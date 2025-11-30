import UsuariosService from "../../../services/usuario-service.js";

document.addEventListener("DOMContentLoaded", () => {
    carregarUsuario();
});

async function carregarUsuario() {
    const id = sessionStorage.getItem("usuarioExclusaoId");
    const usuario = await UsuariosService.getById(id);

    document.getElementById("info").textContent =
        `Tem certeza que deseja excluir o usuário "${usuario.nome}" (#${usuario.id})?`;

    document.getElementById("confirmar").addEventListener("click", async () => {
        await UsuariosService.delete(id);
        window.location.href = "index.html";
    });

    document.getElementById("cancelar").addEventListener("click", () => {
        window.location.href = "index.html";
    });
}
