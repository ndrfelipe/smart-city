# Camada de configuração
import logging
import sys
import time
from datetime import datetime
from flask import Flask, g, request
from flask_cors import CORS

# Garante encoding UTF-8 no stdout (resolve acentuação no Windows)
sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

# Configura handler explícito para garantir output no processo filho do reloader
_handler = logging.StreamHandler(sys.stdout)
_handler.setFormatter(logging.Formatter(
    fmt="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
))
_root_logger = logging.getLogger()
_root_logger.setLevel(logging.INFO)
if not _root_logger.handlers:
    _root_logger.addHandler(_handler)

# Suprime o log de acesso padrão do Werkzeug (evita log duplicado)
logging.getLogger("werkzeug").setLevel(logging.ERROR)

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
    import os
    app = Flask(__name__, static_folder=os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'static')))
    # permite acentuação:
    app.json.ensure_ascii = False

    print("Configurando credenciais do banco de dados.")
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')

    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    print("Configurando secret key.")
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', create_random_string())

    print("Inicializando extensões")
    db.init_app(app)
    bcrypt.init_app(app)

    print("Configurando Middlewares")
    CORS(app)
    ErrorHandler(app)

    # Garante que o handler está presente no processo filho do reloader
    logger = logging.getLogger()
    if not logger.handlers:
        logger.addHandler(_handler)
    logger.setLevel(logging.INFO)
    logging.getLogger("werkzeug").setLevel(logging.ERROR)

    @app.before_request
    def before_request_log():
        g.start_time = time.time()

    @app.after_request
    def after_request_log(response):
        duration_ms = (time.time() - g.start_time) * 1000
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"{now} [REQUEST] {request.method} {request.path} | {response.status_code} | {duration_ms:.1f}ms | IP: {request.remote_addr}", flush=True)
        return response

    print("Trabalhando no registro de rotas (Blueprints)")
    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(demandas_bp)

    # Configuração do Swagger UI
    from flask_swagger_ui import get_swaggerui_blueprint
    SWAGGER_URL = '/docs'
    API_URL = '/static/swagger.yaml'
    swaggerui_blueprint = get_swaggerui_blueprint(
        SWAGGER_URL,
        API_URL,
        config={'app_name': "SmartCity API"}
    )
    app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)

    # Criar tabelas se não existirem
    with app.app_context():
        db.create_all()

    return app