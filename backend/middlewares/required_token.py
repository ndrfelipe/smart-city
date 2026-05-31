import jwt
from functools import wraps
from flask import request, current_app
from models.token_list import TokenUsedList
from utils.responses import standard_response
from utils.get_token import get_token_by_header

def required_token(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        
        token = get_token_by_header(request)
        if not token:
            return standard_response(message="Token não fornecido", status_code=401)
        
        

        # DEBUG:
        print(f"DEBUG: token capturado pelo middleware via header: {token}")
        try:
            payload =jwt.decode(
                token,
                current_app.config['SECRET_KEY'],
                algorithms=['HS256']
            )

        except jwt.ExpiredSignatureError:
            return standard_response(message="Token expirado", status_code=401)
        except jwt.InvalidTokenError:
            return standard_response(message="Token inválido", status_code=401)

        if TokenUsedList.is_listed(payload['jti']):
            return standard_response(message="Token inválido", status_code=401)
        
        # injetando o payload na requisição para uso nas rotas. Através dele é possível ver o EMAIL do usuário.
        request.current_user = payload
        return f(*args, **kwargs)
    return decorated



