const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const dbPath = path.join(__dirname, 'database.json');

const dadosIniciais = {
  produtos: [
    { id: 1, categoria: 'Tortas', nome: 'Torta Brigadeiro', tamanhos: ['Mini', 'N°1', 'N°2'] },
    { id: 2, categoria: 'Tortas', nome: 'Torta Bombom', tamanhos: ['Mini', 'N°1', 'N°2'] },
    { id: 3, categoria: 'Sobremesas', nome: 'Pave Paulista', tamanhos: ['350g', '700g', '1,4kg'] }
  ],
  pedidosLojas: [],
  pedidosProducao: [],
  caminhoesDespachados: []
};

function lerBancoDados() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify(dadosIniciais, null, 2));
    return dadosIniciais;
  }
  return JSON.parse(fs.readFileSync(dbPath));
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

app.post('/api/login', (req, res) => {
  const { setor, codigo, senha } = req.body;
  if (codigo === '00' && senha === '0825' && setoresNomes[setor]) {
    return res.json({ success: true, nome: setoresNomes[setor], setor: setor });
  }
  const usuario = usuariosValidos.find(u => u.setor === setor && u.codigo === codigo && u.senha === senha);
  if (usuario) res.json({ success: true, nome: usuario.nome, setor: usuario.setor });
  else res.status(401).json({ success: false, message: 'Credenciais inválidas!' });
});

// APIs de Produtos
app.get('/api/produtos', (req, res) => res.json(lerBancoDados().produtos));
app.post('/api/produtos', (req, res) => {
  const { categoria, nome, tamanhos } = req.body;
  const db = lerBancoDados();
  const tamanhosArray = tamanhos.split(',').map(t => t.trim());
  const novoProduto = { id: Date.now(), categoria, nome, tamanhos: tamanhosArray };
  db.produtos.push(novoProduto);
  salvarBancoDados(db);
  res.json({ success: true, produto: novoProduto });
});

// Lojas emitindo pedido - Status inicial: Recebido e ID Sequencial (+1000)
app.post('/api/lojas/pedido', (req, res) => {
  const { loja, itens } = req.body;
  const db = lerBancoDados();
  const dataHora = new Date().toLocaleString('pt-BR');
  
  // Lógica do ID sequencial
  let novoId = 1000;
  if (db.pedidosLojas.length > 0) {
    const maiorId = Math.max(...db.pedidosLojas.map(p => p.id));
    novoId = maiorId >= 1000 ? maiorId + 1 : 1000;
  }

  const novoPedido = { id: novoId, loja, data: dataHora, status: 'Recebido', itens };
  db.pedidosLojas.push(novoPedido);
  salvarBancoDados(db);
  res.json({ success: true, pedido: novoPedido });
});

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

app.get('/api/pedidos', (req, res) => res.json(lerBancoDados().pedidosLojas));

// APIs da Câmara Fria
app.get('/api/camara-fria/dados', (req, res) => {
  const db = lerBancoDados();
  res.json({ pedidosLojas: db.pedidosLojas, pedidosProducao: db.pedidosProducao, caminhoesDespachados: db.caminhoesDespachados });
});

app.post('/api/camara-fria/pedir-producao', (req, res) => {
  const { item, qtd, destinoProducao } = req.body;
  const db = lerBancoDados();
  db.pedidosProducao.push({ id: Date.now(), item, qtd, destinoProducao, status: 'Enviado à Produção' });
  salvarBancoDados(db);
  res.json({ success: true });
});

app.post('/api/camara-fria/despachar', (req, res) => {
  const { lojaDestino, itens, motorista } = req.body;
  const db = lerBancoDados();
  db.caminhoesDespachados.push({ id: Date.now(), lojaDestino, itens, motorista, dataHora: new Date().toLocaleString('pt-BR') });
  salvarBancoDados(db);
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));