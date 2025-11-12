const API_URL = "http://localhost:3000/supermercados";

//Supermercado Super Nosso pré-definido (adaptar depois para linkar com mapa)
let supermercadoId = 1;

// Dados (começa vazio/null ou localStorage)
let meusVotos =
  JSON.parse(localStorage.getItem(`meusVotos_${supermercadoId}`)) || {};

// Itens acessibilidade
const nomes = {
  rampa: "Rampa de acesso",
  elevador: "Elevador",
  vagas: "Vagas PCD",
  piso: "Piso tátil",
  braille: "Sinalização braille",
  preferencial: "Atendimento preferencial",
  libras: "Funcionário de libras",
};

// GET para buscar supermercado
async function buscarSupermercado(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    const supermercado = await response.json();
    return supermercado;
  } catch (error) {
    console.error("Erro ao buscar supermercado:", error);
    return null;
  }
}

// PUT para atualizar supermercado
async function atualizarSupermercado(id, dados) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados),
    });
    const supermercadoAtualizado = await response.json();
    return supermercadoAtualizado;
  } catch (error) {
    console.error("Erro ao atualizar supermercado:", error);
    return null;
  }
}

// Verifica o status de acessiblidade
function verificarStatus(acessibilidade) {
  let temSim = false;
  let temInfo = false;

  for (let item in acessibilidade) {
    if (acessibilidade[item] === true) temSim = true;
    if (acessibilidade[item] !== null) temInfo = true;
  }

  if (!temInfo) return { texto: "Sem informação", classe: "sem-info" };
  if (temSim)
    return { texto: "Com acessibilidade", classe: "com-acessibilidade" };
  return { texto: "Sem acessibilidade", classe: "sem-acessibilidade" };
}

// função para data
function formatarData(dataISO) {
  if (!dataISO) return null;
  const data = new Date(dataISO);
  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const ano = data.getFullYear();
  const hora = String(data.getHours()).padStart(2, "0");
  const min = String(data.getMinutes()).padStart(2, "0");
  return `${dia}/${mes}/${ano} às ${hora}:${min}`;
}

// função para a parte de votação
async function votar(item, tipo) {
  const supermercado = await buscarSupermercado(supermercadoId);
  if (!supermercado) return;
  if (meusVotos[item] === tipo) {
    if (tipo === "like") {
      supermercado.votos[item].likes--;
    } else {
      supermercado.votos[item].dislikes--;
    }
    meusVotos[item] = null;
  } else {
    if (meusVotos[item] === "like") {
      supermercado.votos[item].likes--;
    } else if (meusVotos[item] === "dislike") {
      supermercado.votos[item].dislikes--;
    }
    if (tipo === "like") {
      supermercado.votos[item].likes++;
    } else {
      supermercado.votos[item].dislikes++;
    }
    meusVotos[item] = tipo;
  }

  await atualizarSupermercado(supermercadoId, supermercado);

  localStorage.setItem(
    `meusVotos_${supermercadoId}`,
    JSON.stringify(meusVotos)
  );

  mostrarDados();
}

