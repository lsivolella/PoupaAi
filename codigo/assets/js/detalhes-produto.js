const produtoId = new URLSearchParams(window.location.search).get("id");
const produtoArticle = document.querySelector("#card-produto");
const tituloProduto = document.querySelector("#titulo-produto h4");
const mercadosContainer = document.querySelector("#card-mercados-container");

let produto = null;
let localizacaoUsuario = null;

async function carregarEPreencherProduto() {
    const produtos = await carregarProdutos();
    produto = produtos.find(p => p.id === parseInt(produtoId));

    if (produto) {
        console.log(produto);
        preencherProduto(produto);
    } else {
        console.error("Produto não encontrado");
        document.querySelector("#titulo-produto h4").textContent = "Produto não encontrado";
    }
}

async function carregarProdutos() {
    const response = await fetch("../assets/json/db_produtos.json");
    const data = await response.json();
    return data.produtos;
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
    if (tituloProduto) {
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

async function carregarEPreencherMercados() {
    const mercados = await carregarMercados();

    if (mercados) {
        console.log(mercados);
        preencherMercados(produto, mercados);
    } else {
        console.error("Mercados não encontrados");
        mercadosContainer.innerHTML = `
            <p>Mercados não encontrados</p>
            `;
    }
}

async function carregarMercados() {
    const response = await fetch("../assets/json/db_supermercados.json");
    const data = await response.json();
    return data.mercados;
}

async function preencherMercados(produto, mercados) {
    if (produto == null) {
        console.error("Produto nulo");
        return;
    }

    if (mercados == null) {
        console.error("Mercados não encontrados");
        return;
    }

    mercadosContainer.innerHTML = ``;

    if (produto.ocorrencias.length === 0) {
        mercadosContainer.innerHTML = `
            <p>Nenhum preço encontrado para este produto.</p>
        `;
        return;
    }
    produto.ocorrencias.forEach(ocorrencia => {
        const mercado = mercados.find(m => m.id === ocorrencia.mercadoId);
        console.log(mercado);
        if (mercado) {

            const dist = calcularDistancia(
                localizacaoUsuario.latitude,
                localizacaoUsuario.longitude,
                mercado.localizacao.latitude,
                mercado.localizacao.longitude
            );

            mercadosContainer.insertAdjacentHTML("beforeend", `
                <div class="card mb-2" style="width: 100%; max-width: 800px;">
                    <div class="row g-0 align-items-center">
                        <div class="col-4 d-flex justify-content-center align-items-center">
                            ${mercado.logo
                    ? `<img class="card-img-left ms-2" src="${mercado.logo}" alt="logo-mercado" style="max-width:80px;">`
                    : `<span class="material-symbols" style="font-size:48px; color:#666;">shopping_cart</span>`
                }
                        </div>
                        <div class="col-6">
                            <div class="card-body">
                                <h5 class="card-text">${mercado.nome}</h5>
                                <p class="card-text">${dist.toFixed(2)} km de você</p>
                            </div>
                        </div>
                        <div class="col-2">
                            <p><strong>R$ ${ocorrencia.preco.toFixed(2)}</strong></p>
                        </div>
                    </div>
                </div>
            `);
        }
    });
}

function pegarLocalizacaoUsuario() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject("Geolocalização não suportada");
        }

        navigator.geolocation.getCurrentPosition(
            position => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            },
            error => reject(error),
            { enableHighAccuracy: true }
        );
    });
}

function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raio da terra em Km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Km
}

document.addEventListener("DOMContentLoaded", async () => {
    if (produtoId) {
        try {
            localizacaoUsuario = await pegarLocalizacaoUsuario();
            await carregarEPreencherProduto();
            await carregarEPreencherMercados();
        }
        catch (error) {
            console.error("Erro ao carregar dados:", error);
        }
    } else {
        console.error("ID do produto não fornecido na URL");
    }
});
