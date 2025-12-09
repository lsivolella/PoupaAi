const searchInput = document.querySelector("#searchInput");
const searchButton = document.querySelector("#searchButton");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userLogged = document.getElementById("userLogged");
const userGreeting = document.getElementById("userGreeting");
const userAvatar = document.getElementById("userAvatar");
const cartBadge = document.getElementById("cartBadge");

const LOGIN_PAGE = "/codigo/public/views/usuarios/login.html";
const DEFAULT_AVATAR = "/codigo/public/assets/img/Avatar_Usuario.svg";

document.addEventListener("DOMContentLoaded", () => {
  configurarSearchInput();
  verificarLogin();
  carregarCarrinho();
});

function verificarLogin() {
  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

  if (usuarioLogado) {
    mostrarUsuarioLogado(usuarioLogado);
  } else {
    mostrarBotaoLogin();
  }
}

function configurarSearchInput() {
  if (searchButton && searchInput) {
    searchButton.addEventListener("click", realizarBusca);

    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        realizarBusca();
      }
    });
  }
}

function realizarBusca() {
  const termo = searchInput.value.trim();

  if (termo === "") {
    mostrarNotificacao("Digite algo para buscar", "warning");
    return;
  }

  sessionStorage.setItem("searchKey", String(termo));
  window.location.href = `/codigo/public/views/produtos/index.html`;
}

function mostrarUsuarioLogado(usuario) {
  if (loginBtn) {
    loginBtn.style.display = "none";
  }

  if (userLogged) {
    userLogged.style.display = "flex";
  }

  if (userGreeting) {
    const primeiroNome = usuario.nome.split(" ")[0];
    userGreeting.textContent = `Olá, ${primeiroNome}!`;
  }

  if (userAvatar) {
    if (usuario.avatar && usuario.avatar !== "") {
      userAvatar.src = usuario.avatar;
    } else {
      userAvatar.src = DEFAULT_AVATAR;
    }

    userAvatar.onerror = function () {
      this.src = DEFAULT_AVATAR;
    };
  }
}

function mostrarBotaoLogin() {
  if (loginBtn) {
    loginBtn.style.display = "flex";
  }

  if (userLogged) {
    userLogged.style.display = "none";
  }
}

if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    console.log("Redirecionando para:", LOGIN_PAGE);
    window.location.href = LOGIN_PAGE;
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    realizarLogout();
  });
}

function realizarLogout() {
  const confirmar = confirm("Tem certeza que deseja sair?");

  if (confirmar) {
    localStorage.removeItem("usuarioLogado");
    localStorage.removeItem("lembrarLogin");

    window.location.reload();
  }
}

function carregarCarrinho() {
  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  const totalItens = carrinho.reduce(
    (total, item) => total + (item.quantidade || 1),
    0
  );

  if (cartBadge) {
    cartBadge.textContent = totalItens;
  }
}

// CORRIGIDO: Caminho absoluto para funcionar em todas as páginas
if (document.getElementById("cartBtn")) {
  document.getElementById("cartBtn").addEventListener("click", () => {
    console.log("🛒 Abrindo carrinho...");
    window.location.href = "/codigo/public/views/carrinho/index.html";
  });
}

function atualizarCarrinho(produto, quantidade = 1) {
  let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

  const indiceExistente = carrinho.findIndex((item) => item.id === produto.id);

  if (indiceExistente !== -1) {
    carrinho[indiceExistente].quantidade += quantidade;
  } else {
    carrinho.push({
      ...produto,
      quantidade: quantidade,
    });
  }

  localStorage.setItem("carrinho", JSON.stringify(carrinho));

  carregarCarrinho();

  if (typeof mostrarNotificacao === "function") {
    mostrarNotificacao("Produto adicionado ao carrinho!");
  }
}

function mostrarNotificacao(mensagem, tipo = "success") {
  const notificacaoAnterior = document.querySelector(".toast-notification");
  if (notificacaoAnterior) {
    notificacaoAnterior.remove();
  }

  const toast = document.createElement("div");
  toast.className = `toast-notification toast-${tipo}`;
  toast.innerHTML = `
    <i class="bi bi-check-circle"></i>
    <span>${mensagem}</span>
  `;

  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${tipo === "success" ? "#28a745" : tipo === "error" ? "#dc3545" : "#0066cc"
    };
    color: white;
    padding: 15px 25px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    font-weight: 500;
    z-index: 9999;
    display: flex;
    align-items: center;
    gap: 10px;
    animation: slideIn 0.3s ease;
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "slideOut 0.3s ease";
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

const style = document.createElement("style");
style.textContent = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideOut {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(100%);
    }
  }

  @media (max-width: 768px) {
    .toast-notification {
      top: 10px !important;
      right: 10px !important;
      left: 10px !important;
      font-size: 14px !important;
      padding: 12px 20px !important;
    }
  }
`;
document.head.appendChild(style);

console.log("Navbar carregado com sucesso!");