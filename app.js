/* ================================================= */
/* MOMAX REDESIGN LOGIC - VANILLA JS                 */
/* ================================================= */

document.addEventListener('DOMContentLoaded', () => {
    
    // Elements
    const productGrid = document.getElementById('productGrid');
    const categoriesContainer = document.getElementById('categoriesContainer');
    const searchInput = document.getElementById('searchInput');
    const noResults = document.getElementById('noResults');
    
    // Cart Elements
    const cartDrawer = document.getElementById('cartDrawer');
    const cartDrawerOverlay = document.getElementById('cartDrawerOverlay');
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartTotalEl = document.getElementById('cartTotal');
    const cartBadges = document.querySelectorAll('.cart-badge');
    
    // Sheet Elements
    const productSheet = document.getElementById('productSheet');
    const productSheetOverlay = document.getElementById('productSheetOverlay');
    const sheetContent = document.getElementById('sheetContent');
    
    // State
    let currentCategory = 'الكل';
    let searchQuery = '';
    let cart = JSON.parse(localStorage.getItem('momax_v8_cart')) || [];
    
    // Extract unique categories and add 'الكل'
    const categories = ['الكل', ...new Set(products.map(p => p.category))];

    // =================================================
    // INITIALIZATION
    // =================================================
    function init() {
        initTheme();
        renderCategories();
        renderProducts();
        updateCartUI();
        setupEventListeners();
        setupLazyLoading();
    }

    // =================================================
    // RENDER FUNCTIONS
    // =================================================
    function renderCategories() {
        categoriesContainer.innerHTML = categories.map(cat => `
            <button class="chip ${cat === currentCategory ? 'active' : ''}" data-category="${cat}">
                ${cat}
            </button>
        `).join('');
    }

    function renderProducts() {
        let filtered = products.filter(p => {
            const matchCategory = currentCategory === 'الكل' || p.category === currentCategory;
            // Search matches name or EXACT ID
            const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                p.id.toString() === searchQuery.trim();
            return matchCategory && matchSearch;
        });

        if (filtered.length === 0) {
            productGrid.innerHTML = '';
            noResults.classList.remove('hidden');
            return;
        }

        noResults.classList.add('hidden');
        
        // Show Skeletons first for better perceived performance
        productGrid.innerHTML = filtered.map(() => `
            <div class="product-card">
                <div class="card-img-wrapper"><div class="skeleton skeleton-img"></div></div>
                <div class="card-body">
                    <div class="skeleton skeleton-text short"></div>
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-btn"></div>
                </div>
            </div>
        `).join('');

        // Simulate short network delay to process images, then render real cards
        setTimeout(() => {
            productGrid.innerHTML = filtered.map(product => `
                <div class="product-card" onclick="openProductSheet(${product.id})">
                    <div class="card-img-wrapper">
                        <div class="skeleton skeleton-img"></div>
                        <img data-src="${product.image}" alt="${product.name}" onload="this.classList.add('loaded'); this.previousElementSibling.remove();">
                    </div>
                    <div class="card-body">
                        <div class="card-category">${product.category}</div>
                        <div class="card-title">${product.name}</div>
                        <div class="card-id">ID: ${product.id}</div>
                        <div class="card-price">${product.price || 'أسعار مميزة'} ر.ي</div>
                        <div class="card-actions">
                            <button class="btn-add" onclick="event.stopPropagation(); addToCart(${product.id})">أضف للسلة</button>
                        </div>
                    </div>
                </div>
            `).join('');
            setupLazyLoading();
        }, 150);
    }

    // Lazy Loading Images
    function setupLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.getAttribute('data-src');
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        }, { rootMargin: '50px 0px', threshold: 0.01 });

        images.forEach(img => imageObserver.observe(img));
    }

    // =================================================
    // CART LOGIC
    // =================================================
    window.addToCart = (id) => {
        const product = products.find(p => p.id === id);
        if (!product) return;
        
        const existing = cart.find(item => item.id === id);
        if (existing) existing.qty++;
        else cart.push({ ...product, qty: 1 });
        
        saveCart();
        updateCartUI();
        
        // Brief visual feedback
        const btn = event.target;
        const originalText = btn.innerText;
        btn.innerText = '✓ تمت الإضافة';
        btn.style.backgroundColor = 'var(--success)';
        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.backgroundColor = '';
        }, 1000);
    };

    window.updateQty = (id, change) => {
        const item = cart.find(i => i.id === id);
        if (!item) return;
        
        item.qty += change;
        if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
        
        saveCart();
        updateCartUI();
    };

    window.removeFromCart = (id) => {
        cart = cart.filter(i => i.id !== id);
        saveCart();
        updateCartUI();
    };

    function saveCart() {
        localStorage.setItem('momax_v8_cart', JSON.stringify(cart));
    }

    function updateCartUI() {
        const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
        
        // Price logic: Many items in products.js lack a 'price' field. Defaulting to 0 for sum if missing.
        const totalPrice = cart.reduce((sum, item) => sum + ((item.price || 0) * item.qty), 0);
        
        cartBadges.forEach(badge => {
            badge.innerText = totalItems;
            badge.style.display = totalItems > 0 ? 'inline-block' : 'none';
        });

        cartTotalEl.innerText = totalPrice > 0 ? `${totalPrice} ر.ي` : 'حسب الطلب';

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="no-results">السلة فارغة</div>';
            return;
        }

        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">${item.price ? item.price + ' ر.ي' : 'السعر عند الطلب'}</div>
                    <div class="cart-item-actions">
                        <div class="qty-controls">
                            <button onclick="updateQty(${item.id}, -1)">-</button>
                            <span>${item.qty}</span>
                            <button onclick="updateQty(${item.id}, 1)">+</button>
                        </div>
                        <button class="remove-btn" onclick="removeFromCart(${item.id})">حذف</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // =================================================
    // PRODUCT SHEET (MODAL)
    // =================================================
    window.openProductSheet = (id) => {
        const product = products.find(p => p.id === id);
        if (!product) return;

        sheetContent.innerHTML = `
            <div class="sheet-img-container">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div>
                <div class="sheet-meta">
                    <span>ID: ${product.id}</span>
                    <span style="color: var(--primary); font-weight:bold;">${product.category}</span>
                </div>
                <h2 class="sheet-title">${product.name}</h2>
                <p class="sheet-desc">${product.description || 'لا يوجد وصف متاح حالياً لهذا المنتج.'}</p>
                
                <div class="sheet-price-row">
                    <span class="sheet-price">${product.price ? product.price + ' ر.ي' : 'السعر عند الطلب'}</span>
                </div>
                <button class="btn btn-primary" style="width: 100%" onclick="addToCart(${product.id}); closeSheet();">أضف إلى السلة 🛒</button>
            </div>
        `;

        productSheet.classList.remove('hidden');
        productSheetOverlay.classList.remove('hidden');
        // Small delay for CSS transition to trigger
        setTimeout(() => productSheet.classList.add('open'), 10);
    };

    window.closeSheet = () => {
        productSheet.classList.remove('open');
        setTimeout(() => {
            productSheet.classList.add('hidden');
            productSheetOverlay.classList.add('hidden');
        }, 300); // match CSS transition duration
    };

    // =================================================
    // EVENT LISTENERS
    // =================================================
    function setupEventListeners() {
        // Category Chips filtering
        categoriesContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('chip')) {
                currentCategory = e.target.dataset.category;
                renderCategories();
                renderProducts();
            }
        });

        // Search Input
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            renderProducts();
        });

        // Cart Drawer Toggles
        const openCart = () => {
            cartDrawer.classList.remove('hidden');
            cartDrawerOverlay.classList.remove('hidden');
            setTimeout(() => cartDrawer.classList.add('open'), 10);
        };
        const closeCart = () => {
            cartDrawer.classList.remove('open');
            setTimeout(() => {
                cartDrawer.classList.add('hidden');
                cartDrawerOverlay.classList.add('hidden');
            }, 300);
        };

        document.getElementById('desktopCartBtn')?.addEventListener('click', openCart);
        document.getElementById('mobileCartBtn')?.addEventListener('click', openCart);
        document.getElementById('closeCartBtn')?.addEventListener('click', closeCart);
        cartDrawerOverlay.addEventListener('click', closeCart);

        // Clear Cart
        document.getElementById('clearCartBtn').addEventListener('click', () => {
            cart = [];
            saveCart();
            updateCartUI();
        });

        // WhatsApp Checkout
        document.getElementById('whatsappCheckoutBtn').addEventListener('click', () => {
            if (cart.length === 0) return alert('السلة فارغة!');
            
            let msg = "مرحباً، أود طلب المنتجات التالية:%0A%0A";
            cart.forEach(item => {
                msg += `- ${item.name} (ID: ${item.id}) | العدد: ${item.qty}%0A`;
            });
            msg += `%0Aالإجمالي: ${cartTotalEl.innerText}`;
            
            window.open(`https://wa.me/?text=${msg}`, '_blank');
        });

        // Mobile Bottom Nav specific actions
        document.getElementById('mobileSearchBtn').addEventListener('click', () => {
            window.scrollTo(0,0);
            searchInput.focus();
        });
        
        document.getElementById('mobileWhatsappBtn').addEventListener('click', () => {
            window.open('https://wa.me/', '_blank');
        });

        // Sheet Closers
        document.getElementById('closeSheetBtn').addEventListener('click', closeSheet);
        productSheetOverlay.addEventListener('click', closeSheet);

        // Back to top button logic
        const bttBtn = document.getElementById('backToTopBtn');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                bttBtn.classList.remove('hidden');
            } else {
                bttBtn.classList.add('hidden');
            }
        });
        bttBtn.addEventListener('click', () => window.scrollTo(0,0));
        
        // Theme Toggle
        document.getElementById('themeToggleBtn')?.addEventListener('click', () => {
            document.body.classList.toggle('theme-dark');
            localStorage.setItem('momax_theme', document.body.classList.contains('theme-dark') ? 'dark' : 'light');
            updateThemeIcon();
        });
    }

    // =================================================
    // THEME HANDLING
    // =================================================
    function initTheme() {
        const savedTheme = localStorage.getItem('momax_theme');
        if (savedTheme === 'dark') document.body.classList.add('theme-dark');
        updateThemeIcon();
    }
    
    function updateThemeIcon() {
        const btn = document.getElementById('themeToggleBtn');
        if(btn) btn.innerText = document.body.classList.contains('theme-dark') ? '☀️' : '🌙';
    }

    // Boot App
    init();
});