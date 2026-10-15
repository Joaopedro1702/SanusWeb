const ErroHttp = require("../error/errorGlobal");

function consultarController(repo) {
    return async function (req, res) {
        // sem :id na rota -> listagem
        if (req.params.id == null) {
            const lista = await repo();
            return res.status(200).json(lista);
        }

        // com :id -> busca de um registro
        const resultado = await repo({ id: req.params.id });

        if (!resultado[0]) {
            throw new ErroHttp(404, "Não encontrado");
        }

        return res.status(200).json(resultado[0]);
    };
}

module.exports = consultarController;