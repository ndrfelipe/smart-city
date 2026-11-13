from config.extensions import db, bcrypt
from sqlalchemy import event
import datetime
import unicodedata


def normalizar_busca(*partes):
    """Minúsculas e sem acentos: "Semáforo na Rua XV" -> "semaforo na rua xv"."""
    texto = ' '.join(p for p in partes if p)
    sem_acento = unicodedata.normalize('NFKD', texto).encode('ascii', 'ignore').decode('ascii')
    return sem_acento.lower()

class Demanda(db.Model):
    __tablename__ = 'demandas'

    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(120), unique=True, nullable=False)
    descricao = db.Column(db.String(500), nullable=False)
    categoria = db.Column(db.String(120), nullable=False)
    localizacao = db.Column(db.String(500), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='aberto')
    prioridade = db.Column(db.String(20), nullable=False)
    usuario_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    # Nome do arquivo da foto dentro de UPLOAD_FOLDER (a URL pública é montada no schema de resposta).
    foto = db.Column(db.String(255), nullable=True)
    # Região da cidade (CENTRO, NORTE, SUL, LESTE, OESTE); opcional, usada em filtros e métricas.
    regiao = db.Column(db.String(20), nullable=True)
    # Quando a demanda foi concluída/recusada: base do tempo médio de atendimento.
    resolvido_em = db.Column(db.DateTime, nullable=True)
    # Título + descrição + localização normalizados, para a busca ignorar maiúsculas e acentos
    # em qualquer banco (SQLite/PostgreSQL). Mantido pelos eventos no fim deste arquivo.
    texto_busca = db.Column(db.Text, nullable=True)
    # setor_id
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime)

    def to_dict(self):
        return {
            'id': self.id,
            'titulo': self.titulo,
            'descricao': self.descricao,
            'categoria': self.categoria,
            'localizacao': self.localizacao,
            'status': self.status,
            'prioridade': self.prioridade,
            'foto': self.foto,
            'regiao': self.regiao,
            'resolvido_em': self.resolvido_em,
            'created_at': self.created_at,
            'updated_at': self.updated_at if self.updated_at else None
        }


@event.listens_for(Demanda, 'before_insert')
@event.listens_for(Demanda, 'before_update')
def _atualizar_texto_busca(mapper, connection, demanda):
    demanda.texto_busca = normalizar_busca(demanda.titulo, demanda.descricao, demanda.localizacao)
