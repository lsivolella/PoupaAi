import {UsuariosService} from "../../../services/usuario-service.js";

document.addEventListener("DOMContentLoaded", () => {
    carregarDados();
    document.getElementById("formUsuario").addEventListener("submit", salvar);
});

async function carregarDados() {
    const id = sessionStorage.getItem("usuarioEdicaoId");
    const usuario = await UsuariosService.getById(id);

    document.getElementById("nome").value = usuario.nome;
    document.getElementById("email").value = usuario.email;
    document.getElementById("senha").value = usuario.senha;
}

async function salvar(event) {
    event.preventDefault();

    const id = parseInt(sessionStorage.getItem("usuarioEdicaoId"));
    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    const usuarioAtualizado = {
        id,
        nome,
        email,
        senha
    };

    await UsuariosService.update(usuarioAtualizado);

    window.location.href = "index.html";
}
