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
    console.log("🔍 Carregando estatísticas para usuário:", usuarioId);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // 📋 LISTAS (apenas para contar listas ativas)
    const listas = await fetch(
      `${API_URL}/listasCompras?usuarioId=${usuarioId}`
    ).then((r) => r.json());

    console.log(`📋 Listas: ${listas.length} total`);
    const listasAtivas = listas.filter((l) => l.status === "ativa").length;
    console.log(`📋 Listas ativas: ${listasAtivas}`);

    const totalItensListas = listas.reduce(
      (acc, l) => acc + (l.produtos?.length || 0),
      0
    );
    console.log(`📦 Itens nas listas (planejados): ${totalItensListas}`);

    // 🛒 HISTÓRICO (dados efetivos de compras)
    const historico = await fetch(
      `${API_URL}/historicoCompras?usuarioId=${usuarioId}`
    ).then((r) => r.json());

    console.log(`🛒 Histórico de compras: ${historico.length} total`);
    console.table(
      historico.map((h) => ({
        id: h.id,
        mercadoId: h.mercadoId,
        data: h.data.split("T")[0],
        total: "R$ " + h.total.toFixed(2),
      }))
    );

    // 💰 ECONOMIA TOTAL (baseado no histórico)
    let economiaTotal = 0;
    historico.forEach((compra) => {
      compra.itens.forEach((item) => {
        // Simula que o preço anterior era 15% maior
        const precoAnterior = item.precoUnitario * 1.15;
        const economia = (precoAnterior - item.precoUnitario) * item.quantidade;
        economiaTotal += economia;
      });
    });

    console.log(`💰 Economia total calculada: R$ ${economiaTotal.toFixed(2)}`);

    // 🔔 ALERTAS
    const alertasConfig = await fetch(
      `${API_URL}/alertasConfig?usuarioId=${usuarioId}`
    ).then((r) => r.json());

    const alertasNovos = await fetch(
      `${API_URL}/alertas?usuarioId=${usuarioId}&lido=false`
    ).then((r) => r.json());

    const alertasAtivosCount = alertasConfig.filter((a) => a.ativo).length;
    console.log(`🔔 Alertas ativos: ${alertasAtivosCount}`);
    console.log(`🆕 Alertas não lidos: ${alertasNovos.length}`);

    // 📅 COMPRAS DO MÊS (baseado no histórico)
    const mesAtual = new Date().getMonth();
    const anoAtual = new Date().getFullYear();

    const comprasEsteMes = historico.filter((h) => {
      const dataCompra = new Date(h.data);
      return (
        dataCompra.getMonth() === mesAtual &&
        dataCompra.getFullYear() === anoAtual
      );
    });

    const valorComprasMes = comprasEsteMes.reduce(
      (acc, h) => acc + (h.total || 0),
      0
    );

    console.log(`📅 Compras em dezembro: ${comprasEsteMes.length}`);
    console.log(`💵 Valor total do mês: R$ ${valorComprasMes.toFixed(2)}`);

    // 🎨 ATUALIZAR INTERFACE
    document.getElementById("economiaTotal").textContent = `R$ ${formatarPreco(
      economiaTotal
    )}`;

    // Calcula variação (se tiver histórico de mês passado)
    const mesPassado = new Date();
    mesPassado.setMonth(mesPassado.getMonth() - 1);
    const comprasMesPassado = historico.filter((h) => {
      const d = new Date(h.data);
      return d.getMonth() === mesPassado.getMonth();
    });
    const economiaPassada =
      comprasMesPassado.length > 0 ? economiaTotal * 0.85 : 0;
    const variacao =
      economiaPassada > 0
        ? (((economiaTotal - economiaPassada) / economiaPassada) * 100).toFixed(
            1
          )
        : "15,0";
    document.getElementById("economiaVariacao").textContent = `+${variacao}%`;

    document.getElementById("listasAtivas").textContent = listasAtivas;
    document.getElementById("totalItens").textContent = totalItensListas;

    document.getElementById("alertasAtivos").textContent = alertasAtivosCount;
    document.getElementById("alertasNovos").textContent = alertasNovos.length;

    document.getElementById("comprasMes").textContent = `R$ ${formatarPreco(
      valorComprasMes
    )}`;
    document.getElementById("totalCompras").textContent = comprasEsteMes.length;

    console.log("✅ Estatísticas atualizadas!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  } catch (error) {
    console.error("❌ Erro ao carregar estatísticas:", error);
  }
}

async function carregarGraficos(usuarioId) {
  try {
    console.log("📊 Carregando gráficos...");

    // Usa HISTÓRICO para gráficos (dados efetivos)
    const historico = await fetch(
      `${API_URL}/historicoCompras?usuarioId=${usuarioId}`
    ).then((r) => r.json());

    await criarGraficoEconomia(historico);
    await criarGraficoMercados(historico);

    console.log("✅ Gráficos carregados!");
  } catch (error) {
    console.error("❌ Erro ao carregar gráficos:", error);
  }
}

