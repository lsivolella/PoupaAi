import { AvaliacaoService } from "../../../services/avaliacao-service";

const service = new AvaliacaoService();
const id = sessionStorage.getItem("avaliacaoId");
const form = document.querySelector("#form-editar");

async function carregarDados() {
  if (!id) {
    alert("Nenhuma avaliação selecionada!");
    window.location.href = "./visualizar.html";
    return;
  }

  const avaliacao = await service.getAvaliacao(id);

  form.usuarioId.value = avaliacao.usuarioId;
  form.mercadoId.value = avaliacao.mercadoId;
  form.nota.value = avaliacao.nota;
  form.comentario.value = avaliacao.comentario;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const dadosAtualizados = {
    usuarioId: Number(form.usuarioId.value),
    mercadoId: Number(form.mercadoId.value),
    nota: Number(form.nota.value),
    comentario: form.comentario.value,
  };

  await service.atualizarAvaliacao(id, dadosAtualizados);

  alert("Avaliação atualizada com sucesso!");
  window.location.href = "./visualizar.html";
});

carregarDados();
