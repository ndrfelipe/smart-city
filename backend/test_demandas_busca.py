import os
import shutil
import sqlite3
import tempfile
import unittest

from app import create_app
from config.extensions import db
from models.demanda import Demanda
from models.user import User


class ListarDemandasFiltrosTestCase(unittest.TestCase):
    """Busca textual (q) e filtros de status/categoria em GET /api/demandas."""

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

    def test_q_searches_title_description_and_location_ignoring_case(self):
        self.assertEqual(self._titulos('?q=brasil'), ['Buraco na pista', 'Lixo acumulado'])
        self.assertEqual(self._titulos('?q=POSTE'), ['Poste piscando'])
        self.assertEqual(self._titulos('?q=escola'), ['Buraco na pista'])

    def test_q_ignores_accents(self):
        self.assertEqual(self._titulos('?q=semaforo'), ['Semáforo danificado'])

    def test_blank_q_returns_everything(self):
        self.assertEqual(len(self._titulos('?q=%20%20')), 5)

    def test_status_filter_matches_legacy_and_new_values(self):
        self.assertEqual(self._titulos('?status=PENDING'), ['Asfalto afundado', 'Buraco na pista', 'Semáforo danificado'])
        self.assertEqual(self._titulos('?status=IN_PROGRESS'), ['Poste piscando'])
        self.assertEqual(self._titulos('?status=RESOLVED'), ['Lixo acumulado'])

    def test_category_filter_matches_legacy_values(self):
        self.assertEqual(self._titulos('?categoria=ROAD_MAINTENANCE'), ['Asfalto afundado', 'Buraco na pista'])

    def test_filters_combine_with_search_and_pagination(self):
        response = self.client.get('/api/demandas?q=brasil&status=PENDING&per_page=1', headers=self.headers)
        body = response.get_json()['data']
        self.assertEqual([d['title'] for d in body['demandas']], ['Buraco na pista'])
        self.assertEqual(body['paginacao']['total'], 1)

    def test_percent_and_underscore_are_literal(self):
        self.assertEqual(self._titulos('?q=%25'), [])
        self.assertEqual(self._titulos('?q=_'), [])

    def test_rejects_too_long_query(self):
        response = self.client.get('/api/demandas?q=' + 'a' * 101, headers=self.headers)
        self.assertEqual(response.status_code, 422)


class BackfillTextoBuscaTestCase(unittest.TestCase):
    """Demandas criadas antes da coluna texto_busca precisam aparecer na busca após a migração."""

    def test_existing_rows_become_searchable(self):
        tmp_dir = tempfile.mkdtemp()
        db_path = os.path.join(tmp_dir, 'legacy.db')
        try:
            with sqlite3.connect(db_path) as conn:
                conn.execute('CREATE TABLE users (id INTEGER PRIMARY KEY, username VARCHAR(50) NOT NULL, '
                             'email VARCHAR(120) NOT NULL UNIQUE, password_hash VARCHAR(128) NOT NULL, '
                             'role VARCHAR(20) NOT NULL, created_at DATETIME)')
                conn.execute('CREATE TABLE demandas (id INTEGER PRIMARY KEY, titulo VARCHAR(120) NOT NULL UNIQUE, '
                             'descricao VARCHAR(500) NOT NULL, categoria VARCHAR(120) NOT NULL, '
                             'localizacao VARCHAR(500) NOT NULL, status VARCHAR(20) NOT NULL, '
                             'prioridade VARCHAR(20) NOT NULL, usuario_id INTEGER NOT NULL, '
                             'created_at DATETIME, updated_at DATETIME)')
                conn.execute("INSERT INTO demandas (titulo, descricao, categoria, localizacao, status, prioridade, "
                             "usuario_id) VALUES ('Calçada Quebrada', 'Buraco na calçada', 'OTHER', 'Praça Tiradentes', "
                             "'aberto', 'media', 1)")

            os.environ['DATABASE_URL'] = f'sqlite:///{db_path}'
            app = create_app()
            with app.app_context():
                db.engine.dispose()

            with sqlite3.connect(db_path) as conn:
                (texto,) = conn.execute('SELECT texto_busca FROM demandas').fetchone()
            self.assertEqual(texto, 'calcada quebrada buraco na calcada praca tiradentes')
        finally:
            os.environ['DATABASE_URL'] = 'sqlite:///:memory:'
            shutil.rmtree(tmp_dir, ignore_errors=True)


if __name__ == '__main__':
    unittest.main()
