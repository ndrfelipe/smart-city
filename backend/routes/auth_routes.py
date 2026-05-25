from flask import Blueprint, request
from extensions import db
from models.user import User
from schemas.user_schema import UserRegistrationSchema, UserResponseSchema
from marshmallow import ValidationError
from utils.responses import standard_response

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

registration_schema = UserRegistrationSchema()
user_response_schema = UserResponseSchema()

@auth_bp.route('/register', methods=['POST'])
def register():
    json_data = request.get_json()
    if not json_data:
        return standard_response(message="Nenhum dado fornecido", status_code=400)

    try:
        # Validar dados de entrada
        data = registration_schema.load(json_data)
        
        # Criar novo usuário
        new_user = User(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            role=data.get('role', 'cidadao')
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        # Retornar usuário criado (sem senha) em formato padronizado
        user_data = user_response_schema.dump(new_user)
        return standard_response(data=user_data, message="Usuário registrado com sucesso", status_code=201)

    except ValidationError as err:
        return standard_response(data={"errors": err.messages}, message="Erro de validação", status_code=400)
    except Exception as e:
        db.session.rollback()
        return standard_response(message="Erro interno ao registrar usuário", data={"error": str(e)}, status_code=500)
