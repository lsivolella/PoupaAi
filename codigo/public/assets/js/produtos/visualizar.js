import { ProdutoService } from "../../../services/produto-service.js";
import { formatarMoeda } from "../../../utils/formatador.js";

const produtoService = new ProdutoService();
const tabela = document.querySelector("#tabela-produtos");

async function criarListaDetalhes() {
  const produtos = await produtoService.getProdutos();

  tabela.innerHTML = "";

  produtos.forEach((produto) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
            <td style="display:none;">${produto.id}</td>
            <td>${produto.nome}</td>
            <td>${produto.categoria}</td>
            <td>${formatarMoeda(produto.preco)}</td>
            <td><img src="${produto.imagem_url}" alt="${
      produto.nome
    }" width="50"></td>
            <td>
                <a href="detalhes.html?id=${
                  produto.id
                }" class="btn btn-sm btn-info">Detalhes</a>
                <button class="btn btn-sm btn-danger btn-excluir-produto" data-id="${
                  produto.id
                }">Excluir</button>
            </td>
        `;

    tabela.appendChild(tr);
  });

  adicionarEventosExcluir();
}

function adicionarEventosExcluir() {
  const botoesExcluir = document.querySelectorAll(".btn-excluir-produto");
  botoesExcluir.forEach((botao) => {
    botao.addEventListener("click", async () => {
      const id = botao.dataset.id;
      if (confirm("Tem certeza que deseja excluir este produto?")) {
        await produtoService.excluirProduto(id);
        botao.closest("tr").remove(); // remove a linha da tabela
      }
    });
  });
}

window.addEventListener("load", criarListaDetalhes);
