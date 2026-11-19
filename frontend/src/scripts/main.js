
const API_URL = ["localhost", "127.0.0.1"].includes(window.location.hostname)
    ? "http://127.0.0.1:3000/api"
    : "https://sanus-backend.onrender.com/api";
let cardForm;
let referenciaPixAtual;

function exibirMensagem(texto, tipo = "info") {
    const titulos = {
        success: "Sucesso!",
        error: "Ops!",
        warning: "Atenção",
        info: "Aviso"
    };

    return Swal.fire({
        icon: tipo,
        title: titulos[tipo] || titulos.info,
        text: texto,
        confirmButtonText: "Entendi",
        confirmButtonColor: "#0077c8",
        customClass: {
            popup: "sanus-swal"
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    atualizarBotaoPerfil();
    configurarLogin();
    configurarCadastro();

    if (document.querySelector("#formDados")) {
        dadosPerfil().catch((erro) => exibirMensagem(erro.message, "error"));

        document.querySelector("#formDados").addEventListener("submit", async (event) => {
            event.preventDefault();

            try {
                const resposta = await fetch(`${API_URL}/perfil`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("sanus_token")}`
                    },
                    body: JSON.stringify({
                        nome: document.querySelector("#nome").value,
                        email: document.querySelector("#email").value,
                        telefone: document.querySelector("#telefone").value,
                        data_Nasc: document.querySelector("#dataNasc").value
                    })
                });

                const dados = await resposta.json();

                if (!resposta.ok) {
                    throw new Error(dados.error || "Não foi possível salvar os dados.");
                }

                localStorage.setItem("sanus_usuario", dados.nome);
                document.querySelector("#perfilNome").textContent = dados.nome;
                document.querySelector("#perfilEmail").textContent = dados.email;
                exibirMensagem("Dados atualizados com sucesso.", "success");
            } catch (erro) {
                exibirMensagem(erro.message, "error");
            }
        });
    }

    if (document.getElementById("productGrid")) {
        if (localStorage.getItem("sanus_token")) {
            carregarProdutos();
        }
    }

    if (document.getElementById("cartItemsList")) {
        renderCart();
    }

    if (document.getElementById("checkoutTotal")) {
        updateCheckoutSummary();
        iniciarCheckoutApi();
    }

    if (document.getElementById("paymentStatus")) {
        verificarStatusPedido();
    }
});

async function carregarProdutos() {
    const token = localStorage.getItem("sanus_token");

    if (!token) {
        openModal("authModal");
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}/produtos`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (resposta.status === 401) {
            localStorage.removeItem("sanus_token");
            localStorage.removeItem("sanus_usuario");
            atualizarBotaoPerfil();
            openModal("authModal");
            return;
        }

        if (!resposta.ok) {
            throw new Error("Não foi possível carregar os produtos.");
        }

        const produtosDaApi = await resposta.json();

        products = produtosDaApi.map((produto) => ({
            id: produto.id,
            title: produto.nome,
            description: produto.descricao,
            price: Number(produto.preco),
            oldPrice: Number(produto.preco),
            badge: produto.tarja || "",
            icon: "ph-pill"
        }));

        renderProducts(products, "productGrid");
    } catch (erro) {
        console.error(erro);
        exibirMensagem("Não foi possível carregar os produtos. Tente novamente em instantes.", "error");
    }
}

function configurarLogin() {
    const formulario = document.querySelector("#auth-login form");
    if (!formulario) return;

    formulario.addEventListener("submit", async (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();

        const [campoEmail, campoSenha] = formulario.querySelectorAll("input");

        try {
            await fazerLogin(campoEmail.value, campoSenha.value);
            closeModal("authModal");
            atualizarBotaoPerfil();

            if (document.getElementById("productGrid")) {
                carregarProdutos();
            }
        } catch (erro) {
            exibirMensagem(erro.message, "error");
        }
    }, true);
}

async function fazerLogin(email, senha) {
    const resposta = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, senha })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
        throw new Error(dados.error || "Não foi possível entrar.");
    }

    localStorage.setItem("sanus_token", dados.token);
    localStorage.setItem("sanus_usuario", dados.nome);
}

function atualizarBotaoPerfil() {
    const usuarioEstaLogado = Boolean(localStorage.getItem("sanus_token"));

    document.querySelectorAll("[data-profile-button]").forEach((botao) => {
        const texto = botao.querySelector("span");
        if (texto) texto.textContent = usuarioEstaLogado ? "MEU PERFIL" : "ENTRAR / CADASTRAR";
        botao.setAttribute("aria-label", usuarioEstaLogado ? "Abrir meu perfil" : "Entrar ou criar uma conta");
    });
}

function acessarPerfil() {
    if (!localStorage.getItem("sanus_token")) {
        switchAuthTab("login");
        openModal("authModal");
        return;
    }

    window.location.href = `${window.ROOT_PATH || ""}meu_perfil/index.html`;
}

function configurarCadastro() {
    const formulario = document.querySelector("#auth-register form");
    if (!formulario) return;

    const campoEmail = formulario.querySelector('input[type="email"]');

    if (!formulario.querySelector("#cadastroCpf")) {
        const grupoCpf = document.createElement("div");
        grupoCpf.className = "form-group";
        grupoCpf.innerHTML = '<label>CPF</label><input id="cadastroCpf" type="text" inputmode="numeric" pattern="[0-9]{3}\\.[0-9]{3}\\.[0-9]{3}-[0-9]{2}" maxlength="14" placeholder="000.000.000-00" required>';
        campoEmail.closest(".form-group").insertAdjacentElement("afterend", grupoCpf);

        const grupoDataNascimento = document.createElement("div");
        grupoDataNascimento.className = "form-group";
        grupoDataNascimento.innerHTML = '<label>DATA DE NASCIMENTO</label><input id="cadastroDataNascimento" type="date" required>';
        grupoCpf.insertAdjacentElement("afterend", grupoDataNascimento);

        const grupoTelefone = document.createElement("div");
        grupoTelefone.className = "form-group";
        grupoTelefone.innerHTML = '<label>TELEFONE</label><input id="cadastroTelefone" type="text" inputmode="tel" pattern="\\([0-9]{2}\\)[0-9]{5}-[0-9]{4}" maxlength="14" placeholder="(00)00000-0000" required>';
        grupoDataNascimento.insertAdjacentElement("afterend", grupoTelefone);
    }

    const campoCpf = formulario.querySelector("#cadastroCpf");

    campoCpf.addEventListener("input", () => {
        let cpf = campoCpf.value.replace(/\D/g, "").slice(0, 11);

        cpf = cpf
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d{1,2})$/, "$1-$2");

        campoCpf.value = cpf;
    });

    const campoTelefone = formulario.querySelector("#cadastroTelefone");
    campoTelefone.addEventListener("input", () => {
        const telefone = campoTelefone.value.replace(/\D/g, "").slice(0, 11);
        campoTelefone.value = telefone
            .replace(/^(\d{2})(\d)/, "($1)$2")
            .replace(/(\d{5})(\d)/, "$1-$2");
    });

    formulario.addEventListener("submit", async (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();

        const campoNome = formulario.querySelector('.form-group input[type="text"]');
        const campoEmailCadastro = formulario.querySelector('input[type="email"]');
        const campoSenha = formulario.querySelector('input[type="password"]');
        const campoDataNascimento = formulario.querySelector("#cadastroDataNascimento");

        try {
            await criarUsuario(
                campoNome.value,
                campoCpf.value.replace(/\D/g, ""),
                campoEmailCadastro.value,
                campoSenha.value,
                campoDataNascimento.value,
                campoTelefone.value
            );

            document.querySelector('#auth-login input[type="email"]').value = campoEmailCadastro.value;
            switchAuthTab("login");
            exibirMensagem("Cadastro realizado. Agora informe sua senha para entrar.", "success");
        } catch (erro) {
            exibirMensagem(erro.message, "error");
        }
    }, true);
}

async function criarUsuario(nome, cpf, email, senha, data_Nasc, telefone) {
    const resposta = await fetch(`${API_URL}/usuarios`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ nome, cpf, email, senha, data_Nasc, telefone })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
        throw new Error(dados.error || "Não foi possível concluir o cadastro.");
    }

    return dados;
}

