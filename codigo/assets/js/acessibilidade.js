// Dados (começa vazio/null ou localStorage)
let acessibilidade = JSON.parse(localStorage.getItem("acessibilidade")) || {
  rampa: null,
  elevador: null,
  vagas: null,
  piso: null,
  braille: null,
  preferencial: null,
  libras: null,
};

let votos = JSON.parse(localStorage.getItem("votos")) || {
  rampa: { likes: 0, dislikes: 0 },
  elevador: { likes: 0, dislikes: 0 },
  vagas: { likes: 0, dislikes: 0 },
  piso: { likes: 0, dislikes: 0 },
  braille: { likes: 0, dislikes: 0 },
  preferencial: { likes: 0, dislikes: 0 },
  libras: { likes: 0, dislikes: 0 },
};

let meusVotos = JSON.parse(localStorage.getItem("meusVotos")) || {};
let comentarios = localStorage.getItem("comentarios") || "";
let dataAtualizacao = localStorage.getItem("dataAtualizacao")
  ? new Date(localStorage.getItem("dataAtualizacao"))
  : null;

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

// Verifica o status de acessiblidade
function verificarStatus() {
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
function formatarData(data) {
  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const ano = data.getFullYear();
  const hora = String(data.getHours()).padStart(2, "0");
  const min = String(data.getMinutes()).padStart(2, "0");
  return `${dia}/${mes}/${ano} às ${hora}:${min}`;
}

// função para a parte de votação
function votar(item, tipo) {
  if (meusVotos[item] === tipo) {
    if (tipo === "like") {
      votos[item].likes--;
    } else {
      votos[item].dislikes--;
    }
    meusVotos[item] = null;
  } else {
    if (meusVotos[item] === "like") {
      votos[item].likes--;
    } else if (meusVotos[item] === "dislike") {
      votos[item].dislikes--;
    }
    if (tipo === "like") {
      votos[item].likes++;
    } else {
      votos[item].dislikes++;
    }
    meusVotos[item] = tipo;
  }

  localStorage.setItem("votos", JSON.stringify(votos));
  localStorage.setItem("meusVotos", JSON.stringify(meusVotos));

  mostrarDados();
}

// Mostra na tela os itens de acessiblidade
function mostrarDados() {
  const lista = document.getElementById("lista-acessibilidade");
  const titulo = document.getElementById("titulo-card");
  const textoStatus = document.getElementById("status-acessibilidade");
  const elementoData = document.getElementById("data-atualizacao");

  if (!lista) return;

  lista.innerHTML = "";

  // Atualiza status
  const status = verificarStatus();
  textoStatus.textContent = status.texto;
  titulo.className = `titulo-card ${status.classe}`;

  // Mostra data de atualização
  if (elementoData && dataAtualizacao) {
    elementoData.textContent = `Última atualização: ${formatarData(
      dataAtualizacao
    )}`;
    elementoData.style.display = "block";
  } else if (elementoData) {
    elementoData.style.display = "none";
  }

  // Mostra os comentários
  const cardComentarios = document.getElementById("card-comentarios");
  const mostrarComentarios = document.getElementById("mostrar-comentarios");
  if (cardComentarios && comentarios.trim() !== "") {
    cardComentarios.style.display = "block";
    mostrarComentarios.textContent = comentarios;
  } else if (cardComentarios) {
    cardComentarios.style.display = "none";
  }

  // Cria lista dos itens de acessibilidade
  for (let item in acessibilidade) {
    const li = document.createElement("li");
    li.className = "item-acessibilidade";

    const divInfo = document.createElement("div");
    divInfo.className = "info-item";

    const nome = document.createElement("span");
    nome.className = "nome-item-lista";
    nome.textContent = nomes[item] + ":";

    const valor = document.createElement("span");

    if (acessibilidade[item] === null) {
      valor.className = "valor-item vazio";
      valor.textContent = "Sem informação";
    } else if (acessibilidade[item] === true) {
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
    if (acessibilidade[item] !== null) {
      const divVotacao = document.createElement("div");
      divVotacao.className = "botoes-votacao";

      const btnLike = document.createElement("button");
      btnLike.className = "botao-voto";
      if (meusVotos[item] === "like") btnLike.classList.add("votado");
      btnLike.innerHTML = `👍 ${votos[item].likes}`;
      btnLike.onclick = () => votar(item, "like");

      const btnDislike = document.createElement("button");
      btnDislike.className = "botao-voto";
      if (meusVotos[item] === "dislike")
        btnDislike.classList.add("votado-dislike");
      btnDislike.innerHTML = `👎 ${votos[item].dislikes}`;
      btnDislike.onclick = () => votar(item, "dislike");

      divVotacao.appendChild(btnLike);
      divVotacao.appendChild(btnDislike);
      li.appendChild(divVotacao);
    }

    lista.appendChild(li);
  }
}

// Marca a opção selecionada
function marcarOpcao(campo, valor) {
  acessibilidade[campo] = valor;

  // Atualiza botões
  document.querySelectorAll(".botao-opcao").forEach((botao) => {
    const campoBtn = botao.getAttribute("data-campo");
    const valorBtn = botao.getAttribute("data-valor");
    let valorReal;

    if (valorBtn === "null") valorReal = null;
    else valorReal = valorBtn === "true";

    if (acessibilidade[campoBtn] === valorReal) {
      botao.classList.add("ativo");
    } else {
      botao.classList.remove("ativo");
    }
  });
}

// Botão Salvar
function salvarAlteracoes() {
  const campoComentarios = document.getElementById("comentarios");
  if (campoComentarios) {
    comentarios = campoComentarios.value;
  }

  // Atualiza data
  dataAtualizacao = new Date();

  localStorage.setItem("acessibilidade", JSON.stringify(acessibilidade));
  localStorage.setItem("comentarios", comentarios);
  localStorage.setItem("dataAtualizacao", dataAtualizacao.toISOString());
  window.location.href = "acessibilidade.html";
}

// Inicia a lista
if (document.getElementById("lista-acessibilidade")) {
  mostrarDados();
}

if (document.getElementById("tela-editar")) {
  const campoComentarios = document.getElementById("comentarios");
  if (campoComentarios) {
    campoComentarios.value = comentarios;
  }

  document.querySelectorAll(".botao-opcao").forEach((botao) => {
    const campo = botao.getAttribute("data-campo");
    const valorBtn = botao.getAttribute("data-valor");
    let valorReal;

    if (valorBtn === "null") valorReal = null;
    else valorReal = valorBtn === "true";

    if (acessibilidade[campo] === valorReal) {
      botao.classList.add("ativo");
    }
  });
}

// limpar os dados antes de começar
function limparDados() {
  localStorage.clear();
  location.reload();
}
