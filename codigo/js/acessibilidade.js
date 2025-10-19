// Dados (começa vazio/null)
let acessibilidade = {
  rampa: null,
  elevador: null,
  vagas: null,
  piso: null,
  braille: null,
  preferencial: null,
  libras: null,
};

let comentarios = "";

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

// Mostra na tela os itens de acessiblidade
function mostrarDados() {
  const lista = document.getElementById("lista-acessibilidade");
  const titulo = document.getElementById("titulo-card");
  const textoStatus = document.getElementById("status-acessibilidade");

  if (!lista) return;

  lista.innerHTML = "";

  // Atualiza status (tem que ajustar essa parte)
  const status = verificarStatus();
  textoStatus.textContent = status.texto;
  titulo.className = `titulo-card ${status.classe}`;

  // Cria lista dos itens de acessibilidade
  for (let item in acessibilidade) {
    const li = document.createElement("li");
    li.className = "item-acessibilidade";

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

    li.appendChild(nome);
    li.appendChild(valor);
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
  window.location.href = "acessibilidade.html";
}

// Inicia a lista
if (document.getElementById("lista-acessibilidade")) {
  mostrarDados();
}
