const API_URL = "http://localhost:3001";

let economiaChart = null;
let mercadosChart = null;

document.addEventListener("DOMContentLoaded", () => {
  carregarDashboard();
  configurarEventos();
});

async function carregarDashboard() {
  try {
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (!usuarioLogado) {
      window.location.href = "../usuarios/login.html";
      return;
    }

    await Promise.all([
      carregarEstatisticas(usuarioLogado.id),
      carregarGraficos(usuarioLogado.id),
      carregarListasRecentes(usuarioLogado.id),
      carregarProdutosMaisComprados(usuarioLogado.id),
    ]);
  } catch (error) {
    console.error("Erro ao carregar dashboard:", error);
    mostrarErro("Erro ao carregar dashboard.");
  }
}

async function carregarEstatisticas(usuarioId) {
  try {
    const listas = await fetch(
      `${API_URL}/listas-compras?usuarioId=${usuarioId}`
    ).then((r) => r.json());
    const alertasConfig = await fetch(
      `${API_URL}/alertas-config?usuarioId=${usuarioId}`
    ).then((r) => r.json());
    const alertasNovos = await fetch(
      `${API_URL}/alertas?usuarioId=${usuarioId}&lido=false`
    ).then((r) => r.json());
    const economiaTotal = calcularEconomiaTotal(listas);
    const listasAtivas = listas.filter((l) => l.status === "ativa").length;
    const totalItens = listas.reduce(
      (acc, l) => acc + (l.produtos?.length || 0),
      0
    );
    const alertasAtivosCount = alertasConfig.filter((a) => a.ativo).length;
    const mesAtual = new Date().getMonth();
    const listasEsteMes = listas.filter((l) => {
      const dataLista = new Date(l.dataCriacao);
      return dataLista.getMonth() === mesAtual;
    });
    const comprasMes = listasEsteMes.reduce(
      (acc, l) => acc + (l.valorTotal || 0),
      0
    );

    document.getElementById("economiaTotal").textContent = `R$ ${formatarPreco(
      economiaTotal
    )}`;
    document.getElementById("economiaVariacao").textContent = "+12,5%"; // Mock
    document.getElementById("listasAtivas").textContent = listasAtivas;
    document.getElementById("totalItens").textContent = totalItens;
    document.getElementById("alertasAtivos").textContent = alertasAtivosCount;
    document.getElementById("alertasNovos").textContent = alertasNovos.length;
    document.getElementById("comprasMes").textContent = `R$ ${formatarPreco(
      comprasMes
    )}`;
    document.getElementById("totalCompras").textContent = listasEsteMes.length;
  } catch (error) {
    console.error("Erro ao carregar estatísticas:", error);
  }
}

function calcularEconomiaTotal(listas) {
  return listas.reduce((total, lista) => {
    const valorItens =
      lista.produtos?.reduce(
        (acc, p) => acc + p.quantidade * p.valorUnitario,
        0
      ) || 0;
    const economia = Math.max(0, (lista.valorTotal || 0) - valorItens);
    return total + economia;
  }, 0);
}

async function carregarGraficos(usuarioId) {
  try {
    const listas = await fetch(
      `${API_URL}/listas-compras?usuarioId=${usuarioId}`
    ).then((r) => r.json());

    criarGraficoEconomia(listas);
    criarGraficoMercados(listas);
  } catch (error) {
    console.error("Erro ao carregar gráficos:", error);
  }
}

function criarGraficoEconomia(listas) {
  const ctx = document.getElementById("economiaChart");
  if (!ctx) return;
  const meses = [];
  const economias = [];

  for (let i = 5; i >= 0; i--) {
    const data = new Date();
    data.setMonth(data.getMonth() - i);
    const mes = data.toLocaleDateString("pt-BR", { month: "short" });
    meses.push(mes.charAt(0).toUpperCase() + mes.slice(1));

    const listasDoMes = listas.filter((l) => {
      const dataLista = new Date(l.dataCriacao);
      return (
        dataLista.getMonth() === data.getMonth() &&
        dataLista.getFullYear() === data.getFullYear()
      );
    });

    const economia = calcularEconomiaTotal(listasDoMes);
    economias.push(economia);
  }

  if (economiaChart) economiaChart.destroy();

  economiaChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: meses,
      datasets: [
        {
          label: "Economia (R$)",
          data: economias,
          borderColor: "#0066cc",
          backgroundColor: "rgba(0, 102, 204, 0.1)",
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: "#0066cc",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return "R$ " + context.parsed.y.toFixed(2).replace(".", ",");
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return "R$ " + value.toFixed(0);
            },
          },
        },
      },
    },
  });
}

