from marshmallow import Schema, fields, validate, validates, ValidationError
from models.user import User

class UserRegistrationSchema(Schema):
    username = fields.String(required=True, validate=validate.Length(min=3, max=50))
    email = fields.Email(required=True)
    password = fields.String(required=True, validate=validate.Length(min=6))
    role = fields.String(validate=validate.OneOf(['cidadao', 'gestor', 'servidor']), dump_default='cidadao')

    @validates('email')
    def validate_email(self, value, **kwargs):
        if User.query.filter_by(email=value).first():
            raise ValidationError('E-mail já cadastrado.')

class UserLoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.String(required=True, validate=validate.Length(min=6))


class UserResponseSchema(Schema):
    id = fields.Int()
    name = fields.Str(attribute='username')
    email = fields.Str()
    role = fields.Str()  # retorna o valor exato do banco, sem transformação
    createdAt = fields.DateTime(attribute='created_at')
