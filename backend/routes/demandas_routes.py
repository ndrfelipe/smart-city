from flask import Blueprint
from middlewares.required_token import required_token
from controllers.demandas_controller import DemandaController

demandas_bp = Blueprint('demandas', __name__, url_prefix='/api/demandas')

# /api/demandas
demandas_bp.route('', methods=['POST'])(required_token(DemandaController.criar_demanda))
demandas_bp.route('', methods=['GET'])(required_token(DemandaController.listar_demandas))
demandas_bp.route('/<int:demanda_id>', methods=['GET'])(required_token(DemandaController.obter_demanda))
demandas_bp.route('/<int:demanda_id>', methods=['PATCH'])(required_token(DemandaController.atualizar_demanda))
demandas_bp.route('/<int:demanda_id>', methods=['DELETE'])(required_token(DemandaController.deletar_demanda))

