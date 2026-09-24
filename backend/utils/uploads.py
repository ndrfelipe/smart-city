import os
import uuid

from flask import current_app

# Assinatura (magic bytes) de cada formato aceito. A extensão e o mimetype enviados pelo
# cliente não são confiáveis, então o tipo é decidido pelo conteúdo do arquivo.
_IMAGE_SIGNATURES = {
    'jpg': lambda head: head.startswith(b'\xff\xd8\xff'),
    'png': lambda head: head.startswith(b'\x89PNG\r\n\x1a\n'),
    'webp': lambda head: head[:4] == b'RIFF' and head[8:12] == b'WEBP',
    'heic': lambda head: head[4:8] == b'ftyp' and head[8:12] in (b'heic', b'heix', b'mif1', b'msf1', b'hevc'),
}

ALLOWED_FORMATS_LABEL = 'JPG, PNG, WEBP ou HEIC'


def detect_image_extension(file_storage):
    """Retorna a extensão canônica ('jpg', 'png', ...) ou None se o arquivo não for uma imagem aceita."""
    head = file_storage.stream.read(16)
    file_storage.stream.seek(0)
    for extension, matches in _IMAGE_SIGNATURES.items():
        if matches(head):
            return extension
    return None


def upload_folder():
    folder = current_app.config['UPLOAD_FOLDER']
    os.makedirs(folder, exist_ok=True)
    return folder


def save_image(file_storage, extension):
    """Salva com nome aleatório (não dá para adivinhar a URL de outra foto) e devolve o nome do arquivo."""
    filename = f'{uuid.uuid4().hex}.{extension}'
    file_storage.save(os.path.join(upload_folder(), filename))
    return filename


def delete_image(filename):
    if not filename:
        return
    path = os.path.join(current_app.config['UPLOAD_FOLDER'], os.path.basename(filename))
    try:
        os.remove(path)
    except FileNotFoundError:
        pass
