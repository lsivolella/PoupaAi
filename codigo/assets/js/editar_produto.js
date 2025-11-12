let produtosDb = [];
let imagemProdutoSelecionado = null;
let cardSelecionado = null;

document.addEventListener('DOMContentLoaded', async () => {
    configurarQuantidade();

    await carregarBaseDeDadosEExibirLista();

    document.getElementById('search-bar').addEventListener('input', filtrarProdutos);

    document.getElementById('btn-adicionar-produto').addEventListener('click', salvarProduto);
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
            throw new Error(`Erro HTTP: ${response.status} - Não foi possível encontrar o arquivo db_produtos.json`);
        }

        const data = await response.json();

        if (!data.produtos) {
            throw new Error("O JSON não contém a chave 'produtos'.");
        }

        produtosDb = data.produtos;

        renderizarListaProdutos(produtosDb);
    } catch (erro) {
        console.error("Erro crítico ao buscar produtos:", erro);
        const container = document.getElementById('product-list-container');
        if (container) {
            container.innerHTML = `<p style="color: red; padding: 20px;"><b>Erro:</b> ${erro.message}. Verifique o console (F12).</p>`;
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
            <img src="${prod.imagem_url}" alt="${prod.nome}" 
                onerror="this.src='https://placehold.co/150x120/eee/ccc?text=Sem+Foto'">
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
    document.getElementById('quantidade').focus();
    document.querySelector('.form-title').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function salvarProduto() {
    const nome = document.getElementById('nome').value;

    if (!nome) {
        console.warn("Selecione um produto da lista primeiro!");
        return;
    }

    const marca = document.getElementById('marca').value;
    const descricao = document.getElementById('descricao').value;
    const quantidade = document.getElementById('quantidade').value;

    const novoItem = {
        nome,
        marca,
        descricao,
        quantidade,
        imagem: imagemProdutoSelecionado
    };

    try {
        let listaCompras = JSON.parse(localStorage.getItem('meus_produtos')) || [];
        listaCompras.push(novoItem);
        localStorage.setItem('meus_produtos', JSON.stringify(listaCompras));

        window.location.href = 'lista.html';
    } catch (e) {
        console.error("Erro ao salvar no LocalStorage:", e);
    }
}
