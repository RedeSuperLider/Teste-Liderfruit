// Atualiza o título da página e o título no corpo
window.addEventListener("DOMContentLoaded", () => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('pt-BR');
    const pageTitle = `Pedido Líder Fruit ${formattedDate}`;

    document.title = pageTitle;
    document.getElementById("tituloNoCorpo").textContent = pageTitle;

    // NOVO: Chama a nova função para buscar os itens da API
    fetchAndRenderItems();
    applySavedTheme(); // Aplica o tema salvo ao carregar a página
});

// NOVO: Adiciona um array vazio para ser preenchido pela API
let items = [];
const itemQuantities = new Map();

// NOVO: Função assíncrona para buscar os itens da API e renderizá-los
async function fetchAndRenderItems() {
    const itemList = document.getElementById("items-list");
    // Mensagem de carregamento (opcional, mas recomendado)
    itemList.innerHTML = `<p id="loading-message" style="text-align: center; color: #555;">Carregando itens...</p>`;

    try {
        // MUDANÇA: Use o URL completo da API fornecida pelo usuário
        const response = await fetch('https://api-teste-git-main-lucas-projects-1dd37544.vercel.app/api/itens'); 
        if (!response.ok) {
            throw new Error(`Erro na rede: ${response.statusText}`);
        }
        items = await response.json();

        // Inicializa o mapa de quantidades com os itens da API
        itemQuantities.clear();
        items.forEach(item => itemQuantities.set(item, 0));

        preencherListaDeItens();
    } catch (error) {
        console.error("Falha ao carregar os itens:", error);
        itemList.innerHTML = `<p style="text-align: center; color: red;">Não foi possível carregar a lista de itens. Por favor, tente novamente.</p>`;
    }
}

// A função preencherListaDeItens agora usa a variável global 'items'
function preencherListaDeItens() {
    const itemList = document.getElementById("items-list");
    itemList.innerHTML = '';

    items.forEach(item => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `
            <div class="item">
                <span>${item}</span>
                <div class="quantity-control">
                    <button type="button" class="quantity-btn minus-btn"><i>-</i></button>
                    <input type="number" class="item-quantity" placeholder="0" value="${itemQuantities.get(item)}" min="0" data-item-name="${item}">
                    <button type="button" class="quantity-btn plus-btn"><i>+</i></button>
                </div>
            </div>
        `;
        itemList.appendChild(listItem);
    });

    // Delegação de Eventos para os botões
    itemList.addEventListener("click", (event) => {
        const target = event.target;
        const button = target.closest(".quantity-btn");
        if (!button) return;

        const input = button.parentElement.querySelector(".item-quantity");
        let currentValue = parseInt(input.value) || 0;
        const itemName = input.dataset.itemName;

        if (button.classList.contains("plus-btn")) {
            currentValue++;
        } else if (button.classList.contains("minus-btn") && currentValue > 0) {
            currentValue--;
        }

        input.value = currentValue;
        itemQuantities.set(itemName, currentValue);
        atualizarTotalizador();
    });

    // Delegação de Eventos para os inputs
    itemList.addEventListener("input", (event) => {
        const target = event.target;
        if (target.classList.contains("item-quantity")) {
            const itemName = target.dataset.itemName;
            itemQuantities.set(itemName, parseInt(target.value) || 0);
            atualizarTotalizador();
        }
    });

    // Comportamento para o valor 0 do input
    itemList.addEventListener("focusin", (event) => {
        const target = event.target;
        if (target.classList.contains("item-quantity") && target.value === "0") {
            target.value = "";
        }
    });

    itemList.addEventListener("focusout", (event) => {
        const target = event.target;
        if (target.classList.contains("item-quantity") && target.value === "") {
            target.value = "0";
            const itemName = target.dataset.itemName;
            itemQuantities.set(itemName, 0);
            atualizarTotalizador();
        }
    });

    atualizarTotalizador();
}

