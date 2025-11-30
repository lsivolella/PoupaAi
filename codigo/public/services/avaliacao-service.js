export class AvaliacaoService {
    constructor(baseUrl = "http://localhost:3001") {
      this.base = baseUrl;
      this.endpoint = `${this.base}/avaliacoes`;
    }
  
    async getAvaliacoes() {
      const r = await fetch(this.endpoint);
      return r.json();
    }
  
    async getAvaliacao(id) {
      const r = await fetch(`${this.endpoint}/${id}`);
      return r.json();
    }
  
    async criarAvaliacao(data) {
      await fetch(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
    }
  
    async atualizarAvaliacao(id, data) {
      await fetch(`${this.endpoint}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
    }
  
    async excluirAvaliacao(id) {
      await fetch(`${this.endpoint}/${id}`, { method: "DELETE" });
    }
}