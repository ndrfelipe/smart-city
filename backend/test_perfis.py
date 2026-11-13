import os
import unittest

from app import create_app
from config.extensions import db
from models.user import User


class PerfisTestCase(unittest.TestCase):
    """Distinção Cidadão x Gestor: o cadastro cria cidadão e ninguém se promove sozinho."""

    def setUp(self):
        os.environ['DATABASE_URL'] = 'sqlite:///:memory:'
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()
        self.ctx = self.app.app_context()
        self.ctx.push()
        db.create_all()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.ctx.pop()

    def _registrar_e_logar(self, email='ana@example.com'):
        self.client.post('/auth/register', json={'username': 'ana', 'email': email, 'password': '123456', 'role': 'gestor'})
        response = self.client.post('/auth/login', json={'email': email, 'password': '123456'})
        return {'Authorization': f"Bearer {response.get_json()['data']['access_token']}"}

    def test_cadastro_publico_sempre_cria_cidadao(self):
        headers = self._registrar_e_logar()
        me = self.client.get('/auth/me', headers=headers).get_json()['data']
        self.assertEqual(me['role'], 'cidadao')

    def test_cidadao_nao_se_promove_a_gestor(self):
        headers = self._registrar_e_logar()
        response = self.client.patch('/auth/update', json={'role': 'gestor'}, headers=headers)
        self.assertEqual(response.status_code, 403)
        self.assertEqual(User.get_user_by_email('ana@example.com').role, 'cidadao')

    def test_update_ignora_campos_nao_editaveis(self):
        headers = self._registrar_e_logar()
        response = self.client.patch('/auth/update', json={'username': 'Ana Maria', 'id': 99, 'email': 'x@y.com'}, headers=headers)
        self.assertEqual(response.status_code, 200)
        user = User.get_user_by_email('ana@example.com')
        self.assertEqual(user.username, 'Ana Maria')
        self.assertNotEqual(user.id, 99)

    def test_update_valida_tamanho_da_senha(self):
        headers = self._registrar_e_logar()
        response = self.client.patch('/auth/update', json={'password': '123'}, headers=headers)
        self.assertEqual(response.status_code, 400)

    def test_comando_create_gestor(self):
        runner = self.app.test_cli_runner()
        result = runner.invoke(args=['create-gestor', '--email', 'g@prefeitura.gov.br', '--nome', 'Gestora', '--senha', '123456'])
        self.assertEqual(result.exit_code, 0, result.output)
        self.assertEqual(User.get_user_by_email('g@prefeitura.gov.br').role, 'gestor')

        login = self.client.post('/auth/login', json={'email': 'g@prefeitura.gov.br', 'password': '123456'}).get_json()
        self.assertEqual(login['data']['user']['role'], 'gestor')

    def test_comando_promove_conta_existente(self):
        self._registrar_e_logar()
        runner = self.app.test_cli_runner()
        result = runner.invoke(args=['create-gestor', '--email', 'ana@example.com'])
        self.assertEqual(result.exit_code, 0, result.output)
        self.assertEqual(User.get_user_by_email('ana@example.com').role, 'gestor')


if __name__ == '__main__':
    unittest.main()
