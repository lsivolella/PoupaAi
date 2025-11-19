/*const mock_compras = [
  {
    id: "#003",
    status: "Finalizado",
    data: new Date("2025-10-15T12:00:00"),
    itens: [
      {
        imagem_url: "../assets/img/arroz_branco_camil_1kg.jpg",
        preco: 7.20,
        nome: "Arroz Branco Camil 1kg"
      },
      {
        imagem_url: "../assets/img/aveia_integral_quaker_400g.png",
        preco: 8.50,
        nome: "Aveia Integral Quaker 400g"
      },
      {
        imagem_url: "../assets/img/feijao_preto_kicaldo_1kg.png",
        preco: 9.10,
        nome: "Feijão Preto Kicaldo 1kg"
      }
    ]
  },
  {
    id: "#002",
    status: "Em andamento",
    data: new Date("2025-10-14T12:00:00"),
    itens: [
      {
        imagem_url: "../assets/img/pao_forma_integral_visconti_500g.png",
        preco: 8.90,
        nome: "Pão de Forma Integral Visconti 500g"
      },
      {
        imagem_url: "../assets/img/veja_multiuso_500ml.png",
        preco: 6.70,
        nome: "Veja Multiuso 500ml"
      }
    ]
  },
  {
    id: "#001",
    status: "Finalizado",
    data: new Date("2025-10-13T12:00:00"),
    itens: [
      {
        imagem_url: "../assets/img/arroz_branco_camil_1kg.jpg",
        preco: 7.20,
        nome: "Arroz Branco Camil 1kg"
      },
      {
        imagem_url: "../assets/img/feijao_preto_kicaldo_1kg.png",
        preco: 9.10,
        nome: "Feijão Preto Kicaldo 1kg"
      },
      {
        imagem_url: "../assets/img/veja_multiuso_500ml.png",
        preco: 6.70,
        nome: "Veja Multiuso 500ml"
      }
    ]
  }
];*/

const listas = JSON.parse(localStorage.getItem("listas"));

function renderizarCards() {
  let html = "";
  const totalCompras = listas.length;
  for (let i = 0; i < totalCompras; i++) {
    const compra = listas[i];
    const totalItens = compra.itens.length;
    let precoTotal = 0;
    for (let j = 0; j < totalItens; j++) {
      precoTotal += compra.itens[j].preco;
    }
    let imagensHTML = "";

    if (totalItens === 1) {
      imagensHTML += `
        <div class="fundo-de-imagem">
          <img src="${compra.itens[0].imagem_url}" alt="">
        </div>
      `;
    }
    else if (totalItens === 2) {
      imagensHTML += `
        <div class="fundo-de-imagem">
          <img src="${compra.itens[0].imagem_url}" alt="">
        </div>
        <div class="fundo-de-imagem">
          <img src="${compra.itens[1].imagem_url}" alt="">
        </div>
      `;
    }
    else {
      imagensHTML += `
        <div class="fundo-de-imagem">
          <img src="${compra.itens[0].imagem_url}" alt="">
        </div>
        <div class="fundo-de-imagem">
          <img src="${compra.itens[1].imagem_url}" alt="">
        </div>
        <div class="fundo-de-imagem">
          <h1>+${totalItens - 2}</h1>
        </div>
      `;
    }
    html += `
      <div class="card">
        <div id="card-data">
          <span>Data do pedido: </span>
          <span>${new Date(compra.data).toLocaleDateString("pt-BR")}</span>
        </div>

        <div id="status-id-preco">
          <div id="status-id">
            <h4>${compra.status}</h4>
            <h2>${compra.id}</h2>
          </div>

          <div id="preco">
            <h2>R$${precoTotal.toFixed(2)}</h2>
          </div>
        </div>

        <div id="imagensprodutos-detalhes">
          <div id="imagensprodutos">
            ${imagensHTML}
          </div>

          <div id="botao-detlhes">
            <button>Detalhes</button>
          </div>
        </div>
      </div>
    `;
  }

  return html;
}

document.getElementById("cards").innerHTML = renderizarCards();