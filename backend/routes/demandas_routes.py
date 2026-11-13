from flask import Blueprint
from middlewares.required_token import required_token
from middlewares.required_role import required_role
from controllers.demandas_controller import DemandaController

demandas_bp = Blueprint('demandas', __name__, url_prefix='/api/demandas')

# /api/demandas
demandas_bp.route('', methods=['POST'])(required_token(DemandaController.criar_demanda))
demandas_bp.route('', methods=['GET'])(required_token(DemandaController.listar_demandas))
# Indicadores do painel do gestor: além do token, exige o perfil gestor (camada de segurança).
demandas_bp.route('/metricas', methods=['GET'])(required_token(required_role('gestor')(DemandaController.metricas)))
demandas_bp.route('/<int:demanda_id>', methods=['GET'])(required_token(DemandaController.obter_demanda))
demandas_bp.route('/<int:demanda_id>', methods=['PATCH'])(required_token(DemandaController.atualizar_demanda))
demandas_bp.route('/<int:demanda_id>', methods=['DELETE'])(required_token(DemandaController.deletar_demanda))

# Fotos: upload autenticado (multipart, campo "foto") e leitura pública pelo nome aleatório.
demandas_bp.route('/<int:demanda_id>/foto', methods=['PUT'])(required_token(DemandaController.enviar_foto))
demandas_bp.route('/fotos/<path:filename>', methods=['GET'])(DemandaController.servir_foto)

