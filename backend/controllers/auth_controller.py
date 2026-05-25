from flask import request
from services.auth_service import AuthService
from schemas.user_schema import UserRegistrationSchema, UserResponseSchema
from marshmallow import ValidationError
from utils.responses import standard_response
from extensions import db

class AuthController:
    registration_schema = UserRegistrationSchema()
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
            new_user = AuthService.register_user(
                username=data['username'],
                email=data['email'],
                password=data['password'],
                role=data.get('role', 'cidadao')
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
