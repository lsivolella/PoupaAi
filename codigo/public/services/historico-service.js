export class HistoricoService {
    constructor(baseUrl = "http://localhost:3001") {
      this.base = baseUrl;
      this.endpoint = `${this.base}/historicoCompras`;
    }
  
    async getHistorico() {
      const r = await fetch(this.endpoint);
      return r.json();
    }
  
    async getCompra(id) {
      const r = await fetch(`${this.endpoint}/${id}`);
      return r.json();
    }
}