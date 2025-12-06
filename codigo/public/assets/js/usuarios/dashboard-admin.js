const API_URL = "http://localhost:3001";

let usuariosChart = null;
let comprasChart = null;
let produtosChart = null;

document.addEventListener("DOMContentLoaded", () => {
  verificarAdmin();
  carregarDashboardAdmin();
  configurarEventos();
  atualizarHorario();
});

function verificarAdmin() {
  const adminLogado = JSON.parse(localStorage.getItem("adminLogado"));
  if (!adminLogado) {
    window.location.href = "../usuarios/login-admin.html";
    return;
  }
}

async function carregarDashboardAdmin() {
  try {
    await Promise.all([
      carregarEstatisticasGlobais(),
      carregarGraficosAdmin(),
      carregarUsuariosRecentes(),
      carregarUltimasCompras(),
    ]);
  } catch (error) {
    console.error("Erro ao carregar dashboard admin:", error);
  }
}

async function carregarEstatisticasGlobais() {
  try {
    const [usuarios, listas, produtos, mercados, alertasConfig, alertas] =
      await Promise.all([
        fetch(`${API_URL}/usuarios`).then((r) => r.json()),
        fetch(`${API_URL}/listas-compras`).then((r) => r.json()),
        fetch(`${API_URL}/produtos`).then((r) => r.json()),
        fetch(`${API_URL}/mercados`).then((r) => r.json()),
        fetch(`${API_URL}/alertas-config`).then((r) => r.json()),
        fetch(`${API_URL}/alertas`).then((r) => r.json()),
      ]);

    const totalUsuarios = usuarios.length;
    const totalCompras = listas.length;
    const totalProdutos = produtos.length;
    const totalMercados = mercados.length;
    const totalAlertas = alertasConfig.filter((a) => a.ativo).length;
    const mesAtual = new Date().getMonth();
    const usuariosNovos = usuarios.filter((u) => {
      const dataCadastro = new Date(u.dataCadastro);
      return dataCadastro.getMonth() === mesAtual;
    }).length;

    const comprasMes = listas.filter((l) => {
      const dataLista = new Date(l.dataCriacao);
      return dataLista.getMonth() === mesAtual;
    }).length;

    const economiaGlobal = listas.reduce((total, lista) => {
      const valorItens =
        lista.produtos?.reduce(
          (acc, p) => acc + p.quantidade * p.valorUnitario,
          0
        ) || 0;
      const economia = Math.max(0, (lista.valorTotal || 0) - valorItens);
      return total + economia;
    }, 0);

    const produtosPendentes = produtos.filter((p) => !p.imagem).length;
    const mercadosAtivos = mercados.filter((m) => m.ativo !== false).length;
    const hoje = new Date().toDateString();
    const alertasHoje = alertas.filter((a) => {
      const dataAlerta = new Date(a.dataNotificacao);
      return dataAlerta.toDateString() === hoje;
    }).length;

    document.getElementById("totalUsuarios").textContent = totalUsuarios;
    document.getElementById("usuariosNovos").textContent = `+${usuariosNovos}`;
    document.getElementById("totalCompras").textContent = totalCompras;
    document.getElementById("comprasMes").textContent = comprasMes;
    document.getElementById("economiaGlobal").textContent = `R$ ${formatarPreco(
      economiaGlobal
    )}`;
    document.getElementById("totalProdutos").textContent = totalProdutos;
    document.getElementById("produtosPendentes").textContent =
      produtosPendentes;
    document.getElementById("totalMercados").textContent = totalMercados;
    document.getElementById("mercadosAtivos").textContent = mercadosAtivos;
    document.getElementById("totalAlertas").textContent = totalAlertas;
    document.getElementById("alertasDisparo").textContent = alertasHoje;
  } catch (error) {
    console.error("Erro ao carregar estatísticas:", error);
  }
}

async function carregarGraficosAdmin() {
  try {
    const [usuarios, listas, produtos] = await Promise.all([
      fetch(`${API_URL}/usuarios`).then((r) => r.json()),
      fetch(`${API_URL}/listas-compras`).then((r) => r.json()),
      fetch(`${API_URL}/produtos`).then((r) => r.json()),
    ]);

    criarGraficoUsuarios(usuarios);
    criarGraficoCompras(listas);
    criarGraficoProdutos(listas, produtos);
  } catch (error) {
    console.error("Erro ao carregar gráficos:", error);
  }
}

function criarGraficoUsuarios(usuarios) {
  const ctx = document.getElementById("usuariosChart");
  if (!ctx) return;

  const meses = [];
  const novos = [];

  for (let i = 5; i >= 0; i--) {
    const data = new Date();
    data.setMonth(data.getMonth() - i);
    const mes = data.toLocaleDateString("pt-BR", { month: "short" });
    meses.push(mes.charAt(0).toUpperCase() + mes.slice(1));

    const usuariosDoMes = usuarios.filter((u) => {
      const dataCadastro = new Date(u.dataCadastro);
      return (
        dataCadastro.getMonth() === data.getMonth() &&
        dataCadastro.getFullYear() === data.getFullYear()
      );
    });

    novos.push(usuariosDoMes.length);
  }

  if (usuariosChart) usuariosChart.destroy();

  usuariosChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: meses,
      datasets: [
        {
          label: "Novos Usuários",
          data: novos,
          backgroundColor: "rgba(220, 53, 69, 0.8)",
          borderColor: "#dc3545",
          borderWidth: 2,
          borderRadius: 8,
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
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          },
        },
      },
    },
  });
}

