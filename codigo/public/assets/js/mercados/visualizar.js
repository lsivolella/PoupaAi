import { MercadoService } from "../../../services/mercado-service.js";

const service = new MercadoService();
const container = document.getElementById("cards-mercados");
const btnCadastrar = document.getElementById("cadastraBtn");
const inputPesquisa = document.getElementById("pesquisa-mercado");
const btnTodos = document.getElementById("filtro-todos");
const btnAcessivel = document.getElementById("filtro-acessivel");
const btnSemAcessibilidade = document.getElementById(
  "filtro-sem-acessibilidade"
);

let todosMercados = [];

document.addEventListener("DOMContentLoaded", async () => {
  await aplicarFormatacaoUsuario();
  await carregarMercados();
});

async function aplicarFormatacaoUsuario() {
  const userStr = localStorage.getItem("usuarioLogado");
  let user;

  if (userStr) {
    user = JSON.parse(userStr);
  }

  // ✅ Verifica se é admin (aceita "admin" ou "role === admin")
  if (user && (user.tipo === "admin" || user.role === "admin")) {
    btnCadastrar.style.display = "inline-block";
    console.log("👨‍💼 Admin logado - Botão cadastrar visível");
  } else {
    btnCadastrar.style.display = "none";
    console.log("👤 Usuário comum - Botão cadastrar oculto");
  }
}

async function carregarMercados() {
  try {
    todosMercados = await service.getMercados();
    renderizarMercados(todosMercados);
  } catch (err) {
    console.error("Erro ao carregar mercados:", err);
    container.innerHTML = `<div class="alert alert-danger text-center">Erro ao carregar os mercados.</div>`;
  }
}

function renderizarMercados(lista) {
  container.innerHTML = "";

  if (lista.length === 0) {
    container.innerHTML = `<div class="alert alert-warning text-center">Nenhum mercado encontrado.</div>`;
    return;
  }

  lista.forEach((m) => {
    const card = document.createElement("div");
    card.classList.add("col-12");

    // ✅ Corrige caminho da logo
    let logoUrl = m.logo || "";

    if (logoUrl && !logoUrl.startsWith("http")) {
      // Remove ../ se começar com ele
      if (logoUrl.startsWith("../")) {
        logoUrl = logoUrl.substring(3);
      }

      // Se começar com "assets/", adiciona /codigo/public/
      if (logoUrl.startsWith("assets/")) {
        logoUrl = `/codigo/public/${logoUrl}`;
      }
      // Se começar com "img/", adiciona /codigo/public/assets/
      else if (logoUrl.startsWith("img/")) {
        logoUrl = `/codigo/public/assets/${logoUrl}`;
      }
      // Se não tiver caminho completo, assume que está em assets/img/
      else if (!logoUrl.startsWith("/")) {
        logoUrl = `/codigo/public/assets/img/${logoUrl}`;
      }
    }

    // Fallback para logo padrão
    if (!logoUrl) {
      logoUrl = "https://via.placeholder.com/200/667eea/ffffff?text=Mercado";
    }

    card.innerHTML = `
      <div class="card mb-3 d-flex flex-row align-items-center">
        <img 
          src="${logoUrl}" 
          class="img-fluid rounded-start" 
          alt="${m.nome}" 
          style="width: 200px; height: 200px; object-fit: cover;"
          onerror="this.src='https://via.placeholder.com/200/667eea/ffffff?text=Mercado'"
        >
        <div class="card-body flex-grow-1">
          <h5 class="card-title">${m.nome}</h5>
          <p class="card-text mb-1"><b>Endereço:</b> ${m.endereco?.rua}, ${
      m.endereco?.numero
    } - ${m.endereco?.bairro}, ${m.endereco?.cidade} - ${m.endereco?.estado}, ${
      m.endereco?.pais
    }</p>
          <p class="card-text mb-1"><b>Telefone:</b> ${m.telefone}</p>
          <p class="card-text mb-1"><b>Média Avaliações:</b> ${
            m.mediaAvaliacoes ?? "-"
          }</p>
          <p class="card-text mb-1"><b>Funcionamento:</b> ${
            m.horarioFuncionamento
          }</p>
          <div class="mt-2 d-flex gap-2">
            <button class="btn btn-info btn-detalhes" data-id="${m.id}">
              <i class="bi bi-eye"></i> Detalhes
            </button>
            <button class="btn btn-success btn-mapa" data-id="${m.id}">
              <i class="bi bi-geo-alt"></i> Ver Mapa
            </button>
          </div>
        </div>
      </div>
    `;

    container.appendChild(card);
  });

  adicionarEventos();
}

function adicionarEventos() {
  document.querySelectorAll(".btn-detalhes").forEach((btn) => {
    btn.addEventListener("click", () => {
      sessionStorage.setItem("mercadoId", btn.dataset.id);
      window.location.href = "detalhes.html";
    });
  });

  document.querySelectorAll(".btn-mapa").forEach((btn) => {
    btn.addEventListener("click", () => {
      sessionStorage.setItem("mercadoId", btn.dataset.id);
      window.location.href = "mapa.html";
    });
  });
}

function atualizarFiltroAtivo(botaoAtivo) {
  [btnTodos, btnAcessivel, btnSemAcessibilidade].forEach((btn) => {
    btn.classList.remove("ativo");
  });
  botaoAtivo.classList.add("ativo");
}

inputPesquisa.addEventListener("input", () => {
  const termo = inputPesquisa.value.toLowerCase();
  const filtrados = todosMercados.filter((m) =>
    m.nome.toLowerCase().includes(termo)
  );
  renderizarMercados(filtrados);
  atualizarFiltroAtivo(btnTodos);
});

btnTodos.addEventListener("click", () => {
  renderizarMercados(todosMercados);
  atualizarFiltroAtivo(btnTodos);
});

btnAcessivel.addEventListener("click", () => {
  renderizarMercados(
    todosMercados.filter((m) => m.acessibilidades?.length > 0)
  );
  atualizarFiltroAtivo(btnAcessivel);
});

btnSemAcessibilidade.addEventListener("click", () => {
  renderizarMercados(
    todosMercados.filter(
      (m) => !m.acessibilidades || m.acessibilidades.length === 0
    )
  );
  atualizarFiltroAtivo(btnSemAcessibilidade);
});

console.log("✅ Sistema de visualização de mercados carregado!");
