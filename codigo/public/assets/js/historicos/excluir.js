import { HistoricoService } from "../../../services/historico-service.js";
const id = sessionStorage.getItem("historicoId");

const btnExcluir = document.querySelector("#btn-confirmar-exclusao");
const divInfo = document.querySelector("#info-historico");

async function carregar() {
    if (!id) {
        alert("Nenhum histórico selecionado!");
        window.location.href = "./visualizar.html";
        return;
    }

    const r = await fetch(`http://localhost:3001/historicoCompras/${id}`);
    const h = await r.json();

    const itensFormatados = h.itens
        .map(i => `Produto ${i.produtoId} (Qtd: ${i.quantidade}, R$ ${i.precoUnitario})`)
        .join("<br>");

    divInfo.innerHTML = `
        <strong>ID:</strong> ${h.id}<br>
        <strong>Usuário ID:</strong> ${h.usuarioId}<br>
        <strong>Data:</strong> ${new Date(h.data).toLocaleString()}<br>
        <strong>Total:</strong> R$ ${h.total}<br>
        <strong>Mercado:</strong> ${h.mercadoId}<br>
        <strong>Itens:</strong><br>${itensFormatados}
    `;
}

btnExcluir.addEventListener("click", async () => {
    await fetch(`http://localhost:3001/historicoCompras/${id}`, {
        method: "DELETE"
    });

    alert("Histórico excluído com sucesso!");
    window.location.href = "./visualizar.html";
});

carregar();
