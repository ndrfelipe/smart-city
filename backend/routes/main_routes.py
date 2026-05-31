from flask import Blueprint
from utils.responses import standard_response
from flask import request
from middlewares.required_token import required_token

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
@required_token
def index():
    user_info = {
        'email': request.current_user['email'],
    }
    return standard_response(message=f"Boas vindas. Seu email cadastrado é: {user_info['email']}", data={"version": "1.0.0"}, status_code=200)

@main_bp.route('/health')
def health_check():
    return standard_response(message="Healthy", status_code=200)
