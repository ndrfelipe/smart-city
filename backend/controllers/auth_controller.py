from flask import request
from services.auth_service import AuthService
from schemas.user_schema import UserRegistrationSchema, UserResponseSchema, UserLoginSchema
from marshmallow import ValidationError
from utils.responses import standard_response
from config.extensions import db

class AuthController:
    registration_schema = UserRegistrationSchema()
    login_schema = UserLoginSchema()
    user_response_schema = UserResponseSchema()

    @classmethod
    def register(cls):
        json_data = request.get_json()
        if not json_data:
            return standard_response(message="Nenhum dado fornecido", status_code=400)

        try:
            # Validação via Marshmallow
            # Nota: As validações de banco (username/email único) estão dentro do Schema
            data = cls.registration_schema.load(json_data)
            
            # Chamada ao Service para lógica de negócio (persistência)
            # A role é opcional; se não enviada, o Service/Model assume 'cidadao'
            new_user = AuthService.register_user(
                username=data['username'],
                email=data['email'],
                password=data['password'],
                **({'role': data['role']} if 'role' in data else {})
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
                data={"error": str(e)}, 
                status_code=500
            )
        
    @classmethod
    def login(cls):
        json_data = request.get_json()
        if not json_data:
            return standard_response(message="Nenhum dado fornecido", status_code=400)
        
        try:
            data = cls.login_schema.load(json_data)
            token, expiration = AuthService.login_user(
                email=data['email'],
                password=data['password']
            )

            return standard_response(
                data={
                    'token':token,
                    'expiraton':expiration
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
        except Exception as e:
            return standard_response(
                message="Erro interno ao fazer login",
                data={"error": str(e)},
                status_code=500
            )