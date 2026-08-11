// script.js - Front-end: consome a API REST em /api/usuarios
const API_URL = "/api/usuarios";

document.addEventListener("DOMContentLoaded", carregarUsuarios);

// carrega e renderiza a lista de usuários
async function carregarUsuarios() {
    const list = document.getElementById("list");
    list.innerHTML = "<li>Carregando...</li>";

    try {
        const resp = await fetch(API_URL);
        if (!resp.ok) throw new Error("Erro ao buscar usuários.");
        const usuarios = await resp.json();

        list.innerHTML = "";

        if (usuarios.length === 0) {
            list.innerHTML = "<li>Nenhum usuário cadastrado.</li>";
            return;
        }

        usuarios.forEach((usuario) => {
            const item = document.createElement("li");

            const info = document.createElement("div");
            info.className = "info";
            info.innerHTML = `
                <strong>${escapeHtml(usuario.nome)}</strong><br>
                ${escapeHtml(usuario.email)} — ${formatarCpf(usuario.cpf)}<br>
                Tel: ${escapeHtml(usuario.telefone)} | Nasc.: ${formatarData(usuario.data_nascimento)}<br>
                <small>Cadastrado em: ${usuario.data_cadastro}</small>
            `;

            const acoes = document.createElement("div");
            acoes.className = "acoes";

            const btnEditar = document.createElement("button");
            btnEditar.textContent = "Editar";
            btnEditar.onclick = () => editarUsuario(usuario);

            const btnExcluir = document.createElement("button");
            btnExcluir.textContent = "Excluir";
            btnExcluir.onclick = () => excluirUsuario(usuario.id, usuario.nome);

            acoes.appendChild(btnEditar);
            acoes.appendChild(btnExcluir);

            item.appendChild(info);
            item.appendChild(acoes);
            list.appendChild(item);
        });
    } catch (err) {
        list.innerHTML = "<li>Erro ao carregar usuários.</li>";
        console.error(err);
    }
}

// C - U Salva um novo usuário ou atualiza um existente

async function salvarUsuario() {
    const id = document.getElementById("userId").value;
    const nome = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const cpf = document.getElementById("cpf").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const data_nascimento = document.getElementById("data").value;

    if (!nome || !email || !cpf || !telefone || !data_nascimento) {
        mostrarMensagem("Preencha todos os campos obrigatórios.", true);
        return;
    }

    const payload = { nome, email, cpf, telefone, data_nascimento };
    const editando = Boolean(id);
    const url = editando ? `${API_URL}/${id}` : API_URL;
    const method = editando ? "PUT" : "POST";

    try {
        const resp = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const data = await resp.json();

        if (!resp.ok) {
            const detalhes = data.detalhes ? data.detalhes.join(" ") : "";
            mostrarMensagem(`${data.erro || "Erro ao salvar."} ${detalhes}`, true);
            return;
        }

        mostrarMensagem(editando ? "Usuário atualizado com sucesso!" : "Usuário cadastrado com sucesso!", false);
        limparFormulario();
        carregarUsuarios();
    } catch (err) {
        mostrarMensagem("Erro de comunicação com o servidor.", true);
        console.error(err);
    }
}

// Preenche o formulário em modo edição
function editarUsuario(usuario) {
    document.getElementById("userId").value = usuario.id;
    document.getElementById("name").value = usuario.nome;
    document.getElementById("email").value = usuario.email;
    document.getElementById("cpf").value = usuario.cpf;
    document.getElementById("telefone").value = usuario.telefone;
    document.getElementById("data").value = usuario.data_nascimento;

    document.getElementById("btnSalvar").textContent = "Atualizar";
    document.getElementById("btnCancelar").style.display = "inline-block";
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function cancelarEdicao() {
    limparFormulario();
}

function limparFormulario() {
    document.getElementById("userId").value = "";
    document.getElementById("name").value = "";
    document.getElementById("email").value = "";
    document.getElementById("cpf").value = "";
    document.getElementById("telefone").value = "";
    document.getElementById("data").value = "";
    document.getElementById("btnSalvar").textContent = "Salvar";
    document.getElementById("btnCancelar").style.display = "none";
}

//delete - Exclui um usuário
async function excluirUsuario(id, nome) {
    const confirmar = confirm(`Deseja realmente excluir o usuário "${nome}"?`);
    if (!confirmar) return;

    try {
        const resp = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        const data = await resp.json();

        if (!resp.ok) {
            mostrarMensagem(data.erro || "Erro ao excluir usuário.", true);
            return;
        }

        mostrarMensagem("Usuário excluído com sucesso.", false);
        carregarUsuarios();
    } catch (err) {
        mostrarMensagem("Erro de comunicação com o servidor.", true);
        console.error(err);
    }
}

// Utilitários
function mostrarMensagem(texto, isErro) {
    const el = document.getElementById("mensagem");
    el.textContent = texto;
    el.className = "mensagem " + (isErro ? "erro" : "sucesso");
    setTimeout(() => { el.textContent = ""; el.className = "mensagem"; }, 4000);
}

function formatarCpf(cpf) {
    if (!cpf) return "";
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function formatarData(data) {
    if (!data) return "";
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}
