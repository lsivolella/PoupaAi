const produtoId = new URLSearchParams(window.location.search).get("id");
const form = document.querySelector("#produto-form");
const adicionarMercadoBtn = document.querySelector("#adicionar-mercado-btn");
const listaMercadosDiv = document.querySelector("#lista-mercados");
const baseURL = "http://localhost:3000/produtos";
const imagemInput = document.querySelector("#imagem");
const previewImagem = document.querySelector("#preview-imagem");
let mercadosDB = [];

async function carregarMercados() {
    const res = await fetch("../assets/json/db_supermercados.json");
    const data = await res.json();
    mercadosDB = data.mercados;
}

function preencherFormulario(produto) {
    if (produto == null) {
        console.error("Produto nulo");
        return;
    }

    document.getElementById("nome").value = produto.nome || "";
    document.getElementById("marca").value = produto.marca || "";
    document.getElementById("unidade").value = produto.unidade_medida || "";
    document.getElementById("embalagem").value = produto.tamanho_embalagem || "";
    document.getElementById("descricao").value = produto.descricao || "";
    // Imagem de preview
    if (previewImagem && produto.imagem_url) {
        previewImagem.src = produto.imagem_url;
        previewImagem.style.display = "block";
        previewImagem.style.alignContent = "center";
    }
    // Lista de mercados
    listaMercadosDiv.innerHTML = "";
    produto.ocorrencias?.forEach(o => {
        const mercado = mercadosDB.find(m => m.id == o.mercadoId);

        const html = `
        <div class="entrada-mercado row mb-2">
            <div class="col-6 d-flex align-items-center">
                <select class="form-control select-mercado">
                    ${mercadosDB.map(m => `
                        <option value="${m.id}" ${m.id == o.mercadoId ? "selected" : ""}>
                            ${m.nome}
                        </option>
                    `).join("")}
                </select>
            </div>
            <div class="col-4 d-flex align-items-center">
                <input type="text" class="form-control preco-mercado" value="${o.preco}">
            </div>
            <div class="col-2 d-flex align-items-center">
                <button class="btn btn-link p-0 text-danger remover-mercado-btn">
                    <span class="material-symbols">delete</span>
                </button>
            </div>
        </div>
    `;
        listaMercadosDiv.insertAdjacentHTML("beforeend", html);
    });
}

if (form) {
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(form);

        const ocorrencias = Array.from(
            document.querySelectorAll("#lista-mercados .entrada-mercado")
        ).map(row => ({
            mercadoId: row.querySelector(".select-mercado").value,
            preco: parseFloat(row.querySelector(".preco-mercado").value) || 0
        })).filter(o => o.mercadoId);

        const produto = {
            nome: formData.get("nome")?.trim() || null,
            marca: formData.get("marca")?.trim() || null,
            unidade_medida: formData.get("unidade")?.trim() || null,
            tamanho_embalagem: parseFloat(formData.get("embalagem")),
            descricao: formData.get("descricao")?.trim() || null,
            imagem_url: null,
            ocorrencias
        };

        console.log("Dados do produto:", produto);

        try {
            localStorage.setItem(`produto_${produtoId}`, JSON.stringify(produto));
        }
        catch (error) {
            console.error("Erro ao salvar no LocalStorage: ", error);
        }
    });
}

imagemInput?.addEventListener("change", function () {
    const file = this.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {
        previewImagem.src = e.target.result;
        previewImagem.style.display = "block";
    };

    reader.readAsDataURL(file);
});

if (adicionarMercadoBtn && listaMercadosDiv) {
    adicionarMercadoBtn?.addEventListener("click", () => {
        const novaEntradaHTML = `
            <div class="entrada-mercado row mb-2">
                <div class="col-6 d-flex align-items-center">
                    <select class="form-control select-mercado">
                        <option value="">Selecione o mercado</option>
                        ${mercadosDB.map(m => `<option value="${m.id}">${m.nome}</option>`).join("")}
                    </select>
                </div>
                <div class="col-4 d-flex align-items-center">
                    <input type="text" class="form-control preco-mercado" placeholder="Preço (R$)" value="">
                </div>
                <div class="col-2 d-flex align-items-center">
                    <button class="btn btn-link p-0 text-danger remover-mercado-btn" title="Remover">
                        <span class="material-symbols">delete</span>
                    </button>
                </div>
            </div>
        `;

        listaMercadosDiv.insertAdjacentHTML("beforeend", novaEntradaHTML);

        listaMercadosDiv.addEventListener("click", (event) => {
            if (event.target.closest(".remover-mercado-btn")) {
                const entradaMercado = event.target.closest(".entrada-mercado");
                entradaMercado?.remove();
            }
        });
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    await carregarMercados();
    // Se estiver em modo de edição, carregar os dados do produto
    if (produtoId) {
        document.querySelector("#titulo-produto").textContent = "Editar Produto";
        const response = await fetch("../assets/json/db_produtos.json");
        const data = await response.json();

        const produto = data.produtos.find(p => p.id === Number(produtoId));

        if (!produto) {
            alert("Produto não encontrado");
            return;
        }

        preencherFormulario(produto);
    }
});