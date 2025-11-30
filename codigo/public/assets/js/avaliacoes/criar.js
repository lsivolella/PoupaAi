import { AvaliacaoService } from "../../../services/avaliacao-service";

const service = new AvaliacaoService();
const form = document.querySelector("#form-criar");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nova = {
        usuarioId: Number(form.usuarioId.value),
        mercadoId: Number(form.mercadoId.value),
        nota: Number(form.nota.value),
        comentario: form.comentario.value
    };

    await service.criarAvaliacao(nova);

    alert("Avaliação criada com sucesso!");
    window.location.href = "./visualizar.html";
});
