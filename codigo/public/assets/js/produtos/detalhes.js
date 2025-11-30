import { ProdutoService } from "../../../services/produto-service.js";

const produtoService = new ProdutoService();

// Elementos
const imgProduto = document.querySelector("#img-produto");
const detNome = document.querySelector("#det-nome");
const detCategoria = document.querySelector("#det-categoria");
const detPreco = document.querySelector("#det-preco");
const detMarca = document.querySelector("#det-marca");
const detUnidade = document.querySelector("#det-unidade");
const detTamanho = document.querySelector("#det-tamanho");
const detDescricao = document.querySelector("#det-descricao");
const detMercado = document.querySelector("#det-mercado");

const btnExcluir = document.querySelector("#btn-excluir");
const btnEditar = document.querySelector("#btn-editar");

// Pegar ID da URL
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// Buscar mercado
async function getMercadoName(idMercado) {
  if (!idMercado) return "Não informado";

  const r = await fetch(`http://localhost:3001/mercados/${idMercado}`);
  if (!r.ok) return "Desconhecido";

  const m = await r.json();
  return m.nome || "Desconhecido";
}

// Carregar produto
async function carregarDetalhes() {
  const produto = await produtoService.getProduto(id);

  if (!produto) {
    alert("Produto não encontrado!");
    return;
  }

  // Preencher dados
  imgProduto.src = produto.imagem_url;
  detNome.textContent = produto.nome;
  detCategoria.textContent = produto.categoria;
  detPreco.textContent = `R$ ${produto.preco.toFixed(2)}`;
  detMarca.textContent = produto.marca;
  detUnidade.textContent = produto.unidade_medida;
  detTamanho.textContent = produto.tamanho_embalagem;
  detDescricao.textContent = produto.descricao;

  if (produto.Mercado && produto.Mercado.length > 0) {
    const nomeMercado = await getMercadoName(produto.Mercado[0]);
    detMercado.textContent = nomeMercado;
  } else {
    detMercado.textContent = "Não informado";
  }

  btnEditar.href = `editar.html?id=${produto.id}`;

  btnExcluir.onclick = async () => {
    const confirma = confirm("Tem certeza que deseja excluir este produto?");
    if (!confirma) return;

    await produtoService.excluirProduto(produto.id);
    window.location.assign("index.html");
  };
}

carregarDetalhes();