function criarGraficoCompras(listas) {
  const ctx = document.getElementById("comprasChart");
  if (!ctx) return;

  const meses = [];
  const valores = [];

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

    const valorTotal = listasDoMes.reduce(
      (acc, l) => acc + (l.valorTotal || 0),
      0
    );
    valores.push(valorTotal);
  }

  if (comprasChart) comprasChart.destroy();

  comprasChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: meses,
      datasets: [
        {
          label: "Volume (R$)",
          data: valores,
          borderColor: "#28a745",
          backgroundColor: "rgba(40, 167, 69, 0.1)",
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 5,
          pointBackgroundColor: "#28a745",
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

async function criarGraficoProdutos(listas, produtos) {
  const ctx = document.getElementById("produtosChart");
  if (!ctx) return;

  const contagemProdutos = {};

  listas.forEach((lista) => {
    lista.produtos?.forEach((item) => {
      if (!contagemProdutos[item.produtoId]) {
        contagemProdutos[item.produtoId] = 0;
      }
      contagemProdutos[item.produtoId]++;
    });
  });

  const top10 = Object.entries(contagemProdutos)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const labels = [];
  const dados = [];

  for (const [produtoId, count] of top10) {
    const produto = produtos.find((p) => p.id === parseInt(produtoId));
    labels.push(produto?.nome || "Produto desconhecido");
    dados.push(count);
  }

  if (produtosChart) produtosChart.destroy();

  produtosChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Quantidade de Compras",
          data: dados,
          backgroundColor: [
            "#0066cc",
            "#28a745",
            "#ffc107",
            "#dc3545",
            "#17a2b8",
            "#6f42c1",
            "#fd7e14",
            "#20c997",
            "#e83e8c",
            "#6610f2",
          ],
          borderWidth: 0,
          borderRadius: 8,
        },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          },
        },
      },
    },
  });
}

async function carregarUsuariosRecentes() {
  try {
    const usuarios = await fetch(`${API_URL}/usuarios`).then((r) => r.json());

    const recentes = usuarios
      .sort((a, b) => new Date(b.dataCadastro) - new Date(a.dataCadastro))
      .slice(0, 5);

    const tbody = document.getElementById("usuariosTableBody");
    tbody.innerHTML = "";

    if (recentes.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="text-center py-5">
            <i class="bi bi-inbox" style="font-size: 48px; color: #e0e0e0;"></i>
            <p class="mt-3 text-muted">Nenhum usuário cadastrado</p>
          </td>
        </tr>
      `;
      return;
    }

    recentes.forEach((usuario) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td data-label="Usuário">
          <strong>${usuario.nome}</strong>
        </td>
        <td data-label="Email">
          ${usuario.email}
        </td>
        <td data-label="Cadastro">
          ${formatarData(usuario.dataCadastro)}
        </td>
        <td data-label="Status">
          <span class="status-badge-active">Ativo</span>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error("Erro ao carregar usuários:", error);
  }
}

async function carregarUltimasCompras() {
  try {
    const listas = await fetch(`${API_URL}/listas-compras`).then((r) =>
      r.json()
    );
    const usuarios = await fetch(`${API_URL}/usuarios`).then((r) => r.json());

    const recentes = listas
      .sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao))
      .slice(0, 5);

    const tbody = document.getElementById("comprasTableBody");
    tbody.innerHTML = "";

    if (recentes.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="text-center py-5">
            <i class="bi bi-inbox" style="font-size: 48px; color: #e0e0e0;"></i>
            <p class="mt-3 text-muted">Nenhuma compra registrada</p>
          </td>
        </tr>
      `;
      return;
    }

    recentes.forEach((lista) => {
      const usuario = usuarios.find((u) => u.id === lista.usuarioId);

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td data-label="Usuário">
          ${usuario?.nome || "Desconhecido"}
        </td>
        <td data-label="Lista">
          <strong>${lista.nome || "Sem nome"}</strong>
        </td>
        <td data-label="Valor">
          <strong>R$ ${formatarPreco(lista.valorTotal || 0)}</strong>
        </td>
        <td data-label="Data">
          ${formatarData(lista.dataCriacao)}
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error("Erro ao carregar compras:", error);
  }
}

function configurarEventos() {
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("adminLogado");
    window.location.href = "../usuarios/login-admin.html";
  });

  document.getElementById("refreshBtn").addEventListener("click", () => {
    location.reload();
  });
}

function atualizarHorario() {
  const agora = new Date();
  const tempo = calcularTempo(agora);
  document.getElementById("lastUpdate").textContent = tempo;

  setInterval(() => {
    const novoTempo = calcularTempo(new Date());
    document.getElementById("lastUpdate").textContent = novoTempo;
  }, 60000);
}

function calcularTempo(data) {
  const agora = new Date();
  const diff = Math.floor((agora - data) / 1000); // segundos

  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

function formatarPreco(preco) {
  return preco.toFixed(2).replace(".", ",");
}

function formatarData(data) {
  return new Date(data).toLocaleDateString("pt-BR");
}
