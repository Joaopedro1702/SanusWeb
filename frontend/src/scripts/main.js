
const API_URL = "https://sanus-backend.onrender.com/api";

document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    configurarLogin();

    if (document.getElementById("productGrid")) {
        if (localStorage.getItem("sanus_token")) {
            carregarProdutos();
        } else {
            openModal("authModal");
        }
    }

    if (document.getElementById("cartItemsList")) {
        renderCart();
    }

    if (document.getElementById("checkoutTotal")) {
        updateCheckoutSummary();
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
        alert("Não foi possível carregar os produtos. Tente novamente em instantes.");
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

            if (document.getElementById("productGrid")) {
                carregarProdutos();
            }
        } catch (erro) {
            alert(erro.message);
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
        alert(`${product.title} foi adicionado ao seu carrinho.`);
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

function processPayment() {
    let cart = getCart();
    if (cart.length === 0) { alert("O seu carrinho está vazio."); return; }
    const cardNum = document.getElementById("cardNum").value;
    const isCard = !document.getElementById("form-card-section").classList.contains("hidden");
    if (isCard && cardNum.startsWith("0000")) {
        window.location.href = window.ROOT_PATH + "falha/index.html"; 
    } else {
        saveCart([]); 
        window.location.href = window.ROOT_PATH + "sucesso/index.html";
    }
}

function copyPixCode() {
    navigator.clipboard.writeText("00020126580014BR.GOV.BCB.PIX0114SANUSPAGAMENTOS");
    alert("Código PIX copiado.");
}

function openModal(id) { const m = document.getElementById(id); if(m) m.classList.add("active"); }
function closeModal(id) { const m = document.getElementById(id); if(m) m.classList.remove("active"); }
function switchAuthTab(tabName) {
    document.querySelectorAll(".auth-subview").forEach(t => t.classList.remove("active"));
    const t = document.getElementById(`auth-${tabName}`); if(t) t.classList.add("active");
}
