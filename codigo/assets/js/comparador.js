// Variáveis globais
let produtosCache = [];
let mercadosCache = [];
let listaAtual = { produtos: [] };
let ordemCrescente = true;
let ordemCrescenteBusca = true;

// Inicialização ao carregar a página
document.addEventListener('DOMContentLoaded', async () => {
  await inicializar();
  configurarEventListeners();
});

async function inicializar() {
  mostrarCarregando();
  
  try {
    produtosCache = await carregarProdutos();
    mercadosCache = await carregarMercados();
    carregarListaDoLocalStorage();
    
    console.log('Produtos carregados:', produtosCache.length);
    console.log('Mercados carregados:', mercadosCache.length);
    
    renderizarComparativoListas();
    
  } catch (erro) {
    console.error('Erro na inicialização:', erro);
    mostrarErro('Erro ao carregar dados.');
  } finally {
    ocultarCarregando();
  }
}

// Carregar produtos do JSON
async function carregarProdutos() {
  try {
    const response = await fetch('../assets/json/db_produtos.json');
    if (!response.ok) throw new Error('Erro ao carregar produtos');
    const data = await response.json();
    return data.produtos || [];
  } catch (erro) {
    console.error('Erro ao carregar produtos:', erro);
    return [];
  }
}

// Carregar mercados do JSON
async function carregarMercados() {
  try {
    const response = await fetch('../assets/json/db_supermercados.json');
    if (!response.ok) throw new Error('Erro ao carregar mercados');
    const data = await response.json();
    return data.mercados || [];
  } catch (erro) {
    console.error('Erro ao carregar mercados:', erro);
    return [];
  }
}

// ABA 1: Buscar e comparar produto específico
function buscarECompararProduto(termo) {
  const termoLower = termo.toLowerCase().trim();
  const listaBusca = document.getElementById('lista-busca');
  const secaoHeader = document.getElementById('secao-header-busca');
  
  if (!termoLower) {
    secaoHeader.style.display = 'none';
    listaBusca.innerHTML = `
      <div class="mensagem-vazia">
        <p style="font-size: 18px; margin-bottom: 12px;">🔍 Digite o nome de um produto</p>
        <p style="font-size: 14px; color: #999;">Exemplos: arroz, feijão, pão, aveia</p>
      </div>
    `;
    return;
  }
  
  const produtosEncontrados = produtosCache.filter(p => 
    p.nome.toLowerCase().includes(termoLower) ||
    p.marca.toLowerCase().includes(termoLower)
  );
  
  if (produtosEncontrados.length === 0) {
    secaoHeader.style.display = 'none';
    listaBusca.innerHTML = `
      <div class="mensagem-vazia">
        <p style="font-size: 18px; margin-bottom: 12px;">❌ Nenhum produto encontrado</p>
        <p style="font-size: 14px; color: #999;">Não encontramos "${termo}"</p>
      </div>
    `;
    return;
  }
  
  renderizarComparativoProduto(produtosEncontrados);
}

function renderizarComparativoProduto(produtos) {
  const listaBusca = document.getElementById('lista-busca');
  const secaoHeader = document.getElementById('secao-header-busca');
  const nomeProduto = document.getElementById('nome-produto-buscado');
  
  secaoHeader.style.display = 'flex';
  nomeProduto.textContent = produtos[0].nome.toUpperCase();
  
  let html = '';
  
  produtos.forEach(produto => {
    if (!produto.ocorrencias || produto.ocorrencias.length === 0) return;
    
    const precos = produto.ocorrencias.map(o => o.preco);
    const menorPreco = Math.min(...precos);
    
    html += `
      <div style="background-color: #f9f9f9; padding: 12px 16px; font-weight: bold; border-bottom: 2px solid #e0e0e0;">
        ${produto.marca} - ${produto.nome} ${produto.tamanho_embalagem}${produto.unidade_medida}
      </div>
    `;
    
    produto.ocorrencias.forEach(ocorrencia => {
      const mercado = mercadosCache.find(m => m.id == ocorrencia.mercadoId);
      if (!mercado) return;
      
      const isMelhorPreco = ocorrencia.preco === menorPreco;
      const economia = isMelhorPreco ? '' : `<span style="font-size: 12px; color: #ff4444;">+R$ ${formatarPreco(ocorrencia.preco - menorPreco)}</span>`;
      
      html += `
        <div class="produto" data-preco="${ocorrencia.preco}">
          <div class="produto-imagem">
            <img src="${produto.imagem_url}" alt="${produto.nome}" onerror="this.src='https://placehold.co/80x80/eee/999?text=Sem+Imagem'">
          </div>
          <div class="produto-info">
            <p class="produto-nome">${mercado.nome}</p>
            <p class="produto-detalhes">${mercado.endereco || 'Endereço não disponível'}</p>
            ${isMelhorPreco ? '<p style="color: #4CAF50; font-size: 12px; font-weight: bold; margin-top: 4px;">✓ MELHOR PREÇO</p>' : ''}
          </div>
          <div class="produto-preco-area">
            <p class="produto-preco ${isMelhorPreco ? 'melhor-preco' : ''}">R$ ${formatarPreco(ocorrencia.preco)}</p>
            ${economia}
          </div>
        </div>
      `;
    });
  });
  
  listaBusca.innerHTML = html;
}