function atualizarTotalizador() {
    let total = 0;
    for (const quantity of itemQuantities.values()) {
        total += quantity;
    }
    document.getElementById("total-items").textContent = total;
}

// Lógica do Modal de Confirmação (sem alterações, já estava boa)
const submitOrderButton = document.getElementById("submit-order");
const confirmationModal = document.getElementById("confirmation-modal");
const closeButton = document.querySelector(".close-button");
const confirmSendWhatsappButton = document.getElementById("confirm-send-whatsapp");
const cancelSendButton = document.getElementById("cancel-send");
const orderSummaryDiv = document.getElementById("order-summary");

let currentOrderMessage = "";

submitOrderButton.addEventListener("click", () => {
    const companyNameInput = document.getElementById("company-name");
    const notificationBar = document.getElementById("notification-bar");
    const fixedBottomBar = document.querySelector(".fixed-bottom-bar");

    companyNameInput.classList.remove("invalid-field", "blink-invalid");

    if (companyNameInput.value.trim() === "") {
        companyNameInput.classList.add("invalid-field", "blink-invalid");
        const bottomBarHeight = fixedBottomBar.offsetHeight;
        notificationBar.style.bottom = `${bottomBarHeight}px`;
        notificationBar.classList.add("show");
        window.scrollTo({ top: 0, behavior: 'smooth' });

        setTimeout(() => {
            notificationBar.classList.remove("show");
            companyNameInput.classList.remove("invalid-field", "blink-invalid");
        }, 5000);
        return;
    }

    notificationBar.classList.remove("show");

    const today = new Date();
    const formattedDate = today.toLocaleDateString('pt-BR');
    let orderSummaryHtml = `<p><strong>Empresa:</strong> ${companyNameInput.value}</p><p><strong>Data do Pedido:</strong> ${formattedDate}</p><p><strong>Itens do Pedido:</strong></p><ul>`;
    let totalQuantity = 0;
    currentOrderMessage = `Pedido (${formattedDate}):\nEmpresa: ${companyNameInput.value}\n\nItens:\n`;
    let hasItemsInOrder = false;

    itemQuantities.forEach((quantity, itemName) => {
        if (quantity > 0) {
            hasItemsInOrder = true;
            orderSummaryHtml += `<li>${itemName}: ${quantity}</li>`;
            currentOrderMessage += `${itemName}: ${quantity}\n`;
            totalQuantity += quantity;
        }
    });

    if (!hasItemsInOrder) {
        orderSummaryHtml += `<p>Nenhum item selecionado.</p>`;
    }

    orderSummaryHtml += `</ul><p><strong>Total de Volumes:</strong> ${totalQuantity}</p>`;
    currentOrderMessage += `\nTotal de Volumes: ${totalQuantity}`;
    orderSummaryDiv.innerHTML = orderSummaryHtml;

    confirmationModal.style.display = "flex";
    document.body.classList.add('no-scroll');
});

function closeModal() {
    confirmationModal.style.display = "none";
    document.body.classList.remove('no-scroll');
}

closeButton.addEventListener("click", closeModal);
cancelSendButton.addEventListener("click", closeModal);
window.addEventListener("click", (event) => {
    if (event.target === confirmationModal) {
        closeModal();
    }
});

confirmSendWhatsappButton.addEventListener("click", () => {
    const encodedMessage = encodeURIComponent(currentOrderMessage);
    const whatsappLink = `https://api.whatsapp.com/send?phone=+552299912-9013&text=${encodedMessage}`;
    window.open(whatsappLink, "_blank");
    closeModal();
});


// Lógica do Modo Escuro (simplificada)
const darkModeToggle = document.getElementById("dark-mode-toggle");

darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    // Salva a preferência no localStorage
    if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("theme", "dark");
    } else {
        localStorage.setItem("theme", "light");
    }
});

function applySavedTheme() {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
    } else {
        document.body.classList.remove("dark-mode");
    }
}