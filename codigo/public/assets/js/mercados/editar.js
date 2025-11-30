import { MercadoService } from "../../../services/mercado-service.js";
import { AcessibilidadeService } from "../../../services/acessibilidade-service.js";

const mercadoService = new MercadoService();
const acessibilidadeService = new AcessibilidadeService();

const id = sessionStorage.getItem("mercadoId");
const form = document.querySelector("#formEditar");
const selectAcessibilidade = document.querySelector("#acessibilidadeMercado");

async function carregarDados() {
    if (!id) {
        alert("Nenhum mercado selecionado!");
        window.location.href = "./index.html";
        return;
    }

    const mercado = await mercadoService.getMercado(id);

    // Preencher campos do formulário
    form.nomeMercado.value = mercado.nome || "";
    form.cepMercado.value = mercado.endereco?.cep || "";
    form.ruaMercado.value = mercado.endereco?.rua || "";
    form.numeroMercado.value = mercado.endereco?.numero || "";
    form.bairroMercado.value = mercado.endereco?.bairro || "";
    form.cidadeMercado.value = mercado.endereco?.cidade || "";
    form.estadoMercado.value = mercado.endereco?.estado || "";
    form.paisMercado.value = mercado.endereco?.pais || "";
    form.telefoneMercado.value = mercado.telefone || "";
    form.emailMercado.value = mercado.email || "";
    form.logoMercado.value = mercado.logo || "";

    // Carregar acessibilidades no select
    const acessibilidades = await acessibilidadeService.getAcessibilidades();
    selectAcessibilidade.innerHTML = "";

    const mercadoAcessibilidades = mercado.acessibilidades?.map(Number) || [];

    acessibilidades.forEach(a => {
        const option = document.createElement("option");
        option.value = a.id;
        option.textContent = a.tipo;
        if (mercadoAcessibilidades.includes(a.id)) {
            option.selected = true;
        }
        selectAcessibilidade.appendChild(option);
    });
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const acessibilidadesSelecionadas = Array.from(selectAcessibilidade.selectedOptions)
        .map(option => Number(option.value));

    const dadosAtualizados = {
        nome: form.nomeMercado.value,
        endereco: {
            cep: form.cepMercado.value,
            rua: form.ruaMercado.value,
            numero: form.numeroMercado.value,
            bairro: form.bairroMercado.value,
            cidade: form.cidadeMercado.value,
            estado: form.estadoMercado.value,
            pais: form.paisMercado.value
        },
        telefone: form.telefoneMercado.value,
        email: form.emailMercado.value,
        logo: form.logoMercado.value,
        acessibilidades: acessibilidadesSelecionadas
    };

    await mercadoService.atualizarMercado(id, dadosAtualizados);

    alert("Mercado atualizado com sucesso!");
    window.location.href = "./index.html";
});

carregarDados();
