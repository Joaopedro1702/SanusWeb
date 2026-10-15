const jwt = require('jsonwebtoken');
const { jetSecret, jwtSecret } = require('../config');


//criando função resposavel por verificar token

function autenticar(req, res, next){

    const header = req.headers.authorization;
    if( !header || !header.startsWith("Bearer ")){
        return res.status(401).json({error: "Token não informado"});
    }

    //separa a palavra bearer do token em si

    const token = header.split(" ")[1];
    try{

        const payload = jwt.verify(token, jwtSecret);

        req.usuario = payload;

        next();
    }catch(err){
        return res.status(401).json({error:"Token inválido ou expirado"});
    }    

}

module.exports = { autenticar };