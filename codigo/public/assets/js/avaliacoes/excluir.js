import { AvaliacaoService } from "../../../services/avaliacao-service";

const service = new AvaliacaoService();
const id = sessionStorage.getItem("avaliacaoId");

const btnExcluir = document.querySelector("#btn-confirmar-exclusao");
const texto = document.querySelector("#info-avaliacao");

async function carregar() {
  if (!id) {
    alert("Nenhuma avaliação selecionada!");
    window.location.href = "./visualizar.html";
    return;
  }

  const avaliacao = await service.getAvaliacao(id);

  texto.innerHTML = `
        <strong>ID:</strong> ${avaliacao.id}<br>
        <strong>Usuário ID:</strong> ${avaliacao.usuarioId}<br>
        <strong>Mercado ID:</strong> ${avaliacao.mercadoId}<br>
        <strong>Nota:</strong> ${avaliacao.nota}<br>
        <strong>Comentário:</strong> ${avaliacao.comentario}
    `;
}

btnExcluir.addEventListener("click", async () => {
  await service.excluirAvaliacao(id);
  alert("Avaliação excluída com sucesso!");
  window.location.href = "./visualizar.html";
});

carregar();
