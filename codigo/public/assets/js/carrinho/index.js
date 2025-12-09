const API_URL = "http://localhost:3001";

// ========================================
// INICIALIZAÇÃO
// ========================================

document.addEventListener("DOMContentLoaded", () => {
  carregarCarrinho();
  configurarEventListeners();
});

function configurarEventListeners() {
  // Limpar carrinho
  const btnLimpar = document.getElementById("btn-limpar-carrinho");
  if (btnLimpar) {
    btnLimpar.addEventListener("click", limparCarrinho);
  }

  // Registrar compra
  const btnRegistrar = document.getElementById("btn-registrar-compra");
  if (btnRegistrar) {
    btnRegistrar.addEventListener("click", abrirModalConfirmacao);
  }

  // Confirmar compra no modal
  const btnConfirmar = document.getElementById("btn-confirmar-compra");
  if (btnConfirmar) {
    btnConfirmar.addEventListener("click", registrarCompra);
  }
}

// ========================================
// CARREGAR E RENDERIZAR CARRINHO
// ========================================

async function carregarCarrinho() {
  try {
    const carrinho = obterCarrinho();

    if (!carrinho || carrinho.length === 0) {
      mostrarCarrinhoVazio();
      return;
    }

    // Carregar dados completos dos produtos e mercados
    const produtos = await Promise.all(
      carrinho.map(async (item) => {
        try {
          const response = await fetch(`${API_URL}/produtos/${item.produtoId}`);
          if (!response.ok) throw new Error("Produto não encontrado");
          const produto = await response.json();

          const mercadoResponse = await fetch(
            `${API_URL}/mercados/${item.mercadoId}`
          );
          if (!mercadoResponse.ok) throw new Error("Mercado não encontrado");
          const mercado = await mercadoResponse.json();

          return {
            ...item,
            produto,
            mercado,
          };
        } catch (erro) {
          console.error("Erro ao carregar item:", erro);
          return null;
        }
      })
    );

    // Filtra itens nulos (que deram erro)
    const produtosValidos = produtos.filter((p) => p !== null);

    if (produtosValidos.length === 0) {
      mostrarCarrinhoVazio();
      return;
    }

    renderizarCarrinho(produtosValidos);
  } catch (erro) {
    console.error("Erro ao carregar carrinho:", erro);
    mostrarNotificacao("Erro ao carregar carrinho", "danger");
  }
}

