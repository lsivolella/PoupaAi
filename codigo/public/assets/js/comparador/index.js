const API_URL = "http://localhost:3001";

// Variáveis globais
let produtosCache = [];
let mercadosCache = [];
let listaAtual = { produtos: [] };
let ordemCrescente = true;

// ========================================
// INICIALIZAÇÃO
// ========================================

document.addEventListener("DOMContentLoaded", async () => {
  await inicializar();
  configurarEventListeners();
});

async function inicializar() {
  mostrarCarregando();

  try {
    // Carrega produtos e mercados do JSON Server
    produtosCache = await carregarProdutos();
    mercadosCache = await carregarMercados();

    // Carrega lista do localStorage
    carregarListaDoLocalStorage();

    console.log("✅ Produtos carregados:", produtosCache.length);
    console.log("✅ Mercados carregados:", mercadosCache.length);

    // Renderiza estado inicial
    renderizarListaProdutos();
    renderizarComparativoMercados();
  } catch (erro) {
    console.error("❌ Erro na inicialização:", erro);
    mostrarErro("Erro ao carregar dados. Verifique se o JSON Server está rodando.");
  } finally {
    ocultarCarregando();
  }
}

async function carregarProdutos() {
  const response = await fetch(`${API_URL}/produtos`);
  if (!response.ok) throw new Error("Erro ao carregar produtos");
  return await response.json();
}

async function carregarMercados() {
  const response = await fetch(`${API_URL}/mercados`);
  if (!response.ok) throw new Error("Erro ao carregar mercados");
  return await response.json();
}

// ========================================
// ABA 1: BUSCAR E COMPARAR PRODUTO
// ========================================

function buscarProduto(termo) {
  const termoLower = termo.trim().toLowerCase();
  const resultados = document.getElementById("resultados-comparacao");
  const header = document.getElementById("header-comparacao");
  const nomeProduto = document.getElementById("nome-produto-comparacao");

  if (!termoLower) {
    header.style.display = "none";
    resultados.innerHTML = `
      <div class="alert alert-info text-center">
        <i class="bi bi-info-circle"></i> Digite o nome de um produto para comparar preços entre mercados
      </div>
    `;
    return;
  }

  // Busca produtos que contenham o termo
  const produtosEncontrados = produtosCache.filter(
    (p) =>
      p.nome.toLowerCase().includes(termoLower) ||
      p.marca.toLowerCase().includes(termoLower)
  );

  if (produtosEncontrados.length === 0) {
    header.style.display = "none";
    resultados.innerHTML = `
      <div class="alert alert-warning text-center">
        <i class="bi bi-exclamation-triangle"></i> Nenhum produto encontrado para "${termo}"
      </div>
    `;
    return;
  }

  // Mostra header
  header.style.display = "flex";
  nomeProduto.textContent = produtosEncontrados[0].nome.toUpperCase();

  // Renderiza comparação
  renderizarComparacaoProduto(produtosEncontrados);
}

