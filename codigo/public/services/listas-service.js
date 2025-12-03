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
}