async function criarGraficoMercados(listas) {
  const ctx = document.getElementById("mercadosChart");
  if (!ctx) return;

  try {
    const mercados = await fetch(`${API_URL}/mercados`).then((r) => r.json());

    const gastosPorMercado = {};
    mercados.forEach((m) => {
      gastosPorMercado[m.id] = { nome: m.nome, total: 0 };
    });

    listas.forEach((lista) => {
      if (lista.mercadoId && gastosPorMercado[lista.mercadoId]) {
        gastosPorMercado[lista.mercadoId].total += lista.valorTotal || 0;
      }
    });

    const top5 = Object.values(gastosPorMercado)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .filter((m) => m.total > 0);

    if (top5.length === 0) {
      ctx.parentElement.innerHTML = `
        <div class="text-center py-5">
          <i class="bi bi-pie-chart" style="font-size: 48px; color: #e0e0e0;"></i>
          <p class="mt-3 text-muted">Nenhuma compra registrada ainda</p>
        </div>
      `;
      return;
    }

    const labels = top5.map((m) => m.nome);
    const dados = top5.map((m) => m.total);
    const cores = ["#0066cc", "#28a745", "#ffc107", "#dc3545", "#17a2b8"];

    if (mercadosChart) mercadosChart.destroy();

    mercadosChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            data: dados,
            backgroundColor: cores.slice(0, top5.length),
            borderWidth: 3,
            borderColor: "#fff",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              padding: 15,
              font: {
                size: 12,
              },
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || "";
                const value =
                  "R$ " + context.parsed.toFixed(2).replace(".", ",");
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percent = ((context.parsed / total) * 100).toFixed(1);
                return `${label}: ${value} (${percent}%)`;
              },
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("Erro ao criar gráfico de mercados:", error);
  }
}
async function carregarListasRecentes(usuarioId) {
  try {
    const listas = await fetch(
      `${API_URL}/listas-compras?usuarioId=${usuarioId}`
    ).then((r) => r.json());
    const listasRecentes = listas
      .sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao))
      .slice(0, 5);

    const tbody = document.getElementById("listasTableBody");
    tbody.innerHTML = "";

    if (listasRecentes.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-5">
            <i class="bi bi-inbox" style="font-size: 48px; color: #e0e0e0;"></i>
            <p class="mt-3 text-muted">Nenhuma lista criada ainda</p>
          </td>
        </tr>
      `;
      return;
    }

    listasRecentes.forEach((lista) => {
      const totalItens =
        lista.produtos?.reduce(
          (acc, p) => acc + p.quantidade * p.valorUnitario,
          0
        ) || 0;
      const economia = Math.max(0, (lista.valorTotal || 0) - totalItens);

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td data-label="Nome">
          <strong>${lista.nome || "Lista sem nome"}</strong>
        </td>
        <td data-label="Itens">
          ${lista.produtos?.length || 0} itens
        </td>
        <td data-label="Valor Total">
          <strong>R$ ${formatarPreco(lista.valorTotal || 0)}</strong>
        </td>
        <td data-label="Economia">
          <span class="text-success">
            <i class="bi bi-arrow-down"></i>
            R$ ${formatarPreco(economia)}
          </span>
        </td>
        <td data-label="Data">
          ${formatarData(lista.dataCriacao)}
        </td>
        <td data-label="Ação" class="text-center">
          <a href="../listas/visualizar.html?id=${
            lista.id
          }" class="btn-action btn-view">
            <i class="bi bi-eye"></i>
          </a>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error("Erro ao carregar listas:", error);
  }
}

async function carregarProdutosMaisComprados(usuarioId) {
  try {
    const listas = await fetch(
      `${API_URL}/listas-compras?usuarioId=${usuarioId}`
    ).then((r) => r.json());
    const contagemProdutos = {};

    listas.forEach((lista) => {
      lista.produtos?.forEach((item) => {
        if (!contagemProdutos[item.produtoId]) {
          contagemProdutos[item.produtoId] = {
            id: item.produtoId,
            quantidade: 0,
          };
        }
        contagemProdutos[item.produtoId].quantidade++;
      });
    });

    const top8 = Object.values(contagemProdutos)
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 8);

    const grid = document.getElementById("productsGrid");
    grid.innerHTML = "";

    if (top8.length === 0) {
      grid.innerHTML = `
        <div class="products-empty">
          <i class="bi bi-box-seam"></i>
          <h3>Nenhum produto comprado</h3>
          <p>Comece criando uma lista de compras!</p>
        </div>
      `;
      return;
    }

    for (const item of top8) {
      const produto = await fetch(`${API_URL}/produtos/${item.id}`).then((r) =>
        r.json()
      );
      const card = document.createElement("div");
      card.className = "product-card";
      card.onclick = () =>
        (window.location.href = `../produtos/detalhes.html?id=${produto.id}`);

      card.innerHTML = `
        <span class="product-badge">${item.quantidade}</span>
        <img src="${
          produto.imagem || "https://via.placeholder.com/150"
        }" alt="${produto.nome}" class="product-img">
        <h4 class="product-name">${produto.nome}</h4>
        <p class="product-price">R$ ${formatarPreco(produto.preco || 0)}</p>
        <p class="product-count">
          Comprado <span>${item.quantidade}x</span>
        </p>
      `;

      grid.appendChild(card);
    }
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
  }
}

function configurarEventos() {
  document.getElementById("refreshBtn").addEventListener("click", () => {
    location.reload();
  });

  document.getElementById("economiaFilter").addEventListener("change", (e) => {
    console.log("Filtro:", e.target.value);
  });
}

function formatarPreco(preco) {
  return preco.toFixed(2).replace(".", ",");
}

function formatarData(data) {
  return new Date(data).toLocaleDateString("pt-BR");
}

function mostrarErro(mensagem) {
  alert(mensagem);
}
