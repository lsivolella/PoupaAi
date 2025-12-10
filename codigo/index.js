const jsonServer = require('json-server');
const path = require('path');
const express = require('express');

const app = express();
const router = jsonServer.router(path.join(__dirname, 'data', 'db.json'));
const middlewares = jsonServer.defaults();

app.use('/api', middlewares);
app.use('/api', router);

app.use(express.static(path.join(__dirname, 'public', 'views')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'views', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log('DB path:', path.join(__dirname, 'data', 'db.json'));
});
