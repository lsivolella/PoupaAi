import { HistoricoService } from "../../../services/historico-service.js";
const id = sessionStorage.getItem("historicoId");
const form = document.querySelector("#form-editar");

async function carregarDados() {
    if (!id) {
        alert("Nenhum histórico selecionado!");
        window.location.href = "./visualizar.html";
        return;
    }

    const r = await fetch(`http://localhost:3001/historicoCompras/${id}`);
    const h = await r.json();

    form.usuarioId.value = h.usuarioId;
    form.data.value = h.data;
    form.total.value = h.total;
    form.mercadoId.value = h.mercadoId;
    form.itens.value = JSON.stringify(h.itens, null, 2);
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    let itensParseados = [];

    try {
        itensParseados = JSON.parse(form.itens.value);
    } catch {
        alert("Os itens devem ser um JSON válido!");
        return;
    }

    const dadosAtualizados = {
        usuarioId: Number(form.usuarioId.value),
        data: form.data.value,
        total: Number(form.total.value),
        mercadoId: Number(form.mercadoId.value),
        itens: itensParseados
    };

    await fetch(`http://localhost:3001/historicoCompras/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosAtualizados)
    });

    alert("Histórico atualizado com sucesso!");
    window.location.href = "./visualizar.html";
});

carregarDados();
