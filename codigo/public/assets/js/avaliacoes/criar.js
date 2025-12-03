import { AvaliacaoService } from "../../../services/avaliacao-service.js";

const service = new AvaliacaoService();

const usuarioSelect = document.querySelector("#usuario-select");
const mercadoSelect = document.querySelector("#mercado-select");
const notaInput = document.querySelector("#nota-input");
const comentarioInput = document.querySelector("#comentario-input");
const salvarBtn = document.querySelector("#salvar-btn");

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

async function carregarMercados() {
    const r = await fetch("http://localhost:3001/mercados");
    const mercados = await r.json();

    mercados.forEach(m => {
        const opt = document.createElement("option");
        opt.value = m.id;
        opt.textContent = m.nome;
        mercadoSelect.appendChild(opt);
    });
}

async function salvar() {

    const avaliacao = {
        usuarioId: Number(usuarioSelect.value),
        mercadoId: Number(mercadoSelect.value),
        nota: Number(notaInput.value),
        comentario: comentarioInput.value.trim(),
        criadoEm: new Date().toISOString()
    };

    await service.criarAvaliacao(avaliacao);

    alert("Avaliação criada com sucesso!");
    window.location.assign("index.html");
}

salvarBtn.addEventListener("click", salvar);

carregarUsuarios();
carregarMercados();
