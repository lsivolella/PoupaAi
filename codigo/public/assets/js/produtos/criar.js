import { ProdutoService } from "../../../services/produto-service.js";

const produtoService = new ProdutoService();

const nomeInput = document.querySelector("#nome-input");
const categoriaSelect = document.querySelector("#categoria-select");
const precoInput = document.querySelector("#preco-input");
const marcaInput = document.querySelector("#marca-input");
const unidadeInput = document.querySelector("#unidade-input");
const tamanhoInput = document.querySelector("#tamanho-input");
const descricaoInput = document.querySelector("#descricao-input");
const mercadoSelect = document.querySelector("#mercado-select");
const imagemInput = document.querySelector("#imagem-input");
const salvarBtn = document.querySelector("#salvar-btn");

async function carregarMercados() {
  const r = await fetch("http://localhost:3001/mercados");
  const mercados = await r.json();

  mercados.forEach((m) => {
    const opt = document.createElement("option");
    opt.value = m.id;
    opt.textContent = m.nome;
    mercadoSelect.appendChild(opt);
  });
}

async function salvar() {
  const produto = {
    nome: nomeInput.value.trim(),
    categoria: categoriaSelect.value,
    preco: +precoInput.value,
    marca: marcaInput.value.trim(),
    unidade_medida: unidadeInput.value.trim(),
    tamanho_embalagem: tamanhoInput.value.trim(),
    descricao: descricaoInput.value.trim(),
    Mercado: mercadoSelect.value ? [Number(mercadoSelect.value)] : [],
    imagem_url: imagemInput.value.trim(),
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  };

  await produtoService.criarProduto(produto);
  window.location.assign("index.html");
}

salvarBtn.addEventListener("click", salvar);

carregarMercados();
