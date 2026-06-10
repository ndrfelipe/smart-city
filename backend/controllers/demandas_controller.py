from flask import request
 
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
        user = User.get_user_by_email(email)
        
        if not user or user.role == 'cidadao':
            return standard_response(
                message="Não é possível cidadão atualizar demanda", 
                status_code=403
            )

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
