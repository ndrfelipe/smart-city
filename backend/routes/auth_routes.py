from flask import Blueprint
from controllers.auth_controller import AuthController

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

# A rota apenas define o endpoint e o método, delegando a lógica para o Controller
auth_bp.route('/register', methods=['POST'])(AuthController.register)
auth_bp.route('/login', methods=['POST'])(AuthController.login)