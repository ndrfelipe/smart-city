import json
import threading
import time
import requests
from app import create_app

SERVER_URL = 'http://127.0.0.1:5000'
REGISTER_ENDPOINT = '/auth/register'

payloads = [
    {
        'username': 'sim_user_1',
        'email': 'sim_user_1@example.com',
        'password': 'senha123',
        'role': 'cidadao'
    },
    {
        'username': 'sim_user_2',
        'email': 'sim_user_2@example.com',
        'password': 'senha123',
        'role': 'cidadao'
    },
    {
        'username': 'sim_user_3',
        'email': 'sim_user_3@example.com',
        'password': 'senha123',
        'role': 'cidadao'
    }
]

results = []


def run_server():
    app = create_app()
    app.run(host='127.0.0.1', port=5000, debug=False, use_reloader=False, threaded=True)


def send_register_request(thread_id, payload):
    url = f'{SERVER_URL}{REGISTER_ENDPOINT}'
    print(f'[Thread {thread_id}] Enviando POST para {url} com payload {payload}')
    try:
        response = requests.post(url, json=payload, timeout=10)
        data = response.json() if response.headers.get('Content-Type', '').startswith('application/json') else response.text
        print(f'[Thread {thread_id}] Status: {response.status_code} | Resposta: {data}')
        results.append((thread_id, response.status_code, data))
    except requests.RequestException as exc:
        print(f'[Thread {thread_id}] Erro ao enviar requisição: {exc}')
        results.append((thread_id, 'error', str(exc)))


def main():
    print('Iniciando servidor Flask em um thread separado...')
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()

    time.sleep(1)

    print('Disparando 3 threads simultâneas para POST /auth/register')
    worker_threads = []
    for index, payload in enumerate(payloads, start=1):
        thread = threading.Thread(target=send_register_request, args=(index, payload))
        worker_threads.append(thread)
        thread.start()

    for thread in worker_threads:
        thread.join()

    print('\nResultados da simulação:')
    for thread_id, status, data in results:
        print(f'  Thread {thread_id} -> status={status} | data={data}')

    print('\nSimulação concluída. O servidor continua ativo enquanto o processo estiver rodando.')
    print('Pressione Ctrl+C para encerrar ou aguarde o término do script.')


if __name__ == '__main__':
    main()
