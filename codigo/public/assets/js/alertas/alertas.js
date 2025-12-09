const API_URL = "http://localhost:3001";

let alertasAtivos = [];
let alertasLidos = [];

document.addEventListener("DOMContentLoaded", () => {
  configurarAbas();
  carregarAlertas();
  configurarEventos();
});

function configurarAbas() {
  const tabs = document.querySelectorAll(".alert-tab");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const tabName = tab.dataset.tab;

      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      document.querySelectorAll(".alert-tab-content").forEach((content) => {
        content.classList.remove("active");
      });
      document.getElementById(tabName).classList.add("active");
    });
  });
}

async function carregarAlertas() {
  try {
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (!usuarioLogado) {
      mostrarErro("Você precisa estar logado para ver os alertas.");
      return;
    }

    const response = await fetch(
      `${API_URL}/alertas?usuarioId=${usuarioLogado.id}`
    );
    const alertas = await response.json();

    alertasAtivos = alertas.filter((a) => !a.lido);
    alertasLidos = alertas.filter((a) => a.lido);

    renderizarAlertas(alertasAtivos, "alertListAtivos", "loadingAtivos");
    renderizarAlertas(alertasLidos, "alertListLidos", "loadingLidos");

    document.getElementById("ativosBadge").textContent = alertasAtivos.length;
    document.getElementById("lidosBadge").textContent = alertasLidos.length;

    if (alertasLidos.length > 0) {
      document.getElementById("lidosActions").style.display = "block";
    }
  } catch (error) {
    console.error("Erro ao carregar alertas:", error);
    mostrarErro("Erro ao carregar alertas. Tente novamente.");
  }
}

async function renderizarAlertas(alertas, containerId, loadingId) {
  const container = document.getElementById(containerId);
  const loading = document.getElementById(loadingId);

  if (loading) loading.remove();

  if (alertas.length === 0) {
    container.innerHTML = `
      <div class="alert-empty">
        <i class="bi bi-inbox"></i>
        <h3>Nenhum alerta ${
          containerId.includes("Lidos") ? "lido" : "novo"
        }</h3>
        <p>${
          containerId.includes("Lidos")
            ? "Os alertas que você marcar como lidos aparecerão aqui."
            : "Você ainda não tem alertas de preço ativos."
        }</p>
        ${
          !containerId.includes("Lidos")
            ? '<a href="criar.html" class="btn btn-primary"><i class="bi bi-plus-lg"></i> Criar Primeiro Alerta</a>'
            : ""
        }
      </div>
    `;
    return;
  }

  container.innerHTML = "";

  for (const alerta of alertas) {
    const produto = await buscarProduto(alerta.produtoId);
    const mercado = alerta.mercadoId
      ? await buscarMercado(alerta.mercadoId)
      : null;

    const card = criarCardAlerta(alerta, produto, mercado);
    container.appendChild(card);
  }
}

// ✅ Função para corrigir caminho da imagem do produto
function getImagemProduto(produto) {
  let imagemUrl = produto.imagem_url || "";

  if (imagemUrl && !imagemUrl.startsWith("http")) {
    if (imagemUrl.startsWith("../")) {
      imagemUrl = imagemUrl.substring(3);
    }

    if (imagemUrl.startsWith("assets/")) {
      imagemUrl = `/codigo/public/${imagemUrl}`;
    } else if (imagemUrl.startsWith("img/")) {
      imagemUrl = `/codigo/public/assets/${imagemUrl}`;
    } else if (!imagemUrl.startsWith("/")) {
      imagemUrl = `/codigo/public/assets/img/${imagemUrl}`;
    }
  }

  return (
    imagemUrl || "https://via.placeholder.com/80/cccccc/666666?text=Sem+Imagem"
  );
}

