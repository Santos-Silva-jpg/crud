# CRUD de Usuários

Atividade prática individual — sistema de Cadastro de Usuários (Create, Read,
Update, Delete), com Front-end, Back-end (API REST) e Banco de Dados
integrados, conforme os requisitos da disciplina.

## Tecnologias utilizadas

- **Front-end:** HTML5, CSS3 e JavaScript puro (fetch API), sem frameworks.
- **Back-end:** Node.js + Express (API REST).
- **Banco de Dados:** SQLite (arquivo local `database.db`), acessado via
  pacote `sqlite3`.
- **Controle de versão:** Git / GitHub.

## Estrutura da aplicação

```
CRUD/
├── server.js         # Back-end: rotas da API REST (/api/usuarios)
├── db.js             # Conexão com o banco e execução do schema
├── database.sql       # Script SQL de criação da tabela "usuarios"
├── package.json       # Dependências do back-end
├── database.db         # Arquivo do banco SQLite (gerado ao rodar o servidor)
├── public/             # Front-end (servido de forma estática pelo Express)
│   ├── index.html
│   ├── style.css
│   └── script.js
└── README.md
```

A aplicação está dividida em três camadas:

1. **Front-end** (`public/`) — interface web que lista, cadastra, edita e
   exclui usuários, consumindo a API via `fetch`.
2. **Back-end** (`server.js` + `db.js`) — API REST em Express, responsável
   pelas regras de negócio, validações e códigos HTTP.
3. **Banco de Dados** (`database.sql`) — script de criação da tabela
   `usuarios`, com chave primária e restrições de integridade.

## Modelo de dados

Tabela `usuarios`:

| Campo             | Tipo    | Restrição               |
|-------------------|---------|--------------------------|
| id                | INTEGER | PRIMARY KEY AUTOINCREMENT |
| nome              | TEXT    | NOT NULL                 |
| email             | TEXT    | NOT NULL, UNIQUE         |
| cpf               | TEXT    | NOT NULL, UNIQUE         |
| telefone          | TEXT    | NOT NULL                 |
| data_nascimento   | TEXT    | NOT NULL                 |
| data_cadastro     | TEXT    | NOT NULL, preenchido automaticamente |

## Endpoints da API

| Método | Rota                  | Descrição                    |
|--------|------------------------|-------------------------------|
| GET    | `/api/usuarios`        | Lista todos os usuários       |
| GET    | `/api/usuarios/:id`    | Consulta um usuário por ID    |
| POST   | `/api/usuarios`        | Cadastra um novo usuário      |
| PUT    | `/api/usuarios/:id`    | Atualiza um usuário existente |
| DELETE | `/api/usuarios/:id`    | Exclui um usuário             |

Códigos de retorno utilizados: `200` (sucesso), `201` (criado), `400`
(dados inválidos), `404` (não encontrado), `409` (e-mail/CPF já
cadastrado), `500` (erro interno).

## Como executar o projeto

Pré-requisito: [Node.js](https://nodejs.org/) instalado (versão 18+).

```bash
# 1. Clonar o repositório
git clone <LINK_DO_REPOSITORIO_AQUI>
cd CRUD

# 2. Instalar as dependências
npm install

# 3. Iniciar o servidor
npm start
```

O servidor iniciará em `http://localhost:3000`. Ao subir pela primeira vez,
o próprio `db.js` executa o `database.sql` e cria o arquivo `database.db`
com a tabela `usuarios` automaticamente — não é necessário rodar o SQL
manualmente, mas o script está disponível em `database.sql` caso queira
executá-lo em outro cliente SQLite (ex: DB Browser for SQLite).

## Link do repositório Git

`<COLE_AQUI_O_LINK_DO_SEU_REPOSITORIO_NO_GITHUB>`
