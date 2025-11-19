const listas = JSON.parse(localStorage.getItem("listas"));

function renderizarDetalhes() {
    let html = "";
    const totalCompras = listas.length;
    for (let i = 0; i < totalCompras; i++) {
        const lista = listas[i];
        const totalItens = lista.itens.length;
        if (lista.id === localStorage.getItem("listaSelecionada")) {
        //console.log(lista.itens);
            for (let j = 0; j < lista.itens.length; j++) {
                let item = lista.itens[j]
                html += `
                    <tr>
                        <td>
                            <figure>
                                <img src="${item.imagem_url}">
                                <figcaption>${item.nome}</figcaption>
                            </figure>
                        </td>
                        <td>R$ ${item.preco.toFixed(2)}</td>
                        <td>${item.quantidade}</td>
                        <td>R$ ${item.preco.toFixed(2)}</td>
                    </tr>
                    `
            }
        }
    }
    return html;
}
document.getElementById("produtos-lista").innerHTML = renderizarDetalhes();


const listaSelecionada = localStorage.getItem("listaSelecionada");

function renderizarDadosLista() {
    if (!listas) return;
    const lista = listas.find(l => l.id === listaSelecionada);
    if (!lista) {
        document.getElementById("dados-lista").innerHTML = `<p>Lista não encontrada.</p>`;
        return;
    }
    document.getElementById("dados-lista").innerHTML = `
        <p><strong>Lista:</strong> ${lista.id}</p>
        <p><strong>Status:</strong> ${lista.status || "-"}</p>
    `;
}
renderizarDadosLista();


function renderizarResumoFinal() {
    if (!listas) return;
    const lista = listas.find(l => l.id === listaSelecionada);
    if (!lista) return;

    let total = 0;
    lista.itens.forEach(item => {
        
        const qtd = Number(item.quantidade) || 1;
        const precoItem = Number(item.preco) || 0;
        total += precoItem;
    });

    const data = lista.data ? new Date(lista.data) : null;
    const dataFormatada = data ? data.toLocaleDateString("pt-BR", {
        day: "2-digit", month: "2-digit", year: "numeric"
    }) : "-";

    document.getElementById("resumo-final").innerHTML = `
        <p><strong>Data da compra:</strong> ${dataFormatada}</p>
        <p><strong>Total da compra:</strong> R$ ${total.toFixed(2)}</p>
    `;
}
renderizarResumoFinal();


// BOTÃO RECOMPRAR: alerta, recria "meus_produtos" e redireciona
(function ativarBotaoRecomprar() {
    const btn = document.getElementById("btn-recomprar");
    if (!btn) return;

    btn.addEventListener("click", () => {

        alert("Os preços dos produtos podem ter sofrido alterações. Verifique antes de finalizar a compra.");

        const lista = listas.find(l => l.id === listaSelecionada);
        if (!lista) return;

        const produtosParaCarrinho = lista.itens.map(item => {
            const qtd = Number(item.quantidade) || 1;
            const precoTotalItem = Number(item.preco) || 0;
            const precoUnitario = precoTotalItem / qtd;

            return {
                nome: item.nome,
                marca: item.marca || "",
                descricao: item.descricao || "",
                imagem: item.imagem_url,
                preco: precoUnitario,
                quantidade: String(qtd)
            };
        });

        localStorage.setItem("meus_produtos", JSON.stringify(produtosParaCarrinho));
        localStorage.setItem("nome_lista_compras", lista.id);

        window.location.href = "../html/finalizar_compra.html";
    });
})();