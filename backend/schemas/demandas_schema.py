from flask import url_for
from marshmallow import Schema, fields, validate, validates, ValidationError, EXCLUDE
from models.demanda import Demanda
 
 
CATEGORIAS_VALIDAS = [
    'ROAD_MAINTENANCE', 'PUBLIC_LIGHTING', 'GARBAGE_COLLECTION',
    'SANITATION', 'INSPECTION', 'OTHER'
]
 
STATUS_VALIDOS    = ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED']
PRIORIDADES_VALIDAS = ['baixa', 'media', 'alta', 'urgente']
REGIOES_VALIDAS     = ['CENTRO', 'NORTE', 'SUL', 'LESTE', 'OESTE']
# Status em que a demanda sai da fila: contam como "atendidas" no tempo médio de atendimento.
STATUS_FINALIZADOS  = ('RESOLVED', 'REJECTED')

# Valores legados (em português) e novos convivem no banco; a API sempre responde com os novos.
CATEGORIA_POR_VALOR_ARMAZENADO = {
    'infraestrutura': 'ROAD_MAINTENANCE',
    'saude': 'SANITATION',
    'educacao': 'OTHER',
    'seguranca': 'INSPECTION',
    'meio_ambiente': 'GARBAGE_COLLECTION',
    'transporte': 'ROAD_MAINTENANCE',
    'outros': 'OTHER',
    **{valor: valor for valor in CATEGORIAS_VALIDAS},
}

STATUS_POR_VALOR_ARMAZENADO = {
    'aberto': 'PENDING',
    'em_andamento': 'IN_PROGRESS',
    'concluido': 'RESOLVED',
    'cancelado': 'REJECTED',
    **{valor: valor for valor in STATUS_VALIDOS},
}


def valores_armazenados(mapeamento: dict, valor_api: str) -> list:
    """Todos os valores gravados no banco que a API apresenta como `valor_api` (para filtrar)."""
    return [armazenado for armazenado, api in mapeamento.items() if api == valor_api]

 
 
class DemandaCreateSchema(Schema):
    class Meta:
        unknown = EXCLUDE
 
    titulo     = fields.String(required=True, validate=validate.Length(min=5, max=120))
    descricao  = fields.String(required=True, validate=validate.Length(min=10, max=500))
    categoria  = fields.String(required=True, validate=validate.OneOf(CATEGORIAS_VALIDAS))
    localizacao = fields.String(required=True, validate=validate.Length(min=3, max=500))
    prioridade = fields.String(required=True, validate=validate.OneOf(PRIORIDADES_VALIDAS))
    regiao     = fields.String(allow_none=True, validate=validate.OneOf(REGIOES_VALIDAS))
 
    @validates('titulo')
    def validate_titulo_unico(self, value, **kwargs):
        if Demanda.query.filter_by(titulo=value).first():
            raise ValidationError('Já existe uma demanda com este título.')
 
 
class DemandaUpdateSchema(Schema):
    """Todos os campos opcionais — apenas o que for enviado será atualizado (PATCH)."""
    class Meta:
        unknown = EXCLUDE
 
    titulo      = fields.String(validate=validate.Length(min=5, max=120))
    descricao   = fields.String(validate=validate.Length(min=10, max=500))
    categoria   = fields.String(validate=validate.OneOf(CATEGORIAS_VALIDAS))
    localizacao = fields.String(validate=validate.Length(min=3, max=500))
    status      = fields.String(validate=validate.OneOf(STATUS_VALIDOS))
    prioridade  = fields.String(validate=validate.OneOf(PRIORIDADES_VALIDAS))
    regiao      = fields.String(allow_none=True, validate=validate.OneOf(REGIOES_VALIDAS))
 
 
class DemandaQuerySchema(Schema):
    """Valida e tipifica os query params de listagem."""
    class Meta:
        unknown = EXCLUDE
 
    status     = fields.String(validate=validate.OneOf(STATUS_VALIDOS))
    prioridade = fields.String(validate=validate.OneOf(PRIORIDADES_VALIDAS))
    categoria  = fields.String(validate=validate.OneOf(CATEGORIAS_VALIDAS))
    regiao     = fields.String(validate=validate.OneOf(REGIOES_VALIDAS))
    q          = fields.String(validate=validate.Length(max=100))
    page       = fields.Integer(load_default=1,  validate=validate.Range(min=1))
    per_page   = fields.Integer(load_default=10, validate=validate.Range(min=1, max=100))

class DemandaResponseSchema(Schema):
    id = fields.Int()
    title = fields.Str(attribute='titulo')
    description = fields.Str(attribute='descricao')
    category = fields.Method("get_category")
    location = fields.Str(attribute='localizacao')
    status = fields.Method("get_status")
    priority = fields.Str(attribute='prioridade')
    createdAt = fields.DateTime(attribute='created_at')
    updatedAt = fields.DateTime(attribute='updated_at')
    photoUrl = fields.Method("get_photo_url")
    region = fields.Str(attribute='regiao', allow_none=True)
    resolvedAt = fields.DateTime(attribute='resolvido_em', allow_none=True)

    def get_photo_url(self, obj):
        # URL absoluta com o host da requisição: funciona tanto em localhost quanto
        # no IP da rede local usado pelo app no celular.
        if not obj.foto:
            return None
        return url_for('demandas.servir_foto', filename=obj.foto, _external=True)

    def get_category(self, obj):
        return CATEGORIA_POR_VALOR_ARMAZENADO.get(obj.categoria, 'OTHER')

    def get_status(self, obj):
        return STATUS_POR_VALOR_ARMAZENADO.get(obj.status, 'PENDING')
