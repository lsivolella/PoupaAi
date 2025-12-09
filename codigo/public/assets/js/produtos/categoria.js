import { ProdutoService } from "../../../services/produto-service.js";
import { formatarMoeda } from "../../../utils/formatador.js";

const produtoService = new ProdutoService();
const listaCategoria = document.querySelector("#lista-categoria-produtos");
const selectCategoria = document.querySelector("#select-categoria");
const tituloCategoria = document.querySelector("#titulo-categoria");

let produtosCache = [];
let mercadosCache = [];

// Mapeamento de nomes bonitos para as categorias
const nomesCategoria = {
  ofertas: "Ofertas",
  hortifruti: "Hortifruti",
  acougue: "Açougue",
  bebe: "Mundo Bebê",
  limpeza: "Limpeza",
  bebidas: "Bebidas",
  padaria: "Padaria",
  alimentos: "Alimentos",
};

function normalizarTexto(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

async function carregarDados() {
  try {
    produtosCache = await produtoService.getProdutos();
    const r = await fetch("http://localhost:3001/mercados");
    mercadosCache = await r.json();

    console.log("Dados carregados:", {
      produtos: produtosCache.length,
      mercados: mercadosCache.length,
    });

    // Verifica se veio categoria na URL
    verificarCategoriaURL();
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
    listaCategoria.innerHTML = `
      <div class="alert alert-danger text-center">
        Erro ao carregar produtos. Tente novamente.
      </div>
    `;
  }
}

function getNomeMercado(id) {
  const mercado = mercadosCache.find((m) => m.id === id);
  return mercado ? mercado.nome : "Desconhecido";
}

// VERIFICA SE VEIO ?categoria= NA URL
function verificarCategoriaURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const categoriaURL = urlParams.get("categoria");

  console.log("Categoria detectada na URL:", categoriaURL);

  if (categoriaURL) {
    // Ativa a aba "Por Categoria"
    const tabCategoria = document.querySelector("#tab-categoria");
    const abaCategoria = document.querySelector("#aba-categoria");

    if (tabCategoria && abaCategoria) {
      // Remove active de todas as abas
      document.querySelectorAll(".nav-link").forEach((tab) => {
        tab.classList.remove("active");
      });
      document.querySelectorAll(".tab-pane").forEach((pane) => {
        pane.classList.remove("show", "active");
      });

      // Ativa a aba de categoria
      tabCategoria.classList.add("active");
      abaCategoria.classList.add("show", "active");

      // Define a categoria no select
      selectCategoria.value = categoriaURL.toLowerCase();

      // Filtra os produtos
      filtrarPorCategoria();

      console.log("Aba 'Por Categoria' ativada automaticamente");
    }
  }
}

function filtrarPorCategoria() {
  const categoriaEscolhida = selectCategoria.value.toLowerCase();

  console.log("Filtrando por categoria:", categoriaEscolhida);

  // Atualiza o título
  if (categoriaEscolhida) {
    const nomeCategoria =
      nomesCategoria[categoriaEscolhida] || categoriaEscolhida;
    tituloCategoria.innerHTML = `<i class="bi bi-box-seam"></i> Produtos - ${nomeCategoria}`;
  } else {
    tituloCategoria.innerHTML = `<i class="bi bi-box-seam"></i> Todos os Produtos`;
  }

  // Filtra produtos
  let resultados = produtosCache;

  if (categoriaEscolhida) {
    resultados = produtosCache.filter((prod) => {
      const categoriaProduto = normalizarTexto(prod.categoria || "");
      const categoriaFiltro = normalizarTexto(categoriaEscolhida);
      return categoriaProduto.includes(categoriaFiltro);
    });
  }

  console.log(`${resultados.length} produtos encontrados`);

  if (resultados.length === 0) {
    listaCategoria.innerHTML = `
      <div class="alert alert-warning text-center">
        <i class="bi bi-inbox"></i>
        <p class="mb-0">Nenhum produto encontrado nesta categoria</p>
      </div>
    `;
    return;
  }

  // Renderiza produtos em cards
  listaCategoria.innerHTML = "";

  resultados.forEach((prod) => {
    // Pega a ocorrência com menor preço
    const ocorrenciaMaisBarata = prod.ocorrencias.reduce((menor, atual) => {
      return atual.preco < menor.preco ? atual : menor;
    });

    const preco = ocorrenciaMaisBarata.preco;
    const mercadoId = ocorrenciaMaisBarata.mercadoId;
    const nomeMercado = getNomeMercado(mercadoId);

    const div = document.createElement("div");
    div.classList.add("card", "mb-3", "produto-card");

    div.innerHTML = `
      <div class="row g-0 align-items-center">
        <div class="col-md-3 text-center p-3">
          <img 
            src="${prod.imagem_url}"
            alt="${prod.nome}" 
            class="img-fluid rounded" 
            style="max-height:150px; object-fit: contain;"
            onerror="this.src='/codigo/public/assets/img/placeholder-produto.png'"
          >
        </div>

        <div class="col-md-9">
          <div class="card-body">
            <h5 class="card-title">${prod.nome}</h5>

            <p class="card-text text-muted mb-2">
              <i class="bi bi-tag"></i> ${prod.marca} - ${prod.tamanho_embalagem
      }${prod.unidade_medida}
            </p>

            <p class="card-text mb-2">
              ${prod.descricao || "Sem descrição"}
            </p>

            <p class="card-text mb-2">
              <i class="bi bi-shop"></i> <strong>Mercado:</strong> ${nomeMercado}
            </p>

            <div class="d-flex align-items-center gap-3">
              <p class="card-text fw-bold fs-4 text-success mb-0">
                R$ ${formatarMoeda(preco)}
              </p>
              <a href="detalhes.html?id=${prod.id
      }" class="btn btn-sm btn-primary">
                <i class="bi bi-eye"></i> Ver Detalhes
              </a>
            </div>
          </div>
        </div>
      </div>
    `;

    listaCategoria.appendChild(div);
  });
}

window.addEventListener("load", async () => {
  await carregarDados();
});

selectCategoria.addEventListener("change", filtrarPorCategoria);

// CSS específico para os cards da categoria
const estilosCategoria = document.createElement("style");
estilosCategoria.textContent = `
  .produto-card {
    transition: all 0.3s ease;
    border: 1px solid #e0e0e0;
  }

  .produto-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.15);
    border-color: #667eea;
  }

  #lista-categoria-produtos {
    min-height: 300px;
  }

  #titulo-categoria {
    color: #667eea;
    font-weight: 600;
    padding: 15px;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 8px;
    border-left: 4px solid #667eea;
  }

  #select-categoria {
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    padding: 10px 15px;
    font-weight: 500;
    transition: all 0.3s ease;
  }

  #select-categoria:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 0.25rem rgba(102, 126, 234, 0.25);
  }
`;
document.head.appendChild(estilosCategoria);

