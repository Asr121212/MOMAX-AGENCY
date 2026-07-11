(function() {
'use strict';
/* ================================================= */
/* MOMAX V7 - Refactored Production-Ready            */
/* ================================================= */

/* =========================== */
/* ELEMENT REFERENCES          */
/* =========================== */
const productsGrid      = document.getElementById("productsGrid");
const searchInput       = document.getElementById("searchInput");
const categoryButtons   = document.querySelectorAll(".category-btn");
const cartDrawer        = document.getElementById("cartDrawer");
const cartOverlay       = document.getElementById("cartOverlay");
const openCartBtn       = document.getElementById("openCartBtn");
const closeCartBtn      = document.getElementById("closeCartBtn");
const cartItems         = document.getElementById("cartItems");
const cartCount         = document.getElementById("cartCount");
const floatingCartCount = document.getElementById("floatingCartCount");
const cartTotal         = document.getElementById("cartTotal");
const themeToggle       = document.getElementById("themeToggle");
const modalBody         = document.getElementById("modalBody");
const modalClose        = document.getElementById("modalClose");

/* =========================== */
/* STATE & INITIAL CONSTANTS   */
/* =========================== */
let currentCategory = "الكل";
let cart = JSON.parse(localStorage.getItem("momax_cart") || "[]");

// Define product grouping by category (if applicable)
const categoryGroups = {
    "شواحن كهرباء و طاقة": {
        "شواحن الكهرباء": [11,24,35,36,39,40,41,42, /* ... */ 181,184,189,235,237,238,239,240,241,242],
        "شواحن الطاقة": [6,9,10,11,26,27,28,29, /* ... */ 130,138,149,199,200,201,236,243,244,245]
    },
    "سماعات": {
        "سماعات سلكية": [], 
        "سماعات بلوتوث": []
    },
    "ريموتات و رسيفرات": {
        "ريموتات": [], 
        "رسيفرات": []
    }
};

/* ================================= */
/* HELPER FUNCTIONS (Debounce, etc.) */
/* ================================= */
/**
 * Debounce: delays function execution until after `wait` ms have elapsed
 * since the last time it was invoked. Useful for limiting search calls.
 */
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

/* ================================= */
/* RENDER PRODUCTS (with grouping)  */
/* ================================= */
function renderProducts() {
    if (!productsGrid) return;
    const keyword = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const filtered = products.filter(product => {
        const categoryMatch = (currentCategory === "الكل" || product.category === currentCategory);
        const searchMatch = product.name.toLowerCase().includes(keyword)
                          || String(product.id).includes(keyword);
        return categoryMatch && searchMatch;
    });

    // If no products match, show a placeholder message
    if (filtered.length === 0) {
        productsGrid.innerHTML = `
            <div class="empty-products">
                <h3>لا توجد منتجات</h3>
                <p>جرّب كلمة بحث أخرى</p>
            </div>`;
        activateReveal();
        return;
    }

    // Build the HTML for all groups/categories
    let html = "";
    const groups = categoryGroups[currentCategory];
    if (groups) {
        Object.keys(groups).forEach(groupTitle => {
            const groupProducts = filtered.filter(p => groups[groupTitle].includes(p.id));
            if (groupProducts.length === 0) return;
            html += `
            <div class="product-group-title">${groupTitle}</div>
            <div class="product-group-line"></div>`;
            groupProducts.forEach(product => {
                html += `
            <div class="product-card reveal">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                </div>
                <div class="product-info">
                    <div class="product-category">${product.category}</div>
                    <div class="product-title">${product.name}</div>
                    <div class="product-price">${product.price} ر.س</div>
                    <button class="details-btn" onclick="showProduct(${product.id})">التفاصيل</button>
                    <button class="add-cart-btn" onclick="addToCart(${product.id})">أضف للسلة</button>
                </div>
            </div>`;
            });
        });
    }
    // Apply the constructed HTML to the DOM once
    productsGrid.innerHTML = html;
    activateReveal();
}

/* ================================= */
/* SEARCH & CATEGORY EVENT BINDING  */
/* ================================= */
// Debounced search input
searchInput?.addEventListener("input", debounce(renderProducts, 300));
// Category button clicks
categoryButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        categoryButtons.forEach(item => item.classList.remove("active"));
        btn.classList.add("active");
        currentCategory = btn.dataset.category;
        renderProducts();
    });
});

