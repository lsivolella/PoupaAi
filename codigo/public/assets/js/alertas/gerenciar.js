const API_URL = "http://localhost:3001";

let alertasCadastrados = [];
let alertaParaExcluir = null;

document.addEventListener("DOMContentLoaded", () => {
  carregarAlertas();
  carregarMercados();
  configurarEventos();
});

async function carregarAlertas() {
  try {
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (!usuarioLogado) {
      mostrarErro("Você precisa estar logado.");
      return;
    }

    console.log("🔍 Carregando alertas para usuário:", usuarioLogado.id);

    // ✅ CORRIGIDO: alertasConfig (sem hífen)
    const response = await fetch(
      `${API_URL}/alertasConfig?usuarioId=${usuarioLogado.id}`
    );
    alertasCadastrados = await response.json();

    console.log(`✅ ${alertasCadastrados.length} alertas carregados`);

    document.getElementById("totalAlertas").textContent =
      alertasCadastrados.length;

    renderizarTabela(alertasCadastrados);
  } catch (error) {
    console.error("Erro ao carregar alertas:", error);
    mostrarErro("Erro ao carregar alertas.");
  }
}

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
    imagemUrl ||
    "https://ui-avatars.com/api/?name=Produto&size=50&background=e0e0e0&color=666"
  );
}

async function renderizarTabela(alertas) {
  const tbody = document.getElementById("alertasTableBody");
  const loadingRow = document.getElementById("loadingRow");
  const emptyState = document.getElementById("emptyState");

  if (loadingRow) loadingRow.remove();

  if (alertas.length === 0) {
    tbody.innerHTML = "";
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";
  tbody.innerHTML = "";

  console.log("📊 Renderizando tabela com", alertas.length, "alertas");

  for (const alerta of alertas) {
    const produto = await buscarProduto(alerta.produtoId);
    const mercado = alerta.mercadoId
      ? await buscarMercado(alerta.mercadoId)
      : null;

    const precoAtual = await buscarPrecoAtual(
      alerta.produtoId,
      alerta.mercadoId
    );

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td data-label="Status">
        <span class="status-badge status-${alerta.ativo ? "ativo" : "pausado"}">
          <i class="bi bi-${
            alerta.ativo ? "check-circle" : "pause-circle"
          }"></i>
          ${alerta.ativo ? "Ativo" : "Pausado"}
        </span>
      </td>
      <td data-label="Produto">
      <div class="table-product">
        <img src="${getImagemProduto(produto)}" alt="${
      produto.nome
    }" class="table-product-img">
        <div>
          <strong>${produto.nome}</strong>
          <small>${produto.marca || ""}</small>
        </div>
      </div>
    </td>
      <td data-label="Tipo">
        <span class="tipo-badge tipo-${alerta.tipo}">
          <i class="bi bi-${
            alerta.tipo === "abaixo" ? "arrow-down-circle" : "bell"
          }"></i>
          ${alerta.tipo === "abaixo" ? "Abaixo de" : "Qualquer oferta"}
        </span>
      </td>
      <td data-label="Valor Alerta">
        ${
          alerta.tipo === "abaixo"
            ? `<strong class="text-primary">R$ ${formatarPreco(
                alerta.valorAlerta
              )}</strong>`
            : "—"
        }
      </td>
      <td data-label="Preço Atual">
        <strong class="${
          precoAtual &&
          alerta.tipo === "abaixo" &&
          precoAtual <= alerta.valorAlerta
            ? "text-success"
            : ""
        }">
          ${precoAtual ? "R$ " + formatarPreco(precoAtual) : "—"}
        </strong>
        ${
          precoAtual &&
          alerta.tipo === "abaixo" &&
          precoAtual <= alerta.valorAlerta
            ? '<br><small class="text-success">✓ Alerta atingido!</small>'
            : ""
        }
      </td>
      <td data-label="Supermercado">
        ${mercado ? mercado.nome : "Todos"}
      </td>
      <td data-label="Criado em">
        ${formatarData(alerta.dataCriacao)}
      </td>
      <td data-label="Ações" class="text-center">
        <div class="table-actions">
          <button class="btn-action btn-toggle" data-id="${
            alerta.id
          }" data-ativo="${alerta.ativo}" title="${
      alerta.ativo ? "Pausar" : "Ativar"
    }">
            <i class="bi bi-${alerta.ativo ? "pause" : "play"}"></i>
          </button>
          <button class="btn-action btn-edit" data-id="${
            alerta.id
          }" title="Editar">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn-action btn-delete" data-id="${
            alerta.id
          }" title="Excluir">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    `;

    tbody.appendChild(tr);
  }

  console.log("✅ Tabela renderizada!");
  adicionarEventos();
}

async function buscarProduto(id) {
  try {
    const response = await fetch(`${API_URL}/produtos/${id}`);
    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar produto:", id, error);
    return { nome: "Produto não encontrado", imagem_url: null };
  }
}

