import { ProdutoService } from "../../../services/produto-service.js";

const produtoService = new ProdutoService();

export async function excluirProdutoById(id) {
  await produtoService.excluirProduto(id);
}

export function confirmarExcluirERecarregar(id) {
  if (confirm("Deseja excluir o produto?")) {
    excluirProdutoById(id).then(() => location.reload());
  }
}

document.querySelector("#btn-excluir").addEventListener("click", () => {
  const id = sessionStorage.getItem("id");
  import("../../assets/js/produtos/excluir.js").then((mod) => {
    mod.confirmarExcluirERecarregar(id);
  });
});
