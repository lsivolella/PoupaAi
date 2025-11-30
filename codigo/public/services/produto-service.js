export class ProdutoService {
    constructor(baseUrl = "http://localhost:3001") {
      this.base = baseUrl;
      this.endpoint = `${this.base}/produtos`;
    }
  
    async getProdutos() {
      const r = await fetch(this.endpoint);
      return r.json();
    }
  
    async getProduto(id) {
      const r = await fetch(`${this.endpoint}/${id}`);
      return r.json();
    }
  
    async criarProduto(produto) {
      await fetch(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(produto)
      });
    }
  
    async atualizarProduto(id, produto) {
      await fetch(`${this.endpoint}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(produto)
      });
    }
  
    async excluirProduto(id) {
      await fetch(`${this.endpoint}/${id}`, { method: "DELETE" });
    }
}