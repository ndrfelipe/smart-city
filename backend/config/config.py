# Camada de configuração
from flask import Flask
from flask_cors import CORS

from routes.main_routes import main_bp
from routes.auth_routes import auth_bp
from routes.demandas_routes import demandas_bp

# middlewares
from middlewares.error_handler import ErrorHandler
from .extensions import db, bcrypt
from utils.random_string import create_random_string
from dotenv import load_dotenv
import os

load_dotenv()

def create_app():
    app = Flask(__name__)
    # permite acentuação:
    app.json.ensure_ascii = False

    print(f"Configurando credenciais do banco de dados.")
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')

    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    print(f"Configurando secret key.")
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', create_random_string())

    print("Inicializando extensões")
    db.init_app(app)
    bcrypt.init_app(app)

    print("Configurando Middlewares")
    CORS(app)
    ErrorHandler(app)

    print("Trabalhando no registro de rotas (Blueprints)")
    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(demandas_bp)

    # Criar tabelas se não existirem
    with app.app_context():
        db.create_all()

    
    return app    