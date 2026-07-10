/* ================================================= */
/* MOMAX V7 FINAL */
/* ================================================= */

/* PRODUCTS GRID */

const productsGrid =
document.getElementById("productsGrid");

/* SEARCH */

const searchInput =
document.getElementById("searchInput");

/* CATEGORIES */

const categoryButtons =
document.querySelectorAll(".category-btn");

/* MODAL */

const productModal =
document.getElementById("productModal");

const modalOverlay =
document.getElementById("modalOverlay");

const modalBody =
document.getElementById("modalBody");

const closeModalBtn =
document.getElementById("closeModalBtn");

/* CART */

const cartDrawer =
document.getElementById("cartDrawer");

const cartOverlay =
document.getElementById("cartOverlay");

const openCartBtn =
document.getElementById("openCartBtn");

const closeCartBtn =
document.getElementById("closeCartBtn");

const cartItems =
document.getElementById("cartItems");

const cartCount =
document.getElementById("cartCount");

const floatingCart =
document.getElementById("floatingCart");

const floatingCartCount =
document.getElementById("floatingCartCount");

const cartTotal =
document.getElementById("cartTotal");

const clearCartBtn =
document.getElementById("clearCartBtn");

const whatsappOrderBtn =
document.getElementById("whatsappOrderBtn");

/* HERO */

const heroWhatsappBtn =
document.getElementById("heroWhatsappBtn");

const floatingWhatsapp =
document.getElementById("floatingWhatsapp");

/* THEME */

const themeToggle =
document.getElementById("themeToggle");

/* STATE */

let currentCategory = "الكل";

let cart =
JSON.parse(
localStorage.getItem("momax_cart")
) || [];

/* ================================================= */
/* PRODUCT GROUPS */
/* ================================================= */