// ABA 2: Buscar produtos para adicionar à lista
function buscarProdutosParaLista(termo) {
  const termoLower = termo.toLowerCase().trim();
  const resultados = document.getElementById('resultados-busca-lista');
  
  if (!termoLower) {
    resultados.style.display = 'none';
    return;
  }
  
  const produtosEncontrados = produtosCache.filter(p => 
    p.nome.toLowerCase().includes(termoLower) ||
    p.marca.toLowerCase().includes(termoLower)
  );
  
  if (produtosEncontrados.length === 0) {
    resultados.style.display = 'block';
    resultados.innerHTML = '<div class="mensagem-vazia">Nenhum produto encontrado</div>';
    return;
  }
  
  let html = '';
  produtosEncontrados.slice(0, 5).forEach(produto => {
    const jaAdicionado = listaAtual.produtos.find(p => p.produtoId === produto.id);
    
    html += `
      <div class="produto" style="border-bottom: 1px solid #f0f0f0;">
        <div class="produto-imagem" style="width: 60px; height: 60px;">
          <img src="${produto.imagem_url}" alt="${produto.nome}" onerror="this.src='https://placehold.co/60x60/eee/999?text=Sem+Imagem'">
        </div>
        <div class="produto-info">
          <p class="produto-nome">${produto.nome}</p>
          <p class="produto-detalhes">${produto.marca} - ${produto.tamanho_embalagem}${produto.unidade_medida}</p>
        </div>
        <button class="botao-adicionar" 
                onclick="adicionarProdutoNaLista(${produto.id})" 
                ${jaAdicionado ? 'disabled style="opacity: 0.5;"' : ''}>
          ${jaAdicionado ? '✓' : '+'}
        </button>
      </div>
    `;
  });
  
  resultados.style.display = 'block';
  resultados.innerHTML = html;
}

function adicionarProdutoNaLista(produtoId) {
  const existe = listaAtual.produtos.find(p => p.produtoId === produtoId);
  
  if (existe) {
    mostrarNotificacao('✓ Produto já está na lista!');
    return;
  }
  
  listaAtual.produtos.push({
    produtoId: produtoId,
    adicionadoEm: new Date().toISOString()
  });
  
  salvarListaNoLocalStorage();
  renderizarComparativoListas();
  buscarProdutosParaLista(document.getElementById('campo-busca-lista').value);
  mostrarNotificacao('✓ Produto adicionado!');
}

