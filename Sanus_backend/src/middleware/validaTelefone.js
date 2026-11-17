function validarTelefone(req, res, next) {
    const digitos = String(req.body.telefone || "").replace(/\D/g, "");

    if (digitos.length !== 11) {
        return res.status(400).json({ error: "Telefone inválido." });
    }

    req.body.telefone = digitos.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1)$2-$3");
    return next();
}

module.exports = validarTelefone;
