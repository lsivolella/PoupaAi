const API_URL = "http://localhost:3001";

document.addEventListener("DOMContentLoaded", () => {
  carregarUsuarios();
  configurarEventos();
});

// ✅ CSS inline para manter estética
const style = document.createElement("style");
style.textContent = `
  .table-modern {
    width: 100%;
    border-collapse: collapse;
  }
  .table-modern th, .table-modern td {
    padding: 12px 15px;
    border-bottom: 1px solid #e0e0e0;
    text-align: left;
  }
  .table-modern th {
    background: #f8f9fa;
    font-weight: bold;
  }
  .status-badge-active {
    display: inline-block;
    padding: 4px 8px;
    background: #28a745;
    color: white;
    border-radius: 6px;
    font-size: 0.85rem;
  }
  .spinner {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #0066cc;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    animation: spin 1s linear infinite;
    margin: auto;
  }
  @keyframes spin {
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

async function carregarUsuarios() {
  try {
    const usuarios = await fetch(`${API_URL}/usuarios`).then((r) => r.json());
    const tbody = document.getElementById("usuariosTableBody");
    tbody.innerHTML = "";

    if (usuarios.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="text-center py-5">
            <i class="bi bi-inbox" style="font-size: 48px; color: #e0e0e0;"></i>
            <p class="mt-3 text-muted">Nenhum usuário cadastrado</p>
          </td>
        </tr>`;
      return;
    }

    usuarios.forEach((usuario) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${usuario.nome}</td>
        <td>${usuario.email}</td>
        <td>${formatarData(usuario.dataCadastro)}</td>
        <td><span class="status-badge-active">Ativo</span></td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error("Erro ao carregar usuários:", error);
  }
}

function configurarEventos() {
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("adminLogado");
    window.location.href = "../usuarios/login-admin.html";
  });

  document.getElementById("searchButton").addEventListener("click", () => {
    const termo = document.getElementById("searchInput").value.toLowerCase();
    const linhas = document.querySelectorAll("#usuariosTableBody tr");
    linhas.forEach((linha) => {
      const nome = linha.cells[0]?.textContent.toLowerCase() || "";
      const email = linha.cells[1]?.textContent.toLowerCase() || "";
      linha.style.display =
        nome.includes(termo) || email.includes(termo) ? "" : "none";
    });
  });
}

function formatarData(data) {
  return new Date(data).toLocaleDateString("pt-BR");
}
