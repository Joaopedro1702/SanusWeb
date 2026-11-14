async function enviarPagamento(dados) {
    const resposta = await fetch(`${API_URL}/pagamentos`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("sanus_token")}`,
        },
        body: JSON.stringify({ itens: itensDoCarrinho(), ...dados }),
    });
    const pagamento = await resposta.json();
    if (!resposta.ok) throw new Error(pagamento.error || "Não foi possível processar o pagamento.");
    return pagamento;
}

async function processarCartao(dadosCartao) {
    try {
        const pagamento = await enviarPagamento({
            tipo: "cartao",
            cartao: {
                token: dadosCartao.token,
                payment_method_id: dadosCartao.paymentMethodId,
                issuer_id: dadosCartao.issuerId,
                installments: Number(dadosCartao.installments),
            },
        });
        if (pagamento.status === "approved") {
            window.location.assign(`${window.ROOT_PATH}sucesso/index.html?referencia=${encodeURIComponent(pagamento.referencia)}`);
            return;
        }
        if (["rejected", "cancelled"].includes(pagamento.status)) {
            exibirMensagem("O cartão não foi aprovado. Confira os dados e tente novamente.", "error");
            return;
        }
        window.location.assign(`${window.ROOT_PATH}sucesso/index.html?referencia=${encodeURIComponent(pagamento.referencia)}`);
    } catch (error) {
        console.error(error);
        exibirMensagem(error.message, "error");
    }
}

async function processarPix() {
    try {
        const pagamento = await enviarPagamento({ tipo: "pix" });
        referenciaPixAtual = pagamento.referencia;
        const status = document.getElementById("pixStatus");
        const qrCode = document.getElementById("pixQrCode");
        const copiar = document.getElementById("copyPixButton");
        if (pagamento.qrCodeBase64) {
            qrCode.src = `data:image/png;base64,${pagamento.qrCodeBase64}`;
            qrCode.hidden = false;
        }
        copiar.dataset.pixCode = pagamento.qrCode || "";
        copiar.disabled = !pagamento.qrCode;
        status.textContent = "Escaneie o QR Code ou copie o código PIX para concluir o pagamento.";
        monitorarPix();
    } catch (error) {
        console.error(error);
        exibirMensagem(error.message, "error");
    }
}

async function monitorarPix() {
    if (!referenciaPixAtual) return;
    try {
        const resposta = await fetch(`${API_URL}/pedidos/${encodeURIComponent(referenciaPixAtual)}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("sanus_token")}` },
        });
        const pedido = await resposta.json();
        if (pedido.status === "approved") {
            window.location.assign(`${window.ROOT_PATH}sucesso/index.html?referencia=${encodeURIComponent(referenciaPixAtual)}`);
            return;
        }
        if (["rejected", "cancelled", "refunded", "charged_back"].includes(pedido.status)) return;
        window.setTimeout(monitorarPix, 3000);
    } catch (error) {
        console.error("Erro ao consultar PIX:", error);
    }
}

async function verificarStatusPedido() {
    const referencia = new URLSearchParams(window.location.search).get("referencia");
    const statusElement = document.getElementById("paymentStatus");
    const orderElement = document.getElementById("orderId");
    if (!referencia || !statusElement) {
        statusElement.textContent = "Não foi possível localizar a referência deste pagamento.";
        return;
    }

    if (orderElement) orderElement.textContent = referencia;
    const token = localStorage.getItem("sanus_token");
    if (!token) {
        statusElement.textContent = "Entre na sua conta para consultar o status do pedido.";
        return;
    }

    for (let tentativa = 0; tentativa < 10; tentativa += 1) {
        try {
            const resposta = await fetch(`${API_URL}/pedidos/${encodeURIComponent(referencia)}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const pedido = await resposta.json();
            if (!resposta.ok) throw new Error(pedido.error || "Falha ao consultar o pedido.");

            if (pedido.status === "approved") {
                statusElement.textContent = "Pagamento aprovado pelo Mercado Pago.";
                saveCart([]);
                return;
            }
            if (["rejected", "cancelled", "refunded", "charged_back"].includes(pedido.status)) {
                statusElement.textContent = "O pagamento não foi aprovado. Você pode tentar novamente pelo carrinho.";
                return;
            }
            statusElement.textContent = "Pagamento recebido; aguardando confirmação do Mercado Pago…";
        } catch (error) {
            statusElement.textContent = error.message;
            return;
        }
        await new Promise((resolve) => window.setTimeout(resolve, 2000));
    }
}

function copyPixCode() {
    const codigo = document.getElementById("copyPixButton")?.dataset.pixCode;
    if (!codigo) return;
    navigator.clipboard.writeText(codigo);
    exibirMensagem("Código PIX copiado.", "success");
}

