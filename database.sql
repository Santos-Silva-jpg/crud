
CREATE TABLE IF NOT EXISTS usuarios (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    nome             TEXT    NOT NULL,
    email            TEXT    NOT NULL UNIQUE,
    cpf              TEXT    NOT NULL UNIQUE,
    telefone         TEXT    NOT NULL,
    data_nascimento  TEXT    NOT NULL,
    data_cadastro    TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE INDEX IF NOT EXISTS idx_usuarios_nome ON usuarios (nome);
