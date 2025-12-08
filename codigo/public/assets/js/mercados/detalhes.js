import { MercadoService } from "../../../services/mercado-service.js";

const service = new MercadoService();

const cardMercado = document.getElementById("card-mercado");
const cardAcessibilidade = document.getElementById("card-acessibilidade");
const cardAvaliacoes = document.getElementById("card-avaliacoes");

const mercadoId = sessionStorage.getItem("mercadoId");

let isAdmin = false;

document.addEventListener("DOMContentLoaded", async () => {
  await carregarStatusUsuario();
  await carregarDetalhes();
});

async function carregarDetalhes() {
  if (!mercadoId) {
    alert("Mercado não selecionado!");
    window.location.href = "index.html";
    return;
  }

  try {
    const mercado = await service.getMercado(mercadoId);

    cardMercado.innerHTML = `
      <div class="card mb-3 d-flex flex-row align-items-center">
        <img src="${mercado.logo}" class="img-fluid rounded-start" alt="${
      mercado.nome
    }" style="width: 250px; object-fit: cover;">
        <div class="card-body flex-grow-1">
          <h3 class="card-title">${mercado.nome}</h3>
          <p><b>Endereço:</b> ${mercado.endereco.rua} ${mercado.endereco.numero}, ${mercado.endereco.bairro}. ${mercado.endereco.cidade} - ${mercado.endereco.estado}</p>
          <p><b>Telefone:</b> ${mercado.telefone}</p>
          <p><b>Funcionamento:</b> ${mercado.horarioFuncionamento}</p>
          <p><b>Média Avaliações:</b> ${mercado.mediaAvaliacoes ?? "-"}</p>
          <div class="mt-2 d-flex gap-2">
            ${
              isAdmin
                ? `
                  <button class="btn btn-warning" id="btn-editar">Editar</button>
                  <button class="btn btn-danger" id="btn-excluir">Excluir</button>
                `
                : ""
            }
            <button class="btn btn-success" id="btn-adicionar-avaliacao">
              <i class="bi bi-star-fill"></i> Adicionar Avaliação
            </button>
          </div>
        </div>
      </div>
    `;

    let acessibilidadesAll = [];
    let acessibilidadesMercado = [];
    if (mercado.acessibilidades && mercado.acessibilidades.length > 0) {
        acessibilidadesAll = await fetch(
          "http://localhost:3001/acessibilidades"
        ).then((r) => r.json());
        acessibilidadesMercado = acessibilidadesAll.filter((a) =>
          mercado.acessibilidades.includes(a.id)
        );
    }

    cardAcessibilidade.innerHTML = `
      <div class="card mb-3">
        <div class="card-header"><b>Acessibilidades</b></div>
        <div class="card-body">
          ${
            acessibilidadesMercado.length > 0
              ? `<ul>${acessibilidadesMercado
                  .map((a) => `<li>${a.tipo}</li>`)
                  .join("")}</ul>`
              : "<p>Nenhuma acessibilidade cadastrada.</p>"
          }
        </div>
      </div>
    `;

    const avaliacoesAll = await fetch("http://localhost:3001/avaliacoes").then(
      (r) => r.json()
    );
    const avaliacoesMercado = avaliacoesAll.filter(
      (av) => av.mercadoId == mercado.id
    );

    cardAvaliacoes.innerHTML = `
      <div class="card mb-3">
        <div class="card-header"><b>Avaliações</b></div>
        <div class="card-body">
          <p><b>Média:</b> ${mercado.mediaAvaliacoes ?? "-"}</p>
          <p><b>Total de Avaliações:</b> ${mercado.numeroDeAvaliacoes ?? 0}</p>
          ${
            avaliacoesMercado.length > 0
              ? `<ul>${avaliacoesMercado
                  .map(
                    (av) =>
                      `<li><b>Usuário ${av.usuarioId}:</b> ${av.comentario} (Nota: ${av.nota})</li>`
                  )
                  .join("")}</ul>`
              : "<p>Sem avaliações.</p>"
          }
        </div>
      </div>
    `;

    adicionarEventos(mercado.id);
  } catch (err) {
    console.error(err);
    alert("Erro ao carregar detalhes do mercado.");
    window.location.href = "index.html";
  }
}

async function carregarStatusUsuario() {
  const userStr = localStorage.getItem("usuarioLogado");
  let user;
  
  if (userStr)
  {
    user = JSON.parse(userStr);
  }
  isAdmin = user && user.role === "admin";
}

function adicionarEventos(id) {
  const buttonEditar = document.getElementById("btn-editar");
  buttonEditar?.addEventListener("click", () => {
        sessionStorage.setItem("mercadoId", id);
        window.location.href = "./editar.html";
      });

  const buttonExcluir = document.getElementById("btn-excluir")
  buttonExcluir?.addEventListener("click", async () => {
    if (confirm("Deseja realmente excluir este mercado?")) {
      try {
        await service.excluirMercado(id);
        window.location.href = "index.html";
      } catch (err) {
        console.error(err);
        alert("Não foi possível excluir o mercado.");
      }
    }
  });

  document
    .getElementById("btn-adicionar-avaliacao")
    .addEventListener("click", () => {
      sessionStorage.setItem("mercadoId", id);
      window.location.href = "../avaliacoes/criar.html";
    });
}