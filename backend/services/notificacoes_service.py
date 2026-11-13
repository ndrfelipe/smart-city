"""Notificações push (Expo Push API) do fluxo registrar -> acompanhar -> notificar.

O app registra o Expo push token do aparelho em PUT /auth/push-token. Quando um gestor
muda o status de uma demanda, o autor recebe uma notificação com o novo status.
"""
import json
import logging
import os
import re
import threading
import urllib.request

EXPO_PUSH_URL = os.getenv('EXPO_PUSH_URL', 'https://exp.host/--/api/v2/push/send')
EXPO_PUSH_TOKEN_RE = re.compile(r'^Expo(nent)?PushToken\[[^\]]+\]$')

STATUS_LABELS = {
    'PENDING': 'Pendente',
    'IN_PROGRESS': 'Em análise',
    'RESOLVED': 'Concluída',
    'REJECTED': 'Recusada',
}

logger = logging.getLogger(__name__)


def token_valido(token) -> bool:
    return isinstance(token, str) and bool(EXPO_PUSH_TOKEN_RE.match(token))


def montar_mensagem_status(token: str, demanda, status_novo: str) -> dict:
    label = STATUS_LABELS.get(status_novo, status_novo)
    return {
        'to': token,
        'title': 'Sua demanda foi atualizada',
        'body': f'"{demanda.titulo}" agora está: {label}.',
        'sound': 'default',
        'channelId': 'demandas',
        'data': {'tipo': 'status_demanda', 'demandaId': demanda.id, 'status': status_novo},
    }


def _post_expo(mensagens: list) -> None:
    corpo = json.dumps(mensagens).encode('utf-8')
    requisicao = urllib.request.Request(
        EXPO_PUSH_URL,
        data=corpo,
        headers={'Content-Type': 'application/json', 'Accept': 'application/json'},
        method='POST',
    )
    try:
        with urllib.request.urlopen(requisicao, timeout=10) as resposta:
            retorno = json.loads(resposta.read().decode('utf-8') or '{}')
        for ticket in retorno.get('data', []) if isinstance(retorno.get('data'), list) else []:
            if ticket.get('status') == 'error':
                logger.warning('[PUSH] Expo recusou a notificação: %s', ticket.get('message'))
    except Exception as erro:  # rede fora do ar não pode quebrar a atualização da demanda
        logger.warning('[PUSH] Falha ao enviar notificação: %s', erro)


def enviar_push(mensagens: list) -> None:
    """Envia em segundo plano: a resposta da API não espera o serviço da Expo."""
    if not mensagens or os.getenv('PUSH_NOTIFICATIONS_DISABLED') == '1':
        return
    threading.Thread(target=_post_expo, args=(mensagens,), daemon=True).start()


def notificar_mudanca_status(demanda, status_novo: str, autor_da_mudanca_id: int) -> bool:
    """Avisa o autor da demanda (se não foi ele mesmo quem mudou e se tem aparelho registrado)."""
    autor = demanda.autor
    if autor is None or autor.id == autor_da_mudanca_id or not token_valido(autor.push_token):
        return False
    enviar_push([montar_mensagem_status(autor.push_token, demanda, status_novo)])
    return True
