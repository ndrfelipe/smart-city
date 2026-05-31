
def get_token_by_header(request) -> str | None:
    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    
    return auth_header.split(' ')[1]