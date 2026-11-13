from flask import current_app, request, send_from_directory
from werkzeug.exceptions import RequestEntityTooLarge
 
from services.demandas_service import DemandaService
from utils.responses import standard_response
from schemas.demandas_schema import DemandaResponseSchema

class DemandaController:
    demanda_response_schema = DemandaResponseSchema()

    @staticmethod
    def criar_demanda():
        email = request.current_user['email']
        data  = request.get_json(silent=True) or {}
    
        try:
            demanda = DemandaService.criar_demanda(data, email=email)
            return standard_response(
                message='Demanda criada com sucesso.',
                data={'demanda': DemandaController.demanda_response_schema.dump(demanda)},
                status_code=201
            )
        except LookupError as e:
            return standard_response(message=str(e), status_code=404)
        except ValueError as e:
            return standard_response(message='Dados inválidos.', data={'errors': e.args[0]}, status_code=422)
    
    @staticmethod
    def listar_demandas():
        email       = request.current_user['email']
        query_params = request.args.to_dict()
    
        try:
            paginacao = DemandaService.listar_demandas(query_params, email=email)
            return standard_response(
                data={
                    'demandas': DemandaController.demanda_response_schema.dump(paginacao.items, many=True),
                    'paginacao': {
                        'total':       paginacao.total,
                        'paginas':     paginacao.pages,
                        'pagina_atual': paginacao.page,
                        'por_pagina':  paginacao.per_page,
                        'tem_proxima': paginacao.has_next,
                        'tem_anterior': paginacao.has_prev,
                    }
                },
                status_code=200
            )
        except LookupError as e:
            return standard_response(message=str(e), status_code=404)
        except ValueError as e:
            return standard_response(message='Parâmetros inválidos.', data={'errors': e.args[0]}, status_code=422)
    
    @staticmethod
    def obter_demanda(demanda_id:int):
        email = request.current_user['email']
    
        try:
            demanda = DemandaService.obter_demanda(demanda_id, email=email)
            return standard_response(data={'demanda': DemandaController.demanda_response_schema.dump(demanda)}, status_code=200)
        except LookupError as e:
            return standard_response(message=str(e), status_code=404)
        except PermissionError as e:
            return standard_response(message=str(e), status_code=403)
    
    @staticmethod
    def atualizar_demanda(demanda_id:int):
        email = request.current_user['email']
        # Buscando o usuário para verificar o cargo (role)
        from models.user import User
        user = User.get_user_by_email(email)
        
        # Removida a restrição total que bloqueava gestores. 
        # A lógica de quem pode editar o quê está dentro do DemandaService.atualizar_demanda
        if not user:
            return standard_response(message="Usuário não encontrado", status_code=404)

        data  = request.get_json(silent=True) or {}
    
        try:
            demanda = DemandaService.atualizar_demanda(demanda_id, data, email=email)
            return standard_response(
                message='Demanda atualizada com sucesso.',
                data={'demanda': DemandaController.demanda_response_schema.dump(demanda)},
                status_code=200
            )
        except LookupError as e:
            return standard_response(message=str(e), status_code=404)
        except PermissionError as e:
            # Mensagem vem do service (ex.: "Apenas demandas pendentes podem ser editadas.").
            return standard_response(message=str(e), status_code=403)
        except ValueError as e:
            return standard_response(message='Dados inválidos.', data={'errors': e.args[0]}, status_code=422)
    
    @staticmethod
    def deletar_demanda(demanda_id):
        email = request.current_user['email']
    
        try:
            DemandaService.deletar_demanda(demanda_id, email=email)
            return standard_response(message='Demanda removida com sucesso.', status_code=200)
        except LookupError as e:
            return standard_response(message=str(e), status_code=404)
        except PermissionError as e:
            return standard_response(message=str(e), status_code=403)

    @staticmethod
    def metricas():
        """Painel do gestor (a rota já exige perfil gestor via required_role)."""
        return standard_response(data=DemandaService.metricas(), status_code=200)

    @staticmethod
    def enviar_foto(demanda_id: int):
        """PUT multipart/form-data com o arquivo no campo 'foto'."""
        email = request.current_user['email']

        try:
            arquivo = request.files.get('foto')
        except RequestEntityTooLarge:
            limite_mb = current_app.config['MAX_CONTENT_LENGTH'] // (1024 * 1024) or 1
            return standard_response(
                message='Arquivo muito grande.',
                data={'errors': {'foto': [f'A foto deve ter no máximo {limite_mb} MB.']}},
                status_code=413
            )

        try:
            demanda = DemandaService.salvar_foto(demanda_id, arquivo, email=email)
            return standard_response(
                message='Foto enviada com sucesso.',
                data={'demanda': DemandaController.demanda_response_schema.dump(demanda)},
                status_code=200
            )
        except LookupError as e:
            return standard_response(message=str(e), status_code=404)
        except PermissionError as e:
            return standard_response(message=str(e), status_code=403)
        except ValueError as e:
            return standard_response(message='Dados inválidos.', data={'errors': e.args[0]}, status_code=422)

    @staticmethod
    def servir_foto(filename: str):
        # Público de propósito: o nome é um UUID aleatório, e o <Image> do app não envia token.
        return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)
