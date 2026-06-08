from marshmallow import Schema, fields, validate, validates, ValidationError, EXCLUDE
from models.demanda import Demanda
 
 
CATEGORIAS_VALIDAS = [
    'infraestrutura', 'saude', 'educacao', 'seguranca',
    'meio_ambiente', 'transporte', 'outros'
]
 
STATUS_VALIDOS = ['aberto', 'em_andamento', 'concluido', 'cancelado']
 
PRIORIDADES_VALIDAS = ['baixa', 'media', 'alta', 'urgente']

class DemandaCreateSchema(Schema):
    class Meta:
        unknown = EXCLUDE  # ignora campos desconhecidos silenciosamente
 
    titulo = fields.String(
        required=True,
        validate=validate.Length(min=5, max=120),
        error_messages={'required': 'O título é obrigatório.'}
    )
    descricao = fields.String(
        required=True,
        validate=validate.Length(min=10, max=500),
        error_messages={'required': 'A descrição é obrigatória.'}
    )
    categoria = fields.String(
        required=True,
        validate=validate.OneOf(CATEGORIAS_VALIDAS),
        error_messages={'required': 'A categoria é obrigatória.'}
    )
    localizacao = fields.String(
        required=True,
        validate=validate.Length(min=3, max=500),
        error_messages={'required': 'A localização é obrigatória.'}
    )
    prioridade = fields.String(
        required=True,
        validate=validate.OneOf(PRIORIDADES_VALIDAS),
        error_messages={'required': 'A prioridade é obrigatória.'}
    )
 
    @validates('titulo')
    def validate_titulo_unico(self, value, **kwargs):
        if Demanda.query.filter_by(titulo=value).first():
            raise ValidationError('Já existe uma demanda com este título.')
        
class DemandaUpdateSchema(Schema):
    """
    Todos os campos são opcionais no update (PATCH).
    Apenas os campos enviados serão atualizados.
    """
    class Meta:
        unknown = EXCLUDE
 
    titulo = fields.String(validate=validate.Length(min=5, max=120))
    descricao = fields.String(validate=validate.Length(min=10, max=500))
    categoria = fields.String(validate=validate.OneOf(CATEGORIAS_VALIDAS))
    localizacao = fields.String(validate=validate.Length(min=3, max=500))
    status = fields.String(validate=validate.OneOf(STATUS_VALIDOS))
    prioridade = fields.String(validate=validate.OneOf(PRIORIDADES_VALIDAS))
 
    @validates('titulo')
    def validate_titulo_unico(self, value, **kwargs):
        # A checagem de unicidade no update é feita no service,
        # pois precisamos excluir o próprio registro da busca.
        pass

class DemandaQuerySchema(Schema):
    """Schema para validar query params de listagem/filtro."""
    class Meta:
        unknown = EXCLUDE
 
    status = fields.String(validate=validate.OneOf(STATUS_VALIDOS))
    prioridade = fields.String(validate=validate.OneOf(PRIORIDADES_VALIDAS))
    categoria = fields.String(validate=validate.OneOf(CATEGORIAS_VALIDAS))
    page = fields.Integer(load_default=1, validate=validate.Range(min=1))
    per_page = fields.Integer(load_default=10, validate=validate.Range(min=1, max=100))
