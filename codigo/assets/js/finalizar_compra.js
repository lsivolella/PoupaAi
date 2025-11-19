let produtos_do_carrinho = JSON.parse(localStorage.getItem("meus_produtos")) || [];
let totalItens = produtos_do_carrinho.length;

function linhaDeItens() {

  // Se não tiver nada no carrinho
  if (totalItens === 0) {
    return `
            <tr>
                <td colspan="4" style="text-align:center;">
                    Nenhum produto no carrinho
                </td>
            </tr>
        `;
  }

  let html1 = "";

  for (let i = 0; i < totalItens; i++) {

    const produto_atual = produtos_do_carrinho[i];

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
                <span>R$ ${(produto_atual.preco * produto_atual.quantidade).toFixed(2)}</span>
              </td>
            </tr>
        `;
  }
  return html1;
}

// Renderiza tabela
document.getElementById("produtos").innerHTML = linhaDeItens();

function precoTotal() {

  let total = 0;

  for (let i = 0; i < totalItens; i++) {
    const produto_atual = produtos_do_carrinho[i];
    total += produto_atual.preco * produto_atual.quantidade;
  }

  return total;
}

function resumoDoCarrinho() {

  return `
    <h2>Resumo do Carrinho</h2>
        <p>Carrinho referente a lista: <strong>${localStorage.getItem("nome_lista_compras") || "(sem nome)"}</strong></p>
        <p>Sub-total: <strong>R$ ${precoTotal().toFixed(2)}</strong></p>
        <div class="calcular-frete">
          <span>Cálculo do frete: </span>
          <form>
            <input type="text" name="frete" id="frete" placeholder="Digite o seu CEP">
          </form>
        </div>
        <p>Valor do Frete: <strong>Grátis</strong></p>
        <p>Total: <strong>R$ ${precoTotal().toFixed(2)}</strong></p>
    `;
}

document.getElementById("resumo").innerHTML = resumoDoCarrinho();

document.getElementById("finalizacao").addEventListener('click', () => {

  let listas_usuario = JSON.parse(localStorage.getItem("listas")) || [];

  const itens = produtos_do_carrinho.map(produto_atual => ({
    imagem_url: produto_atual.imagem,
    preco: produto_atual.preco * produto_atual.quantidade,
    nome: produto_atual.nome
  }));

  const lista = {
    id: localStorage.getItem("nome_lista_compras") || "Sem nome",
    status: "Finalizado",
    data: new Date(),
    itens: itens
  };

  listas_usuario.push(lista);

  localStorage.setItem("listas", JSON.stringify(listas_usuario));

  window.location.href = "../html/historico_de_compras.html";

  // limpar o carrinho
  // localStorage.removeItem('meus_produtos');
  // localStorage.removeItem('nome_lista_compras');
});
