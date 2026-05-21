from flask import Flask
from flask_cors import CORS
from utils.responses import standard_response

app = Flask(__name__)

# Configura o CORS para permitir requisições de qualquer origem (pode ser restrito depois)
CORS(app)

@app.route('/')
def index():
    return standard_response(message="API is running", data={"version": "1.0.0"})

@app.route('/health')
def health_check():
    return standard_response(message="Healthy", status_code=200)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
