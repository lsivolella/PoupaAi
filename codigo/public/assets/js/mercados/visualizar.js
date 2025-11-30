import { MercadoService } from "../../../services/mercado-service.js";

const service = new MercadoService();
const container = document.getElementById("cards-mercados");
const inputPesquisa = document.getElementById("pesquisa-mercado");
const btnTodos = document.getElementById("filtro-todos");
const btnAcessivel = document.getElementById("filtro-acessivel");
const btnSemAcessibilidade = document.getElementById("filtro-sem-acessibilidade");

let todosMercados = [];

// Função para carregar todos os mercados
async function carregarMercados() {
  try {
    todosMercados = await service.getMercados();
    renderizarMercados(todosMercados);
  } catch (err) {
    console.error("Erro ao carregar mercados:", err);
    container.innerHTML = `<div class="alert alert-danger text-center">Erro ao carregar os mercados.</div>`;
  }
}

// Função para renderizar os cards
function renderizarMercados(lista) {
  container.innerHTML = "";

  if (lista.length === 0) {
    container.innerHTML = `<div class="alert alert-warning text-center">Nenhum mercado encontrado.</div>`;
    return;
  }

  lista.forEach(m => {
    const card = document.createElement("div");
    card.classList.add("col-12");

    card.innerHTML = `
      <div class="card mb-3 d-flex flex-row align-items-center">
        <img src="${m.logo}" class="img-fluid rounded-start" alt="${m.nome}" style="width: 200px; object-fit: cover;">
        <div class="card-body flex-grow-1">
          <h5 class="card-title">${m.nome}</h5>
          <p class="card-text mb-1"><b>Endereço:</b> ${m.endereco?.rua}, ${m.endereco?.numero} - ${m.endereco?.bairro}, ${m.endereco?.cidade} - ${m.endereco?.estado}, ${m.endereco?.pais}</p>
          <p class="card-text mb-1"><b>Telefone:</b> ${m.telefone}</p>
          <p class="card-text mb-1"><b>Média Avaliações:</b> ${m.mediaAvaliacoes ?? "-"}</p>
          <p class="card-text mb-1"><b>Funcionamento:</b> ${m.horarioFuncionamento}</p>
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

// Função para adicionar eventos aos botões de detalhe e mapa
function adicionarEventos() {
  document.querySelectorAll(".btn-detalhes").forEach(btn => {
    btn.addEventListener("click", () => {
      sessionStorage.setItem("mercadoId", btn.dataset.id);
      window.location.href = "detalhes.html";
    });
  });

  document.querySelectorAll(".btn-mapa").forEach(btn => {
    btn.addEventListener("click", () => {
      sessionStorage.setItem("mercadoId", btn.dataset.id);
      window.location.href = "mapa.html";
    });
  });
}

// Função para atualizar a classe "ativo" nos filtros
function atualizarFiltroAtivo(botaoAtivo) {
  [btnTodos, btnAcessivel, btnSemAcessibilidade].forEach(btn => {
    btn.classList.remove("ativo");
  });
  botaoAtivo.classList.add("ativo");
}

// Filtros e pesquisa
inputPesquisa.addEventListener("input", () => {
  const termo = inputPesquisa.value.toLowerCase();
  const filtrados = todosMercados.filter(m => m.nome.toLowerCase().includes(termo));
  renderizarMercados(filtrados);
  atualizarFiltroAtivo(btnTodos); // reseta para "Todos"
});

btnTodos.addEventListener("click", () => {
  renderizarMercados(todosMercados);
  atualizarFiltroAtivo(btnTodos);
});

btnAcessivel.addEventListener("click", () => {
  renderizarMercados(todosMercados.filter(m => m.acessibilidades?.length > 0));
  atualizarFiltroAtivo(btnAcessivel);
});

btnSemAcessibilidade.addEventListener("click", () => {
  renderizarMercados(todosMercados.filter(m => !m.acessibilidades || m.acessibilidades.length === 0));
  atualizarFiltroAtivo(btnSemAcessibilidade);
});

carregarMercados();