async function buscarMercado(id) {
  try {
    const response = await fetch(`${API_URL}/mercados/${id}`);
    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar mercado:", id, error);
    return null;
  }
}

async function buscarPrecoAtual(produtoId, mercadoId) {
  try {
    const produto = await fetch(`${API_URL}/produtos/${produtoId}`).then((r) =>
      r.json()
    );

    if (mercadoId) {
      const ocorrencia = produto.ocorrencias?.find(
        (o) => o.mercadoId === mercadoId
      );
      return ocorrencia?.preco || null;
    } else {
      const precos = produto.ocorrencias?.map((o) => o.preco) || [];
      return precos.length > 0 ? Math.min(...precos) : null;
    }
  } catch (error) {
    console.error("Erro ao buscar preço:", error);
    return null;
  }
}

async function carregarMercados() {
  try {
    const response = await fetch(`${API_URL}/mercados`);
    const mercados = await response.json();

    const select = document.getElementById("filterMercado");
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

function configurarEventos() {
  document
    .getElementById("filterStatus")
    .addEventListener("change", aplicarFiltros);
  document
    .getElementById("filterMercado")
    .addEventListener("change", aplicarFiltros);

  document.getElementById("modalClose").addEventListener("click", fecharModal);
  document.getElementById("modalCancel").addEventListener("click", fecharModal);
  document
    .getElementById("modalConfirm")
    .addEventListener("click", confirmarExclusao);
}

function adicionarEventos() {
  document.querySelectorAll(".btn-toggle").forEach((btn) => {
    btn.addEventListener("click", () =>
      toggleAlerta(btn.dataset.id, btn.dataset.ativo === "true")
    );
  });

  document.querySelectorAll(".btn-edit").forEach((btn) => {
    btn.addEventListener("click", () => editarAlerta(btn.dataset.id));
  });

  document.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", () => abrirModalExcluir(btn.dataset.id));
  });
}

async function toggleAlerta(id, estaAtivo) {
  try {
    // ✅ CORRIGIDO: alertasConfig (sem hífen)
    await fetch(`${API_URL}/alertasConfig/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ativo: !estaAtivo }),
    });

    mostrarNotificacao(
      `Alerta ${estaAtivo ? "pausado" : "ativado"} com sucesso!`,
      "success"
    );

    carregarAlertas();
  } catch (error) {
    console.error("Erro ao alternar alerta:", error);
    mostrarNotificacao("Erro ao alterar status.", "error");
  }
}

function editarAlerta(id) {
  window.location.href = `criar.html?id=${id}`;
}

function abrirModalExcluir(id) {
  alertaParaExcluir = id;
  const modal = document.getElementById("modalOverlay");
  modal.style.display = "flex";

  setTimeout(() => {
    modal.querySelector(".modal-content").style.transform = "scale(1)";
  }, 10);
}

function fecharModal() {
  const modal = document.getElementById("modalOverlay");
  modal.querySelector(".modal-content").style.transform = "scale(0.9)";

  setTimeout(() => {
    modal.style.display = "none";
    alertaParaExcluir = null;
  }, 200);
}

async function confirmarExclusao() {
  if (!alertaParaExcluir) return;

  try {
    // ✅ CORRIGIDO: alertasConfig (sem hífen)
    await fetch(`${API_URL}/alertasConfig/${alertaParaExcluir}`, {
      method: "DELETE",
    });

    mostrarNotificacao("Alerta excluído com sucesso!", "success");
    fecharModal();
    carregarAlertas();
  } catch (error) {
    console.error("Erro ao excluir alerta:", error);
    mostrarNotificacao("Erro ao excluir alerta.", "error");
  }
}

function aplicarFiltros() {
  const statusFilter = document.getElementById("filterStatus").value;
  const mercadoFilter = document.getElementById("filterMercado").value;

  let alertasFiltrados = [...alertasCadastrados];

  if (statusFilter !== "todos") {
    const ativo = statusFilter === "ativos";
    alertasFiltrados = alertasFiltrados.filter((a) => a.ativo === ativo);
  }

  if (mercadoFilter !== "todos") {
    alertasFiltrados = alertasFiltrados.filter(
      (a) =>
        a.mercadoId === parseInt(mercadoFilter) ||
        (!a.mercadoId && mercadoFilter === "todos")
    );
  }

  renderizarTabela(alertasFiltrados);
}

function formatarPreco(preco) {
  return preco.toFixed(2).replace(".", ",");
}

function formatarData(data) {
  const d = new Date(data);
  return d.toLocaleDateString("pt-BR");
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
  document.getElementById("alertasTableBody").innerHTML = `
    <tr>
      <td colspan="8" class="text-center py-5">
        <i class="bi bi-exclamation-triangle text-danger" style="font-size: 48px;"></i>
        <p class="mt-3 text-danger">${mensagem}</p>
      </td>
    </tr>
  `;
}
