import jwt
import uuid

from datetime import timezone, datetime, timedelta
from flask import current_app

from models.user import User
from models.token_list import TokenUsedList


class AuthService:

    @staticmethod
    def _generate_token(email:str, expires_in: timedelta) -> tuple[str, str]:
        """Gera um access ou refresh token. Retorna (token, token_id)"""
        token_id = str(uuid.uuid4())
        expiration = datetime.now(timezone.utc) + expires_in

        token = jwt.encode(
            {
                'email': email,
                'exp': expiration,
                'jti': token_id          
            },
            current_app.config['SECRET_KEY'],
            algorithm='HS256'
        )

        return token, token_id
    
    @staticmethod
    def register_user(username, email, password, role='cidadao'):

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
    def login_user(email:str, password:str) -> dict[str, str]:
        user = User.query.filter_by(email=email).first() 
        if not user or not user.check_password(password):
            raise ValueError("E-mail ou senha incorretos.")
        
        access_token, _ = AuthService._generate_token(email, timedelta(hours=1))
        refresh_token, _ = AuthService._generate_token(email, timedelta(days=7))

        return {
            'access_token': access_token,
            'refresh_token': refresh_token
        }
    
    @staticmethod
    def refresh_token(token:str) -> dict:
        try:
            payload = jwt.decode(
                token,
                current_app.config['SECRET_KEY'],
                algorithms=['HS256']
            )
        except jwt.ExpiredSignatureError:
            raise ValueError("Refresh token expirado, faça login novamente")
        except jwt.InvalidTokenError:
            raise ValueError("Refresh token inválido")
        
        if TokenUsedList.is_listed(payload['jti']):
            raise ValueError("Refresh Token já utilizado.")
        
        # invalidando o refresh token atual ao registrá-lo na tabela TokenUsedList
        TokenUsedList.add(payload['jti'])

        new_access, _ = AuthService._generate_token(payload['email'], timedelta(hours=1))
        new_refresh, _ = AuthService._generate_token(payload['email'], timedelta(days=7))

        return  {
            'access_token': new_access,
            'refresh_token': new_refresh,
        }
    
    @staticmethod
    def logout(token:str):
        try:
            payload = jwt.decode(
                token,
                current_app.config['SECRET_KEY'],
                algorithms=['HS256']
            )
        except jwt.InvalidTokenError:
            raise ValueError("Token inválido")

        if TokenUsedList.is_listed(payload['jti']):
            raise ValueError("Token já invalidado")

        TokenUsedList.add(payload['jti'])


