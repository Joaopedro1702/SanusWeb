const {
    MercadoPagoConfig,
    Payment,
    WebhookSignatureValidator,
} = require("mercadopago");

function criarClientesMercadoPago() {
    const accessToken = process.env.MP_TOKEN_ACCESS;
    if (!accessToken) {
        const error = new Error("Mercado Pago não configurado no servidor.");
        error.status = 503;
        throw error;
    }

    const client = new MercadoPagoConfig({ accessToken });
    return {
        payment: new Payment(client),
    };
}

module.exports = { criarClientesMercadoPago, WebhookSignatureValidator };
