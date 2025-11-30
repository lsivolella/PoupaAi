import UsuariosService from "../../../services/usuario-service.js";

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("formUsuario").addEventListener("submit", salvar);
});

async function salvar(event) {
    event.preventDefault();

    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    const novoUsuario = { nome, email, senha };

    await UsuariosService.create(novoUsuario);

    window.location.href = "index.html";
}
