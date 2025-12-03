import { UsuarioService } from "../../../services/usuario-service.js";

const usuarioService = new UsuarioService();

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("form-usuario").addEventListener("submit", salvar);
});

async function salvar(event) {
    event.preventDefault();

    const nome = document.getElementById("nome-input").value;
    const email = document.getElementById("email-input").value;
    const senha = document.getElementById("senha-input").value;

    const novoUsuario = { nome, email, senha };

    await usuarioService.criarUsuario(novoUsuario);

    window.location.href = "index.html";
}
