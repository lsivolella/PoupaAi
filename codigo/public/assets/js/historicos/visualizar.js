import { HistoricoService } from "../../../services/historico-service.js";

const HistoricosService = new HistoricoService();
const API_URL = "http://localhost:3001";

const tabela = document.querySelector("#tabela-historico");

document.addEventListener("DOMContentLoaded", async () => {
  await verificarUsuarioECarregarHistorico();
});

async function verificarUsuarioECarregarHistorico() {
  // Verifica se usuário está logado
  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

  if (!usuarioLogado) {
    mostrarMensagemNaoLogado();
    return;
  }

  // Carrega histórico filtrado
  await carregarHistorico(usuarioLogado.id);
}

function mostrarMensagemNaoLogado() {
  // Esconde a tabela
  const tabelaContainer = document.querySelector("table");
  if (tabelaContainer) {
    tabelaContainer.style.display = "none";
  }

  // Pega o container principal (main)
  const mainContainer = document.querySelector("main");
  if (!mainContainer) {
    console.error("Elemento <main> não encontrado");
    return;
  }

  // Cria mensagem bonita
  const mensagem = document.createElement("div");
  mensagem.className = "text-center py-5";
  mensagem.innerHTML = `
    <div class="card shadow-sm mx-auto" style="max-width: 600px;">
      <div class="card-body p-5">
        <i class="bi bi-person-x" style="font-size: 80px; color: #667eea;"></i>
        <h3 class="mt-4 mb-3">Você precisa estar logado</h3>
        <p class="text-muted mb-4">
          Para visualizar seu histórico de compras, você precisa fazer login na sua conta.
        </p>
        <a href="/codigo/public/views/usuarios/login.html" class="btn btn-primary btn-lg">
          <i class="bi bi-box-arrow-in-right"></i> Fazer Login
        </a>
        <hr class="my-4">
        <p class="text-muted small mb-0">
          Ainda não tem conta? 
          <a href="/codigo/public/views/usuarios/cadastro.html">Cadastre-se aqui</a>
        </p>
      </div>
    </div>
  `;

  // Adiciona depois do título
  const titulo = mainContainer.querySelector("h1");
  if (titulo) {
    titulo.insertAdjacentElement("afterend", mensagem);
  } else {
    mainContainer.appendChild(mensagem);
  }
}

async function carregarHistorico(usuarioId) {
  try {
    // Busca TODOS os históricos
    const todosHistoricos = await HistoricosService.getHistorico();

    // Filtra apenas do usuário logado
    const historicosDoUsuario = todosHistoricos.filter(
      (h) => h.usuarioId === usuarioId
    );

    console.log("📦 Total de históricos:", todosHistoricos.length);
    console.log("✅ Históricos do usuário:", historicosDoUsuario.length);

    if (historicosDoUsuario.length === 0) {
      mostrarHistoricoVazio();
      return;
    }

    // Busca dados completos (produtos e mercados)
    const historicosCompletos = await Promise.all(
      historicosDoUsuario.map(async (h) => {
        try {
          // Busca nome do mercado
          const mercadoResponse = await fetch(
            `${API_URL}/mercados/${h.mercadoId}`
          );
          const mercado = mercadoResponse.ok
            ? await mercadoResponse.json()
            : { nome: "Mercado Desconhecido" };

          // Busca nomes dos produtos
          const itensComNomes = await Promise.all(
            h.itens.map(async (item) => {
              try {
                const produtoResponse = await fetch(
                  `${API_URL}/produtos/${item.produtoId}`
                );
                const produto = produtoResponse.ok
                  ? await produtoResponse.json()
                  : { nome: "Produto Desconhecido" };

                return {
                  ...item,
                  nomeProduto: produto.nome,
                  marca: produto.marca || "",
                };
              } catch (erro) {
                console.error("Erro ao buscar produto:", erro);
                return {
                  ...item,
                  nomeProduto: "Produto Desconhecido",
                  marca: "",
                };
              }
            })
          );

          return {
            ...h,
            nomeMercado: mercado.nome,
            enderecoMercado: mercado.endereco
              ? `${mercado.endereco.rua}, ${mercado.endereco.numero}`
              : "",
            itens: itensComNomes,
          };
        } catch (erro) {
          console.error("Erro ao processar histórico:", erro);
          return h;
        }
      })
    );

    renderizarHistorico(historicosCompletos);
  } catch (erro) {
    console.error("Erro ao carregar histórico:", erro);
    mostrarNotificacao("Erro ao carregar histórico de compras", "error");
  }
}

