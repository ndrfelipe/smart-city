import datetime
import os
import unittest
from unittest import mock

from app import create_app
from config.extensions import db
from models.demanda import Demanda
from models.user import User

TOKEN_ANA = 'ExponentPushToken[ana-aparelho]'


def demanda_valida(**extra):
    base = {
        'titulo': 'Buraco na avenida central',
        'descricao': 'Buraco grande perto do ponto de ônibus.',
        'categoria': 'ROAD_MAINTENANCE',
        'localizacao': 'Av. Central, 100',
        'prioridade': 'media',
    }
    base.update(extra)
    return base


class AcompanhamentoTestCase(unittest.TestCase):
    """Fluxo registrar -> acompanhar -> notificar, filtro por região, controle de acesso e métricas."""

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

        # Nada sai para a Expo durante os testes: capturamos as mensagens montadas.
        self.push_patch = mock.patch('services.notificacoes_service.enviar_push')
        self.enviar_push = self.push_patch.start()

    def tearDown(self):
        self.push_patch.stop()
        db.session.remove()
        db.drop_all()
        self.ctx.pop()

    def _auth(self, email):
        response = self.client.post('/auth/login', json={'email': email, 'password': '123456'})
        return {'Authorization': f"Bearer {response.get_json()['data']['access_token']}"}

    def _criar(self, email='ana@example.com', **extra):
        response = self.client.post('/api/demandas', json=demanda_valida(**extra), headers=self._auth(email))
        self.assertEqual(response.status_code, 201, response.get_json())
        return response.get_json()['data']['demanda']

    # --- push token -------------------------------------------------------------------

    def test_registra_e_remove_push_token(self):
        headers = self._auth('ana@example.com')
        self.assertEqual(self.client.put('/auth/push-token', json={'token': TOKEN_ANA}, headers=headers).status_code, 200)
        self.assertEqual(User.get_user_by_email('ana@example.com').push_token, TOKEN_ANA)

        self.assertEqual(self.client.delete('/auth/push-token', headers=headers).status_code, 200)
        self.assertIsNone(User.get_user_by_email('ana@example.com').push_token)

    def test_rejeita_push_token_invalido(self):
        response = self.client.put('/auth/push-token', json={'token': 'qualquer-coisa'}, headers=self._auth('ana@example.com'))
        self.assertEqual(response.status_code, 400)

    def test_token_passa_para_a_conta_que_logou_no_aparelho(self):
        self.client.put('/auth/push-token', json={'token': TOKEN_ANA}, headers=self._auth('ana@example.com'))
        self.client.put('/auth/push-token', json={'token': TOKEN_ANA}, headers=self._auth('bruno@example.com'))
        self.assertIsNone(User.get_user_by_email('ana@example.com').push_token)
        self.assertEqual(User.get_user_by_email('bruno@example.com').push_token, TOKEN_ANA)

    def test_logout_desativa_notificacoes_do_aparelho(self):
        headers = self._auth('ana@example.com')
        self.client.put('/auth/push-token', json={'token': TOKEN_ANA}, headers=headers)
        self.assertEqual(self.client.get('/auth/logout', headers=headers).status_code, 200)
        self.assertIsNone(User.get_user_by_email('ana@example.com').push_token)

    # --- notificação na mudança de status ---------------------------------------------

    def test_notifica_autor_quando_gestor_muda_status(self):
        self.client.put('/auth/push-token', json={'token': TOKEN_ANA}, headers=self._auth('ana@example.com'))
        demanda = self._criar()

        response = self.client.patch(f"/api/demandas/{demanda['id']}", json={'status': 'IN_PROGRESS'},
                                     headers=self._auth('gestora@example.com'))

        self.assertEqual(response.status_code, 200)
        self.enviar_push.assert_called_once()
        mensagem = self.enviar_push.call_args.args[0][0]
        self.assertEqual(mensagem['to'], TOKEN_ANA)
        self.assertIn('Em análise', mensagem['body'])
        self.assertEqual(mensagem['data'], {'tipo': 'status_demanda', 'demandaId': demanda['id'], 'status': 'IN_PROGRESS'})

    def test_nao_notifica_sem_mudanca_de_status_ou_sem_aparelho(self):
        demanda = self._criar()
        gestora = self._auth('gestora@example.com')
        # Sem token registrado: nada a enviar.
        self.client.patch(f"/api/demandas/{demanda['id']}", json={'status': 'IN_PROGRESS'}, headers=gestora)
        self.client.put('/auth/push-token', json={'token': TOKEN_ANA}, headers=self._auth('ana@example.com'))
        # Mesmo status de novo e mudança de prioridade: não é mudança de status.
        self.client.patch(f"/api/demandas/{demanda['id']}", json={'status': 'IN_PROGRESS', 'prioridade': 'alta'}, headers=gestora)
        self.enviar_push.assert_not_called()

    def test_conclusao_marca_resolvido_em_e_reabertura_limpa(self):
        demanda = self._criar()
        gestora = self._auth('gestora@example.com')

        concluida = self.client.patch(f"/api/demandas/{demanda['id']}", json={'status': 'RESOLVED'}, headers=gestora).get_json()
        self.assertIsNotNone(concluida['data']['demanda']['resolvedAt'])

        reaberta = self.client.patch(f"/api/demandas/{demanda['id']}", json={'status': 'IN_PROGRESS'}, headers=gestora).get_json()
        self.assertIsNone(reaberta['data']['demanda']['resolvedAt'])

    # --- região --------------------------------------------------------------------------

    def test_cria_e_filtra_por_regiao(self):
        self._criar(regiao='NORTE')
        self._criar(titulo='Lâmpada queimada na praça', categoria='PUBLIC_LIGHTING', regiao='SUL')
        self._criar(titulo='Lixo acumulado na esquina', categoria='GARBAGE_COLLECTION')

        response = self.client.get('/api/demandas?regiao=NORTE', headers=self._auth('ana@example.com'))
        demandas = response.get_json()['data']['demandas']
        self.assertEqual([d['region'] for d in demandas], ['NORTE'])

        combinado = self.client.get('/api/demandas?regiao=SUL&categoria=PUBLIC_LIGHTING&status=PENDING',
                                    headers=self._auth('ana@example.com')).get_json()['data']['demandas']
        self.assertEqual(len(combinado), 1)

    def test_rejeita_regiao_invalida(self):
        response = self.client.post('/api/demandas', json=demanda_valida(regiao='MARTE'), headers=self._auth('ana@example.com'))
        self.assertEqual(response.status_code, 422)
        self.assertEqual(self.client.get('/api/demandas?regiao=MARTE', headers=self._auth('ana@example.com')).status_code, 422)

    # --- métricas (segurança + dados) -------------------------------------------------

    def test_metricas_exigem_perfil_gestor(self):
        self.assertEqual(self.client.get('/api/demandas/metricas').status_code, 401)
        self.assertEqual(self.client.get('/api/demandas/metricas', headers=self._auth('ana@example.com')).status_code, 403)
        self.assertEqual(self.client.get('/api/demandas/metricas', headers=self._auth('gestora@example.com')).status_code, 200)

    def test_metricas_do_painel(self):
        d1 = self._criar(regiao='NORTE')
        self._criar(titulo='Lâmpada queimada na praça', categoria='PUBLIC_LIGHTING', regiao='NORTE')
        self._criar(email='bruno@example.com', titulo='Esgoto a céu aberto', categoria='SANITATION')

        # Registrada há 10h e concluída agora; uma demanda legada concluída usa updated_at.
        demanda = db.session.get(Demanda, d1['id'])
        demanda.created_at = datetime.datetime.utcnow() - datetime.timedelta(hours=10)
        db.session.commit()
        self.client.patch(f"/api/demandas/{d1['id']}", json={'status': 'RESOLVED'}, headers=self._auth('gestora@example.com'))
        legado = Demanda(titulo='Demanda antiga concluída', descricao='Registrada antes das métricas.', categoria='infraestrutura',
                         localizacao='Rua Velha', prioridade='baixa', status='concluido', usuario_id=1,
                         created_at=datetime.datetime(2026, 1, 1, 8, 0), updated_at=datetime.datetime(2026, 1, 1, 10, 0))
        db.session.add(legado)
        db.session.commit()

        response = self.client.get('/api/demandas/metricas', headers=self._auth('gestora@example.com'))
        dados = response.get_json()['data']

        self.assertEqual(dados['total'], 4)
        self.assertEqual(dados['por_status'], {'PENDING': 2, 'IN_PROGRESS': 0, 'RESOLVED': 2, 'REJECTED': 0})
        self.assertEqual(dados['por_categoria']['ROAD_MAINTENANCE'], 2)  # inclui o legado 'infraestrutura'
        self.assertEqual(dados['por_categoria']['PUBLIC_LIGHTING'], 1)
        self.assertEqual(dados['por_regiao']['NORTE'], 2)
        self.assertEqual(dados['por_regiao']['NAO_INFORMADA'], 2)
        self.assertEqual(dados['atendidas'], 2)
        self.assertAlmostEqual(dados['tempo_medio_atendimento_horas'], 6.0, delta=0.2)  # média de 10h e 2h
        self.assertEqual(dados['taxa_resolucao'], 0.5)

    def test_metricas_sem_demandas(self):
        dados = self.client.get('/api/demandas/metricas', headers=self._auth('gestora@example.com')).get_json()['data']
        self.assertEqual(dados['total'], 0)
        self.assertIsNone(dados['tempo_medio_atendimento_horas'])


if __name__ == '__main__':
    unittest.main()
