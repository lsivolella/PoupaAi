const API_URL = "http://localhost:3001";

class Carousel {
  constructor() {
    this.wrapper = document.getElementById("carouselWrapper");
    this.slides = document.querySelectorAll(".carousel-slide");
    this.prevBtn = document.getElementById("prevBtn");
    this.nextBtn = document.getElementById("nextBtn");
    this.indicators = document.getElementById("carouselIndicators");

    this.currentIndex = 0;
    this.totalSlides = this.slides.length;
    this.autoPlayInterval = null;

    this.init();
  }

  init() {
    if (this.totalSlides === 0) return;

    this.createIndicators();

    this.prevBtn.addEventListener("click", () => this.prev());
    this.nextBtn.addEventListener("click", () => this.next());

    this.startAutoPlay();

    this.wrapper.addEventListener("mouseenter", () => this.stopAutoPlay());
    this.wrapper.addEventListener("mouseleave", () => this.startAutoPlay());

    this.goToSlide(0);
  }

  createIndicators() {
    for (let i = 0; i < this.totalSlides; i++) {
      const indicator = document.createElement("div");
      indicator.classList.add("indicator");
      if (i === 0) indicator.classList.add("active");

      indicator.addEventListener("click", () => this.goToSlide(i));
      this.indicators.appendChild(indicator);
    }
  }

  goToSlide(index) {
    this.currentIndex = index;
    const offset = -index * 100;
    this.wrapper.style.transform = `translateX(${offset}%)`;

    const allIndicators = this.indicators.querySelectorAll(".indicator");
    allIndicators.forEach((ind, i) => {
      ind.classList.toggle("active", i === index);
    });
  }

  next() {
    const nextIndex = (this.currentIndex + 1) % this.totalSlides;
    this.goToSlide(nextIndex);
  }

  prev() {
    const prevIndex =
      (this.currentIndex - 1 + this.totalSlides) % this.totalSlides;
    this.goToSlide(prevIndex);
  }

  startAutoPlay() {
    this.autoPlayInterval = setInterval(() => this.next(), 5000);
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
    }
  }
}

async function carregarOfertas() {
  try {
    const response = await fetch(`${API_URL}/promocoes?ativa=true&_limit=8`);

    if (!response.ok) {
      throw new Error("Erro ao carregar ofertas");
    }

    const promocoes = await response.json();

    const ofertasCompletas = await Promise.all(
      promocoes.map(async (promo) => {
        const produtoRes = await fetch(
          `${API_URL}/produtos/${promo.produtoId}`
        );
        const produto = await produtoRes.json();

        const mercadoRes = await fetch(
          `${API_URL}/mercados/${promo.mercadoId}`
        );
        const mercado = await mercadoRes.json();

        return {
          ...promo,
          produto,
          mercado,
        };
      })
    );

    renderizarOfertas(ofertasCompletas);
  } catch (error) {
    console.error("Erro ao carregar ofertas:", error);
    mostrarErroOfertas();
  }
}

