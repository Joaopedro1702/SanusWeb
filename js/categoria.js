function renderEstrelas(nota, total = 5){
    let html = "";
    for (let i = 1; i <= total; i++){
        html += i <= nota ? "★":"☆";
    }
    return html
}

function criarCard(produto) {
  return `
    <article class="card-produto">
      <div class="card-imagem">
        <img src="${produto.imagemUrl}" alt="${produto.nome}">
      </div>
      <div class="info-produto">
        <h3 class="nome-produto">${produto.nome}</h3>
        <div class="estrelas">
          ${renderEstrelas(produto.avaliacao)}
          <span class="num-avaliacoes">(${produto.totalAvaliacoes})</span>
        </div>
      </div>
    </article>
    `;
}

const produtos = [
    {
        nome: "Remédio Genérico",
        imagemUrl:"https://placehold.co/90x90",
        avaliacao: 4,
        totalAvaliacoes: 31
    }
];

const section = document.querySelector(".lista-produtos");
section.innerHTML = produtos.map(criarCard).join("");