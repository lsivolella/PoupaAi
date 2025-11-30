export function formatarMoeda(valor) {
    if (valor == null) return "";
    return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
