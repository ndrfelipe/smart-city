import os
import unittest

from app import create_app
from config.extensions import db
from models.demanda import Demanda
from models.user import User


class ListarDemandasFiltrosTestCase(unittest.TestCase):
    """Filtros de status/categoria em GET /api/demandas."""

    def setUp(self):
        os.environ['DATABASE_URL'] = 'sqlite:///:memory:'
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()
        self.ctx = self.app.app_context()
        self.ctx.push()
        db.create_all()

        ana = User(username='ana', email='ana@example.com', password='123456')
        db.session.add(ana)
        db.session.commit()

        # Mistura valores legados ('aberto', 'infraestrutura') e novos ('PENDING', 'ROAD_MAINTENANCE'),
        # como acontece no banco real.
        dados = [
            ('Semáforo danificado', 'Apagado há três dias', 'PUBLIC_LIGHTING', 'Rua XV de Novembro, 450', 'aberto'),
            ('Buraco na pista', 'Buraco grande perto da escola', 'infraestrutura', 'Av. Brasil, 1200', 'aberto'),
            ('Poste piscando', 'Luz do poste pisca a noite toda', 'PUBLIC_LIGHTING', 'Travessa dos Estudantes, 12', 'em_andamento'),
            ('Asfalto afundado', 'Afundamento na via principal', 'ROAD_MAINTENANCE', 'Rua das Flores, 99', 'PENDING'),
            ('Lixo acumulado', 'Coleta não passou na semana', 'GARBAGE_COLLECTION', 'Av. Brasil, 300', 'RESOLVED'),
        ]
        for titulo, descricao, categoria, localizacao, status in dados:
            db.session.add(Demanda(titulo=titulo, descricao=descricao, categoria=categoria, localizacao=localizacao,
                                   status=status, prioridade='media', usuario_id=ana.id))
        db.session.commit()

        response = self.client.post('/auth/login', json={'email': 'ana@example.com', 'password': '123456'})
        self.headers = {'Authorization': f"Bearer {response.get_json()['data']['access_token']}"}

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.ctx.pop()

    def _titulos(self, query=''):
        response = self.client.get(f'/api/demandas{query}', headers=self.headers)
        self.assertEqual(response.status_code, 200, response.get_json())
        return sorted(d['title'] for d in response.get_json()['data']['demandas'])

    def test_status_filter_matches_legacy_and_new_values(self):
        self.assertEqual(self._titulos('?status=PENDING'), ['Asfalto afundado', 'Buraco na pista', 'Semáforo danificado'])
        self.assertEqual(self._titulos('?status=IN_PROGRESS'), ['Poste piscando'])
        self.assertEqual(self._titulos('?status=RESOLVED'), ['Lixo acumulado'])

    def test_category_filter_matches_legacy_values(self):
        self.assertEqual(self._titulos('?categoria=ROAD_MAINTENANCE'), ['Asfalto afundado', 'Buraco na pista'])


if __name__ == '__main__':
    unittest.main()