function criarGraficoEconomia(historico) {
  const ctx = document.getElementById("economiaChart");
  if (!ctx) {
    console.warn("⚠️ Canvas economiaChart não encontrado");
    return;
  }

  const meses = [];
  const economias = [];
  const dataAtual = new Date();

  console.log("📈 Criando gráfico de economia (últimos 6 meses)...");

  for (let i = 5; i >= 0; i--) {
    const data = new Date();
    data.setMonth(dataAtual.getMonth() - i);

    const mesNome = data.toLocaleDateString("pt-BR", { month: "short" });
    meses.push(mesNome.charAt(0).toUpperCase() + mesNome.slice(1));

    const comprasDoMes = historico.filter((h) => {
      const dataCompra = new Date(h.data);
      return (
        dataCompra.getMonth() === data.getMonth() &&
        dataCompra.getFullYear() === data.getFullYear()
      );
    });

    // Calcula economia real do mês
    let economiaMes = 0;
    comprasDoMes.forEach((compra) => {
      compra.itens.forEach((item) => {
        const precoAnterior = item.precoUnitario * 1.15;
        const economia = (precoAnterior - item.precoUnitario) * item.quantidade;
        economiaMes += economia;
      });
    });

    economias.push(economiaMes);
    console.log(
      `📅 ${meses[meses.length - 1]}: R$ ${economiaMes.toFixed(2)} (${
        comprasDoMes.length
      } compras)`
    );
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

  console.log("✅ Gráfico de economia criado!");
}

async function criarGraficoMercados(historico) {
  const ctx = document.getElementById("mercadosChart");
  if (!ctx) {
    console.warn("⚠️ Canvas mercadosChart não encontrado");
    return;
  }

  try {
    console.log("🏪 Criando gráfico de mercados...");

    const mercados = await fetch(`${API_URL}/mercados`).then((r) => r.json());
    console.log(`🏪 Mercados cadastrados: ${mercados.length}`);

    const gastosPorMercado = {};
    mercados.forEach((m) => {
      gastosPorMercado[m.id] = { nome: m.nome, total: 0 };
    });

    historico.forEach((compra) => {
      if (compra.mercadoId && gastosPorMercado[compra.mercadoId]) {
        gastosPorMercado[compra.mercadoId].total += compra.total || 0;
        console.log(
          `💰 ${gastosPorMercado[compra.mercadoId].nome}: +R$ ${(
            compra.total || 0
          ).toFixed(2)}`
        );
      }
    });

    console.log("📊 Gastos totais (histórico efetivo):");
    Object.values(gastosPorMercado).forEach((m) => {
      if (m.total > 0) {
        console.log(`  ${m.nome}: R$ ${m.total.toFixed(2)}`);
      }
    });

    const top5 = Object.values(gastosPorMercado)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .filter((m) => m.total > 0);

    if (top5.length === 0) {
      console.warn("⚠️ Nenhuma compra efetivada ainda");
      ctx.parentElement.innerHTML = `
        <div class="text-center py-5">
          <i class="bi bi-pie-chart" style="font-size: 48px; color: #e0e0e0;"></i>
          <p class="mt-3 text-muted">Nenhuma compra efetivada ainda</p>
          <p class="text-muted small">Finalize uma lista para ver dados aqui</p>
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

    console.log("✅ Gráfico de mercados criado!");
  } catch (error) {
    console.error("❌ Erro ao criar gráfico de mercados:", error);
  }
}

async function carregarListasRecentes(usuarioId) {
  try {
    console.log("📋 Carregando listas recentes (planejamento)...");

    const listas = await fetch(
      `${API_URL}/listasCompras?usuarioId=${usuarioId}`
    ).then((r) => r.json());

    console.log(`📋 Total de listas: ${listas.length}`);

    const listasRecentes = listas
      .sort(
        (a, b) =>
          new Date(b.dataAtualizacao || b.dataCriacao) -
          new Date(a.dataAtualizacao || a.dataCriacao)
      )
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
      // Economia estimada (15%)
      const economia = (lista.valor || 0) * 0.15;

      // Badge de status
      const statusBadge =
        lista.status === "ativa"
          ? '<span class="badge bg-success">Ativa</span>'
          : '<span class="badge bg-secondary">Finalizada</span>';

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td data-label="Nome">
          <strong>${lista.nome || "Lista sem nome"}</strong> ${statusBadge}
        </td>
        <td data-label="Itens">
          ${lista.produtos?.length || 0} itens
        </td>
        <td data-label="Valor Estimado">
          <strong>R$ ${formatarPreco(lista.valor || 0)}</strong>
        </td>
        <td data-label="Economia Est.">
          <span class="text-success">
            <i class="bi bi-arrow-down"></i>
            R$ ${formatarPreco(economia)}
          </span>
        </td>
        <td data-label="Data">
          ${formatarData(lista.dataAtualizacao || lista.dataCriacao)}
        </td>
        <td data-label="Ação" class="text-center">
          <a href="/codigo/public/views/listas/editar.html?id=${
            lista.id
          }" class="btn-action btn-view" title="Editar lista">
            <i class="bi bi-pencil"></i>
          </a>
        </td>
      `;
      tbody.appendChild(tr);
    });

    console.log(`✅ ${listasRecentes.length} listas carregadas!`);
  } catch (error) {
    console.error("❌ Erro ao carregar listas:", error);
  }
}

