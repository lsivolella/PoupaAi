import { AvaliacaoService } from "../../../services/avaliacao-service.js";

const service = new AvaliacaoService();
const API_URL = "http://localhost:3001";
const id = sessionStorage.getItem("avaliacaoId");
const form = document.querySelector("#form-editar");

document.addEventListener("DOMContentLoaded", () => {
  carregarDados();
  configurarFormulario();
});

async function carregarDados() {
  if (!id) {
    alert("Nenhuma avaliação selecionada!");
    window.location.href = "index.html";
    return;
  }

  try {
    const avaliacao = await service.getAvaliacao(id);
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

    // ✅ Verifica se a avaliação pertence ao usuário
    if (avaliacao.usuarioId !== usuarioLogado.id) {
      alert("Você não pode editar avaliações de outros usuários!");
      window.location.href = "index.html";
      return;
    }

    // ✅ Esconde select de usuário (não precisa editar)
    const usuarioField = document.querySelector(".mb-3:has(#usuarioId)");
    if (usuarioField) {
      usuarioField.style.display = "none";
    }

    // Carrega mercados
    const mercados = await fetch(`${API_URL}/mercados`).then((r) => r.json());
    const mercadoSelect = document.getElementById("mercadoId");

    mercados.forEach((m) => {
      const option = document.createElement("option");
      option.value = m.id;
      option.textContent = m.nome;

      if (m.id === avaliacao.mercadoId) {
        option.selected = true;
      }

      mercadoSelect.appendChild(option);
    });

    // Preenche formulário
    document.getElementById("nota").value = avaliacao.nota;
    document.getElementById("comentario").value = avaliacao.comentario || "";

    console.log("✅ Avaliação carregada:", avaliacao);
  } catch (erro) {
    console.error("Erro ao carregar avaliação:", erro);
    alert("Erro ao carregar avaliação!");
    window.location.href = "index.html";
  }
}

function configurarFormulario() {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nota = document.getElementById("nota").value;
    const mercadoId = document.getElementById("mercadoId").value;
    const comentario = document.getElementById("comentario").value;

    // Validações
    if (!nota || nota < 0 || nota > 5) {
      mostrarNotificacao("Nota deve ser entre 0 e 5!", "warning");
      return;
    }

    try {
      const btnSubmit = form.querySelector('button[type="submit"]');
      btnSubmit.disabled = true;
      btnSubmit.innerHTML =
        '<span class="spinner-border spinner-border-sm me-2"></span>Salvando...';

      const dadosAtualizados = {
        mercadoId: Number(mercadoId),
        nota: Number(nota),
        comentario: comentario,
      };

      await service.atualizarAvaliacao(id, dadosAtualizados);

      mostrarNotificacao("✅ Avaliação atualizada com sucesso!", "success");

      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    } catch (erro) {
      console.error("Erro ao atualizar avaliação:", erro);
      mostrarNotificacao("Erro ao atualizar avaliação", "error");

      const btnSubmit = form.querySelector('button[type="submit"]');
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = "Salvar Alterações";
    }
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

console.log("✅ Sistema de edição de avaliações carregado!");