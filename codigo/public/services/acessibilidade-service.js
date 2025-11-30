export class AcessibilidadeService {
    constructor(baseUrl = "http://localhost:3001") {
      this.base = baseUrl;
      this.endpoint = `${this.base}/acessibilidades`;
    }
  
    async getAcessibilidades() {
      const r = await fetch(this.endpoint);
      return r.json();
    }
  
    async getAcessibilidade(id) {
      const r = await fetch(`${this.endpoint}/${id}`);
      return r.json();
    }
  
    async criarAcessibilidade(data) {
      await fetch(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
    }
  
    async atualizarAcessibilidade(id, data) {
      await fetch(`${this.endpoint}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
    }
  
    async excluirAcessibilidade(id) {
      await fetch(`${this.endpoint}/${id}`, {
        method: "DELETE"
      });
    }
}
  