function renderizarOfertas(ofertas) {
  const container = document.getElementById("offersContainer");

  if (ofertas.length === 0) {
    container.innerHTML = `
      <div class="no-offers">
        <i class="bi bi-inbox"></i>
        <p>Nenhuma oferta disponível no momento.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = ofertas
    .map((oferta) => {
      const desconto = calcularDesconto(
        oferta.precoOriginal,
        oferta.precoPromocional
      );

      return `
      <div class="offer-card">
        <div class="offer-badge">-${desconto}%</div>
        <div class="offer-image">
          <img src="${oferta.produto.imagem_url}" alt="${
        oferta.produto.nome
      }" onerror="this.src='./assets/img/placeholder-produto.png'">
        </div>
        <div class="offer-content">
          <div class="offer-market">
            <i class="bi bi-shop"></i>
            ${oferta.mercado.nome}
          </div>
          <h3 class="offer-title">${oferta.produto.nome}</h3>
          <p class="offer-brand">${oferta.produto.marca}</p>
          <div class="offer-price">
            <span class="price-old">R$ ${formatarPreco(
              oferta.precoOriginal
            )}</span>
            <span class="price-new">R$ ${formatarPreco(
              oferta.precoPromocional
            )}</span>
          </div>
          <div class="offer-description">
            ${oferta.descricao}
          </div>
          <button class="btn-add-cart" onclick="adicionarAoCarrinho(${
            oferta.produtoId
          }, ${oferta.mercadoId})">
            <i class="bi bi-cart-plus"></i>
            Adicionar ao Carrinho
          </button>
        </div>
      </div>
    `;
    })
    .join("");
}

function mostrarErroOfertas() {
  const container = document.getElementById("offersContainer");
  container.innerHTML = `
    <div class="error-offers">
      <i class="bi bi-exclamation-triangle"></i>
      <p>Não foi possível carregar as ofertas.</p>
      <button class="btn-retry" onclick="carregarOfertas()">
        <i class="bi bi-arrow-clockwise"></i>
        Tentar Novamente
      </button>
    </div>
  `;
}

async function adicionarAoCarrinho(produtoId, mercadoId) {
  try {
    const response = await fetch(`${API_URL}/produtos/${produtoId}`);
    const produto = await response.json();

    const ocorrencia = produto.ocorrencias.find(
      (o) => o.mercadoId === mercadoId
    );

    if (!ocorrencia) {
      mostrarNotificacao("Produto não disponível neste mercado", "error");
      return;
    }

    const itemCarrinho = {
      id: `${produtoId}-${mercadoId}`,
      produtoId: produtoId,
      mercadoId: mercadoId,
      nome: produto.nome,
      marca: produto.marca,
      imagem: produto.imagem_url,
      preco: ocorrencia.preco,
      quantidade: 1,
    };

    let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

    const indiceExistente = carrinho.findIndex(
      (item) => item.id === itemCarrinho.id
    );

    if (indiceExistente !== -1) {
      carrinho[indiceExistente].quantidade += 1;
      mostrarNotificacao("Quantidade atualizada no carrinho!", "success");
    } else {
      carrinho.push(itemCarrinho);
      mostrarNotificacao("Produto adicionado ao carrinho!", "success");
    }

    localStorage.setItem("carrinho", JSON.stringify(carrinho));

    if (typeof carregarCarrinho === "function") {
      carregarCarrinho();
    }
  } catch (error) {
    console.error("Erro ao adicionar ao carrinho:", error);
    mostrarNotificacao("Erro ao adicionar produto", "error");
  }
}

function calcularDesconto(precoOriginal, precoPromocional) {
  const desconto = ((precoOriginal - precoPromocional) / precoOriginal) * 100;
  return Math.round(desconto);
}

function formatarPreco(preco) {
  return preco.toFixed(2).replace(".", ",");
}

document.addEventListener("DOMContentLoaded", () => {
  new Carousel();

  carregarOfertas();

  console.log("✅ Sistema de busca da Home carregado e corrigido");
  console.log(
    "✅ Busca redireciona para: /codigo/public/views/produtos/index.html"
  );
});

const stylesAdicionais = document.createElement("style");
stylesAdicionais.textContent = `
  .no-offers,
  .error-offers {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    color: #6c757d;
    text-align: center;
  }

  .no-offers i,
  .error-offers i {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  .btn-retry {
    margin-top: 1rem;
    padding: 10px 20px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
    transition: all 0.3s ease;
  }

  .btn-retry:hover {
    background: #5568d3;
    transform: translateY(-2px);
  }

  .offer-card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: all 0.3s ease;
    position: relative;
  }

  .offer-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.15);
  }

  .offer-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    background: #ff4757;
    color: white;
    padding: 5px 12px;
    border-radius: 20px;
    font-weight: 700;
    font-size: 14px;
    z-index: 1;
  }

  .offer-image {
    width: 100%;
    height: 200px;
    overflow: hidden;
    background: #f8f9fa;
  }

  .offer-image img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .offer-content {
    padding: 15px;
  }

  .offer-market {
    font-size: 12px;
    color: #667eea;
    font-weight: 500;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .offer-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 5px;
    color: #2d3748;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .offer-brand {
    font-size: 13px;
    color: #6c757d;
    margin-bottom: 10px;
  }

  .offer-price {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
  }

  .price-old {
    font-size: 13px;
    color: #999;
    text-decoration: line-through;
  }

  .price-new {
    font-size: 22px;
    font-weight: 700;
    color: #43e97b;
  }

  .offer-description {
    font-size: 13px;
    color: #667eea;
    margin-bottom: 12px;
    font-weight: 500;
  }

  .btn-add-cart {
    width: 100%;
    padding: 12px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.3s ease;
  }

  .btn-add-cart:hover {
    background: #5568d3;
    transform: translateY(-2px);
  }

  .btn-add-cart:active {
    transform: translateY(0);
  }
`;
document.head.appendChild(stylesAdicionais);
