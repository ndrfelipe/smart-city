from extensions import db
from models.user import User

class AuthService:
    @staticmethod
    def register_user(username, email, password, role='cidadao'):
        # Criar instância do modelo User
        # O hash da senha é feito no __init__ do modelo User
        new_user = User(
            username=username,
            email=email,
            password=password,
            role=role
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        return new_user

    @staticmethod
    def get_user_by_username(username):
        return User.query.filter_by(username=username).first()

    @staticmethod
    def get_user_by_email(email):
        return User.query.filter_by(email=email).first()
