const express = require("express");

const app = express();

const routes = require("./src/routes")

const cors = require('cors');

const { port } = require('./src/config');

//Permite receber o JSON
app.use(express.json());
app.use(cors());
app.use("/api", routes);

app.get("/teste", (req, res) => {
    res.json({
        mensagem: "Servidor Sanus funcionando!"
    });
});

app.use((req, res) =>{
    res.status(404).json({error: "Rota não encontrada"});
});

app.use((err, req, res, next) => {
    console.error(err);
    
    const status = err.status || 500;
    const mensagem = status === 500 ? "Erro interno do servidor": err.message;

    res.status(status).json({error: mensagem})
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
