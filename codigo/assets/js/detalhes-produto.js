const produtoId = new URLSearchParams(window.location.search).get("id");
const produtoArticle = document.querySelector("#card-produto");
const mercadosContainer = document.querySelector("#card-mercados-container");
const tituloProduto = document.querySelector("#titulo-produto h4");

async function carregarProdutos() {
    const response = await fetch("../assets/json/db_produtos.json");
    const data = await response.json();
    return data.produtos;
}

async function carregarMercados() {
    const response = await fetch("../assets/json/db_supermercados.json");
    const data = await response.json();
    return data.mercados;
}

function preencherProduto(produto) {
    if (produto == null) {
        console.error("Produto nulo");
        return;
    }

    if (produtoArticle == null) {
        console.error("Elemento do produto não encontrado");
        return;
    }

    // Atualiza título da página
    if (tituloProduto)
    {
        let titulo = `${produto.nome} ${produto.marca} ${produto.tamanho_embalagem}${produto.unidade_medida}`;
        tituloProduto.textContent = titulo;
    }

    // Atualiza card do produto
    produtoArticle.innerHTML = `
        <div id="card-produto-esquerda">
            <p>${produto.nome}</p>
            <p>${produto.descricao}</p>
            <p>${produto.tamanho_embalagem} ${produto.unidade_medida}</p>
            <p><strong>${produto.marca}</strong></p>
        </div>
        <div id="card-produto-direita">
            <img src="${produto.imagem_url}" alt="${produto.nome}">
        </div>
    `;
}

document.addEventListener("DOMContentLoaded", async () => {
    if (produtoId) {
        try {
            const produtos = await carregarProdutos();
            const mercados = await carregarMercados();
            const produto = produtos.find(p => p.id === parseInt(produtoId));

            if (produto) {
                console.log(produto);
                preencherProduto(produto);
            } else {
                console.error("Produto não encontrado");
                document.querySelector("#titulo-produto h4").textContent = "Produto não encontrado";
            }
        }
        catch (error) {
            console.error("Erro ao carregar dados:", error);
        }
    } else {
        console.error("ID do produto não fornecido na URL");
    }
});