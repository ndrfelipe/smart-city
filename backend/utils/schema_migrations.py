from sqlalchemy import inspect, text

# db.create_all() só cria tabelas que ainda não existem: colunas novas em tabelas já
# criadas (ex.: bancos SQLite de desenvolvimento) precisam ser adicionadas aqui.
# Cada entrada: (tabela, coluna, definição SQL da coluna).
_PENDING_COLUMNS = [
    ('demandas', 'foto', 'VARCHAR(255)'),
    ('demandas', 'texto_busca', 'TEXT'),
    ('demandas', 'regiao', 'VARCHAR(20)'),
    ('demandas', 'resolvido_em', 'TIMESTAMP'),
    ('users', 'push_token', 'VARCHAR(255)'),
]


def apply_pending_columns(db):
    inspector = inspect(db.engine)
    existing_tables = set(inspector.get_table_names())

    with db.engine.begin() as connection:
        for table, column, definition in _PENDING_COLUMNS:
            if table not in existing_tables:
                continue
            columns = {info['name'] for info in inspector.get_columns(table)}
            if column not in columns:
                print(f"Migrando banco: adicionando coluna {table}.{column}")
                connection.execute(text(f'ALTER TABLE {table} ADD COLUMN {column} {definition}'))


def backfill_texto_busca(db):
    """Preenche o texto de busca de demandas criadas antes da coluna existir."""
    from models.demanda import Demanda, normalizar_busca

    pendentes = Demanda.query.filter(Demanda.texto_busca.is_(None)).all()
    for demanda in pendentes:
        demanda.texto_busca = normalizar_busca(demanda.titulo, demanda.descricao, demanda.localizacao)
    if pendentes:
        print(f"Migrando banco: texto de busca preenchido em {len(pendentes)} demanda(s)")
        db.session.commit()
