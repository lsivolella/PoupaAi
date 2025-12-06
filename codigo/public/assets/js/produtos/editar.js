import { ProdutoService } from "../../../services/produto-service.js";
import { formatarMoeda } from "../../../assets/js/utils/formatador.js";

let produto = {};
const produtoService = new ProdutoService();

const idInput = document.querySelector("#id-input");
const nomeInput = document.querySelector("#nome-input");
const categoriaSelect = document.querySelector("#categoria-select");
const precoInput = document.querySelector("#preco-input");
const imagemInput = document.querySelector("#imagem-input");
const atualizarBtn = document.querySelector("#atualizar-btn");

async function mostrarProduto() {
  const id = sessionStorage.getItem("id");
  produto = await produtoService.getProduto(id);

  idInput.value = produto.id;
  nomeInput.value = produto.nome || "";
  categoriaSelect.value = produto.categoria || "";
  precoInput.value = produto.preco || 0;
  imagemInput.value = produto.imagem_url || "";
}

async function salvar() {
  const atualizado = {
    id: idInput.value,
    nome: nomeInput.value.trim(),
    categoria: categoriaSelect.value,
    preco: +precoInput.value,
    imagem_url: imagemInput.value.trim(),
    criadoEm: produto.criadoEm,
    atualizadoEm: new Date().toISOString(),
  };

  await produtoService.atualizarProduto(atualizado.id, atualizado);
  window.location.assign("index.html");
}

window.addEventListener("load", mostrarProduto);
atualizarBtn.addEventListener("click", salvar);