function renderizarCarrinho(itens) {
  const carrinhoVazio = document.getElementById("carrinho-vazio");
  const carrinhoConteudo = document.getElementById("carrinho-conteudo");
  const listaProdutos = document.getElementById("lista-produtos-carrinho");
  const totalItens = document.getElementById("total-itens");

  // Mostra carrinho com produtos
  carrinhoVazio.style.display = "none";
  carrinhoConteudo.style.display = "block";

  // Atualiza contador
  const quantidadeTotal = itens.reduce((acc, item) => acc + item.quantidade, 0);
  totalItens.textContent = quantidadeTotal;

  // Renderiza lista de produtos
  let html = "";

  itens.forEach((item, index) => {
    const { produto, mercado, quantidade, preco } = item;
    const subtotal = preco * quantidade;

    html += `
      <div class="border-bottom p-3" data-item-id="${item.id}">
        <div class="row align-items-center">
          <!-- Imagem -->
          <div class="col-md-2 col-3 text-center">
            <img src="${produto.imagem_url}" alt="${produto.nome}"
              class="img-fluid rounded"
              style="max-height: 100px; object-fit: contain;"
              onerror="this.src='https://via.placeholder.com/100?text=Sem+Imagem'">
          </div>

          <!-- Informações do Produto -->
          <div class="col-md-4 col-9">
            <h6 class="mb-1">${produto.nome}</h6>
            <p class="text-muted mb-1 small">
              ${produto.marca} - ${produto.tamanho_embalagem}${
      produto.unidade_medida
    }
            </p>
            <p class="mb-0 small">
              <i class="bi bi-shop"></i> ${mercado.nome}
            </p>
          </div>

          <!-- Preço Unitário -->
          <div class="col-md-2 col-4 text-center">
            <small class="text-muted d-block">Preço Unit.</small>
            <strong>R$ ${formatarPreco(preco)}</strong>
          </div>

          <!-- Quantidade -->
          <div class="col-md-2 col-4 text-center">
            <div class="d-flex align-items-center justify-content-center gap-2">
              <button class="btn btn-sm btn-outline-secondary" 
                onclick="diminuirQuantidade('${item.id}')">
                <i class="bi bi-dash"></i>
              </button>
              <strong style="min-width: 30px;">${quantidade}</strong>
              <button class="btn btn-sm btn-outline-secondary"
                onclick="aumentarQuantidade('${item.id}')">
                <i class="bi bi-plus"></i>
              </button>
            </div>
          </div>

          <!-- Subtotal e Remover -->
          <div class="col-md-2 col-4 text-center">
            <strong class="text-success d-block mb-2">
              R$ ${formatarPreco(subtotal)}
            </strong>
            <button class="btn btn-sm btn-danger" 
              onclick="removerItem('${item.id}')">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  });

  listaProdutos.innerHTML = html;

  // Atualiza resumo
  atualizarResumo(itens);
}

function atualizarResumo(itens) {
  // Pega o primeiro mercado (assumindo que todos são do mesmo)
  const mercado = itens[0].mercado;

  // Atualiza informações do mercado
  document.getElementById("nome-mercado-resumo").textContent = mercado.nome;
  document.getElementById(
    "endereco-mercado-resumo"
  ).textContent = `${mercado.endereco.rua}, ${mercado.endereco.numero} - ${mercado.endereco.bairro}`;

  // Calcula totais
  const subtotal = itens.reduce(
    (acc, item) => acc + item.preco * item.quantidade,
    0
  );
  const desconto = 0; // Pode implementar lógica de desconto aqui
  const total = subtotal - desconto;

  // Atualiza valores
  document.getElementById("subtotal-valor").textContent = `R$ ${formatarPreco(
    subtotal
  )}`;
  document.getElementById("desconto-valor").textContent = `-R$ ${formatarPreco(
    desconto
  )}`;
  document.getElementById("total-valor").textContent = `R$ ${formatarPreco(
    total
  )}`;
}

function mostrarCarrinhoVazio() {
  document.getElementById("carrinho-vazio").style.display = "block";
  document.getElementById("carrinho-conteudo").style.display = "none";
}

// ========================================
// MANIPULAR QUANTIDADES
// ========================================

window.aumentarQuantidade = function (itemId) {
  const carrinho = obterCarrinho();
  const item = carrinho.find((i) => i.id === itemId);

  if (item) {
    item.quantidade++;
    salvarCarrinho(carrinho);
    carregarCarrinho();
    mostrarNotificacao("Quantidade atualizada", "success");
  }
};

window.diminuirQuantidade = function (itemId) {
  const carrinho = obterCarrinho();
  const item = carrinho.find((i) => i.id === itemId);

  if (item) {
    if (item.quantidade > 1) {
      item.quantidade--;
      salvarCarrinho(carrinho);
      carregarCarrinho();
      mostrarNotificacao("Quantidade atualizada", "success");
    } else {
      removerItem(itemId);
    }
  }
};

window.removerItem = function (itemId) {
  if (confirm("Deseja remover este produto do carrinho?")) {
    const carrinho = obterCarrinho();
    const novoCarrinho = carrinho.filter((i) => i.id !== itemId);

    salvarCarrinho(novoCarrinho);
    carregarCarrinho();
    mostrarNotificacao("Produto removido", "info");

    // Atualiza badge da navbar
    if (typeof carregarCarrinho === "function") {
      carregarCarrinho();
    }
  }
};

function limparCarrinho() {
  if (confirm("Deseja limpar todo o carrinho?")) {
    localStorage.removeItem("carrinho");
    carregarCarrinho();
    mostrarNotificacao("Carrinho limpo!", "info");

    // Atualiza badge da navbar
    if (typeof carregarCarrinho === "function") {
      carregarCarrinho();
    }
  }
}

// ========================================
// REGISTRAR COMPRA
// ========================================

function abrirModalConfirmacao() {
  const carrinho = obterCarrinho();

  if (!carrinho || carrinho.length === 0) {
    mostrarNotificacao("Carrinho vazio!", "warning");
    return;
  }

  // Calcula total
  const total = carrinho.reduce(
    (acc, item) => acc + item.preco * item.quantidade,
    0
  );

  // Pega nome do mercado (primeiro item)
  const mercadoNome = document.getElementById(
    "nome-mercado-resumo"
  ).textContent;

  // Atualiza modal
  document.getElementById("modal-total").textContent = `R$ ${formatarPreco(
    total
  )}`;
  document.getElementById("modal-mercado").textContent = mercadoNome;
  document.getElementById("modal-itens").textContent = carrinho.length;

  // Abre modal
  const modal = new bootstrap.Modal(
    document.getElementById("modalConfirmacao")
  );
  modal.show();
}

async function registrarCompra() {
  try {
    // Fecha modal
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("modalConfirmacao")
    );
    modal.hide();

    // Mostra loading
    const btnConfirmar = document.getElementById("btn-confirmar-compra");
    const textoOriginal = btnConfirmar.innerHTML;
    btnConfirmar.disabled = true;
    btnConfirmar.innerHTML =
      '<span class="spinner-border spinner-border-sm me-2"></span>Registrando...';

    // Pega dados do carrinho
    const carrinho = obterCarrinho();
    const metodoPagamento = document.getElementById("metodo-pagamento").value;

    // Pega usuário logado
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (!usuarioLogado) {
      throw new Error("Usuário não está logado");
    }

    // Pega mercado (do primeiro item)
    const mercadoId = carrinho[0].mercadoId;

    // Calcula total
    const total = carrinho.reduce(
      (acc, item) => acc + item.preco * item.quantidade,
      0
    );

    // Monta itens da compra
    const itens = carrinho.map((item) => ({
      produtoId: item.produtoId,
      quantidade: item.quantidade,
      precoUnitario: item.preco,
      subtotal: item.preco * item.quantidade,
    }));

    // Cria objeto de compra
    const compra = {
      usuarioId: usuarioLogado.id,
      mercadoId: mercadoId,
      data: new Date().toISOString(),
      status: "Finalizado",
      total: total,
      metodoPagamento: metodoPagamento,
      itens: itens,
    };

    console.log("📤 Registrando compra:", compra);

    // Salva no JSON Server
    const response = await fetch(`${API_URL}/historicoCompras`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(compra),
    });

    if (!response.ok) {
      throw new Error("Erro ao registrar compra");
    }

    const compraSalva = await response.json();
    console.log("✅ Compra registrada:", compraSalva);

    // Limpa carrinho
    localStorage.removeItem("carrinho");

    // Mostra sucesso
    mostrarNotificacao("✅ Compra registrada com sucesso!", "success");

    // Aguarda 1 segundo e redireciona
    setTimeout(() => {
      window.location.href = "/codigo/public/views/historicos/index.html";
    }, 1500);
  } catch (erro) {
    console.error("❌ Erro ao registrar compra:", erro);
    mostrarNotificacao("Erro ao registrar compra: " + erro.message, "danger");

    // Restaura botão
    const btnConfirmar = document.getElementById("btn-confirmar-compra");
    btnConfirmar.disabled = false;
    btnConfirmar.innerHTML = '<i class="bi bi-check-circle"></i> Confirmar';
  }
}

// ========================================
// FUNÇÕES AUXILIARES - LOCALSTORAGE
// ========================================

function obterCarrinho() {
  try {
    const carrinho = localStorage.getItem("carrinho");
    return carrinho ? JSON.parse(carrinho) : [];
  } catch (erro) {
    console.error("Erro ao obter carrinho:", erro);
    return [];
  }
}

function salvarCarrinho(carrinho) {
  try {
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
  } catch (erro) {
    console.error("Erro ao salvar carrinho:", erro);
  }
}

// ========================================
// FUNÇÕES AUXILIARES - FORMATAÇÃO
// ========================================

function formatarPreco(preco) {
  return preco.toFixed(2).replace(".", ",");
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
  }, 3000);
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

console.log("✅ Sistema de carrinho carregado!");
