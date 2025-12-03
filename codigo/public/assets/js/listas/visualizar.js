import { ListasService } from "../../../services/listas-service.js";
import { UsuarioService } from "../../../services/usuario-service.js";
import { ProdutoService } from "../../../services/produto-service.js";

const listasService = new ListasService();
const usuariosService = new UsuarioService();
const produtosService = new ProdutoService();

const tabela = document.querySelector("#tabelaListasCompras");

async function carregarListasCompras() {

    const listas = await listasService.getListas();
    const usuarios = await usuariosService.getUsuarios();
    const produtos = await produtosService.getProdutos();

    tabela.innerHTML = "";

    listas.forEach(lista => {

        const usuario = usuarios.find(u => u.id === lista.usuarioId)?.nome || "—";

        const totalItens = lista.produtos
            .reduce((acc, p) => acc + (p.quantidade * p.valorUnitario), 0)
            .toFixed(2);

        const tr = document.createElement("tr");
        tr.innerHTML = `
        <td>${lista.id}</td>
        <td>${usuario}</td>
        <td>R$ ${parseFloat(lista.valor).toFixed(2)}</td>
        <td>R$ ${totalItens}</td>
        <td>
            <button class="editar-btn btn btn-sm btn-info" data-id="${lista.id}">
                Editar
            </button>
    
            <button class="excluir-btn btn btn-sm btn-danger" data-id="${lista.id}">
                Excluir
            </button>
    
            <button class="finalizar-btn btn btn-sm btn-success" data-id="${lista.id}">
                Finalizar
            </button>
        </td>
    `;
    

        tabela.appendChild(tr);
    });

    adicionarEventos();
}

function adicionarEventos() {
    document.querySelectorAll(".editar-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            sessionStorage.setItem("listaEdicaoId", btn.dataset.id);
            window.location.href = "editar.html";
        });
    });

    document.querySelectorAll(".excluir-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = btn.dataset.id;

            if (confirm("Tem certeza que deseja excluir esta lista?")) {
                await listasService.excluirLista(id);
                btn.closest("tr").remove();
            }
        });
    });

    document.querySelectorAll(".finalizar-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = btn.dataset.id;

            if (confirm("Finalizar lista e mover para o histórico?")) {
                await listasService.finalizarLista(id);
                btn.closest("tr").remove();
                alert("Lista finalizada e movida para o histórico!");
            }
        });
    });
}


window.addEventListener("load", carregarListasCompras);
