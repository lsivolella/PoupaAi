const form = document.querySelector("#produto-form");
const adicionarMercadoBtn = document.querySelector("#adicionar-mercado-btn");
const listaMercadosDiv = document.querySelector("#lista-mercados");
const baseURL = "http://localhost:3000/produtos";
const produtoId = new URLSearchParams(window.location.search).get("id");

function fillForm(produto) {
    if (produto == null) {
        console.error("Produto nulo");
        return;
    }

    // Preenche os campos do formulário com os dados do produto
}

document.addEventListener("DOMContentLoaded", async () => {
    if (produtoId) {
        document.querySelector("#titulo-produto").textContent = "Editar Produto";
        const response = await fetch(`${baseURL}/${produtoId}`);
        const produto = await response.json();
        fillForm(produto);
    }
});

if (form) {
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(form);

        const produto = {
            nome: formData.get("nome")?.trim() || null,
            marca: formData.get("marca")?.trim() || null,
            unidade: formData.get("unidade")?.trim() || null,
            embalagem: parseFloat(formData.get("embalagem")),
            descricao: formData.get("descricao")?.trim() || null,
            imagem: formData.get("imagem") || null,
        };

        console.log("Dados do produto:", produto);
    });
}

if (adicionarMercadoBtn && listaMercadosDiv) {
    adicionarMercadoBtn?.addEventListener("click", () => {
        const novaEntradaHTML = `
            <div class="entrada-mercado row mb-2">
                <div class="col-6 d-flex align-items-center">
                    <input type="text" class="form-control" placeholder="Nome do mercado" value="">
                </div>
                <div class="col-4 d-flex align-items-center">
                    <input type="text" class="form-control" placeholder="Preço (R$)" value="">
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