const categoryGroups = {

    "شواحن كهرباء و طاقة": {
        "شواحن الكهرباء": [11 , 24 , 35 , 36 , 39 , 40 , 41 , 42 , 43 , 81 , 94 , 102 , 111 , 112 , 117 , 118 , 121 , 122 , 123 , 125 , 126 , 132 , 133 , 137 , 141 , 142 , 143 , 144 , 155 , 156 , 157 , 158 , 164 , 166 , 181 , 184 , 189 , 235 , 237 , 238 , 239 , 240 , 241 , 242],
        "شواحن الطاقة": [6 , 9 , 10 , 11 , 26 , 27 , 28 , 29 , 30 , 31 , 44 , 50 , 51 , 95 , 99 , 103 , 104 , 106 , 127 , 128 , 129 , 130 , 138 , 149 , 199 , 200 , 201 , 236 , 243 , 244 , 245]
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

/* ================================================= */
/* LOADER */
/* ================================================= */

document.addEventListener(
"DOMContentLoaded",
() => {

const loader =
document.getElementById("loader");

if(loader){

setTimeout(() => {

loader.style.opacity = "0";

setTimeout(() => {

loader.style.display = "none";

},500);

},1000);

}

}
);

/* ================================================= */
/* THEME SYSTEM */
/* ================================================= */

const savedTheme =
localStorage.getItem(
"momax_theme"
);

if(savedTheme){

document.body.className =
savedTheme;

}

updateThemeIcon();

themeToggle?.addEventListener(
"click",
() => {

if(
document.body.classList.contains(
"theme-dark"
)
){

document.body.classList.remove(
"theme-dark"
);

document.body.classList.add(
"theme-light"
);

}else{

document.body.classList.remove(
"theme-light"
);

document.body.classList.add(
"theme-dark"
);

}

localStorage.setItem(
"momax_theme",
document.body.className
);

updateThemeIcon();

}
);

function updateThemeIcon(){

if(
document.body.classList.contains(
"theme-dark"
)
){

themeToggle.textContent = "☀️";

}else{

themeToggle.textContent = "🌙";

}

}

/* ================================================= */
/* CART STORAGE */
/* ================================================= */

function saveCart(){

localStorage.setItem(
"momax_cart",
JSON.stringify(cart)
);

}

/* ================================================= */
/* CART DRAWER */
/* ================================================= */

function openCart(){

cartDrawer.classList.add(
"show"
);

cartOverlay.classList.add(
"show"
);

}

function closeCart(){

cartDrawer.classList.remove(
"show"
);

cartOverlay.classList.remove(
"show"
);

}

openCartBtn?.addEventListener(
"click",
openCart
);

floatingCart?.addEventListener(
"click",
openCart
);

closeCartBtn?.addEventListener(
"click",
closeCart
);

cartOverlay?.addEventListener(
"click",
closeCart
);

/* ================================================= */
/* CART FUNCTIONS */
/* ================================================= */

function addToCart(id){

const product =
products.find(
item => item.id === id
);

if(!product) return;

const existing =
cart.find(
item => item.id === id
);

if(existing){

existing.qty++;

}else{

cart.push({

id:product.id,

name:product.name,

price:product.price,

image:product.image,

qty:1

});

}

updateCart();

}

function increaseQty(id){

const item =
cart.find(
item => item.id === id
);

if(item){

item.qty++;

updateCart();

}

}

function decreaseQty(id){

const item =
cart.find(
item => item.id === id
);

if(!item) return;

item.qty--;

if(item.qty <= 0){

removeFromCart(id);

return;

}

updateCart();

}

function removeFromCart(id){

cart =
cart.filter(
item => item.id !== id
);

updateCart();

}

/* ================================================= */
/* CLEAR CART */
/* ================================================= */

function clearCart(){

cart = [];

updateCart();

}

/* ================================================= */
/* UPDATE CART UI */
/* ================================================= */

function updateCart(){

if(!cartItems) return;

cartItems.innerHTML = "";

let total = 0;
let count = 0;

cart.forEach(item => {

total += item.price * item.qty;
count += item.qty;

cartItems.innerHTML += `

<div class="cart-item">

<img
src="${item.image}"
alt="${item.name}">

<div class="cart-item-info">

<div class="cart-item-title">

${item.name}

</div>

<div class="cart-item-price">

${item.price} ر.ي

</div>

<div class="cart-qty">

<button
onclick="decreaseQty(${item.id})">

-

</button>

<span>

${item.qty}

</span>

<button
onclick="increaseQty(${item.id})">

+

</button>

</div>

<button
class="remove-item"
onclick="removeFromCart(${item.id})">

حذف

</button>

</div>

</div>

`;

});

cartCount.textContent = count;

if(floatingCartCount){
floatingCartCount.textContent = count;
}

if(floatingCart){
floatingCart.classList.remove("cart-pop");
void floatingCart.offsetWidth;
floatingCart.classList.add("cart-pop");
}

if(floatingCartCount){

    floatingCartCount.textContent = count;

}

if(floatingCart){

    floatingCart.classList.remove("cart-pop");

    void floatingCart.offsetWidth;

    floatingCart.classList.add("cart-pop");

}

cartTotal.textContent = total;

saveCart();

}

/* ================================================= */
/* PRODUCT MODAL */
/* ================================================= */

function showProduct(id){

const product =
products.find(
item => item.id === id
);

if(!product) return;

modalBody.innerHTML = `

<div class="modal-image">

<img
src="${product.image}"
alt="${product.name}">

</div>

<div class="modal-info">

<div class="modal-category">

${product.category}

</div>

<h2 class="modal-title">

${product.name}

</h2>

<p class="modal-description">

${product.description}

</p>

<div class="modal-price">

${product.price} ر.ي

</div>

<button
class="hero-btn primary-btn"
onclick="addToCart(${product.id})">

أضف للسلة

</button>

</div>

`;

productModal.classList.add("show");
modalOverlay.classList.add("show");

}

function closeModal(){

productModal.classList.remove(
"show"
);

modalOverlay.classList.remove(
"show"
);

}

closeModalBtn?.addEventListener(
"click",
closeModal
);

modalOverlay?.addEventListener(
"click",
closeModal
);

/* ================================================= */
/* RENDER PRODUCTS */
/* ================================================= */

function renderProducts(){

if(!productsGrid) return;

const keyword =
searchInput
? searchInput.value.toLowerCase()
: "";

const filtered =
products.filter(product => {

const categoryMatch =
currentCategory === "الكل"
||
product.category === currentCategory;

const searchMatch =
product.name.toLowerCase().includes(keyword) ||
String(product.id).includes(keyword);

return categoryMatch && searchMatch;

});

if(filtered.length === 0){

productsGrid.innerHTML = `

<div class="empty-products">

<h3>

لا توجد منتجات

</h3>

<p>

جرّب كلمة بحث أخرى

</p>

</div>

`;

return;

}

productsGrid.innerHTML = "";

productsGrid.innerHTML = "";

const groups = categoryGroups[currentCategory];

if (groups) {

    Object.keys(groups).forEach(groupTitle => {

        const groupProducts = filtered.filter(product =>
            groups[groupTitle].includes(product.id)
        );

        if (groupProducts.length === 0) return;

        productsGrid.innerHTML += `
            <div class="product-group-title">
                ${groupTitle}
            </div>

            <div class="product-group-line"></div>
        `;

        groupProducts.forEach(product => {

            productsGrid.innerHTML += `

            <div class="product-card reveal">

                <div class="product-image">

                    <img
                    src="${product.image}" loading="lazy"
                    alt="${product.name}">

                </div>

                <div class="product-info">

                    <div class="product-category">

                        ${product.category}

                    </div>

                    <div class="product-title">

                        ${product.name}

                    </div>

                    <div class="product-id">

                        ID: ${product.id}

                    </div>

                    <div class="product-description">

                        ${product.description}

                    </div>

                    <div class="product-price">

                        ${product.price} ر.ي

                    </div>

                    <div class="product-actions">

                        <button
                        class="details-btn"
                        onclick="showProduct(${product.id})">

                            التفاصيل

                        </button>

                        <button
                        class="add-cart-btn"
                        onclick="addToCart(${product.id})">

                            أضف للسلة

                        </button>

                    </div>

                </div>

            </div>

            `;

        });

    });

} else {

    filtered.forEach(product => {

        productsGrid.innerHTML += `

        <div class="product-card reveal">

            <div class="product-image">

                <img
                src="${product.image}" loading="lazy"
                alt="${product.name}">

            </div>

            <div class="product-info">

                <div class="product-category">

                    ${product.category}

                </div>

                <div class="product-title">

                    ${product.name}

                </div>

                <div class="product-id">

                    ID: ${product.id}

                </div>

                <div class="product-description">

                    ${product.description}

                </div>

                <div class="product-price">

                    ${product.price} ر.ي

                </div>

                <div class="product-actions">

                    <button
                    class="details-btn"
                    onclick="showProduct(${product.id})">

                        التفاصيل

                    </button>

                    <button
                    class="add-cart-btn"
                    onclick="addToCart(${product.id})">

                        أضف للسلة

                    </button>

                </div>

            </div>

        </div>

        `;

    });

}

activateReveal();

}

/* ================================================= */
/* SEARCH */
/* ================================================= */

searchInput?.addEventListener(
"input",
renderProducts
);

/* ================================================= */
/* CATEGORIES */
/* ================================================= */

categoryButtons.forEach(btn => {

btn.addEventListener(
"click",
() => {

categoryButtons.forEach(item => {

item.classList.remove(
"active"
);

});

btn.classList.add(
"active"
);

currentCategory =
btn.dataset.category;

renderProducts();

}
);

});

/* ================================================= */
/* WHATSAPP */
/* ================================================= */

function openWhatsapp(){

window.open(
"https://wa.me/",
"_blank"
);

}

heroWhatsappBtn?.addEventListener(
"click",
e => {

e.preventDefault();

openWhatsapp();

}
);

floatingWhatsapp?.addEventListener(
"click",
openWhatsapp
);

whatsappOrderBtn?.addEventListener(
"click",
() => {

if(cart.length === 0) return;

let message =
"طلب جديد من MOMAX%0A%0A";

cart.forEach(item => {

message +=
`${item.name} × ${item.qty}%0A`;

});

message +=
`%0Aالإجمالي: ${cartTotal.textContent} ر.ي`;

window.open(
`https://wa.me/?text=${message}`,
"_blank"
);

}
);

/* ================================================= */
/* BUTTONS */
/* ================================================= */

clearCartBtn?.addEventListener(
"click",
clearCart
);

/* ================================================= */
/* REVEAL */
/* ================================================= */

function activateReveal(){

const elements =
document.querySelectorAll(
".reveal"
);

const observer =
new IntersectionObserver(

entries => {

entries.forEach(entry => {

if(entry.isIntersecting){

entry.target.classList.add(
"show"
);

}

});

},

{
threshold:0.1
}

);

elements.forEach(el => {

observer.observe(el);

});

}

function updateCategoryCounts() {

    const buttons = document.querySelectorAll(".category-btn");

    buttons.forEach(button => {

        const category = button.dataset.category;

        const originalName = category;

        let count = 0;

        if (category === "الكل") {
            count = products.length;
        } else {
            count = products.filter(
                product => product.category === category
            ).length;
        }

        button.textContent = `${originalName} (${count})`;

    });

}

/* ================================================= */
/* START */
/* ================================================= */

updateCart();

renderProducts();

updateCategoryCounts();

activateReveal();