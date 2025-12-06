import { AcessibilidadeService } from "../../../services/acessibilidade-service.js";

const service = new AcessibilidadeService();
const tabela = document.querySelector("#tabela-acessibilidades");

async function carregarAcessibilidades() {
  const acessibilidades = await service.getAcessibilidades();

  tabela.innerHTML = "";

  acessibilidades.forEach((a) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
            <td>${a.id}</td>
            <td>${a.tipo}</td>
            <td>
                <button class="btn btn-warning btn-editar" data-id="${a.id}">Editar</button>
                <button class="btn btn-danger btn-excluir" data-id="${a.id}">Excluir</button>
            </td>
        `;

    tabela.appendChild(tr);
  });

  adicionarEventos();
}

function adicionarEventos() {
  document.querySelectorAll(".btn-editar").forEach((btn) => {
    btn.addEventListener("click", () => {
      sessionStorage.setItem("acessibilidadeId", btn.dataset.id);
      window.location.href = "./editar.html";
    });
  });

  document.querySelectorAll(".btn-excluir").forEach((btn) => {
    btn.addEventListener("click", () => {
      sessionStorage.setItem("acessibilidadeId", btn.dataset.id);
      window.location.href = "./excluir.html";
    });
  });
}

carregarAcessibilidades();
