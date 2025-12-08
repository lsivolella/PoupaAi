import { ListasService } from "../../../services/listas-service.js";
import { UsuarioService } from "../../../services/usuario-service.js";
import { ProdutoService } from "../../../services/produto-service.js";

const ListasComprasService = new ListasService();
const UsuariosService = new UsuarioService();
const ProdutosService = new ProdutoService();

let lista;

document.addEventListener("DOMContentLoaded", async () => {
  await carregarSelects();
  await carregarDados();
  document
    .getElementById("addProduto")
    .addEventListener("click", adicionarProduto);
  document.getElementById("formLista").addEventListener("submit", salvar);
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

async function carregarDados() {
  const id = sessionStorage.getItem("listaEdicaoId");
  lista = await ListasComprasService.getLista(id);

  document.getElementById("valor").value = lista.valor;

  const tbody = document.getElementById("itensLista");

  lista.produtos.forEach((item) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td data-produto="${item.produtoId}">
                ${document.querySelector(
      `#produto option[value="${item.produtoId}"]`
    ).text
      }
            </td>
            <td>${item.quantidade}</td>
            <td>R$ ${parseFloat(item.valorUnitario).toFixed(2)}</td>
            <td><button class="remover-item">Remover</button></td>
        `;
    tbody.appendChild(tr);

    tr.querySelector(".remover-item").addEventListener("click", () => {
      removerProduto(item.produtoId);
      tr.remove();
    });
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
        <td data-produto="${produtoId}">
            ${document.querySelector(`#produto option[value="${produtoId}"]`)
      .text
    }
        </td>
        <td>${quantidade}</td>
        <td>R$ ${parseFloat(valorUnitario).toFixed(2)}</td>
        <td><button class="remover-item">Remover</button></td>
    `;

  tbody.appendChild(tr);

  tr.querySelector(".remover-item").addEventListener("click", () => {
    removerProduto(produtoId);
    tr.remove();
  });
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

function removerProduto(produtoId) {
  lista.produtos = lista.produtos.filter(p => p.produtoId !== produtoId);
  atualizarValorTotal();
}

async function salvar(event) {
  event.preventDefault();

  const usuario = await carregarUsuario();
  if (!usuario) return;

  atualizarValorTotal();
  const id = parseInt(sessionStorage.getItem("listaEdicaoId"));
  const usuarioId = usuario.id;
  const valor = parseFloat(document.getElementById("valor").value);

  const produtos = [...document.querySelectorAll("#itensLista tr")].map(
    (tr) => ({
      produtoId: parseInt(tr.children[0].getAttribute("data-produto")),
      quantidade: parseInt(tr.children[1].textContent),
      valorUnitario: parseFloat(tr.children[2].textContent.replace("R$ ", "")),
    })
  );

  const listaAtualizada = {
    id,
    usuarioId,
    valor,
    produtos,
  };

  await ListasComprasService.atualizarLista(id, listaAtualizada);

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