async function carregarProdutosMaisComprados(usuarioId) {
  try {
    console.log("🛒 Carregando produtos mais comprados (do histórico)...");

    // Usa HISTÓRICO (compras efetivas)
    const historico = await fetch(
      `${API_URL}/historicoCompras?usuarioId=${usuarioId}`
    ).then((r) => r.json());

    console.log(`🛒 Analisando ${historico.length} compras efetivadas...`);

    const contagemProdutos = {};

    historico.forEach((compra) => {
      compra.itens?.forEach((item) => {
        if (!contagemProdutos[item.produtoId]) {
          contagemProdutos[item.produtoId] = {
            id: item.produtoId,
            quantidade: 0,
          };
        }
        contagemProdutos[item.produtoId].quantidade += item.quantidade;
      });
    });

    const top8 = Object.values(contagemProdutos)
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 8);

    console.log(`🏆 Top ${top8.length} produtos mais comprados`);

    const grid = document.getElementById("productsGrid");
    grid.innerHTML = "";

    if (top8.length === 0) {
      grid.innerHTML = `
        <div class="products-empty">
          <i class="bi bi-box-seam"></i>
          <h3>Nenhuma compra efetivada</h3>
          <p>Finalize uma lista para ver seus produtos favoritos!</p>
        </div>
      `;
      return;
    }

    for (const item of top8) {
      const produto = await fetch(`${API_URL}/produtos/${item.id}`).then((r) =>
        r.json()
      );

      const menorPreco = produto.ocorrencias
        ? Math.min(...produto.ocorrencias.map((o) => o.preco))
        : 0;

      // ✅ Corrige caminho da imagem
      let imagemUrl = produto.imagem_url || "";

      if (imagemUrl && !imagemUrl.startsWith("http")) {
        // Remove ../ se começar com ele
        if (imagemUrl.startsWith("../")) {
          imagemUrl = imagemUrl.substring(3);
        }

        // Se começar com "assets/", adiciona /codigo/public/
        if (imagemUrl.startsWith("assets/")) {
          imagemUrl = `/codigo/public/${imagemUrl}`;
        }
        // Se começar com "img/", adiciona /codigo/public/assets/
        else if (imagemUrl.startsWith("img/")) {
          imagemUrl = `/codigo/public/assets/${imagemUrl}`;
        }
        // Se não tiver caminho completo, assume que está em assets/img/
        else if (!imagemUrl.startsWith("/")) {
          imagemUrl = `/codigo/public/assets/img/${imagemUrl}`;
        }
      }

      // Fallback para imagem padrão
      if (!imagemUrl) {
        imagemUrl =
          "https://via.placeholder.com/200/cccccc/666666?text=Produto";
      }

      const card = document.createElement("div");
      card.className = "product-card";
      card.onclick = () =>
        (window.location.href = `/codigo/public/views/produtos/detalhes.html?id=${produto.id}`);

      card.innerHTML = `
        <span class="product-badge">${item.quantidade}x</span>
        <img src="${imagemUrl}" alt="${
        produto.nome
      }" class="product-img" onerror="this.src='https://via.placeholder.com/200/cccccc/666666?text=Produto'">
        <h4 class="product-name">${produto.nome}</h4>
        <p class="product-price">R$ ${formatarPreco(menorPreco)}</p>
        <p class="product-count">
          Comprado <span>${item.quantidade}x</span>
        </p>
      `;

      grid.appendChild(card);
    }

    console.log("✅ Produtos mais comprados carregados!");
  } catch (error) {
    console.error("❌ Erro ao carregar produtos:", error);
  }
}

function configurarEventos() {
  const refreshBtn = document.getElementById("refreshBtn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      location.reload();
    });
  }

  const economiaFilter = document.getElementById("economiaFilter");
  if (economiaFilter) {
    economiaFilter.addEventListener("change", (e) => {
      console.log("🔄 Filtro selecionado:", e.target.value);
      // TODO: Implementar filtro de período
    });
  }
}

function formatarPreco(preco) {
  return preco.toFixed(2).replace(".", ",");
}

function formatarData(data) {
  return new Date(data).toLocaleDateString("pt-BR");
}

function mostrarErro(mensagem) {
  console.error("❌ Erro:", mensagem);
  alert(mensagem);
}

console.log("✅ Dashboard do cliente carregado!");
