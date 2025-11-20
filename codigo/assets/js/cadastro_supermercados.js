const supermercados = JSON.parse(localStorage.getItem("db_supermercados")) || [];

document.getElementById("cepMercado").addEventListener("input", function () {
  this.value = this.value
    .replace(/\D/g, "")
    .replace(/(\d{5})(\d{1,3})/, "$1-$2");
});

document.getElementById("telefoneMercado").addEventListener("input", function () {
  let v = this.value.replace(/\D/g, "");

  if (v.length <= 10) {
    this.value = v.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  } else {
    this.value = v.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
  }
});


function cadastrarMercado() {
  const nome = document.getElementById("nomeMercado").value.trim();
  const rua = document.getElementById("ruaMercado").value.trim();
  const numero = document.getElementById("numeroMercado").value.trim();
  const bairro = document.getElementById("bairroMercado").value.trim();
  const cidade = document.getElementById("cidadeMercado").value.trim();
  const estado = document.getElementById("estadoMercado").value.trim();
  const pais = document.getElementById("paisMercado").value.trim() || "Brasil";
  const cep = document.getElementById("cepMercado").value.trim();

  const telefone = document.getElementById("telefoneMercado").value.trim();
  const email = document.getElementById("emailMercado").value.trim();
  const imagem = document.getElementById("imagemMercado").files[0] || null;

  const latitude = document.getElementById("latitudeMercado").value.trim();
  const longitude = document.getElementById("longitudeMercado").value.trim();

  const acessSelect = document.getElementById("acessibilidadeMercado");
  const acessSelecionadas = [...acessSelect.options]
    .filter(opt => opt.selected)
    .map(opt => opt.value);

  if (!nome || !rua || !cidade || !estado) {
    alert("Preencha nome e endereço completo.");
    return;
  }

  if (cep && !/^\d{5}-?\d{3}$/.test(cep)) {
    alert("CEP inválido.");
    return;
  }

  if (!latitude || !longitude) {
    alert("Informe latitude e longitude.");
    return;
  }

  const enderecoCompleto = `${rua} ${numero ? numero + ", " : ""}${bairro ? bairro + ", " : ""}${cidade} - ${estado}, ${pais}`;

  const acessibilidadeJSON = {
    rampa: acessSelecionadas.includes("rampa") || null,
    elevador: acessSelecionadas.includes("elevador") || null,
    vagas: acessSelecionadas.includes("vagas") || null,
    piso: acessSelecionadas.includes("piso") || null,
    braille: acessSelecionadas.includes("braille") || null,
    preferencial: acessSelecionadas.includes("preferencial") || null,
    libras: acessSelecionadas.includes("libras") || null,
  };

  const novoMercado = {
    id: String(supermercados.length + 1),
    nome,
    logo: imagem ? imagem.name : "",
    endereco: enderecoCompleto,
    telefone,
    email,
    cep,
    horario: "",
    localizacao: {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude)
    },
    acessibilidade: acessibilidadeJSON,
    votos: {
      rampa: { likes: 0, dislikes: 0 },
      elevador: { likes: 0, dislikes: 0 },
      vagas: { likes: 0, dislikes: 0 },
      piso: { likes: 0, dislikes: 0 },
      braille: { likes: 0, dislikes: 0 },
      preferencial: { likes: 0, dislikes: 0 },
      libras: { likes: 0, dislikes: 0 }
    },
    comentarios: "",
    dataAtualizacao: new Date().toISOString()
  };

  supermercados.push(novoMercado);
  localStorage.setItem("db_supermercados", JSON.stringify(supermercados));

  alert(`Mercado cadastrado com sucesso!\nNome: ${nome}`);

  document.getElementById("formCadastro").reset();

  console.log("Supermercados cadastrados:", supermercados);
}

document.getElementById("btnCadastrar").addEventListener("click", cadastrarMercado);
