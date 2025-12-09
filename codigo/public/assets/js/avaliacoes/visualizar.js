import { AvaliacaoService } from "../../../services/avaliacao-service.js";

const service = new AvaliacaoService();
const API_URL = "http://localhost:3001";
const tabela = document.querySelector("#tabela-avaliacoes");

document.addEventListener("DOMContentLoaded", () => {
  verificarUsuarioECarregar();
});

async function verificarUsuarioECarregar() {
  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

  if (!usuarioLogado) {
    mostrarMensagemNaoLogado();
    return;
  }

  await carregarAvaliacoes(usuarioLogado.id);
}

function mostrarMensagemNaoLogado() {
  const container = document.querySelector("main");
  const tabelaContainer = document.querySelector("table");

  if (tabelaContainer) {
    tabelaContainer.style.display = "none";
  }

  const btnNova = document.querySelector('a[href="criar.html"]');
  if (btnNova) {
    btnNova.style.display = "none";
  }

  const mensagem = document.createElement("div");
  mensagem.className = "text-center py-5";
  mensagem.innerHTML = `
    <div class="card shadow-sm mx-auto" style="max-width: 600px;">
      <div class="card-body p-5">
        <i class="bi bi-star" style="font-size: 80px; color: #ffc107;"></i>
        <h3 class="mt-4 mb-3">Você precisa estar logado</h3>
        <p class="text-muted mb-4">
          Para ver e criar avaliações, faça login na sua conta.
        </p>
        <a href="../usuarios/login.html" class="btn btn-primary btn-lg">
          <i class="bi bi-box-arrow-in-right"></i> Fazer Login
        </a>
      </div>
    </div>
  `;

  const titulo = container.querySelector("h1");
  if (titulo) {
    titulo.insertAdjacentElement("afterend", mensagem);
  }
}

async function carregarAvaliacoes(usuarioId) {
  try {
    // Busca TODAS as avaliações
    const todasAvaliacoes = await service.getAvaliacoes();

    // ✅ Filtra apenas do usuário logado
    const avaliacoesDoUsuario = todasAvaliacoes.filter(
      (av) => av.usuarioId === usuarioId
    );

    console.log("📊 Total de avaliações:", todasAvaliacoes.length);
    console.log("✅ Avaliações do usuário:", avaliacoesDoUsuario.length);

    if (avaliacoesDoUsuario.length === 0) {
      mostrarAvaliacoesVazias();
      return;
    }

    // Busca nomes dos mercados
    const avaliacoesCompletas = await Promise.all(
      avaliacoesDoUsuario.map(async (av) => {
        try {
          const mercadoResponse = await fetch(
            `${API_URL}/mercados/${av.mercadoId}`
          );
          const mercado = mercadoResponse.ok
            ? await mercadoResponse.json()
            : { nome: "Mercado Desconhecido" };

          return {
            ...av,
            nomeMercado: mercado.nome,
          };
        } catch (erro) {
          return {
            ...av,
            nomeMercado: "Mercado Desconhecido",
          };
        }
      })
    );

    renderizarAvaliacoes(avaliacoesCompletas);
  } catch (erro) {
    console.error("Erro ao carregar avaliações:", erro);
    mostrarNotificacao("Erro ao carregar avaliações", "error");
  }
}

function mostrarAvaliacoesVazias() {
  tabela.innerHTML = `
    <tr>
      <td colspan="5" class="text-center py-5">
        <i class="bi bi-star" style="font-size: 60px; color: #ccc;"></i>
        <p class="mt-3 text-muted">Você ainda não fez nenhuma avaliação</p>
        <a href="criar.html" class="btn btn-primary mt-2">
          <i class="bi bi-plus-lg"></i> Criar Primeira Avaliação
        </a>
      </td>
    </tr>
  `;
}

function renderizarAvaliacoes(avaliacoes) {
  tabela.innerHTML = "";

  avaliacoes.forEach((av) => {
    const tr = document.createElement("tr");

    // Formata data se existir
    let dataFormatada = "-";
    if (av.data) {
      dataFormatada = new Date(av.data).toLocaleDateString("pt-BR");
    }

    // Cria estrelas visuais
    const estrelas = criarEstrelas(av.nota);

    tr.innerHTML = `
      <td>
        <strong>${av.nomeMercado}</strong>
        <br>
        <small class="text-muted">${dataFormatada}</small>
      </td>
      <td class="text-center">
        <div>${estrelas}</div>
        <small class="text-muted">${av.nota.toFixed(1)}</small>
      </td>
      <td style="max-width: 300px;">
        ${av.comentario || '<em class="text-muted">Sem comentário</em>'}
      </td>
      <td class="text-center">
        <button class="btn btn-sm btn-warning btn-editar me-1" data-id="${
          av.id
        }" title="Editar avaliação">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-danger btn-excluir" data-id="${
          av.id
        }" title="Excluir avaliação">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `;

    tabela.appendChild(tr);
  });

  adicionarEventos();
}

function criarEstrelas(nota) {
  let estrelas = "";
  const notaArredondada = Math.round(nota);

  for (let i = 1; i <= 5; i++) {
    if (i <= notaArredondada) {
      estrelas += '<i class="bi bi-star-fill" style="color: #ffc107;"></i>';
    } else {
      estrelas += '<i class="bi bi-star" style="color: #ddd;"></i>';
    }
  }

  return estrelas;
}

function adicionarEventos() {
  document.querySelectorAll(".btn-editar").forEach((btn) => {
    btn.addEventListener("click", () => {
      sessionStorage.setItem("avaliacaoId", btn.dataset.id);
      window.location.href = "editar.html";
    });
  });

  document.querySelectorAll(".btn-excluir").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (confirm("Tem certeza que deseja excluir esta avaliação?")) {
        try {
          btn.disabled = true;
          btn.innerHTML =
            '<span class="spinner-border spinner-border-sm"></span>';

          await service.excluirAvaliacao(btn.dataset.id);

          // Remove a linha da tabela
          btn.closest("tr").remove();

          mostrarNotificacao("Avaliação excluída com sucesso!", "success");

          // Verifica se ainda tem avaliações
          const linhasRestantes = tabela.querySelectorAll("tr").length;
          if (linhasRestantes === 0) {
            mostrarAvaliacoesVazias();
          }
        } catch (erro) {
          console.error("Erro ao excluir avaliação:", erro);
          mostrarNotificacao("Erro ao excluir avaliação", "error");
          btn.disabled = false;
          btn.innerHTML = '<i class="bi bi-trash"></i>';
        }
      }
    });
  });
}

function mostrarNotificacao(mensagem, tipo = "success") {
  const bgColor = {
    success: "#28a745",
    error: "#dc3545",
    warning: "#ffc107",
    info: "#17a2b8",
  };

  const notification = document.createElement("div");
  notification.textContent = mensagem;
  notification.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: ${bgColor[tipo]};
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

// CSS das animações
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
`;
document.head.appendChild(style);

console.log("✅ Sistema de visualização de avaliações carregado!");
