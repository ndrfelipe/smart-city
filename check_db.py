from app import create_app
from config.extensions import db
from models.user import User
from models.demanda import Demanda

app = create_app()
with app.app_context():
    print("--- USUÁRIOS ---")
    users = User.query.all()
    for u in users:
        print(f"ID: {u.id}, Email: {u.email}, Role: {u.role}")
    
    print("\n--- DEMANDAS ---")
    demandas = Demanda.query.all()
    for d in demandas:
        print(f"ID: {d.id}, Titulo: {d.titulo}, UserID: {d.usuario_id}, Status: {d.status}")
