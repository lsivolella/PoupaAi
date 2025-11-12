document.addEventListener('DOMContentLoaded', () => {
    const nomePadrao = "Minha lista de compras"; 
    if (!localStorage.getItem('nome_lista_compras')) {
        localStorage.setItem('nome_lista_compras', nomePadrao);
    }

    carregarNomeLista();
    carregarProdutos();

    const btnSalvar = document.getElementById('btn-salvar-nome');
    const inputNome = document.getElementById('nome-lista');
    const btnEditar = document.getElementById('btn-editar-nome');

    btnEditar.style.display = 'none';

    btnSalvar.addEventListener('click', () => {
        const nome = inputNome.value.trim();
        if (nome !== "") {
            localStorage.setItem('nome_lista_compras', nome);
            exibirNomeFixo(nome);
        } else {
            console.warn("Por favor, digite um nome para a lista.");
        }
    });

    btnEditar.addEventListener('click', () => {
        editarNomeLista();
    });

    document.getElementById('btn-finalizar').addEventListener('click', () => {
        localStorage.removeItem('meus_produtos');
        localStorage.removeItem('nome_lista_compras');
        location.reload();
    });
});

function exibirNomeFixo(nome) {
    const areaInput = document.getElementById('area-input-nome');
    const tituloFixo = document.getElementById('titulo-lista-fixo');
    const textoNome = document.getElementById('texto-nome-lista');
    const btnEditar = document.getElementById('btn-editar-nome');

    areaInput.classList.add('escondido');
    tituloFixo.style.display = 'flex';
    textoNome.textContent = nome;
    btnEditar.style.display = 'inline-flex';
}

function carregarNomeLista() {
    const nomeSalvo = localStorage.getItem('nome_lista_compras');
    if (nomeSalvo) {
        exibirNomeFixo(nomeSalvo);
    } else {
        document.getElementById('area-input-nome').classList.remove('escondido');
        document.getElementById('titulo-lista-fixo').style.display = 'none';
        document.getElementById('btn-editar-nome').style.display = 'none';
    }
}

function editarNomeLista() {
    const areaInput = document.getElementById('area-input-nome');
    const tituloFixo = document.getElementById('titulo-lista-fixo');
    const inputNome = document.getElementById('nome-lista');
    const btnEditar = document.getElementById('btn-editar-nome');
    const nomeAtual = localStorage.getItem('nome_lista_compras') || "";

    inputNome.value = nomeAtual;
    areaInput.classList.remove('escondido');
    tituloFixo.style.display = 'none';
    btnEditar.style.display = 'none';
    inputNome.focus();
}

function carregarProdutos() {
    const listaUl = document.getElementById('lista-produtos');
    const produtos = JSON.parse(localStorage.getItem('meus_produtos')) || [];

    listaUl.innerHTML = '';

    if (produtos.length === 0) {
        listaUl.innerHTML = '<p style="padding:20px; text-align:center; color:#666;">Nenhum produto na lista.</p>';
        return;
    }

    produtos.forEach((produto, index) => {
        const li = document.createElement('li');
        li.classList.add('produto');
        
        const imagemSrc = produto.imagem ? produto.imagem : 'https://placehold.co/60x60/eee/ccc?text=Item';

        li.innerHTML = `
          <div class="imagem-produto">
            <img src="${imagemSrc}" alt="${produto.nome}" onerror="this.src='https://placehold.co/60x60/eee/ccc?text=Item'">
          </div>
          <div class="descricao-produto">
            <h3>${produto.nome}</h3>
            <p>${produto.marca}</p>
            <p>${produto.descricao}</p>
            <p>Quantidade: <strong>${produto.quantidade}</strong></p>
          </div>
          <div class="acoes-produto">
            <button class="btn-excluir" onclick="deletarProduto(${index})" aria-label="Excluir item">
              <span class="material-symbols-outlined">delete</span>
            </button>
          </div>
        `;
        listaUl.appendChild(li);
    });
}

window.deletarProduto = function(index) {
    let produtos = JSON.parse(localStorage.getItem('meus_produtos')) || [];
    produtos.splice(index, 1); 
    localStorage.setItem('meus_produtos', JSON.stringify(produtos));
    carregarProdutos(); 
}
