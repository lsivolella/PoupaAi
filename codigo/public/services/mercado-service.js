export class MercadoService {
    constructor(baseUrl = "http://localhost:3001") {
      this.base = baseUrl;
      this.endpoint = `${this.base}/mercados`;
    }
  
    async getMercados() {
      const r = await fetch(this.endpoint);
      return r.json();
    }
  
    async getMercado(id) {
      const r = await fetch(`${this.endpoint}/${id}`);
      return r.json();
    }
  
    async criarMercado(data) {
      await fetch(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
    }
  
    async atualizarMercado(id, data) {
      await fetch(`${this.endpoint}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
    }
  
    async excluirMercado(id) {
      await fetch(`${this.endpoint}/${id}`, { method: "DELETE" });
    }
  }