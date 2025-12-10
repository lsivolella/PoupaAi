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
    if (this.autoPlayInterval) clearInterval(this.autoPlayInterval);
  }
}

async function carregarOfertas() {
  try {
    const response = await fetch(`/api/promocoes?ativa=true&_limit=8`);
    if (!response.ok) throw new Error("Erro ao carregar ofertas");

    const promocoes = await response.json();

    const ofertasCompletas = await Promise.all(
      promocoes.map(async (promo) => {
        const produtoRes = await fetch(`/api/produtos/${promo.produtoId}`);
        const produto = await produtoRes.json();

        const mercadoRes = await fetch(`/api/mercados/${promo.mercadoId}`);
        const mercado = await mercadoRes.json();

        return { ...promo, produto, mercado };
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
          <img src="${oferta.produto.imagem_url}" alt="${oferta.produto.nome}"
               onerror="this.src='/assets/img/placeholder-produto.png'">
        </div>
        <div class="offer-content">
          <div class="offer-market">
            <i class="bi bi-shop"></i> ${oferta.mercado.nome}
          </div>
          <h3 class="offer-title">${oferta.produto.nome}</h3>
          <p class="offer-brand">${oferta.produto.marca}</p>
          <div class="offer-price">
            <span class="price-old">R$ ${formatarPreco(oferta.precoOriginal)}</span>
            <span class="price-new">R$ ${formatarPreco(oferta.precoPromocional)}</span>
          </div>
          <div class="offer-description">${oferta.descricao}</div>
          <button class="btn-add-cart" onclick="adicionarAoCarrinho(${oferta.produtoId}, ${oferta.mercadoId})">
            <i class="bi bi-cart-plus"></i> Adicionar ao Carrinho
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
        <i class="bi bi-arrow-clockwise"></i> Tentar Novamente
      </button>
    </div>
  `;
}

// =====================================
// Carrinho
// =====================================
async function adicionarAoCarrinho(produtoId, mercadoId) {
  try {
    const response = await fetch(`/api/produtos/${produtoId}`);
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
      produtoId,
      mercadoId,
      nome: produto.nome,
      marca: produto.marca,
      imagem: produto.imagem_url,
      preco: ocorrencia.preco,
      quantidade: 1,
    };

    let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

    const indiceExistente = carrinho.findIndex((item) => item.id === itemCarrinho.id);

    if (indiceExistente !== -1) {
      carrinho[indiceExistente].quantidade += 1;
      mostrarNotificacao("Quantidade atualizada no carrinho!", "success");
    } else {
      carrinho.push(itemCarrinho);
      mostrarNotificacao("Produto adicionado ao carrinho!", "success");
    }

    localStorage.setItem("carrinho", JSON.stringify(carrinho));
    if (typeof carregarCarrinho === "function") carregarCarrinho();
  } catch (error) {
    console.error("Erro ao adicionar ao carrinho:", error);
    mostrarNotificacao("Erro ao adicionar produto", "error");
  }
}
function calcularDesconto(precoOriginal, precoPromocional) {
  return Math.round(((precoOriginal - precoPromocional) / precoOriginal) * 100);
}

function formatarPreco(preco) {
  return preco.toFixed(2).replace(".", ",");
}

document.addEventListener("DOMContentLoaded", () => {
  new Carousel();
  carregarOfertas();

  console.log("✅ Sistema de busca da Home carregado e corrigido");
});
