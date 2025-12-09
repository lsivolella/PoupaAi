import { ProdutoService } from "../../../services/produto-service.js";
import { formatarMoeda } from "../../../utils/formatador.js";

const produtoService = new ProdutoService();
const listaBusca = document.querySelector("#lista-busca-produtos");
const campoBusca = document.querySelector("#campo-busca-produtos");

let produtosCache = [];
let mercadosCache = [];

function normalizarTexto(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

async function carregarDados() {
  produtosCache = await produtoService.getProdutos();
  const r = await fetch("http://localhost:3001/mercados");
  mercadosCache = await r.json();
}

function getNomeMercado(id) {
  const mercado = mercadosCache.find((m) => m.id === id);
  return mercado ? mercado.nome : "Desconhecido";
}

function filtrarProdutos() {
  const termoOriginal = campoBusca.value.trim();
  const termo = normalizarTexto(termoOriginal);

  if (!termo) {
    listaBusca.innerHTML = `<div class="alert alert-secondary text-center">
            Digite o nome de um produto acima para buscar
        </div>`;
    return;
  }

  const resultados = produtosCache.filter((prod) => {
    const nome = normalizarTexto(prod.nome);
    const marca = normalizarTexto(prod.marca || "");
    const descricao = normalizarTexto(prod.descricao || "");
    return (
      nome.includes(termo) || marca.includes(termo) || descricao.includes(termo)
    );
  });

  if (resultados.length === 0) {
    listaBusca.innerHTML = `<div class="alert alert-warning text-center">
            Nenhum produto encontrado
        </div>`;
    return;
  }

  listaBusca.innerHTML = "";

  resultados.forEach((prod) => {
    // ✅ pega a ocorrência com menor preço
    const ocorrenciaMaisBarata = prod.ocorrencias.reduce((menor, atual) => {
      return atual.preco < menor.preco ? atual : menor;
    });

    const preco = ocorrenciaMaisBarata.preco;
    const mercadoId = ocorrenciaMaisBarata.mercadoId;
    const nomeMercado = getNomeMercado(mercadoId);

    const div = document.createElement("div");
    div.classList.add("card", "mb-3");

    div.innerHTML = `
    <div class="row g-0 align-items-center">
      <div class="col-md-3 text-center p-3">
        <img 
          src="${prod.imagem_url}" 
          alt="${prod.nome}" 
          class="img-fluid rounded" 
          style="max-height:150px;"
        >
      </div>

      <div class="col-md-9">
        <div class="card-body">
          <h5 class="card-title">${prod.nome}</h5>

          <p class="card-text">
            ${prod.marca} - ${prod.tamanho_embalagem}${prod.unidade_medida}
          </p>

          <p class="card-text">${prod.descricao}</p>

          <p class="card-text">
            Mercado: ${nomeMercado}
          </p>

          <p class="card-text fw-bold">
            R$ ${formatarMoeda(preco)}
          </p>
        </div>
      </div>
    </div>
  `;

    listaBusca.appendChild(div);
  });
}

function executarBuscaProduto(){
    const termoBusca = sessionStorage.getItem("searchKey");
    sessionStorage.removeItem("searchKey");

    if (!campoBusca) return;

    campoBusca.value = termoBusca;
    filtrarProdutos();
}

window.addEventListener("load", async () => {
  await carregarDados();
  executarBuscaProduto();
});

campoBusca.addEventListener("input", filtrarProdutos);
