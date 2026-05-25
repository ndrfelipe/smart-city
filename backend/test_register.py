import json
import unittest
from app import create_app
from extensions import db
from models.user import User
import os

class RegisterTestCase(unittest.TestCase):
    def setUp(self):
        # Usar SQLite em memória para testes
        os.environ['DATABASE_URL'] = 'sqlite:///:memory:'
        self.app = create_app()
        self.client = self.app.test_client()
        self.ctx = self.app.app_context()
        self.ctx.push()
        db.create_all()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.ctx.pop()

    def test_register_success(self):
        payload = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "password123",
            "role": "cidadao"
        }
        response = self.client.post('/auth/register', 
                                    data=json.dumps(payload),
                                    content_type='application/json')
        
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(data['data']['username'], 'testuser')
        self.assertEqual(data['data']['email'], 'test@example.com')
        self.assertEqual(data['message'], 'Usuário registrado com sucesso')
        self.assertNotIn('password', data['data'])

    def test_register_duplicate_username(self):
        user = User(username="testuser", email="test@example.com", password="password123")
        db.session.add(user)
        db.session.commit()

        payload = {
            "username": "testuser",
            "email": "other@example.com",
            "password": "password123"
        }
        response = self.client.post('/auth/register', 
                                    data=json.dumps(payload),
                                    content_type='application/json')
        
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertIn('username', data['data']['errors'])
        self.assertEqual(data['message'], 'Erro de validação')

    def test_register_invalid_email(self):
        payload = {
            "username": "testuser",
            "email": "invalid-email",
            "password": "password123"
        }
        response = self.client.post('/auth/register', 
                                    data=json.dumps(payload),
                                    content_type='application/json')
        
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertIn('email', data['data']['errors'])

if __name__ == '__main__':
    unittest.main()
