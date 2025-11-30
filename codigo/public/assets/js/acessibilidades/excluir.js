import { AcessibilidadeService } from "../../../services/acessibilidade-service.js";

const service = new AcessibilidadeService();
const id = sessionStorage.getItem("acessibilidadeId");

const btnExcluir = document.querySelector("#btn-confirmar-exclusao");
const btnCancelar = document.querySelector("#btn-cancelar");
const texto = document.querySelector("#info-acessibilidade");

async function carregar() {
    if (!id) {
        alert("Nenhuma acessibilidade selecionada!");
        window.location.href = "./index.html";
        return;
    }

    const acessibilidade = await service.getAcessibilidade(id);

    texto.innerHTML = `
        <strong>ID:</strong> ${acessibilidade.id}<br>
        <strong>Tipo:</strong> ${acessibilidade.tipo}
    `;
}

btnExcluir.addEventListener("click", async () => {
    if (confirm("Deseja realmente excluir esta acessibilidade?")) {
        await service.excluirAcessibilidade(id);
        alert("Acessibilidade excluída com sucesso!");
        window.location.href = "./index.html";
    }
});

btnCancelar.addEventListener("click", () => {
    window.location.href = "./index.html";
});

carregar();
