import { HistoricoService } from "../../../services/historico-service.js";

const service = new HistoricoService();
const tabela = document.querySelector("#tabela-historico tbody");

async function carregarHistorico() {
    const historicos = await service.getHistorico();

    tabela.innerHTML = "";

    historicos.forEach(h => {
        const tr = document.createElement("tr");

        const itensFormatados = h.itens
            .map(i => `Produto ${i.produtoId} (Qtd: ${i.quantidade}, R$ ${i.precoUnitario})`)
            .join("<br>");

        tr.innerHTML = `
            <td>${h.id}</td>
            <td>${h.usuarioId}</td>
            <td>${new Date(h.data).toLocaleString()}</td>
            <td>R$ ${h.total.toFixed(2)}</td>
            <td>${itensFormatados}</td>
            <td>${h.mercadoId}</td>

            <td>
                <button class="btn-editar" data-id="${h.id}">Editar</button>
                <button class="btn-excluir" data-id="${h.id}">Excluir</button>
            </td>
        `;

        tabela.appendChild(tr);
    });

    adicionarEventos();
}

function adicionarEventos() {
    document.querySelectorAll(".btn-editar").forEach(btn => {
        btn.addEventListener("click", () => {
            sessionStorage.setItem("historicoId", btn.dataset.id);
            window.location.href = "./editar.html";
        });
    });

    document.querySelectorAll(".btn-excluir").forEach(btn => {
        btn.addEventListener("click", () => {
            sessionStorage.setItem("historicoId", btn.dataset.id);
            window.location.href = "./excluir.html";
        });
    });
}

carregarHistorico();
