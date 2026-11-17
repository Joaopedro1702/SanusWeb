const express = require("express");

const app = express();

const routes = require("./src/routes")

const cors = require('cors');

const { port, corsOrigins } = require('./src/config');

//Permite receber o JSON
app.use(express.json());
app.use(cors({
    origin(origin, callback) {
        // Requisições sem Origin, como health checks, não são chamadas de navegadores.
        return callback(null, !origin || corsOrigins.includes(origin));
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Authorization", "Content-Type"],
}));
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
