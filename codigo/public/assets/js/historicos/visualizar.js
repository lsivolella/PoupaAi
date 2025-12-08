import { HistoricoService } from "../../../services/historico-service.js";

const HistoricosService = new HistoricoService();

const tabela = document.querySelector("#tabela-historico");

document.addEventListener("DOMContentLoaded", async () => {
  await carregarHistorico();
});

async function carregarHistorico() {
  const historicos = await HistoricosService.getHistorico();

  tabela.innerHTML = "";

  historicos.forEach((h) => {
    const tr = document.createElement("tr");

    const itensFormatados = h.itens
      .map(
        (i) =>
          `Produto ${i.produtoId} (Qtd: ${i.quantidade}, R$ ${i.precoUnitario})`
      )
      .join("<br>");

    tr.innerHTML = `
            <td>${h.id}</td>
            <td>${h.usuarioId}</td>
            <td>${new Date(h.data).toLocaleString()}</td>
            <td>R$ ${h.total.toFixed(2)}</td>
            <td>${itensFormatados}</td>
            <td>${h.mercadoId}</td>

            <td>
                <button class="btn-editar d-none data-id="${h.id}">Editar</button>
                <button class="btn-excluir" data-id="${h.id}">Excluir</button>
            </td>
        `;

    tabela.appendChild(tr);
  });

  adicionarEventos();
}

function adicionarEventos() {
  // document.querySelectorAll(".btn-editar").forEach((btn) => {
  //   btn.addEventListener("click", () => {
  //     sessionStorage.setItem("historicoId", btn.dataset.id);
  //     window.location.href = "./editar.html";
  //   });
  // });

  document.querySelectorAll(".btn-excluir").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const confirmacao = confirm("Tem certeza que deseja excluir este histórico?");

      if (confirmacao) {
        try {
          btn.disabled = true;
          btn.innerHTML =
            '<span class="spinner" style="width: 16px; height: 16px; border-width: 2px;"></span>';

          await HistoricosService.excluirHistorico(btn.dataset.id);

          mostrarNotificacao("Histórico excluída com sucesso!", "success");
        } catch (error) {
          console.error("Erro ao excluir histórico:", error);
          mostrarNotificacao(
            "Erro ao excluir histórico. Tente novamente.",
            "error"
          );
          btn.disabled = false;
          btn.innerHTML = '<i class="bi bi-trash"></i> Excluir';
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
        top: 20px;
        right: 20px;
        background: ${tipo === "success"
      ? "#28a745"
      : tipo === "error"
        ? "#dc3545"
        : "#0066cc"
    };
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
  notificacao.innerHTML = `
        <i class="bi bi-${tipo === "success"
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