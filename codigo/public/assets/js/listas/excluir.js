import ListasComprasService from "../../../services/listas-service.js";

document.addEventListener("DOMContentLoaded", () => {
  carregarLista();
});

async function carregarLista() {
  const id = sessionStorage.getItem("listaExclusaoId");
  const lista = await ListasComprasService.getById(id);

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
