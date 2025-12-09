import { ProdutoService } from "../../../services/produto-service.js";
import { formatarMoeda } from "../../../utils/formatador.js";

const produtoService = new ProdutoService();
const tabela = document.querySelector("#tabela-produtos");

// Verifica se usuário é admin
function verificarPermissaoAdmin() {
  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

  const isAdmin = usuarioLogado && usuarioLogado.tipo === "admin";

  console.log(isAdmin ? "👨‍💼 Admin logado" : "👤 Usuário comum");

  return isAdmin;
}

// Esconde botão "Cadastrar Produto" se não for admin
function controlarBotaoCadastrar() {
  const btnCadastrar = document.querySelector('a[href="criar.html"]');

  if (!btnCadastrar) return;

  const isAdmin = verificarPermissaoAdmin();

  if (!isAdmin) {
    btnCadastrar.style.display = "none";
    console.log("Botão 'Cadastrar Produto' ocultado");
  } else {
    console.log("Botão 'Cadastrar Produto' visível");
  }
}

async function criarListaDetalhes() {
  const produtos = await produtoService.getProdutos();
  const isAdmin = verificarPermissaoAdmin();

  tabela.innerHTML = "";

  produtos.forEach((produto) => {
    const tr = document.createElement("tr");

    // Pega o menor preço entre as ocorrências
    let menorPreco = "N/A";
    if (produto.ocorrencias && produto.ocorrencias.length > 0) {
      const precos = produto.ocorrencias.map((o) => o.preco);
      const precoMinimo = Math.min(...precos);
      menorPreco = precoMinimo.toFixed(2).replace(".", ",");
    }

    // Corrige caminho da imagem - tenta múltiplos caminhos
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

    // Monta HTML com botão de excluir APENAS se for admin
    const botoesAcao = isAdmin
      ? `
        <a href="detalhes.html?id=${produto.id}" class="btn btn-sm btn-info" title="Ver detalhes">
          <i class="bi bi-eye"></i> Detalhes
        </a>
        <button class="btn btn-sm btn-danger btn-excluir-produto" data-id="${produto.id}" title="Excluir produto">
          <i class="bi bi-trash"></i> Excluir
        </button>
      `
      : `
        <a href="detalhes.html?id=${produto.id}" class="btn btn-sm btn-info" title="Ver detalhes">
          <i class="bi bi-eye"></i> Detalhes
        </a>
      `;

    tr.innerHTML = `
      <td style="display:none;">${produto.id}</td>
      <td>${produto.nome}</td>
      <td>${produto.categoria}</td>
      <td><strong class="text-success">R$ ${menorPreco}</strong></td>
      <td>
        <img 
          src="${imagemUrl}" 
          alt="${produto.nome}" 
          width="50"
          height="50"
          style="border-radius: 4px; object-fit: cover;"
          onerror="this.src='https://via.placeholder.com/50/cccccc/666666?text=IMG'"
        >
      </td>
      <td>${botoesAcao}</td>
    `;

    tabela.appendChild(tr);
  });

  // Só adiciona eventos de excluir se for admin
  if (isAdmin) {
    adicionarEventosExcluir();
  }

  console.log(`📊 ${produtos.length} produtos carregados na tabela`);
}

function adicionarEventosExcluir() {
  const botoesExcluir = document.querySelectorAll(".btn-excluir-produto");

  botoesExcluir.forEach((botao) => {
    botao.addEventListener("click", async () => {
      const id = botao.dataset.id;

      const produto = await produtoService.getProduto(id);
      const nomeProduto = produto ? produto.nome : "este produto";

      if (
        confirm(
          `Tem certeza que deseja excluir "${nomeProduto}"?\n\nEsta ação não pode ser desfeita.`
        )
      ) {
        try {
          // Desabilita botão e mostra loading
          botao.disabled = true;
          botao.innerHTML =
            '<span class="spinner-border spinner-border-sm"></span>';

          await produtoService.excluirProduto(id);

          // Remove a linha da tabela
          botao.closest("tr").remove();

          mostrarNotificacao("Produto excluído com sucesso!", "success");
        } catch (erro) {
          console.error("Erro ao excluir produto:", erro);
          mostrarNotificacao(
            "Erro ao excluir produto. Tente novamente.",
            "error"
          );

          // Restaura botão
          botao.disabled = false;
          botao.innerHTML = '<i class="bi bi-trash"></i> Excluir';
        }
      }
    });
  });
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

// Executa ao carregar a página
window.addEventListener("load", () => {
  controlarBotaoCadastrar();
  criarListaDetalhes();
});

