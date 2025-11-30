import { AcessibilidadeService } from "../../../services/acessibilidade-service.js";

const service = new AcessibilidadeService();
const form = document.querySelector("#form-acessibilidade");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nova = {
        tipo: document.querySelector("#tipo-input").value
    };

    await service.criarAcessibilidade(nova);

    alert("Acessibilidade criada com sucesso!");
    window.location.href = "./visualizar.html";
});
