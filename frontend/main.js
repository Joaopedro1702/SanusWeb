//nossos fetchs

//Produtos
const API_URL = "https://sanus-backend.onrender.com";

async function carregarProdutos(){
    const token = localStorage.getItem("sanus_token");

    const resposta = await fetch(`${API_URL}/produtos`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!resposta.ok){
        throw new Error("Não foi possivel carregar os produtos.")

    }
    document.addEventListener("DOMContentLoaded", () => {
        if (document.getElementById("produtctGrid")){
            carregarProdutos();
        }

        if (document.getElementById(cartItemList)){
            renderCart();
        }

        if (document.getElementById(checkoutTotal)){
            updateCheckoutSumary();
        }
    })

    const produtosDaApi = await resposta.json();

    //Vai ajustar os nomes que a API devolve aos nomes usado pelo front

    const produtos = produtosDaApi.map((produto) => ({
        id: produto.id,
        title: produto.nome,
        price: Number(produto.preco),
        oldPrice: Number(produto.preco),
        badge: produto.tarja || "",
        icon: "ph-pill"
    }));

    renderProducts(produtos, "produtosGrid");
};

//Login

async function fazerLogin(email, senha){
    const resposta = await fetch(`${API_URL}`, {
        method: "POST",
        headers:{
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, senha})
    });

    const dados = await resposta.json();

    if(!resposta.ok){
        throw new Error(dados.error || "Não foi possivel entrar.");
    }
    localStorage.setItem("sanus_token", dados.token);
    localStorage.setItem("sanus_usuario", dados.nome);
}