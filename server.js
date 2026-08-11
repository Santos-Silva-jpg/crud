// server.js - API REST para o CRUD de Usuários
// Camadas: server.js (rotas/HTTP) -> db.js (conexão) -> database.sql (schema)

const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// -----------------------------------------------------------
// Regras de negócio / validações
// -----------------------------------------------------------

function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Validação de CPF com dígitos verificadores (algoritmo oficial)
function validarCPF(cpfBruto) {
    const cpf = String(cpfBruto).replace(/[^\d]+/g, "");

    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(10))) return false;

    return true;
}

// Middleware: valida payload de criação/edição de usuário
function validarUsuario(req, res, next) {
    const { nome, email, cpf, telefone, data_nascimento } = req.body;
    const erros = [];

    if (!nome || !nome.trim()) erros.push("O campo 'nome' é obrigatório.");
    if (!email || !email.trim()) erros.push("O campo 'email' é obrigatório.");
    else if (!validarEmail(email)) erros.push("E-mail em formato inválido.");

    if (!cpf || !cpf.trim()) erros.push("O campo 'cpf' é obrigatório.");
    else if (!validarCPF(cpf)) erros.push("CPF inválido.");

    if (!telefone || !telefone.trim()) erros.push("O campo 'telefone' é obrigatório.");
    if (!data_nascimento || !data_nascimento.trim()) erros.push("O campo 'data_nascimento' é obrigatório.");
    else if (isNaN(Date.parse(data_nascimento))) erros.push("Data de nascimento inválida.");

    if (erros.length > 0) {
        return res.status(400).json({ erro: "Dados inválidos.", detalhes: erros });
    }

    // Normaliza CPF (somente dígitos) antes de seguir
    req.body.cpf = String(cpf).replace(/[^\d]+/g, "");
    next();
}

// -----------------------------------------------------------
// Rotas da API REST - /api/usuarios
// -----------------------------------------------------------

// CREATE - Cadastrar usuário
app.post("/api/usuarios", validarUsuario, (req, res) => {
    const { nome, email, cpf, telefone, data_nascimento } = req.body;

    const sql = `INSERT INTO usuarios (nome, email, cpf, telefone, data_nascimento)
                 VALUES (?, ?, ?, ?, ?)`;

    db.run(sql, [nome.trim(), email.trim(), cpf, telefone.trim(), data_nascimento], function (err) {
        if (err) {
            if (err.message.includes("UNIQUE")) {
                return res.status(409).json({ erro: "Já existe um usuário com este e-mail ou CPF." });
            }
            return res.status(500).json({ erro: "Erro ao cadastrar usuário.", detalhes: err.message });
        }

        db.get("SELECT * FROM usuarios WHERE id = ?", [this.lastID], (err2, row) => {
            if (err2) return res.status(500).json({ erro: "Usuário criado, mas houve erro ao buscá-lo." });
            res.status(201).json(row);
        });
    });
});

// READ - Consultar todos os usuários
app.get("/api/usuarios", (req, res) => {
    db.all("SELECT * FROM usuarios ORDER BY nome ASC", [], (err, rows) => {
        if (err) return res.status(500).json({ erro: "Erro ao consultar usuários.", detalhes: err.message });
        res.status(200).json(rows);
    });
});

// READ - Consultar usuário por ID
app.get("/api/usuarios/:id", (req, res) => {
    const { id } = req.params;
    db.get("SELECT * FROM usuarios WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ erro: "Erro ao consultar usuário.", detalhes: err.message });
        if (!row) return res.status(404).json({ erro: "Usuário não encontrado." });
        res.status(200).json(row);
    });
});

// UPDATE - Atualizar usuário
app.put("/api/usuarios/:id", validarUsuario, (req, res) => {
    const { id } = req.params;
    const { nome, email, cpf, telefone, data_nascimento } = req.body;

    db.get("SELECT * FROM usuarios WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ erro: "Erro ao buscar usuário.", detalhes: err.message });
        if (!row) return res.status(404).json({ erro: "Usuário não encontrado." });

        const sql = `UPDATE usuarios
                     SET nome = ?, email = ?, cpf = ?, telefone = ?, data_nascimento = ?
                     WHERE id = ?`;

        db.run(sql, [nome.trim(), email.trim(), cpf, telefone.trim(), data_nascimento, id], function (err2) {
            if (err2) {
                if (err2.message.includes("UNIQUE")) {
                    return res.status(409).json({ erro: "Já existe outro usuário com este e-mail ou CPF." });
                }
                return res.status(500).json({ erro: "Erro ao atualizar usuário.", detalhes: err2.message });
            }

            db.get("SELECT * FROM usuarios WHERE id = ?", [id], (err3, updated) => {
                if (err3) return res.status(500).json({ erro: "Usuário atualizado, mas houve erro ao buscá-lo." });
                res.status(200).json(updated);
            });
        });
    });
});

// DELETE - Excluir usuário
app.delete("/api/usuarios/:id", (req, res) => {
    const { id } = req.params;

    db.get("SELECT * FROM usuarios WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ erro: "Erro ao buscar usuário.", detalhes: err.message });
        if (!row) return res.status(404).json({ erro: "Usuário não encontrado." });

        db.run("DELETE FROM usuarios WHERE id = ?", [id], function (err2) {
            if (err2) return res.status(500).json({ erro: "Erro ao excluir usuário.", detalhes: err2.message });
            res.status(200).json({ mensagem: "Usuário excluído com sucesso.", id: Number(id) });
        });
    });
});

// Rota inexistente da API
app.use("/api", (req, res) => {
    res.status(404).json({ erro: "Rota não encontrada." });
});

// Tratamento de erros genérico
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ erro: "Erro interno do servidor." });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
