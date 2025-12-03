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

  async criarHistorico(data) {
      const r = await fetch(this.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
      });

      return r.json();
  }
}
