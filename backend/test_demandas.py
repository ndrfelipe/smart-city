import io
import json
import os
import shutil
import sqlite3
import tempfile
import unittest

# Configura o ambiente ANTES de importar a app (create_app lê as variáveis na criação).
_UPLOAD_DIR = tempfile.mkdtemp(prefix='smartcity-uploads-')
os.environ['UPLOAD_FOLDER'] = _UPLOAD_DIR

from app import create_app  # noqa: E402
from config.extensions import db  # noqa: E402
from models.demanda import Demanda  # noqa: E402
from models.user import User  # noqa: E402

# Menor JPEG/PNG válidos o suficiente para o teste (só a assinatura importa para a validação).
JPEG_BYTES = b'\xff\xd8\xff\xe0' + b'\x00' * 64
PNG_BYTES = b'\x89PNG\r\n\x1a\n' + b'\x00' * 64

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
        for name in os.listdir(_UPLOAD_DIR):
            os.remove(os.path.join(_UPLOAD_DIR, name))

    @classmethod
    def tearDownClass(cls):
        shutil.rmtree(_UPLOAD_DIR, ignore_errors=True)

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

    def _enviar_foto(self, demanda_id, email='ana@example.com', content=JPEG_BYTES, filename='foto.jpg',
                     mimetype='image/jpeg'):
        return self.client.put(
            f'/api/demandas/{demanda_id}/foto',
            data={'foto': (io.BytesIO(content), filename, mimetype)},
            content_type='multipart/form-data',
            headers=self._auth(email),
        )

    # --- foto ----------------------------------------------------------------------

    def test_new_demand_has_no_photo(self):
        demanda = self._criar()
        self.assertIsNone(demanda['photoUrl'])

    def test_owner_uploads_photo_and_it_is_served(self):
        demanda = self._criar()

        response = self._enviar_foto(demanda['id'])

        self.assertEqual(response.status_code, 200, response.get_json())
        photo_url = response.get_json()['data']['demanda']['photoUrl']
        self.assertTrue(photo_url.startswith('http://localhost/api/demandas/fotos/'))
        self.assertTrue(photo_url.endswith('.jpg'))

        served = self.client.get(photo_url.replace('http://localhost', ''))
        self.assertEqual(served.status_code, 200)
        self.assertEqual(served.data, JPEG_BYTES)
        served.close()

        detalhe = self.client.get(f"/api/demandas/{demanda['id']}", headers=self._auth('ana@example.com'))
        self.assertEqual(detalhe.get_json()['data']['demanda']['photoUrl'], photo_url)

    def test_replacing_the_photo_removes_the_old_file(self):
        demanda = self._criar()
        self._enviar_foto(demanda['id'])
        self.assertEqual(len(os.listdir(_UPLOAD_DIR)), 1)

        response = self._enviar_foto(demanda['id'], content=PNG_BYTES, filename='nova.png', mimetype='image/png')

        self.assertEqual(response.status_code, 200)
        files = os.listdir(_UPLOAD_DIR)
        self.assertEqual(len(files), 1)
        self.assertTrue(files[0].endswith('.png'))

    def test_other_citizen_cannot_upload_photo(self):
        demanda = self._criar()

        response = self._enviar_foto(demanda['id'], email='bruno@example.com')

        self.assertEqual(response.status_code, 403)
        self.assertEqual(os.listdir(_UPLOAD_DIR), [])

    def test_manager_can_upload_photo_to_any_demand(self):
        demanda = self._criar()
        response = self._enviar_foto(demanda['id'], email='gestora@example.com')
        self.assertEqual(response.status_code, 200)

    def test_rejects_non_image_files(self):
        demanda = self._criar()

        response = self._enviar_foto(demanda['id'], content=b'%PDF-1.4 fake', filename='doc.pdf',
                                     mimetype='application/pdf')

        self.assertEqual(response.status_code, 422)
        self.assertIn('foto', response.get_json()['data']['errors'])

    def test_rejects_file_with_image_extension_but_other_content(self):
        demanda = self._criar()

        response = self._enviar_foto(demanda['id'], content=b'not really an image', filename='fake.jpg')

        self.assertEqual(response.status_code, 422)

    def test_rejects_missing_file(self):
        demanda = self._criar()

        response = self.client.put(f"/api/demandas/{demanda['id']}/foto", data={},
                                   content_type='multipart/form-data', headers=self._auth('ana@example.com'))

        self.assertEqual(response.status_code, 422)
        self.assertIn('foto', response.get_json()['data']['errors'])

    def test_rejects_files_over_the_size_limit(self):
        demanda = self._criar()
        self.app.config['MAX_CONTENT_LENGTH'] = 1024

        response = self._enviar_foto(demanda['id'], content=JPEG_BYTES + b'\x00' * 4096)

        self.assertEqual(response.status_code, 413)
        self.assertIn('foto', response.get_json()['data']['errors'])

    def test_deleting_the_demand_removes_its_photo(self):
        demanda = self._criar()
        self._enviar_foto(demanda['id'])

        response = self.client.delete(f"/api/demandas/{demanda['id']}", headers=self._auth('ana@example.com'))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(os.listdir(_UPLOAD_DIR), [])

    def test_serving_a_missing_photo_returns_404(self):
        response = self.client.get('/api/demandas/fotos/nao-existe.jpg')
        self.assertEqual(response.status_code, 404)

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

        foto = self._enviar_foto(demanda['id'])
        self.assertEqual(foto.status_code, 403)

    def test_citizen_can_delete_pending_demand_stored_with_new_status_value(self):
        # Gestores gravam status em inglês ('PENDING'); a regra de "pendente" vale para os dois formatos.
        demanda = self._criar()
        Demanda.query.get(demanda['id']).status = 'PENDING'
        db.session.commit()

        response = self.client.delete(f"/api/demandas/{demanda['id']}", headers=self._auth('ana@example.com'))
        self.assertEqual(response.status_code, 200)


class LegacyDatabaseMigrationTestCase(unittest.TestCase):
    """db.create_all() não adiciona colunas em tabelas existentes: a migração leve precisa fazer isso."""

    def test_adds_the_photo_column_to_an_existing_demandas_table(self):
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

            os.environ['DATABASE_URL'] = f'sqlite:///{db_path}'
            app = create_app()
            with app.app_context():
                db.engine.dispose()

            with sqlite3.connect(db_path) as conn:
                columns = [row[1] for row in conn.execute('PRAGMA table_info(demandas)')]
            self.assertIn('foto', columns)
        finally:
            os.environ['DATABASE_URL'] = 'sqlite:///:memory:'
            shutil.rmtree(tmp_dir, ignore_errors=True)


if __name__ == '__main__':
    unittest.main()
