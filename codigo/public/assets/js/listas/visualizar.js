import { ListasService } from "../../../services/listas-service.js";
import { UsuarioService } from "../../../services/usuario-service.js";

const ListasComprasService = new ListasService();
const UsuariosService = new UsuarioService();

let listas;

document.addEventListener("DOMContentLoaded", async () => {
  await carregarListasCompras();
});

async function carregarListasCompras() {
  const tbody = document.getElementById("tabelaListasCompras");
  const emptyState = document.getElementById("emptyState");
  const loadingRow = document.getElementById("loadingRow");
  const totalListasBadge = document.getElementById("totalListas");

  try {
    const usuario = await carregarUsuario();
    listas = await carregarListasUsuario(usuario.id);

    if (loadingRow) loadingRow.remove();

    if (listas.length === 0) {
      tbody.innerHTML = "";
      emptyState.style.display = "block";
      totalListasBadge.textContent = "0 listas";
      return;
    }

    emptyState.style.display = "none";
    tbody.innerHTML = "";

    totalListasBadge.textContent = `${listas.length} ${listas.length === 1 ? "lista" : "listas"
      }`;

    listas.forEach((lista) => {
      const totalItens = lista.produtos.reduce(
        (acc, p) => acc + p.quantidade * p.valorUnitario,
        0
      );

      const valorTotal = parseFloat(lista.valor);
      const diferenca = valorTotal - totalItens;

      const tr = document.createElement("tr");
      tr.innerHTML = `
                <td data-label="#">${lista.id}</td>
                <td data-label="Valor Total">
                    <strong>R$ ${formatarPreco(valorTotal)}</strong>
                </td>
                <td data-label="Valor dos Itens">
                    R$ ${formatarPreco(totalItens)}
                </td>
                <td data-label="Diferença">
                    <span class="${diferenca >= 0 ? "text-success" : "text-danger"
        }">
                        ${diferenca >= 0 ? "+" : ""}R$ ${formatarPreco(
          diferenca
        )}
                    </span>
                </td>
                <td data-label="Ações" class="text-center">
                    <button class="btn-action btn-edit" data-id="${lista.id
        }" title="Editar">
                        <i class="bi bi-pencil"></i>
                        Editar
                    </button>
                    <button class="btn-action btn-delete" data-id="${lista.id
        }" title="Excluir">
                        <i class="bi bi-trash"></i>
                        Excluir
                    </button>
                </td>
            `;

      tbody.appendChild(tr);
    });

    adicionarEventos();
  } catch (error) {
    console.error("Erro ao carregar listas:", error);
    tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-5">
                    <i class="bi bi-exclamation-triangle text-danger" style="font-size: 48px;"></i>
                    <p class="mt-3 text-danger">Erro ao carregar as listas. Tente novamente.</p>
                </td>
            </tr>
        `;
  }
}

async function carregarUsuario() {
  const userStr = localStorage.getItem("usuarioLogado");

  if (!userStr) {
    console.error("Usuário não logado.");
    return;
  }

  const user = JSON.parse(userStr);
  return await UsuariosService.getUsuario(user.id);
}

async function carregarListasUsuario(usuarioId) {
  return await ListasComprasService.getListasPorUsuario(usuarioId);
}

function adicionarEventos() {
  document.querySelectorAll(".btn-edit").forEach((btn) => {
    btn.addEventListener("click", () => {
      sessionStorage.setItem("listaEdicaoId", btn.dataset.id);
      window.location.href = "editar.html";
    });
  });

  document.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const confirmacao = confirm("Tem certeza que deseja excluir esta lista?");

      if (confirmacao) {
        try {
          btn.disabled = true;
          btn.innerHTML =
            '<span class="spinner" style="width: 16px; height: 16px; border-width: 2px;"></span>';

          await ListasComprasService.excluirLista(btn.dataset.id);

          mostrarNotificacao("Lista excluída com sucesso!", "success");

          carregarListasCompras();
        } catch (error) {
          console.error("Erro ao excluir lista:", error);
          mostrarNotificacao(
            "Erro ao excluir lista. Tente novamente.",
            "error"
          );
          btn.disabled = false;
          btn.innerHTML = '<i class="bi bi-trash"></i> Excluir';
        }
      }
    });
  });
}

function formatarPreco(valor) {
  return valor.toFixed(2).replace(".", ",");
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

const style = document.createElement("style");
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
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
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
