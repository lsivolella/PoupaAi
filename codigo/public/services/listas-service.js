export class ListasService {
    constructor(baseUrl = "http://localhost:3001") {
      this.base = baseUrl;
      this.endpoint = `${this.base}/listasCompras`;
    }
  
    async getListas() {
      const r = await fetch(this.endpoint);
      return r.json();
    }
  
    async getLista(id) {
      const r = await fetch(`${this.endpoint}/${id}`);
      return r.json();
    }

    async getListasPorUsuario(usuarioId) {
      const r = await fetch(`${this.endpoint}?usuarioId=${usuarioId}`);
      return r.json();
    }
  
    async criarLista(lista) {
      await fetch(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lista)
      });
    }
  
    async atualizarLista(id, lista) {
      await fetch(`${this.endpoint}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lista)
      });
    }
  
    async excluirLista(id) {
      await fetch(`${this.endpoint}/${id}`, { method: "DELETE" });
    }

    async finalizarLista(id) {
      const r = await fetch(`${this.endpoint}/${id}`);
      const lista = await r.json();
  
      const historico = {
          usuarioId: lista.usuarioId,
          data: new Date().toISOString(),
          total: lista.valor,
          itens: lista.produtos.map(p => ({
              produtoId: p.produtoId,
              quantidade: p.quantidade,
              precoUnitario: p.valorUnitario
          })),
          status: "finalizada"
      };
  
      await fetch("http://localhost:3001/historicoCompras", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(historico)
      });
  
      await fetch(`${this.endpoint}/${id}`, {
          method: "DELETE"
      });
  
      return true;
  }  
}