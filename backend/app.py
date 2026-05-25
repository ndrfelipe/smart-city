from flask import Flask
from flask_cors import CORS
from routes.main_routes import main_bp
from routes.auth_routes import auth_bp
from middlewares.error_handler import ErrorHandler
from dotenv import load_dotenv
from extensions import db, bcrypt
import os

load_dotenv()

def create_app():
    app = Flask(__name__)

    # Configurações
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

    # Inicialização de extensões
    db.init_app(app)
    bcrypt.init_app(app)

    # Configurações de Middleware
    CORS(app)
    ErrorHandler(app)

    # Registro de Rotas (Blueprints)
    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp)

    # Criar tabelas se não existirem
    with app.app_context():
        db.create_all()

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
