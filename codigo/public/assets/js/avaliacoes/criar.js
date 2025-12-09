import { AvaliacaoService } from "../../../services/avaliacao-service.js";

const service = new AvaliacaoService();
const API_URL = "http://localhost:3001";
const form = document.querySelector("#form-avaliacao");

document.addEventListener("DOMContentLoaded", () => {
  carregarMercados();
  configurarFormulario();
});

async function carregarMercados() {
  try {
    const mercados = await fetch(`${API_URL}/mercados`).then((r) => r.json());
    const mercadoSelect = document.getElementById("mercado-select");

    mercados.forEach((m) => {
      const option = document.createElement("option");
      option.value = m.id;
      option.textContent = m.nome;
      mercadoSelect.appendChild(option);
    });
  } catch (erro) {
    console.error("Erro ao carregar mercados:", erro);
    alert("Erro ao carregar lista de mercados!");
  }
}

function configurarFormulario() {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    console.log(usuarioLogado);
    const nova = {
      usuarioId: Number(usuarioLogado.id),
      mercadoId: Number(document.getElementById("mercado-select").value),
      nota: Number(document.getElementById("nota-input").value),
      comentario: document.getElementById("comentario-input").value,
    };

    try {
      const btnSubmit = document.getElementById("salvar-btn");
      btnSubmit.disabled = true;
      btnSubmit.innerHTML =
        '<span class="spinner-border spinner-border-sm me-2"></span>Salvando...';

      await service.criarAvaliacao(nova);

      alert("✅ Avaliação criada com sucesso!");
      window.location.href = "./visualizar.html";
    } catch (erro) {
      console.error("Erro ao criar avaliação:", erro);
      alert("Erro ao salvar avaliação!");
      const btnSubmit = document.getElementById("salvar-btn");
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = '<i class="bi bi-save"></i> Salvar Avaliação';
    }
  });
}
