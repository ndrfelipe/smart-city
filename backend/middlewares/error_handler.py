from utils.responses import standard_response
from werkzeug.exceptions import HTTPException

class ErrorHandler:
    """
    Classe responsável por centralizar o tratamento de erros da API.
    Utiliza o padrão de handlers para capturar exceções HTTP e retornar
    respostas JSON padronizadas.
    """

    def __init__(self, app=None):
        if app is not None:
            self.init_app(app)

    def init_app(self, app):
        """
        Registra os handlers de erro na instância do Flask.
        """
        app.register_error_handler(400, self.handle_bad_request)
        app.register_error_handler(401, self.handle_unauthorized)
        app.register_error_handler(403, self.handle_forbidden)
        app.register_error_handler(404, self.handle_not_found)
        app.register_error_handler(405, self.handle_method_not_allowed)
        app.register_error_handler(Exception, self.handle_generic_error)

    def handle_bad_request(self, e):
        # Em erros 400, tentamos capturar detalhes extras (como erros de validação de bibliotecas)
        details = getattr(e, 'data', None)
        return standard_response(
            message=str(e.description) if hasattr(e, 'description') else "Requisição inválida (Bad Request).",
            data=details,
            status_code=400
        )

    def handle_unauthorized(self, e):
        return standard_response(
            message="Não autorizado. Por favor, realize a autenticação.",
            data=None,
            status_code=401
        )

    def handle_forbidden(self, e):
        return standard_response(
            message="Acesso negado. Você não tem permissão para acessar este recurso.",
            data=None,
            status_code=403
        )

    def handle_not_found(self, e):
        return standard_response(
            message="Recurso não encontrado.",
            data={"path": e.description if hasattr(e, 'description') else "unknown"},
            status_code=404
        )

    def handle_method_not_allowed(self, e):
        return standard_response(
            message="Método HTTP não permitido para esta rota.",
            data={"allowed_methods": list(e.valid_methods) if hasattr(e, 'valid_methods') else []},
            status_code=405
        )

    def handle_generic_error(self, e):
        """
        Captura exceções não tratadas (Erro 500).
        """
        # Se for uma exceção HTTP que não mapeamos acima, mantém o status original
        if isinstance(e, HTTPException):
            return standard_response(message=str(e.description), status_code=e.code)
        
        # Log do erro original (em produção seria ideal usar um logger)
        print(f"Erro inesperado: {str(e)}")
        
        return standard_response(
            message="Ocorreu um erro interno no servidor.",
            status_code=500
        )
