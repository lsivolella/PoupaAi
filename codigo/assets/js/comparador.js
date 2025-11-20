// Variáveis globais
let produtosCache = [];
let mercadosCache = [];
let listaAtual = { produtos: [] }; // Formato: [{produtoId: 1, quantidade: 2}, ...]
let ordemCrescenteBusca = true;

// Inicialização
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
    
    renderizarListaProdutos();
    renderizarComparativoListas();
    
  } catch (erro) {
    console.error('Erro na inicialização:', erro);
    mostrarErro('Erro ao carregar dados.');
  } finally {
    ocultarCarregando();
  }
}

// Carregar JSONs
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

// ABA 1: Buscar e comparar produto
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

// ABA 2: Buscar produtos para adicionar
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
    const itemNaLista = listaAtual.produtos.find(p => p.produtoId === produto.id);
    
    html += `
      <div class="produto" style="border-bottom: 1px solid #f0f0f0;">
        <div class="produto-imagem" style="width: 60px; height: 60px;">
          <img src="${produto.imagem_url}" alt="${produto.nome}" onerror="this.src='https://placehold.co/60x60/eee/999?text=Sem+Imagem'">
        </div>
        <div class="produto-info">
          <p class="produto-nome">${produto.nome}</p>
          <p class="produto-detalhes">${produto.marca} - ${produto.tamanho_embalagem}${produto.unidade_medida}</p>
        </div>
        <button class="botao-adicionar" onclick="adicionarProdutoNaLista(${produto.id})">
          ${itemNaLista ? '✓' : '+'}
        </button>
      </div>
    `;
  });
  
  resultados.style.display = 'block';
  resultados.innerHTML = html;
}

// Adicionar produto na lista (sempre adiciona, incrementando quantidade)
function adicionarProdutoNaLista(produtoId) {
  const itemExistente = listaAtual.produtos.find(p => p.produtoId === produtoId);
  
  if (itemExistente) {
    itemExistente.quantidade++;
    mostrarNotificacao('✓ Quantidade atualizada!');
  } else {
    listaAtual.produtos.push({
      produtoId: produtoId,
      quantidade: 1,
      adicionadoEm: new Date().toISOString()
    });
    mostrarNotificacao('✓ Produto adicionado!');
  }
  
  salvarListaNoLocalStorage();
  renderizarListaProdutos();
  renderizarComparativoListas();
  buscarProdutosParaLista(document.getElementById('campo-busca-lista').value);
}

// Renderizar lista de produtos adicionados
function renderizarListaProdutos() {
  const containerLista = document.getElementById('produtos-na-lista');
  const itensLista = document.getElementById('itens-lista');
  
  if (!listaAtual.produtos || listaAtual.produtos.length === 0) {
    containerLista.style.display = 'none';
    return;
  }
  
  containerLista.style.display = 'block';
  
  let html = '';
  listaAtual.produtos.forEach(item => {
    const produto = produtosCache.find(p => p.id === item.produtoId);
    if (!produto) return;
    
    html += `
      <div style="display: flex; align-items: center; gap: 12px; padding: 8px; border-bottom: 1px solid #f0f0f0;">
        <div style="width: 50px; height: 50px; border-radius: 8px; overflow: hidden; flex-shrink: 0; background: #f5f5f5;">
          <img src="${produto.imagem_url}" alt="${produto.nome}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://placehold.co/50x50/eee/999?text=?'">
        </div>
        <div style="flex: 1;">
          <p style="font-weight: bold; font-size: 14px; margin: 0;">${produto.nome}</p>
          <p style="font-size: 12px; color: #666; margin: 2px 0 0 0;">${produto.marca} - ${produto.tamanho_embalagem}${produto.unidade_medida}</p>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <button onclick="diminuirQuantidade(${produto.id})" style="width: 28px; height: 28px; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer; font-size: 18px; display: flex; align-items: center; justify-content: center;">−</button>
          <span style="font-weight: bold; min-width: 30px; text-align: center;">${item.quantidade}</span>
          <button onclick="aumentarQuantidade(${produto.id})" style="width: 28px; height: 28px; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer; font-size: 18px; display: flex; align-items: center; justify-content: center;">+</button>
          <button onclick="removerProduto(${produto.id})" style="width: 28px; height: 28px; border: none; background: #ff4444; color: white; border-radius: 4px; cursor: pointer; font-size: 16px; margin-left: 8px;">🗑️</button>
        </div>
      </div>
    `;
  });
  
  itensLista.innerHTML = html;
}

// Controles de quantidade
function aumentarQuantidade(produtoId) {
  const item = listaAtual.produtos.find(p => p.produtoId === produtoId);
  if (item) {
    item.quantidade++;
    salvarListaNoLocalStorage();
    renderizarListaProdutos();
    renderizarComparativoListas();
  }
}

