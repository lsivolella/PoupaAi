const API_URL = "http://localhost:3001";

let produtoSelecionado = null;
let alertaEditando = null;

document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Inicializando página de criar alerta...");

  // ✅ FORÇA ESTADO INICIAL CORRETO
  document.getElementById("selectedProduct").style.display = "none";
  document.getElementById("alertConfigSection").style.display = "none";
  document.getElementById("submitBtn").disabled = true;

  // ✅ REMOVE O REQUIRED DO CAMPO DE BUSCA (causa problemas no submit)
  const campoBusca = document.getElementById("produtoBusca");
  if (campoBusca) {
    campoBusca.removeAttribute("required");
    console.log("✅ Removido 'required' do campo de busca");
  }

  console.log("✅ Estado inicial configurado:");
  console.log("  - Produto selecionado: ESCONDIDO");
  console.log("  - Seção de config: ESCONDIDA");
  console.log("  - Botão submit: DESABILITADO");
  console.log("  - produtoSelecionado:", produtoSelecionado);

  verificarEdicao();
  configurarEventos();
  carregarMercados();
});

// ========================================
// VERIFICAR SE É EDIÇÃO
// ========================================
async function verificarEdicao() {
  const urlParams = new URLSearchParams(window.location.search);
  const alertaId = urlParams.get("id");

  if (alertaId) {
    console.log("📝 Modo edição - Alerta ID:", alertaId);
    document.getElementById("pageTitle").textContent = "Editar Alerta de Preço";
    document.getElementById("submitBtnText").textContent = "Salvar Alterações";

    try {
      const response = await fetch(`${API_URL}/alertasConfig/${alertaId}`);
      alertaEditando = await response.json();

      await preencherFormularioEdicao(alertaEditando);
    } catch (error) {
      console.error("Erro ao carregar alerta:", error);
      mostrarNotificacao("Erro ao carregar alerta para edição", "error");
    }
  }
}

async function preencherFormularioEdicao(alerta) {
  // Buscar e selecionar produto
  const produto = await buscarProdutoPorId(alerta.produtoId);
  if (produto) {
    selecionarProduto(produto);
  }

  // Configurar tipo de alerta
  document.querySelector(
    `input[name="tipoAlerta"][value="${alerta.tipo}"]`
  ).checked = true;
  toggleValorAlerta();

  // Valor do alerta
  if (alerta.valorAlerta) {
    document.getElementById("valorAlerta").value = alerta.valorAlerta;
  }

  // Supermercado
  if (alerta.mercadoId) {
    document.getElementById("supermercado").value = "specific";
    toggleSupermercadoEspecifico();

    // Aguarda carregar mercados
    setTimeout(() => {
      document.getElementById("supermercadoId").value = alerta.mercadoId;
    }, 500);
  }
}

// ========================================
// BUSCA DE PRODUTOS
// ========================================
function configurarEventos() {
  const campoBusca = document.getElementById("produtoBusca");
  const removeBtn = document.getElementById("removeProductBtn");
  const tipoAlertaInputs = document.querySelectorAll(
    'input[name="tipoAlerta"]'
  );
  const supermercadoSelect = document.getElementById("supermercado");
  const form = document.getElementById("alertForm");
  const decreaseBtn = document.getElementById("decreaseBtn");
  const increaseBtn = document.getElementById("increaseBtn");

  // Busca de produtos
  campoBusca.addEventListener("input", debounce(buscarProdutos, 300));

  // Remover produto
  removeBtn.addEventListener("click", removerProdutoSelecionado);

  // Tipo de alerta
  tipoAlertaInputs.forEach((input) => {
    input.addEventListener("change", toggleValorAlerta);
  });

  // Supermercado
  supermercadoSelect.addEventListener("change", toggleSupermercadoEspecifico);

  // Botões +/-
  decreaseBtn.addEventListener("click", () => ajustarValor(-0.1));
  increaseBtn.addEventListener("click", () => ajustarValor(0.1));

  // Submit
  form.addEventListener("submit", salvarAlerta);
}