/* ========================= */
/* CART FUNCTIONS & RENDER   */
/* ========================= */
/**
 * Rebuilds the cart UI and updates totals.
 */
function updateCart() {
    if (!cartItems) return;
    cartItems.innerHTML = "";
    let total = 0, count = 0;
    let html = "";
    cart.forEach(item => {
        total += item.price * item.qty;
        count += item.qty;
        html += `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-info">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-qty-container">
                    <button onclick="decreaseQty(${item.id})">-</button>
                    <span class="cart-item-qty">${item.qty}</span>
                    <button onclick="increaseQty(${item.id})">+</button>
                </div>
                <div class="cart-item-price">${item.price * item.qty} ر.س</div>
                <button class="remove-item" onclick="removeFromCart(${item.id})">حذف</button>
            </div>
        </div>`;
    });
    cartItems.innerHTML = html;
    cartCount.textContent = count;
    if (floatingCartCount) floatingCartCount.textContent = count;
    cartTotal.textContent = total;
    saveCart();
}

/**
 * Adds a product to the cart (or increments quantity).
 */
function addToCart(id) {
    const product = products.find(item => item.id === id);
    if (!product) return;
    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ id: product.id, name: product.name, price: product.price, image: product.image, qty: 1 });
    }
    updateCart();
}

/**
 * Removes an item from the cart.
 */
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCart();
}

/**
 * Increase quantity of a cart item.
 */
function increaseQty(id) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.qty++;
        updateCart();
    }
}

/**
 * Decrease quantity or remove if reaches 0.
 */
function decreaseQty(id) {
    const item = cart.find(item => item.id === id);
    if (!item) return;
    item.qty--;
    if (item.qty <= 0) {
        removeFromCart(id);
    } else {
        updateCart();
    }
}

/**
 * Clear all items from the cart.
 */
function clearCart() {
    cart = [];
    updateCart();
}

/* ================= */
/* PRODUCT MODAL     */
/* ================= */
/**
 * Displays product details in a modal.
 */
function showProduct(id) {
    const product = products.find(item => item.id === id);
    if (!product) return;
    modalBody.innerHTML = `
        <div class="modal-product-image">
            <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="modal-product-details">
            <h3>${product.name}</h3>
            <p class="modal-product-price">${product.price} ر.س</p>
            <p class="modal-product-description">${product.description || ""}</p>
            <button onclick="addToCart(${product.id})">أضف للسلة</button>
        </div>`;
    cartOverlay.classList.add("active");
}

/* ================= */
/* THEME TOGGLER     */
/* ================= */
const savedTheme = localStorage.getItem("momax_theme");
if (savedTheme) {
    document.body.className = savedTheme;
}
updateThemeIcon();
themeToggle?.addEventListener("click", () => {
    document.body.classList.toggle("theme-dark");
    document.body.classList.toggle("theme-light");
    localStorage.setItem("momax_theme", document.body.className);
    updateThemeIcon();
});
function updateThemeIcon() {
    themeToggle.textContent = document.body.classList.contains("theme-dark") ? "☀️" : "🌙";
}

/* ============== */
/* PERSISTENCE    */
/* ============== */
/**
 * Save cart to localStorage (with error handling).
 */
function saveCart() {
    try {
        localStorage.setItem("momax_cart", JSON.stringify(cart));
    } catch (e) {
        console.error("Could not save cart:", e);
    }
}

/* ============== */
/* INITIAL SETUP  */
/* ============== */
updateCart();
renderProducts();

// Expose key functions for inline HTML handlers
window.addToCart      = addToCart;
window.showProduct    = showProduct;
window.removeFromCart = removeFromCart;
window.increaseQty    = increaseQty;
window.decreaseQty    = decreaseQty;
window.clearCart      = clearCart;
})();
