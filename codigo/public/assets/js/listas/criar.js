import ListasComprasService from "../../../services/listas-service.js";
import UsuariosService from "../../../services/usuario-service.js";
import ProdutosService from "../../../services/produto-service.js";

document.addEventListener("DOMContentLoaded", () => {
  carregarSelects();
  document.getElementById("formLista").addEventListener("submit", salvar);
  document
    .getElementById("addProduto")
    .addEventListener("click", adicionarProduto);
});

async function carregarSelects() {
  const usuarios = await UsuariosService.getAll();
  const produtos = await ProdutosService.getAll();

  const usuarioSelect = document.getElementById("usuario");
  const produtoSelect = document.getElementById("produto");

  usuarios.forEach((u) => {
    usuarioSelect.innerHTML += `<option value="${u.id}">${u.nome}</option>`;
  });

  produtos.forEach((p) => {
    produtoSelect.innerHTML += `<option value="${p.id}">${p.nome}</option>`;
  });
}

function adicionarProduto() {
  const produtoId = document.getElementById("produto").value;
  const quantidade = document.getElementById("quantidade").value;
  const valorUnitario = document.getElementById("valorUnitario").value;

  if (!produtoId || !quantidade || !valorUnitario) return;

  const tbody = document.getElementById("itensLista");

  const tr = document.createElement("tr");
  tr.innerHTML = `
        <td data-produto="${produtoId}">${
    document.querySelector(`#produto option[value="${produtoId}"]`).text
  }</td>
        <td>${quantidade}</td>
        <td>R$ ${parseFloat(valorUnitario).toFixed(2)}</td>
        <td><button class="remover-item">Remover</button></td>
    `;

  tbody.appendChild(tr);

  tr.querySelector(".remover-item").addEventListener("click", () =>
    tr.remove()
  );
}

async function salvar(event) {
  event.preventDefault();

  const usuarioId = parseInt(document.getElementById("usuario").value);
  const valor = parseFloat(document.getElementById("valor").value);

  const produtos = [...document.querySelectorAll("#itensLista tr")].map(
    (tr) => ({
      produtoId: parseInt(tr.children[0].getAttribute("data-produto")),
      quantidade: parseInt(tr.children[1].textContent),
      valorUnitario: parseFloat(tr.children[2].textContent.replace("R$ ", "")),
    })
  );

  const novaLista = {
    usuarioId,
    valor,
    produtos,
  };

  await ListasComprasService.create(novaLista);

  window.location.href = "index.html";
}
