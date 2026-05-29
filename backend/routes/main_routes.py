from flask import Blueprint
from utils.responses import standard_response

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    return standard_response(message="API is running", data={"version": "1.0.0"})

@main_bp.route('/health')
def health_check():
    return standard_response(message="Healthy", status_code=200)
