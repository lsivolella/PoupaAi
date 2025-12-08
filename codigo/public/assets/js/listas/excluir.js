import { ListasService } from "../../../services/listas-service.js";

const ListasComprasService = new ListasService();

document.addEventListener("DOMContentLoaded", () => {
  carregarLista();
});

async function carregarLista() {
  const id = sessionStorage.getItem("listaExclusaoId");
  const lista = await ListasComprasService.getLista(id);

  document.getElementById(
    "info"
  ).textContent = `Tem certeza que deseja excluir a lista de compras #${lista.id}?`;

  document.getElementById("confirmar").addEventListener("click", async () => {
    await ListasComprasService.delete(id);
    window.location.href = "index.html";
  });

  document.getElementById("cancelar").addEventListener("click", () => {
    window.location.href = "index.html";
  });
}
