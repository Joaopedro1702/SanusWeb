const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const raizProjeto = path.join(__dirname, '..');


const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(raizProjeto));

function lerDados(){
    const dados = fs.readFileSync(path.join(raizProjeto, 'login.json'), 'utf-8');

    return JSON.parse(dados)
}

app.get('/', (req, res) => {
    res.sendFile(path.join(raizProjeto, 'login.html'))
});

app.get('/carrinho.html', (req,res) => {
    res.sendFile(path.join(raizProjeto, 'carrinho.html'))
});

app.get('/login.json', (req,res) => {
    const dadosLogin = lerDados();
    res.json(dadosLogin);
});

app.listen(3000, () => {
    console.log("Servidor Sanus Web rodando em http://localhost:3000")
})
