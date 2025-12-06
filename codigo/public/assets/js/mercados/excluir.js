import { MercadoService } from "../../../services/mercado-service.js";

const service = new MercadoService();
const id = sessionStorage.getItem("mercadoId");

const btnExcluir = document.querySelector("#btn-confirmar-exclusao");
const texto = document.querySelector("#info-mercado");

async function carregar() {
  if (!id) {
    alert("Nenhum mercado selecionado!");
    window.location.href = "./visualizar.html";
    return;
  }

  const mercado = await service.getMercado(id);

  texto.innerHTML = `
        <strong>ID:</strong> ${mercado.id}<br>
        <strong>Nome:</strong> ${mercado.nome}<br>
        <strong>Endereço:</strong> ${mercado.endereco}
    `;
}

btnExcluir.addEventListener("click", async () => {
  await service.excluirMercado(id);
  alert("Mercado excluído com sucesso!");
  window.location.href = "./visualizar.html";
});

carregar();
