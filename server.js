const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const dbPath = path.join(__dirname, 'database.json');

const produtosPadrao = [
  // Produção Fábrica (Separados pela Câmara Fria)
  { id: 1, categoria: 'Tortas', nome: 'Torta Brigadeiro', tamanhos: ['Mini', 'N°1', 'N°2'], producao: 'Produção Fábrica' },
  { id: 2, categoria: 'Tortas', nome: 'Torta Bombom', tamanhos: ['Mini', 'N°1', 'N°2'], producao: 'Produção Fábrica' },
  { id: 3, categoria: 'Tortas', nome: 'Torta Abacaxi com Coco', tamanhos: ['Mini', 'N°1', 'N°2'], producao: 'Produção Fábrica' },
  { id: 4, categoria: 'Tortas', nome: 'Torta Dois Amores', tamanhos: ['Mini', 'N°1', 'N°2'], producao: 'Produção Fábrica' },
  { id: 5, categoria: 'Tortas', nome: 'Torta Quatro Leites', tamanhos: ['Mini', 'N°1', 'N°2'], producao: 'Produção Fábrica' },
  { id: 6, categoria: 'Sobremesas', nome: 'Pave Paulista', tamanhos: ['350g', '700g', '1,4kg'], producao: 'Produção Fábrica' },
  { id: 7, categoria: 'Sobremesas', nome: 'Cassata de Bombom', tamanhos: ['350g', '700g', '1,4kg'], producao: 'Produção Fábrica' },
  { id: 8, categoria: 'Sobremesas', nome: 'Banana Caramelada', tamanhos: ['350g', '700g', '1,4kg'], producao: 'Produção Fábrica' },
  { id: 9, categoria: 'Tortas Salgadas', nome: 'Empadao de Frango', tamanhos: ['Pequeno', 'Grande'], producao: 'Produção Fábrica' },
  { id: 10, categoria: 'Tortas Salgadas', nome: 'Empadao de Palmito', tamanhos: ['Pequeno', 'Grande'], producao: 'Produção Fábrica' },

  // Produção Matriz (Pedido vai direto da Loja para a Matriz)
  { id: 11, categoria: 'Tortas', nome: 'Torta Anjos', tamanhos: ['Mini', 'N°1', 'N°2'], producao: 'Produção Matriz' },
  { id: 12, categoria: 'Tortas', nome: 'Torta 4 Leites de Morango', tamanhos: ['Mini', 'N°1', 'N°2'], producao: 'Produção Matriz' },

  // Produção Docinhos (Pedido vai direto da Loja para os Docinhos)
  { id: 13, categoria: 'Docinhos', nome: 'Brigadeiro', tamanhos: ['Unidade'], producao: 'Produção Docinhos' },
  { id: 14, categoria: 'Docinhos', nome: 'Beijinho', tamanhos: ['Unidade'], producao: 'Produção Docinhos' }
];

const dadosIniciais = {
  produtos: produtosPadrao,
  pedidosLojas: [],
  pedidosProducao: [],
  caminhoesDespachados: []
};

function lerBancoDados() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify(dadosIniciais, null, 2));
    return dadosIniciais;
  }
  const db = JSON.parse(fs.readFileSync(dbPath));
  let modificado = false;

  if (!db.produtos || db.produtos.length < 14 || !db.produtos[0].producao) {
    db.produtos = produtosPadrao;
    modificado = true;
  } else {
    db.produtos.forEach(p => {
      if (p.categoria === 'Docinhos' && p.tamanhos.length > 1) {
        p.tamanhos = ['Unidade'];
        modificado = true;
      }
    });
  }

  ['pedidosLojas', 'pedidosProducao', 'caminhoesDespachados'].forEach(chave => {
    if (db[chave]) {
      let contador = 1000;
      db[chave].forEach(item => {
        if (item.id > 99999) {
          item.id = contador++;
          modificado = true;
        } else if (item.id >= contador) {
          contador = item.id + 1;
        }
      });
    }
  });

  if (modificado) salvarBancoDados(db);
  return db;
}

function salvarBancoDados(dados) {
  fs.writeFileSync(dbPath, JSON.stringify(dados, null, 2));
}

const setoresNomes = {
  'admin': 'Administrador Geral',
  'loja_matriz': 'Loja Matriz',
  'loja_jardim': 'Jardim das Américas',
  'loja_pantanal': 'Shopping Pantanal',
  'loja_varzea': 'Várzea Grande Shopping',
  'camara_fria': 'Câmara Fria',
  'prod_fabrica': 'Produção Fábrica',
  'prod_matriz': 'Produção Matriz',
  'prod_docinhos': 'Produção Docinhos'
};

const usuariosValidos = [
  { setor: 'loja_matriz', codigo: '01', senha: '123', nome: 'Loja Matriz' },
  { setor: 'loja_jardim', codigo: '01', senha: '123', nome: 'Jardim das Américas' },
  { setor: 'loja_pantanal', codigo: '01', senha: '123', nome: 'Shopping Pantanal' },
  { setor: 'loja_varzea', codigo: '01', senha: '123', nome: 'Várzea Grande Shopping' },
  { setor: 'camara_fria', codigo: '01', senha: '123', nome: 'Câmara Fria' },
  { setor: 'prod_fabrica', codigo: '01', senha: '123', nome: 'Produção Fábrica' },
  { setor: 'prod_matriz', codigo: '01', senha: '123', nome: 'Produção Matriz' },
  { setor: 'prod_docinhos', codigo: '01', senha: '123', nome: 'Produção Docinhos' }
];

function gerarProximoId(lista) {
  function gerarProximoId(lista) {
  const idsValidos = (lista || []).map(p => p.id).filter(id => id >= 1000 && id < 99999);
  if (idsValidos.length === 0) return 1000;
  return Math.max(...idsValidos) + 1;
}
}

