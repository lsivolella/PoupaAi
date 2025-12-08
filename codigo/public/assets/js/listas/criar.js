import { ListasService } from "../../../services/listas-service.js";
import { UsuarioService } from "../../../services/usuario-service.js";
import { ProdutoService } from "../../../services/produto-service.js";

const ListasComprasService = new ListasService();
const UsuariosService = new UsuarioService();
const ProdutosService = new ProdutoService();

let lista = {
  usuarioId: null,
  valor: 0,
  produtos: []
};

document.addEventListener("DOMContentLoaded", () => {
  carregarSelects();
  document.getElementById("formLista").addEventListener("submit", salvar);
  document
    .getElementById("addProduto")
    .addEventListener("click", adicionarProduto);
});

async function carregarSelects() {
  // const usuarios = await UsuariosService.getUsuarios();
  // const usuarioSelect = document.getElementById("usuario");
  // usuarios.forEach((u) => {
  //   usuarioSelect.innerHTML += `<option value="${u.id}">${u.nome}</option>`;
  // });

  const produtos = await ProdutosService.getProdutos();
  const produtoSelect = document.getElementById("produto");
  produtos.forEach((p) => {
    produtoSelect.innerHTML += `<option value="${p.id}">${p.nome}</option>`;
  });
}

function adicionarProduto() {
  const produtoId = document.getElementById("produto").value;
  const quantidade = document.getElementById("quantidade").value;
  const valorUnitario = document.getElementById("valorUnitario").value;

  if (!produtoId || !quantidade || !valorUnitario) return;

  atualizarListaProdutos(produtoId, quantidade, valorUnitario);
  atualizarValorTotal();

  const tbody = document.getElementById("itensLista");

  const tr = document.createElement("tr");
  tr.innerHTML = `
        <td data-produto="${produtoId}">${document.querySelector(`#produto option[value="${produtoId}"]`).text
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

function atualizarListaProdutos(produtoId, quantidade, valorUnitario) {
  lista.produtos.push({
    produtoId,
    quantidade,
    valorUnitario
  });
}

function atualizarValorTotal() {
  if (!lista) return;

  const valorInput = document.getElementById("valor");
  let total = 0;
  lista.produtos.forEach((item) => {
    total += item.quantidade * item.valorUnitario;
  });
  valorInput.value = total.toFixed(2);
}

async function salvar(event) {
  event.preventDefault();

  const usuario = await carregarUsuario();
  if (!usuario) return;

  const usuarioId = usuario.id;
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

  await ListasComprasService.criarLista(novaLista);

  window.location.href = "index.html";
}

async function carregarUsuario() {
  const userStr = localStorage.getItem("usuarioLogado");

  if (!userStr) {
    console.error("Usuário não logado.");
    return;
  }

  const user = JSON.parse(userStr);
  return await UsuariosService.getUsuario(user.id);
}
