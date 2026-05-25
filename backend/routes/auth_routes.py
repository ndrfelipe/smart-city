from flask import Blueprint, request, jsonify
from extensions import db
from models.user import User
from schemas.user_schema import UserRegistrationSchema, UserResponseSchema
from marshmallow import ValidationError

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

registration_schema = UserRegistrationSchema()
user_response_schema = UserResponseSchema()

@auth_bp.route('/register', methods=['POST'])
def register():
    json_data = request.get_json()
    if not json_data:
        return jsonify({"message": "Nenhum dado fornecido"}), 400

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
        
        # Retornar usuário criado (sem senha)
        return jsonify(user_response_schema.dump(new_user)), 201

    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Erro interno ao registrar usuário", "error": str(e)}), 500
