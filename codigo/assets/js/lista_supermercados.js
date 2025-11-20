const API_URL = "http://localhost:3000/mercados";

let mercados = [];
let mercadosFiltrados = [];
let filtroAtivo = "todos";

// Itens acessibilidade
const nomesRecursos = {
  rampa: "Rampa",
  elevador: "Elevador",
  vagas: "Vagas PCD",
  piso: "Piso tátil",
  braille: "Braille",
  preferencial: "Fila preferencial",
  libras: "Libras",
};

// GET para buscar supermercado
async function buscarMercados() {
  try {
    const response = await fetch(API_URL);
    mercados = await response.json();
    mercadosFiltrados = mercados;
    renderizarLista();
  } catch (error) {
    console.error("Erro ao buscar mercados:", error);
    document.getElementById("lista-supermercados").innerHTML = `
      <div class="mensagem-vazia">
        <div class="icone-vazio">⚠️</div>
        <p>Erro ao carregar supermercados</p>
      </div>
    `;
  }
}

// Verifica o status de acessiblidade
function verificarStatus(acessibilidade) {
  if (!acessibilidade) return "sem-info";

  let temSim = false;
  let temInfo = false;

  for (let item in acessibilidade) {
    if (acessibilidade[item] === true) temSim = true;
    if (acessibilidade[item] !== null) temInfo = true;
  }

  if (!temInfo) return "sem-info";
  if (temSim) return "com";
  return "sem";
}

// Recursos acessibilidade
function obterRecursosDisponiveis(acessibilidade) {
  if (!acessibilidade) return [];

  const recursos = [];
  for (let item in acessibilidade) {
    if (acessibilidade[item] === true) {
      recursos.push(nomesRecursos[item]);
    }
  }
  return recursos;
}

// Renderizar lista de supermercados
function renderizarLista() {
  const lista = document.getElementById("lista-supermercados");
  const contador = document.getElementById("contador-resultados");

  if (mercadosFiltrados.length === 0) {
    lista.innerHTML = `
      <div class="mensagem-vazia">
        <div class="icone-vazio">🏪</div>
        <p>Nenhum supermercado encontrado</p>
      </div>
    `;
    contador.textContent = "0 supermercados encontrados";
    return;
  }

  contador.textContent = `${mercadosFiltrados.length} supermercado${
    mercadosFiltrados.length !== 1 ? "s" : ""
  } encontrado${mercadosFiltrados.length !== 1 ? "s" : ""}`;

  lista.innerHTML = mercadosFiltrados
    .map((mercado) => {
      const status = verificarStatus(mercado.acessibilidade);
      const recursos = obterRecursosDisponiveis(mercado.acessibilidade);

      let badgeTexto = "";
      let badgeClasse = "";

      if (status === "com") {
        badgeTexto = "♿ Com Acessibilidade";
        badgeClasse = "com";
      } else if (status === "sem") {
        badgeTexto = "Sem Acessibilidade";
        badgeClasse = "sem";
      } else {
        badgeTexto = "Sem Informação";
        badgeClasse = "sem-info";
      }

      const recursosHTML =
        recursos.length > 0
          ? `
        <div class="recursos-acessibilidade">
          ${recursos
            .slice(0, 4)
            .map((r) => `<span class="tag-recurso disponivel">✓ ${r}</span>`)
            .join("")}
          ${
            recursos.length > 4
              ? `<span class="tag-recurso">+${recursos.length - 4}</span>`
              : ""
          }
        </div>
      `
          : "";

      return `
        <a href="acessibilidade.html?id=${mercado.id}" class="card-supermercado">
          <div class="cabecalho-card">
            <div class="info-principal">
              <div class="nome-supermercado">${mercado.nome}</div>
              <div class="endereco-supermercado">${mercado.endereco}</div>
              <span class="badge-acessibilidade ${badgeClasse}">${badgeTexto}</span>
            </div>
            <div class="icone-seta">›</div>
          </div>
          ${recursosHTML}
        </a>
      `;
    })
    .join("");
}

// Pesquisa
function buscarPorTexto(termo) {
  const termoLower = termo.toLowerCase().trim();

  if (termoLower === "") {
    mercadosFiltrados = mercados;
  } else {
    mercadosFiltrados = mercados.filter(
      (m) =>
        m.nome.toLowerCase().includes(termoLower) ||
        m.endereco.toLowerCase().includes(termoLower)
    );
  }

  aplicarFiltroAcessibilidade();
  renderizarLista();
}

// Filtro de acessibilidade
function aplicarFiltroAcessibilidade() {
  if (filtroAtivo === "todos") {
    return;
  }

  mercadosFiltrados = mercadosFiltrados.filter((m) => {
    const status = verificarStatus(m.acessibilidade);

    if (filtroAtivo === "com-acessibilidade") {
      return status === "com";
    } else if (filtroAtivo === "sem-acessibilidade") {
      return status === "sem" || status === "sem-info";
    }

    return true;
  });
}

function alterarFiltro(filtro) {
  filtroAtivo = filtro;

  document.querySelectorAll(".botao-filtro").forEach((btn) => {
    btn.classList.remove("ativo");
  });

  document.querySelector(`[data-filtro="${filtro}"]`).classList.add("ativo");

  const campoBusca = document.getElementById("campo-busca");
  buscarPorTexto(campoBusca.value);
}

document.addEventListener("DOMContentLoaded", () => {
  buscarMercados();

  const campoBusca = document.getElementById("campo-busca");
  campoBusca.addEventListener("input", (e) => {
    buscarPorTexto(e.target.value);
  });

  // Filtros
  document.querySelectorAll(".botao-filtro").forEach((btn) => {
    btn.addEventListener("click", () => {
      const filtro = btn.getAttribute("data-filtro");
      alterarFiltro(filtro);
    });
  });
});
