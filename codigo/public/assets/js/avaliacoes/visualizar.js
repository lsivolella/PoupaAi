import { AvaliacaoService } from "../../../services/avaliacao-service";

const service = new AvaliacaoService();
const tabela = document.querySelector("#tabela-avaliacoes tbody");

async function carregarAvaliacoes() {
  const avaliacoes = await service.getAvaliacoes();

  tabela.innerHTML = "";

  avaliacoes.forEach((av) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
            <td>${av.id}</td>
            <td>${av.usuarioId}</td>
            <td>${av.mercadoId}</td>
            <td>${av.nota}</td>
            <td>${av.comentario}</td>

            <td>
                <button class="btn-editar" data-id="${av.id}">Editar</button>
                <button class="btn-excluir" data-id="${av.id}">Excluir</button>
            </td>
        `;

    tabela.appendChild(tr);
  });

  adicionarEventos();
}

function adicionarEventos() {
  document.querySelectorAll(".btn-editar").forEach((btn) => {
    btn.addEventListener("click", () => {
      sessionStorage.setItem("avaliacaoId", btn.dataset.id);
      window.location.href = "./editar.html";
    });
  });

  document.querySelectorAll(".btn-excluir").forEach((btn) => {
    btn.addEventListener("click", () => {
      sessionStorage.setItem("avaliacaoId", btn.dataset.id);
      window.location.href = "./excluir.html";
    });
  });
}

carregarAvaliacoes();
