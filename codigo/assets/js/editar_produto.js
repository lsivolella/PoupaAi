let produtosDb = [];
let imagemProdutoSelecionado = null;
let cardSelecionado = null;
let precoProdutoSelecionado = null;

document.addEventListener('DOMContentLoaded', async () => {
    configurarQuantidade();
    await carregarBaseDeDadosEExibirLista();

    document.getElementById('search-bar').addEventListener('input', filtrarProdutos);
    document.getElementById('btn-adicionar-produto').addEventListener('click', salvarProduto);

    const produtoEdicao = JSON.parse(localStorage.getItem('produto_em_edicao'));
    if (produtoEdicao) {
        preencherFormularioEdicao(produtoEdicao);
    }
});

function configurarQuantidade() {
    const inputQtd = document.getElementById('quantidade');
    document.getElementById('menos').addEventListener('click', () => {
        let val = parseInt(inputQtd.value);
        if (val > 1) inputQtd.value = val - 1;
    });
    document.getElementById('mais').addEventListener('click', () => {
        let val = parseInt(inputQtd.value);
        inputQtd.value = val + 1;
    });
}

async function carregarBaseDeDadosEExibirLista() {
    try {
        const response = await fetch('../assets/json/db_produtos.json');
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();

        if (!data.produtos) {
            throw new Error("JSON inválido");
        }

        produtosDb = data.produtos;
        renderizarListaProdutos(produtosDb);
    } catch (erro) {
        const container = document.getElementById('product-list-container');
        if (container) {
            container.innerHTML = `<p style="color:red; padding:20px;">${erro.message}</p>`;
        }
    }
}

function renderizarListaProdutos(listaDeProdutos) {
    const container = document.getElementById('product-list-container');
    if (!container) return;

    container.innerHTML = '';

    if (listaDeProdutos.length === 0) {
        container.innerHTML = "<p>Nenhum produto encontrado.</p>";
        return;
    }

    listaDeProdutos.forEach(prod => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.dataset.id = prod.id;

        card.innerHTML = `
            <img src="${prod.imagem_url}" alt="${prod.nome}" onerror="this.src='https://placehold.co/150x120'">
            <div class="product-card-info">
                <h3>${prod.nome}</h3>
                <p>${prod.marca}</p>
            </div>
        `;

        card.addEventListener('click', () => {
            if (cardSelecionado) {
                cardSelecionado.classList.remove('selected');
            }
            card.classList.add('selected');
            cardSelecionado = card;
            preencherFormulario(prod);
        });

        container.appendChild(card);
    });
}

function filtrarProdutos() {
    const termo = document.getElementById('search-bar').value.toLowerCase();
    const produtosFiltrados = produtosDb.filter(prod => {
        return (
            prod.nome.toLowerCase().includes(termo) ||
            prod.marca.toLowerCase().includes(termo)
        );
    });
    renderizarListaProdutos(produtosFiltrados);
}

function preencherFormulario(produto) {
    document.getElementById('nome').value = produto.nome;
    document.getElementById('marca').value = produto.marca;
    const descricaoSimples = `${produto.tamanho_embalagem || ''}${produto.unidade_medida || ''}`;
    document.getElementById('descricao').value = descricaoSimples;

    document.getElementById('quantidade').value = 1;

    imagemProdutoSelecionado = produto.imagem_url;
    precoProdutoSelecionado = produto.ocorrencias[0].preco;

    document.getElementById('quantidade').focus();
}

function preencherFormularioEdicao(prod) {
    document.querySelector('.form-title').textContent = "Editar item";
    document.getElementById('nome').value = prod.nome;
    document.getElementById('marca').value = prod.marca;
    document.getElementById('descricao').value = prod.descricao;
    document.getElementById('quantidade').value = prod.quantidade;

    imagemProdutoSelecionado = prod.imagem;
    precoProdutoSelecionado = prod.preco;
}

function salvarProduto() {
    const produtoEdicao = JSON.parse(localStorage.getItem('produto_em_edicao'));

    const nome = document.getElementById('nome').value;
    if (!nome) return;

    const marca = document.getElementById('marca').value;
    const descricao = document.getElementById('descricao').value;
    const quantidade = document.getElementById('quantidade').value;

    const item = {
        nome,
        marca,
        descricao,
        quantidade,
        imagem: imagemProdutoSelecionado,
        preco: precoProdutoSelecionado
    };

    let lista = JSON.parse(localStorage.getItem('meus_produtos')) || [];

    if (produtoEdicao) {
        lista[produtoEdicao.index] = item;
        localStorage.removeItem('produto_em_edicao');
    } else {
        lista.push(item);
    }

    localStorage.setItem('meus_produtos', JSON.stringify(lista));

    window.location.href = "lista.html";
}
