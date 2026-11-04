require("dotenv").config();

//constante que irá receber uma lista com todas as constantes que conecta ao banco
const obrigatorias = ["DB_HOST", "DB_USER", "DB_PSWD", "DB_NAME", "JWT_SECRET"];
const faltando = obrigatorias.filter((nome) => !process.env[nome]);

if (faltando.length){
    throw new Error(`Variáveis de ambiente faltando: ${faltando.join(", ")}`);

}

module.exports = {
    port: process.env.PORT || 3000,
    db:{
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PSWD,
        database: process.env.DB_NAME,
        ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false}: undefined,
    },
    jwtSecret: process.env.JWT_SECRET,
    // Em produção, defina CORS_ORIGINS com os endereços separados por vírgula.
    // Ex.: https://sanus.com.br,https://www.sanus.com.br
    corsOrigins: (process.env.CORS_ORIGINS || "https://sanusweb.jpk-araujo2003.workers.dev,http://127.0.0.1:5500,http://localhost:5500")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean),
    frontendUrl: process.env.FRONTEND_URL || "https://sanusweb.jpk-araujo2003.workers.dev",
    publicBaseUrl: process.env.PUBLIC_BASE_URL || "https://sanus-backend.onrender.com",
};