function criarCardAlerta(alerta, produto, mercado) {
  const card = document.createElement("div");
  card.className = `alert-card ${alerta.lido ? "lido" : ""}`;
  card.dataset.alertaId = alerta.id;

  const tempoDecorrido = calcularTempoDecorrido(alerta.dataNotificacao);
  const imagemProduto = getImagemProduto(produto);

  card.innerHTML = `
    <img src="${imagemProduto}" alt="${produto.nome}" class="alert-product-img">
    
    <div class="alert-content">
      <h3 class="alert-product-name">${produto.nome}</h3>
      
      <div class="alert-price-change">
        <span class="alert-old-price">R$ ${formatarPreco(
          alerta.precoAnterior
        )}</span>
        <i class="bi bi-arrow-right alert-arrow"></i>
        <span class="alert-new-price">R$ ${formatarPreco(
          alerta.precoNovo
        )}</span>
      </div>
      
      <div class="alert-info">
        <span>
          <i class="bi bi-shop"></i>
          ${mercado ? mercado.nome : "Vários supermercados"}
        </span>
        <span>
          <i class="bi bi-clock"></i>
          ${tempoDecorrido}
        </span>
      </div>
      
      <div class="alert-actions">
        <button class="btn-alert btn-ver-produto" onclick="verProduto(${
          produto.id
        })">
          <i class="bi bi-eye"></i>
          Ver Produto
        </button>
        ${
          !alerta.lido
            ? `
          <button class="btn-alert btn-marcar-lido" onclick="marcarComoLido(${alerta.id})">
            <i class="bi bi-check-lg"></i>
            Marcar como Lido
          </button>
        `
            : ""
        }
      </div>
    </div>
  `;

  return card;
}

async function buscarProduto(id) {
  try {
    const response = await fetch(`${API_URL}/produtos/${id}`);
    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    return { nome: "Produto não encontrado", imagem: null };
  }
}

async function buscarMercado(id) {
  try {
    const response = await fetch(`${API_URL}/mercados/${id}`);
    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar mercado:", error);
    return null;
  }
}

async function marcarComoLido(alertaId) {
  try {
    await fetch(`${API_URL}/alertas/${alertaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lido: true }),
    });

    mostrarNotificacao("Alerta marcado como lido!", "success");

    setTimeout(() => {
      carregarAlertas();
    }, 500);
  } catch (error) {
    console.error("Erro ao marcar como lido:", error);
    mostrarNotificacao("Erro ao marcar como lido.", "error");
  }
}

function verProduto(produtoId) {
  window.location.href = `../produtos/detalhes.html?id=${produtoId}`;
}

function configurarEventos() {
  const limparLidosBtn = document.getElementById("limparLidosBtn");
  if (limparLidosBtn) {
    limparLidosBtn.addEventListener("click", limparLidos);
  }
}

async function limparLidos() {
  if (!confirm("Deseja realmente limpar todos os alertas lidos?")) {
    return;
  }

  try {
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

    for (const alerta of alertasLidos) {
      await fetch(`${API_URL}/alertas/${alerta.id}`, {
        method: "DELETE",
      });
    }

    mostrarNotificacao("Alertas lidos removidos!", "success");
    carregarAlertas();
  } catch (error) {
    console.error("Erro ao limpar lidos:", error);
    mostrarNotificacao("Erro ao limpar alertas.", "error");
  }
}

function formatarPreco(preco) {
  return preco.toFixed(2).replace(".", ",");
}

function calcularTempoDecorrido(dataNotificacao) {
  const agora = new Date();
  const data = new Date(dataNotificacao);
  const diff = agora - data;

  const minutos = Math.floor(diff / 60000);
  const horas = Math.floor(diff / 3600000);
  const dias = Math.floor(diff / 86400000);

  if (minutos < 60) {
    return `Há ${minutos} ${minutos === 1 ? "minuto" : "minutos"}`;
  } else if (horas < 24) {
    return `Há ${horas} ${horas === 1 ? "hora" : "horas"}`;
  } else {
    return `Há ${dias} ${dias === 1 ? "dia" : "dias"}`;
  }
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

function mostrarErro(mensagem) {
  document.getElementById("alertListAtivos").innerHTML = `
    <div class="alert-empty">
      <i class="bi bi-exclamation-triangle text-danger" style="font-size: 80px;"></i>
      <h3>Erro</h3>
      <p>${mensagem}</p>
    </div>
  `;
  document.getElementById("loadingAtivos").remove();
}

const style = document.createElement("style");
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(400px); opacity: 0; }
  }
`;
document.head.appendChild(style);
