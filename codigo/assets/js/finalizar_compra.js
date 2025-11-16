const produtos_do_carrinho = JSON.parse(localStorage.getItem("meus_produtos"));
const totalItens = produtos_do_carrinho.length
function linhaDeItens() {
    let html1 = ""
    for (let i = 0; i < totalItens; i++) {
        const produto_atual = produtos_do_carrinho[i]
        html1 += `
            <tr>
              <td>
                <figure>
                  <img src="${produto_atual.imagem}">
                  <figcaption>${produto_atual.nome}</figcaption>    
                </figure>
              </td>
              <td>
                <span>R$ ${produto_atual.preco.toFixed(2)}</span>
              </td>
              <td>
                <span>${produto_atual.quantidade}</span>
              </td>
              <td>
                <span>R$ ${(produto_atual.preco*produto_atual.quantidade).toFixed(2)}</span>
              </td>
            </tr>
        `
    }
    return html1
}
document.getElementById("produtos").innerHTML = linhaDeItens()

function precoTotal() {
    let precoTotal = 0;
    for (let i = 0; i < totalItens; i++){
        const produto_atual = produtos_do_carrinho[i]
        precoTotal += produto_atual.preco*produto_atual.quantidade
    }
    return precoTotal;
}

function resumoDoCarrinho() {
    const html2 = `
    <h2>Resumo do Carrinho</h2>
        <p>Carrinho referente a lista: <strong>${localStorage.getItem("nome_lista_compras")}</strong></p>
        <p>Sub-total: <strong>R$ ${precoTotal().toFixed(2)}</strong></p>
        <div class="calcular-frete">
          <span>Cálculo do frete: </span>
          <form>
            <input type="text" name="frete" id="frete" placeholder="Digite o seu CEP">
          </form>
        </div>
        <p>Valor do Frete: <strong>Grátis</strong></p>
        <p>Total: <strong>R$ ${precoTotal().toFixed(2)}</strong></p>
    `
    return html2
}
document.getElementById("resumo").innerHTML = resumoDoCarrinho()

document.getElementById("finalizacao").addEventListener('click', () => {
        let listas_usuario = localStorage.getItem("listas");
        if (listas_usuario) {
            listas_usuario = JSON.parse(listas_usuario);
        } else {
            listas_usuario = [];
        }
        const itens = [];
        for (let i = 0; i < totalItens; i++) {
            const produto_atual = produtos_do_carrinho[i]
            const item = {
                imagem_url: produto_atual.imagem,
                preco: produto_atual.preco*produto_atual.quantidade,
                nome: produto_atual.nome
            }
            itens.push(item);
        }
        const lista = {
            id: localStorage.getItem("nome_lista_compras"),
            status: "Finalizado",
            data: new Date(),
            itens: itens
        }
        listas_usuario.push(lista);
        localStorage.setItem("listas", JSON.stringify(listas_usuario));
        window.location.href= "../html/historico_de_compras.html"
        /*localStorage.removeItem('meus_produtos');
        localStorage.removeItem('nome_lista_compras');*/
    });