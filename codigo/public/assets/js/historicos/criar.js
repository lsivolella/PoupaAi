import { HistoricoService } from "../../../services/historico-service.js";

const service = new HistoricoService();
const form = document.querySelector("#form-criar");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const itensRaw = form.itens.value.trim();
    let itens = [];

    try {
        itens = JSON.parse(itensRaw);
    } catch {
        alert("Itens deve ser um JSON válido!");
        return;
    }

    const novoHistorico = {
        usuarioId: Number(form.usuarioId.value),
        data: form.data.value,
        total: Number(form.total.value),
        mercadoId: Number(form.mercadoId.value),
        itens
    };

    await fetch("http://localhost:3001/historicoCompras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novoHistorico)
    });

    alert("Histórico criado com sucesso!");
    window.location.href = "./visualizar.html";
});
