import { ListasService } from "../../../services/listas-service.js";

const listasService = new ListasService();

const usuarioSelect = document.querySelector("#usuario");
const valorTotalInput = document.querySelector("#valor");
const produtoSelect = document.querySelector("#produto");
const quantidadeInput = document.querySelector("#quantidade");
const valorUnitarioInput = document.querySelector("#valorUnitario");
const addProdutoBtn = document.querySelector("#addProduto");
const salvarBtn = document.querySelector("#salvar-btn");
const itensLista = document.querySelector("#itensLista");

valorUnitarioInput.readOnly = true;
valorTotalInput.readOnly = true;

async function carregarProdutos() {
    const r = await fetch("http://localhost:3001/produtos");
    const produtos = await r.json();

    produtos.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = p.nome;
        opt.dataset.preco = p.preco; 
        produtoSelect.appendChild(opt);
    });
}

async function carregarUsuarios() {
    const r = await fetch("http://localhost:3001/usuarios");
    const usuarios = await r.json();

    usuarios.forEach(u => {
        const opt = document.createElement("option");
        opt.value = u.id;
        opt.textContent = u.nome;
        usuarioSelect.appendChild(opt);
    });
}
produtoSelect.addEventListener("change", () => {
    const opt = produtoSelect.selectedOptions[0];
    const preco = opt.dataset.preco;
    valorUnitarioInput.value = Number(preco).toFixed(2);
});

function recalcularValorTotal() {
    let total = 0;

    document.querySelectorAll("#itensLista tr").forEach(tr => {
        const quantidade = Number(tr.children[1].textContent);
        const valorUnitario = Number(tr.children[2].textContent.replace("R$ ", ""));
        total += quantidade * valorUnitario;
    });

    valorTotalInput.value = total.toFixed(2);
}

function adicionarProduto() {
    const produtoId = produtoSelect.value;
    const quantidade = quantidadeInput.value;
    const preco = valorUnitarioInput.value;

    if (!produtoId || !quantidade) return;

    const nomeProduto = produtoSelect.selectedOptions[0].text;

    const tr = document.createElement("tr");
    tr.innerHTML = `
        <td data-produto="${produtoId}">${nomeProduto}</td>
        <td>${quantidade}</td>
        <td>R$ ${parseFloat(preco).toFixed(2)}</td>
        <td>
            <button class="btn btn-sm btn-danger remover-item">Remover</button>
        </td>
    `;

    itensLista.appendChild(tr);

    tr.querySelector(".remover-item").addEventListener("click", () => {
        tr.remove();
        recalcularValorTotal();
    });

    recalcularValorTotal();
}

async function salvar() {
    const usuarioId = Number(usuarioSelect.value);
    const valor = Number(valorTotalInput.value);

    const produtos = [...document.querySelectorAll("#itensLista tr")].map(tr => ({
        produtoId: Number(tr.children[0].dataset.produto),
        quantidade: Number(tr.children[1].textContent),
        valorUnitario: Number(tr.children[2].textContent.replace("R$ ", ""))
    }));

    const novaLista = {
        usuarioId,
        valor,
        produtos,
        criadoEm: new Date().toISOString()
    };

    await listasService.criarLista(novaLista);
    window.location.assign("index.html");
}

addProdutoBtn.addEventListener("click", adicionarProduto);
salvarBtn.addEventListener("click", salvar);

carregarProdutos();
carregarUsuarios();
