"""Comandos de linha de comando da API (flask --app config.config:create_app <comando>)."""
import click

from config.extensions import db
from models.user import User

PAPEIS_VALIDOS = ('cidadao', 'gestor')


@click.command('create-gestor')
@click.option('--email', required=True, help='E-mail do gestor público.')
@click.option('--nome', default=None, help='Nome exibido (obrigatório se a conta ainda não existir).')
@click.option('--senha', default=None, help='Senha (obrigatória se a conta ainda não existir).')
def create_gestor(email, nome, senha):
    """Cria uma conta de Gestor Público, ou promove a gestor uma conta já existente.

    O cadastro público (POST /auth/register) sempre cria cidadãos; gestores são
    habilitados por aqui, por quem administra o servidor.
    """
    user = User.get_user_by_email(email)
    if user:
        user.role = 'gestor'
        db.session.commit()
        click.echo(f'Conta {email} promovida a gestor.')
        return

    if not nome or not senha or len(senha) < 6:
        raise click.UsageError('Para criar uma conta nova informe --nome e --senha (mínimo 6 caracteres).')

    db.session.add(User(username=nome, email=email, password=senha, role='gestor'))
    db.session.commit()
    click.echo(f'Gestor {email} criado.')


@click.command('set-role')
@click.argument('email')
@click.argument('papel', type=click.Choice(PAPEIS_VALIDOS))
def set_role(email, papel):
    """Altera o perfil (cidadao/gestor) de uma conta existente."""
    user = User.get_user_by_email(email)
    if not user:
        raise click.UsageError(f'Nenhuma conta com o e-mail {email}.')
    user.role = papel
    db.session.commit()
    click.echo(f'Conta {email} agora é {papel}.')


def register_commands(app):
    app.cli.add_command(create_gestor)
    app.cli.add_command(set_role)
