import json
import os
import unittest

from app import create_app
from config.extensions import db
from models.demanda import Demanda
from models.user import User

DEMANDA_VALIDA = {
    'titulo': 'Semáforo danificado',
    'descricao': 'Semáforo apagado há três dias na esquina.',
    'categoria': 'PUBLIC_LIGHTING',
    'localizacao': 'Rua XV de Novembro, 450',
    'prioridade': 'media',
}


class DemandasTestCase(unittest.TestCase):
    def setUp(self):
        os.environ['DATABASE_URL'] = 'sqlite:///:memory:'
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()
        self.ctx = self.app.app_context()
        self.ctx.push()
        db.create_all()

        db.session.add(User(username='ana', email='ana@example.com', password='123456'))
        db.session.add(User(username='bruno', email='bruno@example.com', password='123456'))
        db.session.add(User(username='gestora', email='gestora@example.com', password='123456', role='gestor'))
        db.session.commit()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.ctx.pop()

    # --- helpers -------------------------------------------------------------------

    def _auth(self, email):
        response = self.client.post('/auth/login', json={'email': email, 'password': '123456'})
        token = response.get_json()['data']['access_token']
        return {'Authorization': f'Bearer {token}'}

    def _criar(self, email='ana@example.com', **overrides):
        payload = {**DEMANDA_VALIDA, **overrides}
        response = self.client.post('/api/demandas', json=payload, headers=self._auth(email))
        self.assertEqual(response.status_code, 201, response.get_json())
        return response.get_json()['data']['demanda']

    # --- edição --------------------------------------------------------------------

    def test_citizen_edits_own_pending_demand(self):
        demanda = self._criar()

        response = self.client.patch(f"/api/demandas/{demanda['id']}",
                                     json={'localizacao': 'Av. Brasil, 1200', 'categoria': 'SANITATION'},
                                     headers=self._auth('ana@example.com'))

        self.assertEqual(response.status_code, 200, response.get_json())
        body = response.get_json()['data']['demanda']
        self.assertEqual(body['location'], 'Av. Brasil, 1200')
        self.assertEqual(body['category'], 'SANITATION')

    def test_citizen_cannot_edit_demand_that_left_pending(self):
        demanda = self._criar()
        Demanda.query.get(demanda['id']).status = 'IN_PROGRESS'
        db.session.commit()

        response = self.client.patch(f"/api/demandas/{demanda['id']}", json={'localizacao': 'Outro lugar'},
                                     headers=self._auth('ana@example.com'))
        self.assertEqual(response.status_code, 403)


    def test_citizen_can_delete_pending_demand_stored_with_new_status_value(self):
        # Gestores gravam status em inglês ('PENDING'); a regra de "pendente" vale para os dois formatos.
        demanda = self._criar()
        Demanda.query.get(demanda['id']).status = 'PENDING'
        db.session.commit()

        response = self.client.delete(f"/api/demandas/{demanda['id']}", headers=self._auth('ana@example.com'))
        self.assertEqual(response.status_code, 200)


if __name__ == '__main__':
    unittest.main()