function renderizarComparativoListas() {
  const container = document.querySelector('.comparativo-grid');
  
  if (!listaAtual.produtos || listaAtual.produtos.length === 0) {
    container.innerHTML = '<div class="mensagem-vazia">Busque e adicione produtos para comparar totais entre mercados</div>';
    return;
  }
  
  const totaisPorMercado = {};
  
  mercadosCache.forEach(mercado => {
    totaisPorMercado[mercado.id] = {
      mercado: mercado,
      itens: [],
      total: 0
    };
    
    listaAtual.produtos.forEach(itemLista => {
      const produto = produtosCache.find(p => p.id === itemLista.produtoId);
      
      if (produto && produto.ocorrencias) {
        const ocorrencia = produto.ocorrencias.find(o => o.mercadoId == mercado.id);
        
        if (ocorrencia) {
          totaisPorMercado[mercado.id].itens.push({
            nome: `${produto.nome} ${produto.tamanho_embalagem}${produto.unidade_medida}`,
            preco: ocorrencia.preco
          });
          totaisPorMercado[mercado.id].total += ocorrencia.preco;
        }
      }
    });
  });
  
  const mercadosComItens = Object.values(totaisPorMercado).filter(m => m.itens.length > 0);
  
  if (mercadosComItens.length === 0) {
    container.innerHTML = '<div class="mensagem-vazia">Produtos não encontrados nos mercados</div>';
    return;
  }
  
  const totais = mercadosComItens.map(m => m.total);
  const melhorTotal = Math.min(...totais);
  
  let html = '';
  mercadosComItens.forEach(dados => {
    const isMelhor = dados.total === melhorTotal;
    
    html += `
      <div class="card-mercado ${isMelhor ? 'melhor-preco' : ''}">
        <div class="mercado-header">
          <h3 class="mercado-nome">${dados.mercado.nome}</h3>
          ${isMelhor ? '<span class="badge-melhor">Melhor Preço</span>' : ''}
        </div>
    `;
    
    dados.itens.forEach(item => {
      html += `
        <div class="item-lista">
          <span class="item-nome">${item.nome}</span>
          <span class="item-preco">R$ ${formatarPreco(item.preco)}</span>
        </div>
      `;
    });
    
    html += `
        <div class="total-mercado">
          <span class="total-label">TOTAL:</span>
          <span class="total-valor">R$ ${formatarPreco(dados.total)}</span>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

function limparLista() {
  if (!listaAtual.produtos || listaAtual.produtos.length === 0) {
    alert('A lista já está vazia!');
    return;
  }
  
  if (confirm(`Deseja limpar todos os ${listaAtual.produtos.length} produtos?`)) {
    listaAtual = { produtos: [] };
    salvarListaNoLocalStorage();
    renderizarComparativoListas();
    mostrarNotificacao('✓ Lista limpa!');
  }
}

// Trocar entre abas
function trocarAba(aba) {
  const abas = document.querySelectorAll('.aba');
  const conteudos = document.querySelectorAll('.conteudo-aba');
  
  abas.forEach(a => a.classList.remove('ativa'));
  conteudos.forEach(c => c.classList.remove('ativa'));
  
  aba.classList.add('ativa');
  
  const abaTarget = aba.getAttribute('data-aba');
  const conteudo = document.getElementById(`aba-${abaTarget}`);
  
  if (conteudo) {
    conteudo.classList.add('ativa');
    
    if (abaTarget === 'listas') {
      renderizarComparativoListas();
    }
  }
}

// Configurar event listeners
function configurarEventListeners() {
  // Busca na aba 1
  const campoBusca = document.getElementById('campo-busca');
  if (campoBusca) {
    campoBusca.addEventListener('input', (e) => {
      buscarECompararProduto(e.target.value);
    });
  }
  
  // Busca na aba 2
  const campoBuscaLista = document.getElementById('campo-busca-lista');
  if (campoBuscaLista) {
    campoBuscaLista.addEventListener('input', (e) => {
      buscarProdutosParaLista(e.target.value);
    });
  }
  
  // Ordenação aba 1
  const btnOrdenarBusca = document.getElementById('btn-ordenar-busca');
  if (btnOrdenarBusca) {
    btnOrdenarBusca.addEventListener('click', () => ordenarProdutosBusca());
  }
  
  // Abas
  const abas = document.querySelectorAll('.aba');
  abas.forEach(aba => {
    aba.addEventListener('click', function() {
      trocarAba(this);
    });
  });
  
  // Limpar lista
  const btnLimpar = document.getElementById('btn-limpar-lista');
  if (btnLimpar) {
    btnLimpar.addEventListener('click', limparLista);
  }
}

function ordenarProdutosBusca() {
  const listaBusca = document.getElementById('lista-busca');
  const titulos = listaBusca.querySelectorAll('div[style*="background-color"]');
  const produtos = Array.from(listaBusca.querySelectorAll('.produto'));
  
  if (produtos.length === 0) return;
  
  ordemCrescenteBusca = !ordemCrescenteBusca;
  
  document.getElementById('seta-cima-busca').classList.toggle('ativa', !ordemCrescenteBusca);
  document.getElementById('seta-baixo-busca').classList.toggle('ativa', ordemCrescenteBusca);
  
  produtos.sort((a, b) => {
    const precoA = parseFloat(a.dataset.preco);
    const precoB = parseFloat(b.dataset.preco);
    return ordemCrescenteBusca ? precoA - precoB : precoB - precoA;
  });
  
  listaBusca.innerHTML = '';
  titulos.forEach(titulo => listaBusca.appendChild(titulo));
  produtos.forEach(p => listaBusca.appendChild(p));
}

// LocalStorage
function salvarListaNoLocalStorage() {
  try {
    localStorage.setItem('poupa_ai_lista_comparacao', JSON.stringify(listaAtual));
  } catch (erro) {
    console.error('Erro ao salvar lista:', erro);
  }
}

function carregarListaDoLocalStorage() {
  try {
    const listaSalva = localStorage.getItem('poupa_ai_lista_comparacao');
    if (listaSalva) {
      listaAtual = JSON.parse(listaSalva);
    }
  } catch (erro) {
    console.error('Erro ao carregar lista:', erro);
    listaAtual = { produtos: [] };
  }
}

// Funções auxiliares
function formatarPreco(preco) {
  return preco.toFixed(2).replace('.', ',');
}

function mostrarCarregando() {
  const listaBusca = document.getElementById('lista-busca');
  if (listaBusca) {
    listaBusca.innerHTML = '<div class="loading">Carregando...</div>';
  }
}

function ocultarCarregando() {
  const listaBusca = document.getElementById('lista-busca');
  if (listaBusca) {
    listaBusca.innerHTML = `
      <div class="mensagem-vazia">
        <p style="font-size: 18px; margin-bottom: 12px;">🔍 Digite o nome de um produto</p>
        <p style="font-size: 14px; color: #999;">Exemplos: arroz, feijão, pão</p>
      </div>
    `;
  }
}

function mostrarErro(mensagem) {
  const listaBusca = document.getElementById('lista-busca');
  if (listaBusca) {
    listaBusca.innerHTML = `<div class="mensagem-vazia" style="color: #ff4444;">${mensagem}</div>`;
  }
}

function mostrarNotificacao(mensagem) {
  const notification = document.createElement('div');
  notification.textContent = mensagem;
  notification.style.cssText = `
    position: fixed; top: 80px; right: 20px;
    background: #4CAF50; color: white;
    padding: 16px 24px; border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    z-index: 1000; animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}
