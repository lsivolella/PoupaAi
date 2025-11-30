import ListasComprasService from "../../../services/listas-service.js";
import UsuariosService from "../../../services/usuario-service.js";
import ProdutosService from "../../../services/produto-service.js";

document.addEventListener("DOMContentLoaded", () => {
    carregarListasCompras();
});

async function carregarListasCompras() {
    const listas = await ListasComprasService.getAll();
    const usuarios = await UsuariosService.getAll();
    const produtos = await ProdutosService.getAll();

    const tbody = document.getElementById("tabelaListasCompras");
    tbody.innerHTML = "";

    listas.forEach(lista => {
        const usuario = usuarios.find(u => u.id === lista.usuarioId)?.nome || "—";

        const totalItens = lista.produtos
            .reduce((acc, p) => acc + (p.quantidade * p.valorUnitario), 0)
            .toFixed(2);

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${lista.id}</td>
            <td>${usuario}</td>
            <td>R$ ${parseFloat(lista.valor).toFixed(2)}</td>
            <td>R$ ${totalItens}</td>
            <td>
                <button class="editar-btn" data-id="${lista.id}">Editar</button>
                <button class="excluir-btn" data-id="${lista.id}">Excluir</button>
            </td>
        `;

        tbody.appendChild(tr);
    });

    adicionarEventos();
}

function adicionarEventos() {
    document.querySelectorAll(".editar-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            sessionStorage.setItem("listaEdicaoId", btn.dataset.id);
            window.location.href = "editar.html";
        });
    });

    document.querySelectorAll(".excluir-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            await ListasComprasService.delete(btn.dataset.id);
            carregarListasCompras();
        });
    });
}
