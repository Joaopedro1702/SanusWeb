//Função que calcula quantos digitos 
//tem no CPF, se tem 11 passa na verificação
//se não pede pra pessoa digitar um cpf válido

function cpfValido(cpf){
    cpf = String(cpf).replace(/\D/g, "");

    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)){
        return false;
    }

    const calcularDIgito = (quantidade) => {
        let soma = 0;

        for (let i = 0; i < quantidade; i++){
            soma += Number(cpf[i]) * (quantidade + 1 - i);
        }

        const resto = (soma * 10) % 11;
        return resto === 10 ? 0 : resto;
    };

    const primeiroDigito = calcularDIgito(9);
    const segundoDigito = calcularDIgito(10);

    return(
        primeiroDigito === Number(cpf[9]) &&
        segundoDigito === Number(cpf[10])
    );
}

//Validação caso dê algum erro no processo.

function validarCpf(req, res, next){
    const cpf = String(req.body.cpf || "").replace(/\D/g, "");

    if (!cpfValido(cpf)){
        return res.status(400).json({
            error: "CPF inválido."
        });
    }
    req.body.cpf = cpf;
    next();
}

module.exports = validarCpf;