async function buscarProdutos() {
  const termo = document.getElementById("produtoBusca").value.trim();
  const resultsContainer = document.getElementById("searchResults");

  if (termo.length < 2) {
    resultsContainer.style.display = "none";
    return;
  }

  console.log("🔍 Buscando produtos:", termo);

  try {
    const response = await fetch(`${API_URL}/produtos`);
    const produtos = await response.json();

    const termoNormalizado = normalizarTexto(termo);

    const resultados = produtos.filter((p) => {
      const nome = normalizarTexto(p.nome);
      const marca = normalizarTexto(p.marca || "");
      return (
        nome.includes(termoNormalizado) || marca.includes(termoNormalizado)
      );
    });

    console.log(`✅ ${resultados.length} produtos encontrados`);

    renderizarResultados(resultados);
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
  }
}

function renderizarResultados(produtos) {
  const resultsContainer = document.getElementById("searchResults");

  if (produtos.length === 0) {
    resultsContainer.innerHTML = `
      <div class="search-no-results">
        <i class="bi bi-inbox"></i>
        <p>Nenhum produto encontrado</p>
      </div>
    `;
    resultsContainer.style.display = "block";
    return;
  }

  // ✅ Guarda produtos para referência
  const produtosParaSelecionar = produtos.slice(0, 5);

  resultsContainer.innerHTML = produtosParaSelecionar
    .map((produto, index) => {
      const precoMinimo = Math.min(...produto.ocorrencias.map((o) => o.preco));

      return `
      <div class="search-result-item" data-produto-index="${index}">
        <img src="${
          produto.imagem_url ||
          "https://ui-avatars.com/api/?name=Produto&size=50&background=e0e0e0&color=666"
        }" 
             alt="${produto.nome}"
             onerror="this.src='https://ui-avatars.com/api/?name=Produto&size=50&background=e0e0e0&color=666'">
        <div class="search-result-info">
          <strong>${produto.nome}</strong>
          <small>${produto.marca} - ${produto.tamanho_embalagem}${
        produto.unidade_medida
      }</small>
          <span class="search-result-price">A partir de R$ ${formatarPreco(
            precoMinimo
          )}</span>
        </div>
      </div>
    `;
    })
    .join("");

  resultsContainer.style.display = "block";

  // ✅ Adiciona event listeners DEPOIS de criar o HTML
  document
    .querySelectorAll("#searchResults .search-result-item")
    .forEach((item, index) => {
      item.addEventListener("click", () => {
        selecionarProduto(produtosParaSelecionar[index]);
      });
    });

  console.log(
    "✅ Event listeners adicionados para",
    produtosParaSelecionar.length,
    "produtos"
  );
}

async function buscarProdutoPorId(id) {
  try {
    const response = await fetch(`${API_URL}/produtos/${id}`);
    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    return null;
  }
}

function selecionarProduto(produto) {
  console.log("✅ Produto selecionado:", produto.nome);

  // ✅ CRÍTICO: Guarda o produto selecionado
  produtoSelecionado = produto;

  // Esconder busca
  document.getElementById("searchResults").style.display = "none";
  document.getElementById("produtoBusca").value = "";

  // Mostrar produto selecionado
  const precoMinimo = Math.min(...produto.ocorrencias.map((o) => o.preco));

  const imgElement = document.getElementById("selectedProductImg");
  imgElement.src =
    produto.imagem_url ||
    "https://ui-avatars.com/api/?name=Produto&size=80&background=e0e0e0&color=666";
  imgElement.onerror = function () {
    this.src =
      "https://ui-avatars.com/api/?name=Produto&size=80&background=e0e0e0&color=666";
  };

  document.getElementById("selectedProductName").textContent = produto.nome;
  document.getElementById(
    "selectedProductBrand"
  ).textContent = `${produto.marca} - ${produto.tamanho_embalagem}${produto.unidade_medida}`;
  document.getElementById(
    "selectedProductPrice"
  ).textContent = `R$ ${formatarPreco(precoMinimo)}`;

  document.getElementById("selectedProduct").style.display = "flex";

  // Mostrar seção de configuração
  document.getElementById("alertConfigSection").style.display = "block";

  // ✅ CRÍTICO: Força validação do formulário
  setTimeout(() => {
    validarFormulario();
    console.log(
      "📋 Produto selecionado:",
      produtoSelecionado ? "SIM ✅" : "NÃO ❌"
    );
    console.log(
      "🔘 Botão habilitado:",
      !document.getElementById("submitBtn").disabled
    );
  }, 100);
}

