from flask import jsonify

def standard_response(data=None, message="", status_code=200):
    """
    Standardizes the JSON response format.
    """
    response = {
        "data": data,
        "message": message,
        "status_code": status_code
    }
    return jsonify(response), status_code
