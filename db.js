

const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const DB_PATH = path.join(__dirname, "database.db");
const SCHEMA_PATH = path.join(__dirname, "database.sql");

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error("Erro ao conectar ao banco de dados:", err.message);
        process.exit(1);
    }
    console.log("Conectado ao banco SQLite em:", DB_PATH);
});

// Garante integridade referencial (boa prática, mesmo com uma única tabela)
db.run("PRAGMA foreign_keys = ON");

const schema = fs.readFileSync(SCHEMA_PATH, "utf8");
db.exec(schema, (err) => {
    if (err) {
        console.error("Erro ao criar/verificar tabela 'usuarios':", err.message);
        process.exit(1);
    } else {
        console.log("Tabela 'usuarios' pronta para uso.");
    }
});

module.exports = db;