function renderProducts(items, targetId) {
    const grid = document.getElementById(targetId);
    if (!grid) return;
    grid.innerHTML = "";
    items.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
            <span class="product-badge">${product.badge}</span>
            <div class="product-img-box"><i class="ph ${product.icon}"></i></div>
            <h3>${product.title}</h3>
            <div class="price-box">
                <span class="old-price">R$ ${product.oldPrice.toFixed(2)}</span>
                <div class="current-price">R$ ${product.price.toFixed(2)}</div>
            </div>
            <div class="card-actions">
                <button class="btn btn-primary btn-block" onclick="addToCart(${product.id})">
                    <i class="ph ph-shopping-cart"></i> ADICIONAR
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function filterProducts(prefix) {
    const query = document.getElementById("searchInput").value.toLowerCase();
    const filtered = products.filter(p => p.title.toLowerCase().includes(query));
    if (document.getElementById("productGrid")) {
        renderProducts(filtered, "productGrid");
    } else {
        window.location.href = prefix + 'produtos/index.html';
    }
}

function getCart() { return JSON.parse(localStorage.getItem('sanus_cart')) || []; }
function saveCart(cartArray) { localStorage.setItem('sanus_cart', JSON.stringify(cartArray)); updateCartCount(); }

function addToCart(id) {
    const product = products.find(p => p.id === id);
    if (product) {
        let cart = getCart();
        cart.push(product);
        saveCart(cart);
        exibirMensagem(`${product.title} foi adicionado ao seu carrinho.`, "success");
    }
}

function updateCartCount() {
    let cart = getCart();
    document.querySelectorAll(".cart-count").forEach(el => { el.innerText = cart.length; });
}

function renderCart() {
    let cart = getCart();
    const container = document.getElementById("cartItemsList");
    if (!container) return;
    container.innerHTML = "";
    if (cart.length === 0) {
        container.innerHTML = "<p>Seu carrinho está vazio.</p>";
        updateCartTotals(0);
        return;
    }
    let subtotal = 0;
    cart.forEach((item, index) => {
        subtotal += item.price;
        const row = document.createElement("div");
        row.className = "cart-item";
        row.innerHTML = `
            <div><strong>${item.title}</strong><p style="font-size: 13px; color: var(--sanus-text-muted);">R$ ${item.price.toFixed(2)}</p></div>
            <button class="btn-back" style="color: var(--sanus-danger); margin: 0;" onclick="removeFromCart(${index})"><i class="ph ph-trash"></i> Remover</button>
        `;
        container.appendChild(row);
    });
    updateCartTotals(subtotal);
}

function removeFromCart(index) {
    let cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    renderCart();
}

function updateCartTotals(subtotal) {
    const formatted = `R$ ${subtotal.toFixed(2)}`;
    if(document.getElementById("cartSubtotal")) document.getElementById("cartSubtotal").innerText = formatted;
    if(document.getElementById("cartTotal")) document.getElementById("cartTotal").innerText = formatted;
}

function updateCheckoutSummary() {
    let cart = getCart();
    const total = cart.reduce((acc, item) => acc + item.price, 0);
    if(document.getElementById("checkoutTotal")) document.getElementById("checkoutTotal").innerText = `R$ ${total.toFixed(2)}`;
}

function selectPaymentMethod(method) {
    const cardSection = document.getElementById("form-card-section");
    const pixSection = document.getElementById("pix-section");
    const tabCard = document.getElementById("tab-card");
    const tabPix = document.getElementById("tab-pix");
    if (!cardSection) return;
    if (method === 'card') {
        cardSection.classList.remove("hidden"); pixSection.classList.add("hidden");
        tabCard.classList.add("active"); tabPix.classList.remove("active");
    } else {
        cardSection.classList.add("hidden"); pixSection.classList.remove("hidden");
        tabCard.classList.remove("active"); tabPix.classList.add("active");
    }
}

async function processPayment() {
    const cart = getCart();
    if (cart.length === 0) {
        exibirMensagem("O seu carrinho está vazio.", "warning");
        return;
    }

    if (!localStorage.getItem("sanus_token")) {
        exibirMensagem("Entre na sua conta para continuar com o pagamento.", "warning");
        openModal("authModal");
        return;
    }

    const isPix = !document.getElementById("pix-section").classList.contains("hidden");
    if (isPix) {
        await processarPix();
        return;
    }

    if (!cardForm) {
        exibirMensagem("O formulário de cartão ainda está carregando.", "info");
        return;
    }
    document.getElementById("form-checkout").requestSubmit();
}

function itensDoCarrinho() {
    const quantidades = new Map();
    for (const item of getCart()) {
        const id = Number(item.id);
        if (Number.isInteger(id) && id > 0) quantidades.set(id, (quantidades.get(id) || 0) + 1);
    }
    return [...quantidades].map(([produtoId, quantidade]) => ({ produtoId, quantidade }));
}

function totalDoCarrinho() {
    return getCart().reduce((total, item) => total + Number(item.price || 0), 0);
}

async function iniciarCheckoutApi() {
    try {
        const resposta = await fetch(`${API_URL}/pagamentos/config`);
        const config = await resposta.json();
        if (!resposta.ok) throw new Error(config.error || "Não foi possível carregar o pagamento.");
        if (!window.MercadoPago) throw new Error("SDK do Mercado Pago não foi carregado.");

        const mp = new MercadoPago(config.publicKey, { locale: "pt-BR" });
        cardForm = mp.cardForm({
            amount: totalDoCarrinho().toFixed(2),
            iframe: true,
            form: {
                id: "form-checkout",
                cardNumber: { id: "form-checkout__cardNumber", placeholder: "0000 0000 0000 0000" },
                expirationDate: { id: "form-checkout__expirationDate", placeholder: "MM/AA" },
                securityCode: { id: "form-checkout__securityCode", placeholder: "123" },
                cardholderName: { id: "form-checkout__cardholderName", placeholder: "Nome do titular" },
                issuer: { id: "form-checkout__issuer", placeholder: "Banco emissor" },
                installments: { id: "form-checkout__installments", placeholder: "Parcelas" },
                identificationType: { id: "form-checkout__identificationType", placeholder: "Tipo" },
                identificationNumber: { id: "form-checkout__identificationNumber", placeholder: "CPF" },
                cardholderEmail: { id: "form-checkout__cardholderEmail", placeholder: "seu@email.com" },
            },
            callbacks: {
                onFormMounted: (error) => {
                    if (error) console.error("Erro ao montar formulário de cartão:", error);
                },
                onSubmit: async (event) => {
                    event.preventDefault();
                    await processarCartao(cardForm.getCardFormData());
                },
            },
        });
    } catch (error) {
        console.error(error);
        exibirMensagem(error.message, "error");
    }
};

function openModal(id) { const m = document.getElementById(id); if(m) m.classList.add("active"); }
function closeModal(id) { const m = document.getElementById(id); if(m) m.classList.remove("active"); }
function switchAuthTab(tabName) {
    document.querySelectorAll(".auth-subview").forEach(t => t.classList.remove("active"));
    const t = document.getElementById(`auth-${tabName}`); if(t) t.classList.add("active");
}

async function dadosPerfil(){
    const resposta = await fetch(`${API_URL}/perfil`, {
        headers: {Authorization: `Bearer ${localStorage.getItem("sanus_token")}`},
    });

    const perfil = await resposta.json();
    const urlFoto = await fotoPerfil();
    const foto = document.querySelector("#perfilFoto");
    const icone = document.querySelector("#perfilFotoIcone");

    if (urlFoto){
        foto.src = urlFoto;
    } else {
        foto.removeAttribute("src");
    }

    foto.hidden = !urlFoto;
    icone.hidden = Boolean(urlFoto);

    if (!resposta.ok) {
        throw new Error(perfil.error || "Não foi possível pegar os dados do usuário");
    }

    document.querySelector("#perfilNome").textContent = perfil.nome;
    document.querySelector("#perfilEmail").textContent = perfil.email;

    document.querySelector("#nome").value = perfil.nome || "";
    document.querySelector("#email").value = perfil.email || "";
    document.querySelector("#telefone").value = perfil.telefone || "";
    document.querySelector("#cpf").value = perfil.cpf || "";
    document.querySelector("#dataNasc").value =
        perfil.data_Nasc?.slice(0, 10) || "";

    if (perfil.foto_url) {
        const foto = document.querySelector("#perfilFoto");
        foto.src = perfil.foto_url;
        foto.hidden = false;
        document.querySelector("#perfilFotoIcone").hidden = true;
    }
}

//Listar pedidos por token de usuario

async function pedidosPerfil(){
        const resposta = await fetch(`${API_URL}/perfil/pedidos`, {
            headers: {Authorization: `Bearer ${localStorage.getItem("sanus_token")}`},
    });
    const pedidos = await resposta.json()

    if(!resposta.ok){
        throw new Error(pedidos.error || "Não foi possivel carregar os seus pedidos.")
    }

    document.querySelector("#listaPedidos").innerHTML = "";
    document.querySelector("#pedidosVazio").hidden = pedidos.length > 0;
}

//Função fetch de logout
async function logout(){
    try{
        const resposta = await fetch(`${API_URL}/perfil/logout`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${localStorage.getItem("sanus_token")}`
            }
        });
        if(!resposta.ok){
            throw new Error("Não foi possível sair da conta");
        }
            localStorage.removeItem('sanus_usuario');
            localStorage.removeItem("sanus_token");
            atualizarBotaoPerfil();
            window.location.href = `${window.ROOT_PATH || ""}index.html`;        
    }catch(erro){
        console.error("Erro ao sair: ", erro)
    }
}

async function fotoPerfil(){
        const resposta = await fetch(`${API_URL}/perfil/foto_perfil`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("sanus_token")}`
            }
        });

        if (resposta.status === 404) {
            localStorage.removeItem("sanus_foto_perfil");
            return null;
        }
        const dados = await resposta.json();

        if(!resposta.ok){
            throw new Error(dados.error || "Não foi possível carregar a foto de perfil.")
        }
        localStorage.setItem("sanus_foto_perfil", dados.foto_perfil);
        return dados.foto_perfil;
}