from config.extensions import db
from datetime import datetime, timezone

class TokenUsedList(db.Model):
    __tablename__= 'token_used_list'

    id = db.Column(db.Integer, primary_key=True)
    token_id = db.Column(db.String(36), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def __init__(self, token_id:str):
        self.token_id = token_id

    @staticmethod
    def is_listed(token_id:str) -> bool:
        return TokenUsedList.query.filter_by(token_id=token_id).first() is not None
    
    @staticmethod
    def add(token_id: str):
        db.session.add(TokenUsedList(token_id=token_id))
        db.session.commit()