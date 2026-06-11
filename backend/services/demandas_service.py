import datetime
 
from config.extensions import db
from models.demanda import Demanda
from models.user import User
from schemas.demandas_schema import DemandaCreateSchema, DemandaUpdateSchema, DemandaQuerySchema
 
 
def _get_user_by_email(email: str) -> User:
    """
    Busca o usuário pelo e-mail extraído do payload JWT.
    Lança LookupError se não encontrado (situação anômala — token válido mas user deletado).
    """
    user = User.query.filter_by(email=email).first()
    if not user:
        raise LookupError('Usuário não encontrado.')
    return user
 
 
class DemandaService:
 
    @staticmethod
    def criar_demanda(data: dict, email: str) -> Demanda:
        """
        Valida os dados e persiste uma nova demanda.
        Recebe o e-mail do payload JWT para resolver o usuario_id.
        """
        schema = DemandaCreateSchema()
        erros = schema.validate(data)
        if erros:
            raise ValueError(erros)
 
        user = _get_user_by_email(email)
        dados = schema.load(data)
 
        demanda = Demanda(
            titulo=dados['titulo'],
            descricao=dados['descricao'],
            categoria=dados['categoria'],
            localizacao=dados['localizacao'],
            prioridade=dados['prioridade'],
            status='aberto',
            usuario_id=user.id,
        )
 
        db.session.add(demanda)
        db.session.commit()
        return demanda
 
    @staticmethod
    def listar_demandas(query_params: dict, email: str):
        """
        Gestores veem todas as demandas; cidadãos, apenas as próprias.
        Suporta filtros por status, prioridade e categoria, com paginação.
        """
        schema = DemandaQuerySchema()
        erros = schema.validate(query_params)
        if erros:
            raise ValueError(erros)
 
        user = _get_user_by_email(email)
        params = schema.load(query_params)
 
        query = Demanda.query
 
        # Escopo por papel: Cidadãos só veem o que criaram
        if user.role != 'gestor':
            query = query.filter_by(usuario_id=user.id)
 
        # Filtros opcionais
        if 'status' in params:
            query = query.filter_by(status=params['status'])
        if 'prioridade' in params:
            query = query.filter_by(prioridade=params['prioridade'])
        if 'categoria' in params:
            query = query.filter_by(categoria=params['categoria'])
 
        query = query.order_by(Demanda.created_at.desc())
 
        return query.paginate(page=params['page'], per_page=params['per_page'], error_out=False)
 
    @staticmethod
    def obter_demanda(demanda_id: int, email: str) -> Demanda:
        """
        Retorna uma demanda pelo ID.
        Cidadãos só acessam as próprias; gestores acessam qualquer uma.
        """
        demanda = Demanda.query.get(demanda_id)
        if not demanda:
            raise LookupError('Demanda não encontrada.')
 
        user = _get_user_by_email(email)
 
        if user.role != 'gestor' and demanda.usuario_id != user.id:
            raise PermissionError('Acesso negado.')
 
        return demanda
 
    @staticmethod
    def atualizar_demanda(demanda_id: int, data: dict, email: str) -> Demanda:
        """
        Atualiza apenas os campos enviados.
        Regras:
          - Cidadãos só editam as próprias demandas e não podem alterar status.
          - Gestores podem editar qualquer campo de qualquer demanda.
        """
        demanda = Demanda.query.get(demanda_id)
        if not demanda:
            raise LookupError('Demanda não encontrada.')
 
        user = _get_user_by_email(email)
 
        if user.role != 'gestor' and demanda.usuario_id != user.id:
            raise PermissionError('Acesso negado.')
 
        if user.role != 'gestor' and 'status' in data:
            raise PermissionError('Apenas gestores podem alterar o status de uma demanda.')
 
        schema = DemandaUpdateSchema()
        erros = schema.validate(data)
        if erros:
            raise ValueError(erros)
 
        dados = schema.load(data)
 
        # Unicidade do título excluindo o próprio registro
        if 'titulo' in dados:
            conflito = Demanda.query.filter(
                Demanda.titulo == dados['titulo'],
                Demanda.id != demanda_id
            ).first()
            if conflito:
                raise ValueError({'titulo': ['Já existe uma demanda com este título.']})
 
        for campo in ['titulo', 'descricao', 'categoria', 'localizacao', 'status', 'prioridade']:
            if campo in dados:
                setattr(demanda, campo, dados[campo])
 
        demanda.updated_at = datetime.datetime.utcnow()
        db.session.commit()
        return demanda
 
    @staticmethod
    def deletar_demanda(demanda_id: int, email: str) -> None:
        """
        Remove uma demanda.
        Cidadãos só podem remover as próprias com status 'aberto'.
        Gestores podem remover qualquer demanda.
        """
        demanda = Demanda.query.get(demanda_id)
        if not demanda:
            raise LookupError('Demanda não encontrada.')
 
        user = _get_user_by_email(email)
 
        if user.role != 'gestor' and demanda.usuario_id != user.id:
            raise PermissionError('Acesso negado.')
 
        if user.role != 'gestor' and demanda.status != 'aberto':
            raise PermissionError('Apenas demandas com status "aberto" podem ser removidas.')
 
        db.session.delete(demanda)
        db.session.commit()