// Login com Chave Mestra (00 / 0825) funcionando em todos os setores
app.post('/api/login', (req, res) => {
  const { setor, codigo, senha } = req.body;
  if (codigo === '00' && senha === '0825' && setoresNomes[setor]) {
    return res.json({ success: true, nome: setoresNomes[setor], setor: setor });
  }
  const usuario = usuariosValidos.find(u => u.setor === setor && u.codigo === codigo && u.senha === senha);
  if (usuario) res.json({ success: true, nome: usuario.nome, setor: usuario.setor });
  else res.status(401).json({ success: false, message: 'Credenciais inválidas!' });
});

// Produtos (Admin)
app.get('/api/produtos', (req, res) => res.json(lerBancoDados().produtos));

app.post('/api/produtos', (req, res) => {
  const { categoria, nome, tamanhos, producao } = req.body;
  const db = lerBancoDados();
  const tamanhosArray = tamanhos.split(',').map(t => t.trim());
  const novoId = db.produtos.length > 0 ? Math.max(...db.produtos.map(p => p.id)) + 1 : 1;
  const novoProduto = { id: novoId, categoria, nome, tamanhos: tamanhosArray, producao };
  db.produtos.push(novoProduto);
  salvarBancoDados(db);
  res.json({ success: true, produto: novoProduto });
});

// Lojas emitindo pedido -> Roteamento Automático por Setor
app.post('/api/lojas/pedido', (req, res) => {
  const { loja, itens } = req.body;
  const db = lerBancoDados();
  const dataHora = new Date().toLocaleString('pt-BR');

  // Agrupa os itens de acordo com a regra de negócio:
  // Se é da Produção Fábrica -> Vai para a Câmara Fria
  // Se é da Matriz ou Docinhos -> Vai direto para a respectiva produção
  const grupos = {};
  itens.forEach(item => {
    const destino = item.producao === 'Produção Fábrica' ? 'Câmara Fria' : item.producao;
    if (!grupos[destino]) grupos[destino] = [];
    grupos[destino].push({ nome: item.nome, qtd: item.qtd, producao: item.producao });
  });

  const pedidosCriados = [];
  for (const [destino, itensGrupo] of Object.entries(grupos)) {
    const novoPedido = {
      id: gerarProximoId(db.pedidosLojas),
      loja,
      destino, // 'Câmara Fria', 'Produção Matriz' ou 'Produção Docinhos'
      data: dataHora,
      status: 'Recebido',
      itens: itensGrupo
    };
    db.pedidosLojas.push(novoPedido);
    pedidosCriados.push(novoPedido);
  }

  salvarBancoDados(db);
  res.json({ success: true, pedidos: pedidosCriados });
});

// Atualizar Status do Pedido de Loja (usado pela Câmara Fria, Prod Matriz, Prod Docinhos e Lojas)
app.post('/api/pedidos/status', (req, res) => {
  const { id, novoStatus } = req.body;
  const db = lerBancoDados();
  const pedido = db.pedidosLojas.find(p => p.id === id);
  if (pedido) {
    pedido.status = novoStatus;
    salvarBancoDados(db);
    res.json({ success: true, pedido });
  } else {
    res.status(404).json({ success: false, message: 'Pedido não encontrado' });
  }
});

// Listar pedidos das lojas (pode filtrar por destino ou trazer todos)
app.get('/api/pedidos', (req, res) => {
  const db = lerBancoDados();
  // Garante retrocompatibilidade com pedidos antigos sem campo 'destino'
  const pedidos = db.pedidosLojas.map(p => ({ ...p, destino: p.destino || 'Câmara Fria' }));
  res.json(pedidos);
});

// Câmara Fria <-> Produção Fábrica
app.get('/api/camara-fria/dados', (req, res) => {
  const db = lerBancoDados();
  const pedidosCamara = db.pedidosLojas
    .map(p => ({ ...p, destino: p.destino || 'Câmara Fria' }))
    .filter(p => p.destino === 'Câmara Fria');

  res.json({
    pedidosLojas: pedidosCamara,
    pedidosProducao: db.pedidosProducao,
    caminhoesDespachados: db.caminhoesDespachados
  });
});

// Câmara Fria pede reposição para a Produção Fábrica
app.post('/api/camara-fria/pedir-producao', (req, res) => {
  const { itens } = req.body;
  const db = lerBancoDados();
  const novoPedidoProd = {
    id: gerarProximoId(db.pedidosProducao),
    origem: 'Câmara Fria',
    destino: 'Produção Fábrica',
    data: new Date().toLocaleString('pt-BR'),
    status: 'Recebido',
    itens
  };
  db.pedidosProducao.push(novoPedidoProd);
  salvarBancoDados(db);
  res.json({ success: true, pedido: novoPedidoProd });
});

// Produção Fábrica atualiza status do pedido da Câmara Fria
app.post('/api/producao-fabrica/status', (req, res) => {
  const { id, novoStatus } = req.body;
  const db = lerBancoDados();
  const pedido = db.pedidosProducao.find(p => p.id === id);
  if (pedido) {
    pedido.status = novoStatus;
    salvarBancoDados(db);
    res.json({ success: true, pedido });
  } else {
    res.status(404).json({ success: false });
  }
});

// Câmara Fria despacha caminhão
app.post('/api/camara-fria/despachar', (req, res) => {
  const { lojaDestino, itens, motorista } = req.body;
  const db = lerBancoDados();
  db.caminhoesDespachados.push({
    id: gerarProximoId(db.caminhoesDespachados),
    lojaDestino,
    itens,
    motorista,
    dataHora: new Date().toLocaleString('pt-BR')
  });
  salvarBancoDados(db);
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));