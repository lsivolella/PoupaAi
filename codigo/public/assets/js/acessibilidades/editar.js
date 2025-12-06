import { AcessibilidadeService } from "../../../services/acessibilidade-service.js";

const service = new AcessibilidadeService();
const id = sessionStorage.getItem("acessibilidadeId");
const form = document.querySelector("#form-editar");

async function carregarDados() {
  if (!id) {
    alert("Nenhuma acessibilidade selecionada!");
    window.location.href = "./index.html";
    return;
  }

  const acessibilidade = await service.getAcessibilidade(id);

  form.tipo.value = acessibilidade.tipo;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const dados = {
    tipo: form.tipo.value,
  };

  await service.atualizarAcessibilidade(id, dados);

  alert("Acessibilidade atualizada com sucesso!");
  window.location.href = "./index.html";
});

carregarDados();
