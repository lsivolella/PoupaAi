import {UsuariosService} from "../../../services/usuario-service.js";

document.addEventListener("DOMContentLoaded", () => {
    carregarUsuarios();
});

async function carregarUsuarios() {
    const usuarios = await UsuariosService.getAll();
    const tbody = document.getElementById("tabelaUsuarios");

    tbody.innerHTML = "";

    usuarios.forEach(usuario => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${usuario.id}</td>
            <td>${usuario.nome}</td>
            <td>${usuario.email}</td>
            <td>
                <button class="editar-btn" data-id="${usuario.id}">Editar</button>
                <button class="excluir-btn" data-id="${usuario.id}">Excluir</button>
            </td>
        `;

        tbody.appendChild(tr);
    });

    adicionarEventos();
}

function adicionarEventos() {
    document.querySelectorAll(".editar-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            sessionStorage.setItem("usuarioEdicaoId", btn.dataset.id);
            window.location.href = "editar.html";
        });
    });

    document.querySelectorAll(".excluir-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            sessionStorage.setItem("usuarioExclusaoId", btn.dataset.id);
            window.location.href = "excluir.html";
        });
    });
}
