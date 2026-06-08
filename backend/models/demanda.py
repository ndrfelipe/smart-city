from config.extensions import db, bcrypt
import datetime

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
            'created_at': self.created_at,
            'updated_at': self.updated_at if self.updated_at else None
        }