function diminuirQuantidade(produtoId) {
  const item = listaAtual.produtos.find(p => p.produtoId === produtoId);
  if (item) {
    if (item.quantidade > 1) {
      item.quantidade--;
    } else {
      removerProduto(produtoId);
      return;
    }
    salvarListaNoLocalStorage();
    renderizarListaProdutos();
    renderizarComparativoListas();
  }
}

function removerProduto(produtoId) {
  listaAtual.produtos = listaAtual.produtos.filter(p => p.produtoId !== produtoId);
  salvarListaNoLocalStorage();
  renderizarListaProdutos();
  renderizarComparativoListas();
  mostrarNotificacao('✓ Produto removido!');
}

// Renderizar comparativo (APENAS mercados com TODOS os itens)
function renderizarComparativoListas() {
  const container = document.querySelector('.comparativo-grid');
  
  if (!listaAtual.produtos || listaAtual.produtos.length === 0) {
    container.innerHTML = '<div class="mensagem-vazia">Busque e adicione produtos para comparar totais entre mercados</div>';
    return;
  }
  
  const totaisPorMercado = {};
  
  // Calcular totais por mercado
  mercadosCache.forEach(mercado => {
    totaisPorMercado[mercado.id] = {
      mercado: mercado,
      itens: [],
      total: 0,
      temTodosProdutos: true
    };
    
    listaAtual.produtos.forEach(itemLista => {
      const produto = produtosCache.find(p => p.id === itemLista.produtoId);
      
      if (produto && produto.ocorrencias) {
        const ocorrencia = produto.ocorrencias.find(o => o.mercadoId == mercado.id);
        
        if (ocorrencia) {
          const subtotal = ocorrencia.preco * itemLista.quantidade;
          totaisPorMercado[mercado.id].itens.push({
            nome: `${produto.nome} ${produto.tamanho_embalagem}${produto.unidade_medida}`,
            quantidade: itemLista.quantidade,
            precoUnitario: ocorrencia.preco,
            subtotal: subtotal
          });
          totaisPorMercado[mercado.id].total += subtotal;
        } else {
          // Mercado NÃO tem este produto
          totaisPorMercado[mercado.id].temTodosProdutos = false;
        }
      }
    });
  });
  
  // FILTRAR apenas mercados que TÊM TODOS os produtos
  const mercadosCompletos = Object.values(totaisPorMercado).filter(m => 
    m.temTodosProdutos && m.itens.length === listaAtual.produtos.length
  );
  
  if (mercadosCompletos.length === 0) {
    container.innerHTML = `
      <div class="mensagem-vazia">
        <p style="font-size: 18px; margin-bottom: 12px;">⚠️ Nenhum mercado tem todos os produtos</p>
        <p style="font-size: 14px; color: #999;">Tente remover alguns itens ou adicionar produtos mais comuns</p>
      </div>
    `;
    return;
  }
  
  // Encontrar melhor preço
  const totais = mercadosCompletos.map(m => m.total);
  const melhorTotal = Math.min(...totais);
  
  // Renderizar cards
  let html = '';
  mercadosCompletos.forEach(dados => {
    const isMelhor = dados.total === melhorTotal;
    const economia = isMelhor ? '' : `<p style="font-size: 12px; color: #ff4444; margin-top: 4px;">+R$ ${formatarPreco(dados.total - melhorTotal)} mais caro</p>`;
    
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
          <span class="item-nome">${item.quantidade}x ${item.nome}</span>
          <span class="item-preco">R$ ${formatarPreco(item.subtotal)}</span>
        </div>
      `;
    });
    
    html += `
        <div class="total-mercado">
          <span class="total-label">TOTAL:</span>
          <span class="total-valor">R$ ${formatarPreco(dados.total)}</span>
        </div>
        ${economia}
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
  
  if (confirm(`Deseja limpar todos os produtos da lista?`)) {
    listaAtual = { produtos: [] };
    salvarListaNoLocalStorage();
    renderizarListaProdutos();
    renderizarComparativoListas();
    mostrarNotificacao('✓ Lista limpa!');
  }
}

// Trocar abas
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
      renderizarListaProdutos();
      renderizarComparativoListas();
    }
  }
}

// Event listeners
function configurarEventListeners() {
  const campoBusca = document.getElementById('campo-busca');
  if (campoBusca) {
    campoBusca.addEventListener('input', (e) => {
      buscarECompararProduto(e.target.value);
    });
  }
  
  const campoBuscaLista = document.getElementById('campo-busca-lista');
  if (campoBuscaLista) {
    campoBuscaLista.addEventListener('input', (e) => {
      buscarProdutosParaLista(e.target.value);
    });
  }
  
  const btnOrdenarBusca = document.getElementById('btn-ordenar-busca');
  if (btnOrdenarBusca) {
    btnOrdenarBusca.addEventListener('click', () => ordenarProdutosBusca());
  }
  
  const abas = document.querySelectorAll('.aba');
  abas.forEach(aba => {
    aba.addEventListener('click', function() {
      trocarAba(this);
    });
  });
  
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
    z-index: 1000;
  `;
  
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 2000);
}
