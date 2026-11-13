from flask import request
from services.auth_service import AuthService
from models.user import User
from schemas.user_schema import UserRegistrationSchema, UserResponseSchema, UserLoginSchema, UserProfileUpdateSchema
from marshmallow import ValidationError
from utils.responses import standard_response
from utils.get_token import get_token_by_header
from services.notificacoes_service import token_valido

from config.extensions import db

class AuthController:
    registration_schema = UserRegistrationSchema()
    login_schema = UserLoginSchema()
    user_response_schema = UserResponseSchema()
    profile_update_schema = UserProfileUpdateSchema()
    # E-mail fica de fora: ele identifica o usuário dentro dos tokens JWT já emitidos.
    CAMPOS_EDITAVEIS_PERFIL = ('username', 'password')

    @classmethod
    def register(cls):
        json_data = request.get_json()
        if not json_data:
            return standard_response(message="Nenhum dado fornecido", status_code=400)

        try:
            # Validação via Marshmallow
            data = cls.registration_schema.load(json_data)
            
            # Forçando role 'cidadao' para registros públicos via API
            new_user = AuthService.register_user(
                username=data['username'],
                email=data['email'],
                password=data['password'],
                role='cidadao'
            )
            
            # Formatação da resposta
            user_data = cls.user_response_schema.dump(new_user)
            return standard_response(
                data=user_data, 
                message="Usuário registrado com sucesso", 
                status_code=201
            )

        except ValidationError as err:
            return standard_response(
                data={"errors": err.messages}, 
                message="Erro de validação", 
                status_code=400
            )
        except Exception as e:
            db.session.rollback()
            return standard_response(
                message="Erro interno ao registrar usuário", 
                status_code=500
            )
        
    @classmethod
    def login(cls):
        json_data = request.get_json()
        if not json_data:
            return standard_response(message="Nenhum dado fornecido", status_code=400)
        
        try:
            data = cls.login_schema.load(json_data)
            result = AuthService.login_user(
                email=data['email'],
                password=data['password']
            )

            # Serializando os dados do usuário
            user_data = cls.user_response_schema.dump(result['user'])
            
            return standard_response(
                data={
                    'access_token': result['access_token'],
                    'refresh_token': result['refresh_token'],
                    'user': user_data
                },
                message="Login realizado com sucesso",
                status_code=200
            )

        except ValidationError as err:
            return standard_response(
                data={"errors": err.messages},
                message="Erro de validação",
                status_code=400
            )
        except ValueError as e:
            return standard_response(
                message=str(e),
                status_code=401
            )
        except Exception as e:
            print(f"[LOGIN ERROR] {type(e).__name__}: {e}", flush=True)
            return standard_response(
                message="Erro interno ao fazer login",
                status_code=500
            )
    
    @classmethod
    def get_me(cls):
        # O payload do token está em request.current_user (injetado pelo middleware)
        email = request.current_user.get('email')
        user = User.get_user_by_email(email)
        
        if not user:
            return standard_response(message="Usuário não encontrado", status_code=404)
        
        user_data = cls.user_response_schema.dump(user)
        return standard_response(data=user_data, status_code=200)

    @classmethod
    def update_profile(cls):
        email = request.current_user.get('email')
        user = User.get_user_by_email(email)
        
        if not user:
            return standard_response(message="Usuário não encontrado", status_code=404)
        
        json_data = request.get_json(silent=True)
        if not json_data:
            return standard_response(message="Nenhum dado fornecido", status_code=400)

        # O próprio usuário nunca altera o perfil (role): isso permitiria a um cidadão
        # se promover a gestor. Gestores são habilitados pelo comando `create-gestor`.
        if 'role' in json_data:
            return standard_response(message="O perfil de acesso não pode ser alterado por esta rota.", status_code=403)

        dados = {campo: json_data[campo] for campo in cls.CAMPOS_EDITAVEIS_PERFIL if campo in json_data}
        if not dados:
            return standard_response(
                data={"errors": {"_schema": ["Envie ao menos um campo editável: username ou password."]}},
                message="Erro de validação",
                status_code=400
            )
        try:
            dados = cls.profile_update_schema.load(dados)
        except ValidationError as err:
            return standard_response(data={"errors": err.messages}, message="Erro de validação", status_code=400)

        # O método update no Model já cuida de hash de senha e commit
        if user.update(dados):
            user_data = cls.user_response_schema.dump(user)
            return standard_response(
                data=user_data, 
                message="Perfil atualizado com sucesso", 
                status_code=200
            )
        else:
            return standard_response(message="Erro ao atualizar perfil", status_code=500)
        
    @classmethod
    def refresh(cls):
        json_data = request.get_json()
        refresh_token = json_data.get('refresh_token') if json_data else None

        if not refresh_token:
            return standard_response(message="Refresh token não fornecido", status_code=400)
        
        try:
            tokens = AuthService.refresh_token(refresh_token)
            return standard_response(data=tokens, message="Token renovado", status_code=200)
        except ValueError as e:
            return standard_response(message=str(e), status_code=401)
    
    @classmethod
    def logout(cls):

        token = get_token_by_header(request)
        if not token:
            return standard_response(message="Token não fornecido", status_code=401)

        try:
            AuthService.logout(token)
            # O aparelho deslogado deixa de receber as notificações desta conta.
            user = User.get_user_by_email(request.current_user.get('email'))
            if user and user.push_token:
                user.push_token = None
                db.session.commit()
            return standard_response(message="Logout realizado com sucesso", status_code=200)
        except ValueError as e:
            return standard_response(message=str(e), status_code=400)

    @classmethod
    def registrar_push_token(cls):
        user = User.get_user_by_email(request.current_user.get('email'))
        if not user:
            return standard_response(message="Usuário não encontrado", status_code=404)

        token = (request.get_json(silent=True) or {}).get('token')
        if not token_valido(token):
            return standard_response(
                data={"errors": {"token": ["Informe um Expo push token válido (ExponentPushToken[...])."]}},
                message="Erro de validação",
                status_code=400
            )

        # Um aparelho pertence a uma conta por vez: se outra conta usava este token
        # (ex.: troca de usuário no mesmo celular), ela deixa de recebê-lo.
        User.query.filter(User.push_token == token, User.id != user.id).update({'push_token': None})
        user.push_token = token
        db.session.commit()
        return standard_response(message="Notificações ativadas neste aparelho", status_code=200)

    @classmethod
    def remover_push_token(cls):
        user = User.get_user_by_email(request.current_user.get('email'))
        if not user:
            return standard_response(message="Usuário não encontrado", status_code=404)
        user.push_token = None
        db.session.commit()
        return standard_response(message="Notificações desativadas neste aparelho", status_code=200)