// Mostra na tela os itens de acessiblidade
async function mostrarDados() {
  const supermercado = await buscarSupermercado(supermercadoId);
  if (!supermercado) {
    alert("Supermercado não encontrado!");
    return;
  }

  const lista = document.getElementById("lista-acessibilidade");
  const titulo = document.getElementById("titulo-card");
  const textoStatus = document.getElementById("status-acessibilidade");
  const elementoData = document.getElementById("data-atualizacao");
  const nomeLoja = document.querySelector(".nome-loja");

  if (!lista) return;

  // Atualiza nome do supermercado
  if (nomeLoja) nomeLoja.textContent = supermercado.nome;

  lista.innerHTML = "";

  // Atualiza status
  const status = verificarStatus(supermercado.acessibilidade);
  textoStatus.textContent = status.texto;
  titulo.className = `titulo-card ${status.classe}`;

  // Mostra data de atualização
  if (elementoData && supermercado.dataAtualizacao) {
    elementoData.textContent = `Última atualização: ${formatarData(
      supermercado.dataAtualizacao
    )}`;
    elementoData.style.display = "block";
  } else if (elementoData) {
    elementoData.style.display = "none";
  }

  // Mostra comentários
  const cardComentarios = document.getElementById("card-comentarios");
  const mostrarComentarios = document.getElementById("mostrar-comentarios");
  if (cardComentarios && supermercado.comentarios.trim() !== "") {
    cardComentarios.style.display = "block";
    mostrarComentarios.textContent = supermercado.comentarios;
  } else if (cardComentarios) {
    cardComentarios.style.display = "none";
  }

  // Cria lista dos itens de acessibilidade
  for (let item in supermercado.acessibilidade) {
    const li = document.createElement("li");
    li.className = "item-acessibilidade";

    const divInfo = document.createElement("div");
    divInfo.className = "info-item";

    const nome = document.createElement("span");
    nome.className = "nome-item-lista";
    nome.textContent = nomes[item] + ":";

    const valor = document.createElement("span");

    if (supermercado.acessibilidade[item] === null) {
      valor.className = "valor-item vazio";
      valor.textContent = "Sem informação";
    } else if (supermercado.acessibilidade[item] === true) {
      valor.className = "valor-item sim";
      valor.textContent = "Sim";
    } else {
      valor.className = "valor-item nao";
      valor.textContent = "Não";
    }

    divInfo.appendChild(nome);
    divInfo.appendChild(valor);
    li.appendChild(divInfo);

    // adiciona os botões para votação caso haja informação anterior salva
    if (supermercado.acessibilidade[item] !== null) {
      const divVotacao = document.createElement("div");
      divVotacao.className = "botoes-votacao";

      const btnLike = document.createElement("button");
      btnLike.className = "botao-voto";
      if (meusVotos[item] === "like") btnLike.classList.add("votado");
      btnLike.innerHTML = `👍 ${supermercado.votos[item].likes}`;
      btnLike.onclick = () => votar(item, "like");

      const btnDislike = document.createElement("button");
      btnDislike.className = "botao-voto";
      if (meusVotos[item] === "dislike")
        btnDislike.classList.add("votado-dislike");
      btnDislike.innerHTML = `👎 ${supermercado.votos[item].dislikes}`;
      btnDislike.onclick = () => votar(item, "dislike");

      divVotacao.appendChild(btnLike);
      divVotacao.appendChild(btnDislike);
      li.appendChild(divVotacao);
    }

    lista.appendChild(li);
  }
}

// dados ao editar
async function carregarModoEdicao() {
  const supermercado = await buscarSupermercado(supermercadoId);
  if (!supermercado) return;

  const campoComentarios = document.getElementById("comentarios");
  if (campoComentarios) {
    campoComentarios.value = supermercado.comentarios;
  }

  document.querySelectorAll(".botao-opcao").forEach((botao) => {
    const campo = botao.getAttribute("data-campo");
    const valorBtn = botao.getAttribute("data-valor");
    let valorReal;

    if (valorBtn === "null") valorReal = null;
    else valorReal = valorBtn === "true";

    if (supermercado.acessibilidade[campo] === valorReal) {
      botao.classList.add("ativo");
    }
  });
}

// Opção selecionada
function marcarOpcao(campo, valor) {
  document.querySelectorAll(".botao-opcao").forEach((botao) => {
    const campoBtn = botao.getAttribute("data-campo");
    const valorBtn = botao.getAttribute("data-valor");
    let valorReal;

    if (valorBtn === "null") valorReal = null;
    else valorReal = valorBtn === "true";

    if (campoBtn === campo) {
      if (valorReal === valor) {
        botao.classList.add("ativo");
      } else {
        botao.classList.remove("ativo");
      }
    }
  });
}

// Botão Salvar
async function salvarAlteracoes() {
  const supermercado = await buscarSupermercado(supermercadoId);
  if (!supermercado) return;

  // Atualiza acessibilidade
  const botoesAtivos = document.querySelectorAll(".botao-opcao.ativo");
  botoesAtivos.forEach((botao) => {
    const campo = botao.getAttribute("data-campo");
    const valorBtn = botao.getAttribute("data-valor");
    let valor;

    if (valorBtn === "null") valor = null;
    else valor = valorBtn === "true";

    supermercado.acessibilidade[campo] = valor;
  });

  // Atualiza comentários
  const campoComentarios = document.getElementById("comentarios");
  if (campoComentarios) {
    supermercado.comentarios = campoComentarios.value;
  }

  // Atualiza data
  supermercado.dataAtualizacao = new Date().toISOString();

  const resultado = await atualizarSupermercado(supermercadoId, supermercado);

  if (resultado) {
    alert("Alterações salvas com sucesso!");
    window.location.href = "acessibilidade.html";
  } else {
    alert("Erro ao salvar alterações.");
  }
}

// Verificando (mudar)
function obterIdDaURL() {
  const parametros = new URLSearchParams(window.location.search);
  const id = parametros.get("id");
  return id ? parseInt(id) : 1;
}

// Inicia a lista
document.addEventListener("DOMContentLoaded", () => {
  const paginaAtual = window.location.pathname;

  supermercadoId = obterIdDaURL();

  if (
    paginaAtual.includes("acessibilidade.html") ||
    paginaAtual.endsWith("/")
  ) {
    mostrarDados();
  }

  if (paginaAtual.includes("editar_acessibilidade.html")) {
    carregarModoEdicao();
  }
});
