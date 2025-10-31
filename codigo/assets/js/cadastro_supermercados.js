const supermercados = [];

function cadastrarMercado() {
  const nome = document.getElementById("nomeMercado").value.trim();
  const rua = document.getElementById("ruaMercado").value.trim();
  const numero = document.getElementById("numeroMercado").value.trim();
  const bairro = document.getElementById("bairroMercado").value.trim();
  const cidade = document.getElementById("cidadeMercado").value.trim();
  const estado = document.getElementById("estadoMercado").value.trim();
  const pais = document.getElementById("paisMercado").value.trim() || "Brasil";
  const acessibilidade = document.getElementById("acessibilidadeMercado").value.trim();
  const imagem = document.getElementById("imagemMercado").files[0] || null;

  if (!nome || !rua || !cidade || !estado || !pais) {
    alert("Preencha nome e endereço completo.");
    return;
  }

  const enderecoCompleto = `${rua} ${numero ? numero + ", " : ""}${bairro ? bairro + ", " : ""}${cidade}, ${estado}, ${pais}`;

  const novoMercado = {
    nome,
    endereco: enderecoCompleto,
    acessibilidade,
    imagem: imagem ? imagem.name : null
  };

  supermercados.push(novoMercado);
  localStorage.setItem("db_supermercados", JSON.stringify(supermercados));

  alert(`Mercado cadastrado com sucesso!\nNome: ${nome}\nEndereço: ${enderecoCompleto}`);

  document.getElementById("formCadastro").reset();

  console.log("Supermercados cadastrados:", supermercados);
}

document.getElementById("btnCadastrar").addEventListener("click", cadastrarMercado);