function mostrarHistoricoVazio() {
  tabela.innerHTML = `
    <tr>
      <td colspan="7" class="text-center py-5">
        <i class="bi bi-inbox" style="font-size: 60px; color: #ccc;"></i>
        <p class="mt-3 text-muted">Você ainda não tem compras registradas</p>
        <a href="/codigo/public/views/index.html" class="btn btn-primary mt-2">
          <i class="bi bi-cart-plus"></i> Ir às Compras
        </a>
      </td>
    </tr>
  `;
}

function renderizarHistorico(historicos) {
  tabela.innerHTML = "";

  historicos.forEach((h) => {
    const tr = document.createElement("tr");

    // Formata itens com nomes dos produtos
    const itensFormatados = h.itens
      .map((i) => {
        const nome = i.nomeProduto || `Produto ${i.produtoId}`;
        const marca = i.marca ? ` - ${i.marca}` : "";
        return `${nome}${marca} (${i.quantidade}x R$ ${i.precoUnitario.toFixed(
          2
        )})`;
      })
      .join("<br>");

    // Formata data
    const dataFormatada = new Date(h.data).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    tr.innerHTML = `
      <td><strong>#${h.id}</strong></td>
      <td>
        <i class="bi bi-person-circle text-primary"></i>
        ${h.usuarioId}
      </td>
      <td>
        <i class="bi bi-calendar3"></i>
        ${dataFormatada}
      </td>
      <td>
        <strong class="text-success">R$ ${h.total.toFixed(2)}</strong>
      </td>
      <td style="max-width: 300px; font-size: 13px;">
        ${itensFormatados}
      </td>
      <td>
        <i class="bi bi-shop"></i>
        <strong>${h.nomeMercado || `Mercado ${h.mercadoId}`}</strong>
        ${
          h.enderecoMercado
            ? `<br><small class="text-muted">${h.enderecoMercado}</small>`
            : ""
        }
      </td>
      <td>
        <button class="btn btn-sm btn-danger btn-excluir" data-id="${
          h.id
        }" title="Excluir compra">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `;

    tabela.appendChild(tr);
  });

  adicionarEventos();
}

function adicionarEventos() {
  document.querySelectorAll(".btn-excluir").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const confirmacao = confirm(
        "Tem certeza que deseja excluir este histórico de compra?\n\nEsta ação não pode ser desfeita."
      );

      if (confirmacao) {
        try {
          btn.disabled = true;
          btn.innerHTML =
            '<span class="spinner-border spinner-border-sm"></span>';

          await HistoricosService.excluirHistorico(btn.dataset.id);

          // Remove a linha da tabela
          btn.closest("tr").remove();

          mostrarNotificacao("Histórico excluído com sucesso!", "success");

          // Verifica se ainda tem itens
          const linhasRestantes = tabela.querySelectorAll("tr").length;
          if (linhasRestantes === 0) {
            mostrarHistoricoVazio();
          }
        } catch (error) {
          console.error("Erro ao excluir histórico:", error);
          mostrarNotificacao(
            "Erro ao excluir histórico. Tente novamente.",
            "error"
          );
          btn.disabled = false;
          btn.innerHTML = '<i class="bi bi-trash"></i>';
        }
      }
    });
  });
}

function mostrarNotificacao(mensagem, tipo = "info") {
  const notificacao = document.createElement("div");
  notificacao.className = `notificacao notificacao-${tipo}`;
  notificacao.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: ${
      tipo === "success" ? "#28a745" : tipo === "error" ? "#dc3545" : "#0066cc"
    };
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
    display: flex;
    align-items: center;
    gap: 10px;
  `;
  notificacao.innerHTML = `
    <i class="bi bi-${
      tipo === "success"
        ? "check-circle"
        : tipo === "error"
        ? "x-circle"
        : "info-circle"
    }" style="font-size: 20px;"></i>
    <span>${mensagem}</span>
  `;

  document.body.appendChild(notificacao);

  setTimeout(() => {
    notificacao.style.animation = "slideOut 0.3s ease-out";
    setTimeout(() => notificacao.remove(), 300);
  }, 3000);
}

// Adiciona CSS das animações
const style = document.createElement("style");
style.textContent = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideOut {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(100%);
    }
  }

  .table td {
    vertical-align: middle;
  }

  .btn-excluir {
    transition: all 0.3s ease;
  }

  .btn-excluir:hover {
    transform: scale(1.1);
  }
`;
document.head.appendChild(style);

console.log("✅ Sistema de histórico carregado!");
