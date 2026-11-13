from functools import wraps

from flask import request

from models.user import User
from utils.responses import standard_response


def required_role(*papeis):
    """Restringe a rota a perfis específicos. Use depois de `required_token`:

        required_token(required_role('gestor')(Controller.metodo))
    """
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            payload = getattr(request, 'current_user', None) or {}
            user = User.get_user_by_email(payload.get('email'))
            if not user:
                return standard_response(message="Usuário não encontrado", status_code=401)
            if user.role not in papeis:
                return standard_response(
                    message="Acesso restrito a gestores públicos." if papeis == ('gestor',) else "Acesso negado.",
                    status_code=403
                )
            request.current_db_user = user
            return f(*args, **kwargs)
        return decorated
    return decorator