function removerProdutoSelecionado() {
  produtoSelecionado = null;

  document.getElementById("selectedProduct").style.display = "none";
  document.getElementById("alertConfigSection").style.display = "none";
  document.getElementById("submitBtn").disabled = true;
}

// ========================================
// CONFIGURAÇÕES DO ALERTA
// ========================================
function toggleValorAlerta() {
  const tipo = document.querySelector('input[name="tipoAlerta"]:checked').value;
  const valorGroup = document.getElementById("valorAlertaGroup");

  console.log("🔄 Tipo de alerta mudou para:", tipo);

  if (tipo === "abaixo") {
    valorGroup.style.display = "block";
  } else {
    valorGroup.style.display = "none";
  }

  // ✅ Revalida o formulário ao mudar o tipo
  setTimeout(() => validarFormulario(), 50);
}

function toggleSupermercadoEspecifico() {
  const valor = document.getElementById("supermercado").value;
  const grupo = document.getElementById("supermercadoEspecificoGroup");

  if (valor === "specific") {
    grupo.style.display = "block";
  } else {
    grupo.style.display = "none";
  }
}

async function carregarMercados() {
  try {
    const response = await fetch(`${API_URL}/mercados`);
    const mercados = await response.json();

    const select = document.getElementById("supermercadoId");
    select.innerHTML = '<option value="">Selecione um supermercado</option>';

    mercados.forEach((mercado) => {
      const option = document.createElement("option");
      option.value = mercado.id;
      option.textContent = mercado.nome;
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Erro ao carregar mercados:", error);
  }
}

function ajustarValor(delta) {
  const input = document.getElementById("valorAlerta");
  const valorAtual = parseFloat(input.value) || 0;
  const novoValor = Math.max(0, valorAtual + delta);
  input.value = novoValor.toFixed(2);
  validarFormulario();
}

function validarFormulario() {
  const submitBtn = document.getElementById("submitBtn");
  const tipo = document.querySelector('input[name="tipoAlerta"]:checked').value;
  const valorAlerta = document.getElementById("valorAlerta").value;

  console.log("🔍 Validando formulário...");
  console.log(
    "  - Produto selecionado:",
    produtoSelecionado ? "✅ SIM" : "❌ NÃO"
  );
  console.log("  - Tipo de alerta:", tipo);
  console.log("  - Valor alerta:", valorAlerta);

  let valido = produtoSelecionado !== null;

  if (tipo === "abaixo") {
    valido = valido && valorAlerta && parseFloat(valorAlerta) > 0;
    console.log("  - Validação 'abaixo de':", valido ? "✅" : "❌");
  } else {
    console.log(
      "  - Tipo 'qualquer promoção': sempre válido se produto selecionado"
    );
  }

  submitBtn.disabled = !valido;
  console.log(
    "  - Botão submit:",
    valido ? "✅ HABILITADO" : "❌ DESABILITADO"
  );

  return valido;
}

// ========================================
// SALVAR ALERTA
// ========================================
async function salvarAlerta(e) {
  e.preventDefault();

  console.log("💾 Tentando salvar alerta...");
  console.log("  - Produto selecionado:", produtoSelecionado);

  if (!produtoSelecionado) {
    console.error("❌ Nenhum produto selecionado!");
    mostrarNotificacao(
      "Por favor, busque e selecione um produto primeiro",
      "error"
    );

    // Foca no campo de busca
    document.getElementById("produtoBusca").focus();
    return;
  }

  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (!usuarioLogado) {
    console.error("❌ Usuário não logado!");
    mostrarNotificacao("Você precisa estar logado", "error");
    window.location.href = "../usuarios/login.html";
    return;
  }

  const tipo = document.querySelector('input[name="tipoAlerta"]:checked').value;
  const valorAlertaInput = document.getElementById("valorAlerta").value;

  // Validação para tipo "abaixo"
  if (
    tipo === "abaixo" &&
    (!valorAlertaInput || parseFloat(valorAlertaInput) <= 0)
  ) {
    console.error("❌ Valor de alerta inválido!");
    mostrarNotificacao("Digite um valor válido para o alerta", "error");
    document.getElementById("valorAlerta").focus();
    return;
  }

  const valorAlerta = tipo === "abaixo" ? parseFloat(valorAlertaInput) : null;
  const supermercadoOpcao = document.getElementById("supermercado").value;
  const mercadoId =
    supermercadoOpcao === "specific"
      ? parseInt(document.getElementById("supermercadoId").value) || null
      : null;

  const alerta = {
    usuarioId: usuarioLogado.id,
    produtoId: produtoSelecionado.id,
    mercadoId: mercadoId,
    tipo: tipo,
    valorAlerta: valorAlerta,
    ativo: true,
    dataCriacao: alertaEditando
      ? alertaEditando.dataCriacao
      : new Date().toISOString(),
  };

  console.log("📤 Dados do alerta a ser salvo:", alerta);

  try {
    let response;

    if (alertaEditando) {
      console.log("✏️ Atualizando alerta existente...");
      response = await fetch(`${API_URL}/alertasConfig/${alertaEditando.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...alerta, id: alertaEditando.id }),
      });
    } else {
      console.log("➕ Criando novo alerta...");
      response = await fetch(`${API_URL}/alertasConfig`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(alerta),
      });
    }

    if (response.ok) {
      const resultado = await response.json();
      console.log("✅ Alerta salvo com sucesso!", resultado);

      mostrarNotificacao(
        alertaEditando
          ? "Alerta atualizado com sucesso!"
          : "Alerta criado com sucesso!",
        "success"
      );

      setTimeout(() => {
        console.log("🔄 Redirecionando para gerenciar...");
        window.location.href = "gerenciar.html";
      }, 1500);
    } else {
      throw new Error("Erro ao salvar");
    }
  } catch (error) {
    console.error("❌ Erro ao salvar alerta:", error);
    mostrarNotificacao("Erro ao salvar alerta", "error");
  }
}

// ========================================
// UTILITÁRIOS
// ========================================
function normalizarTexto(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function formatarPreco(preco) {
  return preco.toFixed(2).replace(".", ",");
}

function mostrarNotificacao(mensagem, tipo = "info") {
  const notificacao = document.createElement("div");
  notificacao.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${
      tipo === "success" ? "#28a745" : tipo === "error" ? "#dc3545" : "#0066cc"
    };
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
  `;
  notificacao.innerHTML = `
    <i class="bi bi-${
      tipo === "success"
        ? "check-circle"
        : tipo === "error"
        ? "x-circle"
        : "info-circle"
    }"></i>
    ${mensagem}
  `;

  document.body.appendChild(notificacao);

  setTimeout(() => {
    notificacao.style.animation = "slideOut 0.3s ease-out";
    setTimeout(() => notificacao.remove(), 300);
  }, 3000);
}

// Adicionar eventos de validação em tempo real
document
  .getElementById("valorAlerta")
  ?.addEventListener("input", validarFormulario);

// ✅ CSS COMPLETO PARA CRIAR ALERTAS - CARREGADO VIA JAVASCRIPT
const estilosCriarAlertas = document.createElement("style");
estilosCriarAlertas.textContent = `
  /* CSS ESPECÍFICO PARA CRIAR ALERTAS */
  
  /* Container do input de busca */
  #alertForm .search-input-wrapper {
    position: relative;
  }

  /* Resultados da busca de produtos */
  #alertForm #searchResults {
    position: absolute !important;
    top: calc(100% + 5px) !important;
    left: 0 !important;
    right: 0 !important;
    background: white !important;
    border: 2px solid #e0e0e0 !important;
    border-radius: 8px !important;
    max-height: 350px !important;
    overflow-y: auto !important;
    z-index: 10000 !important;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15) !important;
    margin-top: 0 !important;
  }

  /* Item individual de resultado */
  #alertForm .search-result-item {
    padding: 12px 15px !important;
    display: flex !important;
    align-items: center !important;
    gap: 12px !important;
    cursor: pointer !important;
    transition: background 0.2s !important;
    border-bottom: 1px solid #f5f5f5 !important;
  }

  #alertForm .search-result-item:last-child {
    border-bottom: none !important;
  }

  #alertForm .search-result-item:hover {
    background: #f8f9fa !important;
  }

  /* Imagem do produto no resultado */
  #alertForm .search-result-item img {
    width: 50px !important;
    height: 50px !important;
    object-fit: contain !important;
    border-radius: 6px !important;
    background: #f5f5f5 !important;
    flex-shrink: 0 !important;
  }

  /* Info do produto no resultado */
  #alertForm .search-result-info {
    flex: 1 !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 4px !important;
  }

  #alertForm .search-result-info strong {
    font-size: 14px !important;
    color: #2d3748 !important;
  }

  #alertForm .search-result-info small {
    font-size: 12px !important;
    color: #718096 !important;
  }

  #alertForm .search-result-price {
    font-size: 13px !important;
    font-weight: 600 !important;
    color: #0066cc !important;
  }

  /* Quando não há resultados */
  #alertForm .search-no-results {
    padding: 40px 20px !important;
    text-align: center !important;
    color: #999 !important;
  }

  #alertForm .search-no-results i {
    font-size: 48px !important;
    margin-bottom: 10px !important;
    opacity: 0.5 !important;
    display: block !important;
  }

  #alertForm .search-no-results p {
    margin: 0 !important;
  }

  /* Produto selecionado */
  #alertForm #selectedProduct {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    padding: 15px !important;
    background: #f0f7ff !important;
    border: 2px solid #0066cc !important;
    border-radius: 12px !important;
    margin-top: 15px !important;
    gap: 15px !important;
  }

  #alertForm .selected-product-content {
    display: flex !important;
    align-items: center !important;
    gap: 15px !important;
    flex: 1 !important;
  }

  #alertForm #selectedProductImg {
    width: 80px !important;
    height: 80px !important;
    object-fit: contain !important;
    border-radius: 8px !important;
    background: white !important;
    flex-shrink: 0 !important;
  }

  #alertForm .selected-product-info {
    flex: 1 !important;
  }

  #alertForm .selected-product-info h4 {
    font-size: 16px !important;
    font-weight: 600 !important;
    color: #2d3748 !important;
    margin: 0 0 5px 0 !important;
  }

  #alertForm .selected-product-info p {
    font-size: 13px !important;
    color: #718096 !important;
    margin: 0 !important;
  }

  #alertForm .selected-product-price {
    margin-top: 5px !important;
    color: #0066cc !important;
    font-weight: 600 !important;
  }

  #alertForm #removeProductBtn {
    background: #dc3545 !important;
    color: white !important;
    border: none !important;
    width: 36px !important;
    height: 36px !important;
    border-radius: 50% !important;
    cursor: pointer !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    transition: all 0.2s !important;
    flex-shrink: 0 !important;
  }

  #alertForm #removeProductBtn:hover {
    background: #c82333 !important;
    transform: scale(1.1) rotate(90deg) !important;
  }

  /* Animações */
  @keyframes slideIn {
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(400px); opacity: 0; }
  }
`;
document.head.appendChild(estilosCriarAlertas);
console.log("✅ CSS de criar alertas carregado");
