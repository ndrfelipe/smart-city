from flask import Flask
from flask_cors import CORS
from routes.main_routes import main_bp
from middlewares.error_handler import ErrorHandler
from dotenv import load_dotenv
import os

load_dotenv()

def create_app():
    app = Flask(__name__)

    # Configurações de Middleware
    CORS(app)
    ErrorHandler(app)

    # Registro de Rotas (Blueprints)
    app.register_blueprint(main_bp)

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