function renderizarComparacaoProduto(produtos) {
  const resultados = document.getElementById("resultados-comparacao");
  let html = "";

  produtos.forEach((produto) => {
    if (!produto.ocorrencias || produto.ocorrencias.length === 0) return;

    // Calcula menor preço
    const precos = produto.ocorrencias.map((o) => o.preco);
    const menorPreco = Math.min(...precos);

    // Título do produto
    html += `
      <div class="card mb-2">
        <div class="card-header bg-light">
          <strong>${produto.marca} - ${produto.nome} ${produto.tamanho_embalagem}${produto.unidade_medida}</strong>
        </div>
        <div class="list-group list-group-flush" id="lista-${produto.id}">
    `;

    // Lista cada mercado
    produto.ocorrencias.forEach((ocorrencia) => {
      const mercado = mercadosCache.find((m) => m.id === ocorrencia.mercadoId);
      if (!mercado) return;

      const isMelhor = ocorrencia.preco === menorPreco;
      const economia =
        ocorrencia.preco > menorPreco
          ? `<small class="text-danger">+R$ ${formatarPreco(
              ocorrencia.preco - menorPreco
            )}</small>`
          : "";

      html += `
        <div class="list-group-item d-flex justify-content-between align-items-center" data-preco="${ocorrencia.preco}">
          <div class="d-flex align-items-center gap-3">
            <img src="${produto.imagem_url}" alt="${produto.nome}" 
              style="width: 60px; height: 60px; object-fit: contain; border-radius: 8px;"
              onerror="this.src='https://via.placeholder.com/60?text=Sem+Imagem'">
            <div>
              <strong>${mercado.nome}</strong>
              <br>
              <small class="text-muted">${mercado.endereco.rua}, ${mercado.endereco.numero}</small>
              ${isMelhor ? '<br><span class="badge bg-success mt-1">Melhor Preço</span>' : ""}
            </div>
          </div>
          <div class="text-end">
            <h5 class="mb-0 ${isMelhor ? "text-success fw-bold" : ""}">
              R$ ${formatarPreco(ocorrencia.preco)}
            </h5>
            ${economia}
          </div>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;
  });

  resultados.innerHTML = html;
}

function ordenarPorPreco() {
  ordemCrescente = !ordemCrescente;

  const btn = document.getElementById("btn-ordenar-preco");
  btn.innerHTML = ordemCrescente
    ? '<i class="bi bi-sort-numeric-down"></i> Ordenar por Preço'
    : '<i class="bi bi-sort-numeric-up"></i> Ordenar por Preço';

  // Ordena cada grupo de produtos
  document.querySelectorAll('[id^="lista-"]').forEach((lista) => {
    const items = Array.from(lista.querySelectorAll(".list-group-item"));

    items.sort((a, b) => {
      const precoA = parseFloat(a.dataset.preco);
      const precoB = parseFloat(b.dataset.preco);
      return ordemCrescente ? precoA - precoB : precoB - precoA;
    });

    items.forEach((item) => lista.appendChild(item));
  });
}

// ========================================
// ABA 2: COMPARAR LISTA DE COMPRAS
// ========================================

function buscarProdutosParaLista(termo) {
  const termoLower = termo.trim().toLowerCase();
  const resultados = document.getElementById("resultados-busca-lista");

  if (!termoLower) {
    resultados.style.display = "none";
    return;
  }

  const produtosEncontrados = produtosCache.filter(
    (p) =>
      p.nome.toLowerCase().includes(termoLower) ||
      p.marca.toLowerCase().includes(termoLower)
  );

  if (produtosEncontrados.length === 0) {
    resultados.style.display = "block";
    resultados.innerHTML = `
      <div class="alert alert-warning">
        <i class="bi bi-exclamation-triangle"></i> Nenhum produto encontrado
      </div>
    `;
    return;
  }

  let html = '<div class="list-group">';

  produtosEncontrados.slice(0, 5).forEach((produto) => {
    const itemNaLista = listaAtual.produtos.find(
      (p) => p.produtoId === produto.id
    );

    html += `
      <div class="list-group-item d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center gap-2">
          <img src="${produto.imagem_url}" alt="${produto.nome}" 
            style="width: 50px; height: 50px; object-fit: contain; border-radius: 8px;"
            onerror="this.src='https://via.placeholder.com/50?text=?'">
          <div>
            <strong>${produto.nome}</strong>
            <br>
            <small class="text-muted">${produto.marca} - ${produto.tamanho_embalagem}${produto.unidade_medida}</small>
          </div>
        </div>
        <button class="btn btn-sm ${
          itemNaLista ? "btn-success" : "btn-primary"
        }" onclick="adicionarProduto(${produto.id})">
          <i class="bi bi-${itemNaLista ? "check" : "plus"}"></i> ${
      itemNaLista ? "Adicionado" : "Adicionar"
    }
        </button>
      </div>
    `;
  });

  html += "</div>";

  resultados.style.display = "block";
  resultados.innerHTML = html;
}

window.adicionarProduto = function (produtoId) {
  const itemExistente = listaAtual.produtos.find(
    (p) => p.produtoId === produtoId
  );

  if (itemExistente) {
    itemExistente.quantidade++;
    mostrarNotificacao("✓ Quantidade atualizada!", "success");
  } else {
    listaAtual.produtos.push({
      produtoId: produtoId,
      quantidade: 1,
    });
    mostrarNotificacao("✓ Produto adicionado!", "success");
  }

  salvarListaNoLocalStorage();
  renderizarListaProdutos();
  renderizarComparativoMercados();

  // Atualiza resultados da busca
  buscarProdutosParaLista(
    document.getElementById("campo-busca-lista").value
  );
};

function renderizarListaProdutos() {
  const container = document.getElementById("container-produtos-lista");
  const itensLista = document.getElementById("itens-lista");

  if (!listaAtual.produtos || listaAtual.produtos.length === 0) {
    container.style.display = "none";
    return;
  }

  container.style.display = "block";

  let html = "";

  listaAtual.produtos.forEach((item) => {
    const produto = produtosCache.find((p) => p.id === item.produtoId);
    if (!produto) return;

    html += `
      <div class="d-flex align-items-center gap-3 mb-3 p-2 border-bottom">
        <img src="${produto.imagem_url}" alt="${produto.nome}" 
          style="width: 60px; height: 60px; object-fit: contain; border-radius: 8px;"
          onerror="this.src='https://via.placeholder.com/60?text=?'">
        <div class="flex-grow-1">
          <strong>${produto.nome}</strong>
          <br>
          <small class="text-muted">${produto.marca} - ${produto.tamanho_embalagem}${produto.unidade_medida}</small>
        </div>
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-sm btn-outline-secondary" onclick="diminuirQuantidade(${produto.id})">
            <i class="bi bi-dash"></i>
          </button>
          <strong style="min-width: 30px; text-align: center;">${item.quantidade}</strong>
          <button class="btn btn-sm btn-outline-secondary" onclick="aumentarQuantidade(${produto.id})">
            <i class="bi bi-plus"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="removerProduto(${produto.id})">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    `;
  });

  itensLista.innerHTML = html;
}

window.aumentarQuantidade = function (produtoId) {
  const item = listaAtual.produtos.find((p) => p.produtoId === produtoId);
  if (item) {
    item.quantidade++;
    salvarListaNoLocalStorage();
    renderizarListaProdutos();
    renderizarComparativoMercados();
  }
};

window.diminuirQuantidade = function (produtoId) {
  const item = listaAtual.produtos.find((p) => p.produtoId === produtoId);
  if (item) {
    if (item.quantidade > 1) {
      item.quantidade--;
    } else {
      removerProduto(produtoId);
      return;
    }
    salvarListaNoLocalStorage();
    renderizarListaProdutos();
    renderizarComparativoMercados();
  }
};

window.removerProduto = function (produtoId) {
  listaAtual.produtos = listaAtual.produtos.filter(
    (p) => p.produtoId !== produtoId
  );
  salvarListaNoLocalStorage();
  renderizarListaProdutos();
  renderizarComparativoMercados();
  mostrarNotificacao("✓ Produto removido!", "info");
};

function renderizarComparativoMercados() {
  const container = document.getElementById("comparativo-mercados");

  if (!listaAtual.produtos || listaAtual.produtos.length === 0) {
    container.innerHTML = `
      <div class="alert alert-info text-center">
        <i class="bi bi-info-circle"></i> Adicione produtos à lista para ver o comparativo de preços entre mercados
      </div>
    `;
    return;
  }

  // Calcula totais por mercado
  const totaisPorMercado = {};

  mercadosCache.forEach((mercado) => {
    totaisPorMercado[mercado.id] = {
      mercado: mercado,
      itens: [],
      total: 0,
      temTodosProdutos: true,
    };

    listaAtual.produtos.forEach((itemLista) => {
      const produto = produtosCache.find((p) => p.id === itemLista.produtoId);

      if (produto && produto.ocorrencias) {
        const ocorrencia = produto.ocorrencias.find(
          (o) => o.mercadoId === mercado.id
        );

        if (ocorrencia) {
          const subtotal = ocorrencia.preco * itemLista.quantidade;
          totaisPorMercado[mercado.id].itens.push({
            nome: `${produto.nome} ${produto.tamanho_embalagem}${produto.unidade_medida}`,
            quantidade: itemLista.quantidade,
            precoUnitario: ocorrencia.preco,
            subtotal: subtotal,
          });
          totaisPorMercado[mercado.id].total += subtotal;
        } else {
          totaisPorMercado[mercado.id].temTodosProdutos = false;
        }
      }
    });
  });

  // Filtra apenas mercados com todos os produtos
  const mercadosCompletos = Object.values(totaisPorMercado).filter(
    (m) => m.temTodosProdutos && m.itens.length === listaAtual.produtos.length
  );

  if (mercadosCompletos.length === 0) {
    container.innerHTML = `
      <div class="alert alert-warning text-center">
        <i class="bi bi-exclamation-triangle"></i> Nenhum mercado tem todos os produtos da lista
        <br><small>Tente remover alguns itens ou adicionar produtos mais comuns</small>
      </div>
    `;
    return;
  }

  // Encontra melhor preço
  const totais = mercadosCompletos.map((m) => m.total);
  const melhorTotal = Math.min(...totais);

  // Renderiza cards
  let html = '<div class="row">';

  mercadosCompletos.forEach((dados) => {
    const isMelhor = dados.total === melhorTotal;
    const economia =
      dados.total > melhorTotal
        ? `<small class="text-danger">+R$ ${formatarPreco(
            dados.total - melhorTotal
          )} mais caro</small>`
        : "";

    html += `
      <div class="col-md-4 mb-3">
        <div class="card h-100 ${isMelhor ? "border-success" : ""}">
          <div class="card-header ${isMelhor ? "bg-success text-white" : ""}">
            <h5 class="mb-0">${dados.mercado.nome}</h5>
            ${isMelhor ? '<span class="badge bg-light text-success">Melhor Preço</span>' : ""}
          </div>
          <div class="card-body">
            <ul class="list-unstyled mb-3">
    `;

    dados.itens.forEach((item) => {
      html += `
        <li class="d-flex justify-content-between mb-2">
          <span>${item.quantidade}x ${item.nome}</span>
          <strong>R$ ${formatarPreco(item.subtotal)}</strong>
        </li>
      `;
    });

    html += `
            </ul>
            <hr>
            <div class="d-flex justify-content-between align-items-center">
              <strong>TOTAL:</strong>
              <h4 class="mb-0 ${isMelhor ? "text-success" : ""}">
                R$ ${formatarPreco(dados.total)}
              </h4>
            </div>
            ${economia}
          </div>
        </div>
      </div>
    `;
  });

  html += "</div>";
  container.innerHTML = html;
}

function limparLista() {
  if (!listaAtual.produtos || listaAtual.produtos.length === 0) {
    mostrarNotificacao("A lista já está vazia!", "info");
    return;
  }

  if (confirm("Deseja limpar todos os produtos da lista?")) {
    listaAtual = { produtos: [] };
    salvarListaNoLocalStorage();
    renderizarListaProdutos();
    renderizarComparativoMercados();
    mostrarNotificacao("✓ Lista limpa!", "success");
  }
}

// ========================================
// EVENT LISTENERS
// ========================================

function configurarEventListeners() {
  // Busca de produto
  const campoBuscaProduto = document.getElementById("campo-busca-produto");
  if (campoBuscaProduto) {
    campoBuscaProduto.addEventListener("input", (e) =>
      buscarProduto(e.target.value)
    );
  }

  // Busca para lista
  const campoBuscaLista = document.getElementById("campo-busca-lista");
  if (campoBuscaLista) {
    campoBuscaLista.addEventListener("input", (e) =>
      buscarProdutosParaLista(e.target.value)
    );
  }

  // Ordenar preço
  const btnOrdenar = document.getElementById("btn-ordenar-preco");
  if (btnOrdenar) {
    btnOrdenar.addEventListener("click", ordenarPorPreco);
  }

  // Limpar lista
  const btnLimpar = document.getElementById("btn-limpar-lista");
  if (btnLimpar) {
    btnLimpar.addEventListener("click", limparLista);
  }
}

// ========================================
// LOCALSTORAGE
// ========================================

function salvarListaNoLocalStorage() {
  try {
    localStorage.setItem(
      "poupaai_lista_comparacao",
      JSON.stringify(listaAtual)
    );
  } catch (erro) {
    console.error("Erro ao salvar lista:", erro);
  }
}

function carregarListaDoLocalStorage() {
  try {
    const listaSalva = localStorage.getItem("poupaai_lista_comparacao");
    if (listaSalva) {
      listaAtual = JSON.parse(listaSalva);
    }
  } catch (erro) {
    console.error("Erro ao carregar lista:", erro);
    listaAtual = { produtos: [] };
  }
}

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

function formatarPreco(preco) {
  return preco.toFixed(2).replace(".", ",");
}

function mostrarCarregando() {
  const resultados = document.getElementById("resultados-comparacao");
  if (resultados) {
    resultados.innerHTML = `
      <div class="text-center p-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Carregando...</span>
        </div>
        <p class="mt-2">Carregando produtos...</p>
      </div>
    `;
  }
}

function ocultarCarregando() {
  const resultados = document.getElementById("resultados-comparacao");
  if (resultados) {
    resultados.innerHTML = `
      <div class="alert alert-info text-center">
        <i class="bi bi-info-circle"></i> Digite o nome de um produto para comparar preços entre mercados
      </div>
    `;
  }
}

function mostrarErro(mensagem) {
  const resultados = document.getElementById("resultados-comparacao");
  if (resultados) {
    resultados.innerHTML = `
      <div class="alert alert-danger text-center">
        <i class="bi bi-exclamation-triangle"></i> ${mensagem}
      </div>
    `;
  }
}

function mostrarNotificacao(mensagem, tipo = "success") {
  const bgColor = {
    success: "#4CAF50",
    info: "#2196F3",
    warning: "#FF9800",
    danger: "#f44336",
  };

  const notification = document.createElement("div");
  notification.textContent = mensagem;
  notification.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: ${bgColor[tipo] || bgColor.success};
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    z-index: 9999;
    animation: slideIn 0.3s ease;
  `;

  document.body.appendChild(notification);
  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => notification.remove(), 300);
  }, 2500);
}

// CSS para animações
const style = document.createElement("style");
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

console.log("✅ Sistema de comparação carregado!");