export class UsuarioService {
    constructor(baseUrl = "http://localhost:3001") {
      this.base = baseUrl;
      this.endpoint = `${this.base}/usuarios`;
    }
  
    async getUsuarios() {
      const r = await fetch(this.endpoint);
      return r.json();
    }
  
    async getUsuario(id) {
      const r = await fetch(`${this.endpoint}/${id}`);
      return r.json();
    }
  
    async criarUsuario(u) {
      await fetch(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(u)
      });
    }
  
    async atualizarUsuario(id, u) {
      await fetch(`${this.endpoint}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(u)
      });
    }
  
    async excluirUsuario(id) {
      await fetch(`${this.endpoint}/${id}`, { method: "DELETE" });
    }
}