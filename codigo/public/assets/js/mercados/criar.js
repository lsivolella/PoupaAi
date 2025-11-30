import { MercadoService } from "../../../services/mercado-service.js";
import { AcessibilidadeService } from "../../../services/acessibilidade-service.js";

const mercadoService = new MercadoService();
const acessibilidadeService = new AcessibilidadeService();

const form = document.querySelector("#form-mercado");
const selectAcessibilidade = document.querySelector("#acessibilidade-select");

async function carregarAcessibilidades() {
  const acessibilidades = await acessibilidadeService.getAcessibilidades();
  selectAcessibilidade.innerHTML = "";

  acessibilidades.forEach(a => {
    const option = document.createElement("option");
    option.value = a.id;
    option.textContent = a.tipo;
    selectAcessibilidade.appendChild(option);
  });
}

async function criarMercado() {
  const nome = document.querySelector("#nome-input").value;
  const logo = document.querySelector("#logo-input").value;
  const cep = document.querySelector("#cep-input").value;
  const rua = document.querySelector("#rua-input").value;
  const numero = document.querySelector("#numero-input").value;
  const bairro = document.querySelector("#bairro-input").value;
  const cidade = document.querySelector("#cidade-input").value;
  const estado = document.querySelector("#estado-input").value;
  const pais = document.querySelector("#pais-input").value;
  const telefone = document.querySelector("#telefone-input").value;
  const email = document.querySelector("#email-input").value;

  const acessibilidadesSelecionadas = Array.from(selectAcessibilidade.selectedOptions)
    .map(option => Number(option.value));

  const novoMercado = {
    nome,
    logo,
    endereco: {
      cep,
      rua,
      numero,
      bairro,
      cidade,
      estado,
      pais
    },
    telefone,
    email,
    acessibilidades: acessibilidadesSelecionadas
  };

  await mercadoService.criarMercado(novoMercado);
  alert("Mercado criado com sucesso!");
  window.location.href = "./index.html";
}

document.querySelector("#salvar-btn").addEventListener("click", criarMercado);
carregarAcessibilidades();
