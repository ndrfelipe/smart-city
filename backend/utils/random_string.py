import string
import random

def create_random_string() -> str:
    """
    Create a random string with 12 characters.
    """
    random_str = string.ascii_letters + string.digits + string.ascii_uppercase
    key = ''.join(random.choice(random_str) for i in range(12))
    return key

