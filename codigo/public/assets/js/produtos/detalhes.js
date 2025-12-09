import { ProdutoService } from "../../../services/produto-service.js";

const produtoService = new ProdutoService();

const imgProduto = document.querySelector("#img-produto");
const detNome = document.querySelector("#det-nome");
const detCategoria = document.querySelector("#det-categoria");
const detMarca = document.querySelector("#det-marca");
const detUnidade = document.querySelector("#det-unidade");
const detTamanho = document.querySelector("#det-tamanho");
const detDescricao = document.querySelector("#det-descricao");

const btnExcluir = document.querySelector("#btn-excluir");
const btnEditar = document.querySelector("#btn-editar");

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

async function getMercadoName(idMercado) {
  if (!idMercado) return "Não informado";

  const r = await fetch(`http://localhost:3001/mercados/${idMercado}`);
  if (!r.ok) return "Desconhecido";

  const m = await r.json();
  return m.nome || "Desconhecido";
}

// ✅ NOVA FUNÇÃO: Verifica se usuário é admin
function verificarPermissaoAdmin() {
  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

  // Se não está logado ou não é admin, esconde botões
  if (!usuarioLogado || usuarioLogado.tipo !== "admin") {
    if (btnEditar) {
      btnEditar.style.display = "none";
    }
    if (btnExcluir) {
      btnExcluir.style.display = "none";
    }

    console.log("👤 Usuário comum - Botões de admin ocultos");
    return false;
  }

  console.log("👨‍💼 Admin logado - Botões de admin visíveis");
  return true;
}

async function carregarDetalhes() {
  const produto = await produtoService.getProduto(id);

  if (!produto) {
    alert("Produto não encontrado!");
    window.location.href = "index.html";
    return;
  }

  // ✅ Corrige caminho da imagem
  let imagemUrl = produto.imagem_url || "";

  if (imagemUrl && !imagemUrl.startsWith("http")) {
    // Remove ../ se começar com ele
    if (imagemUrl.startsWith("../")) {
      imagemUrl = imagemUrl.substring(3);
    }

    // Se começar com "assets/", adiciona /codigo/public/
    if (imagemUrl.startsWith("assets/")) {
      imagemUrl = `/codigo/public/${imagemUrl}`;
    }
    // Se começar com "img/", adiciona /codigo/public/assets/
    else if (imagemUrl.startsWith("img/")) {
      imagemUrl = `/codigo/public/assets/${imagemUrl}`;
    }
    // Se não tiver caminho completo, assume que está em assets/img/
    else if (!imagemUrl.startsWith("/")) {
      imagemUrl = `/codigo/public/assets/img/${imagemUrl}`;
    }
  }

  imgProduto.src = imagemUrl;
  imgProduto.onerror = function () {
    this.src = "https://via.placeholder.com/300/cccccc/666666?text=Sem+Imagem";
  };

  detNome.textContent = produto.nome;
  detCategoria.textContent = produto.categoria;
  detMarca.textContent = produto.marca;
  detUnidade.textContent = produto.unidade_medida;
  detTamanho.textContent = produto.tamanho_embalagem;
  detDescricao.textContent = produto.descricao || "Sem descrição";

  // ✅ Verifica se é admin antes de configurar botões
  const isAdmin = verificarPermissaoAdmin();

  if (isAdmin) {
    // Configura botão editar
    if (btnEditar) {
      btnEditar.href = `editar.html?id=${produto.id}`;
    }

    // Configura botão excluir
    if (btnExcluir) {
      btnExcluir.onclick = async () => {
        const confirma = confirm(
          `Tem certeza que deseja excluir o produto "${produto.nome}"?\n\nEsta ação não pode ser desfeita.`
        );
        if (!confirma) return;

        try {
          btnExcluir.disabled = true;
          btnExcluir.innerHTML =
            '<span class="spinner-border spinner-border-sm"></span> Excluindo...';

          await produtoService.excluirProduto(produto.id);

          mostrarNotificacao("Produto excluído com sucesso!", "success");

          setTimeout(() => {
            window.location.href = "index.html";
          }, 1500);
        } catch (erro) {
          console.error("Erro ao excluir produto:", erro);
          mostrarNotificacao(
            "Erro ao excluir produto. Tente novamente.",
            "error"
          );
          btnExcluir.disabled = false;
          btnExcluir.innerHTML = '<i class="bi bi-trash"></i> Excluir';
        }
      };
    }
  }
}

function mostrarNotificacao(mensagem, tipo = "success") {
  const notification = document.createElement("div");
  notification.textContent = mensagem;
  notification.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: ${tipo === "success" ? "#28a745" : "#dc3545"};
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    z-index: 9999;
    animation: slideIn 0.3s ease;
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// CSS das animações
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
`;
document.head.appendChild(style);

// Carrega detalhes ao iniciar
carregarDetalhes();

console.log("✅ Sistema de detalhes carregado!");
