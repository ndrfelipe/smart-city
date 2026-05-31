from models.user import User
import jwt
from datetime import timezone, datetime, timedelta
from flask import current_app


class AuthService:
    @staticmethod
    def register_user(username, email, password, role='cidadao'):
        # Criar instância do modelo User
        # O hash da senha é feito no __init__ do modelo User
        
        
        new_user = User.add(
            {
            'username':username,
            'email':email,
            'password':password,
            'role':role
            }
        )

        if not new_user:
            raise ValueError("Ocorreu algum problema no registro do usuário no BD.")
        
        return new_user

    @staticmethod
    def get_user_by_username(username):
        return User.query.filter_by(username=username).first()

    @staticmethod
    def get_user_by_email(email):
        return User.query.filter_by(email=email).first()
    
    @staticmethod
    def login_user(email:str, password:str) -> tuple[str, datetime]:
        user = User.query.filter_by(email=email).first() 
        if not user or not user.check_password(password):
            raise ValueError("E-mail ou senha incorretos.")
        
        # gerar e retornar o jwt aqui
        dt_expiracao = datetime.now(timezone.utc) + timedelta(hours=1)

        token = jwt.encode({
            'email':email,
            'exp':dt_expiracao,
        },
        current_app.config['SECRET_KEY'],
        algorithm='HS256'
        )

        return token, dt_expiracao
