/* ================================================= */
/* 1. نظام تجميع المنتجات في الأقسام عبر الـ ID */
/* ================================================= */
const customCategoryGroups = {
    "شواحن كهرباء و طاقة": [
        {
            subTitle: "⚡ شواحن كهرباء",
            ids: [1, 3] // ضع هنا أرقام الآيدي لشواحن الكهرباء
        },
        {
            subTitle: "🔋 شواحن طاقة",
            ids: [2, 6, 16] // ضع هنا أرقام منتجات الطاقة
        }
    ],
    "شواحن سيارة و MP3": [
        {
            subTitle: "🚗 شواحن سيارة",
            ids: [4, 10]
        },
        {
            subTitle: "🎵 مشغلات MP3",
            ids: [8, 9]
        }
    ]
    // يمكنك إضافة أي قسم جديد هنا مستقبلاً بنفس الطريقة
};
/* ================================================= */
/* منطق تشغيل متجر موماكس V8 - VANILLA JS            */
/* ================================================= */

document.addEventListener('DOMContentLoaded', () => {
    
    // ربط العناصر النشطة بـ DOM
    const productsDynamicGrid = document.getElementById('productsDynamicGrid');
    const categoriesChipsWrapper = document.getElementById('categoriesChipsWrapper');
    const productSearchInput = document.getElementById('productSearchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const searchEmptyState = document.getElementById('searchEmptyState');
    
    // عناصر التحكم في السلة
    const shoppingCartDrawer = document.getElementById('shoppingCartDrawer');
    const cartDrawerDimOverlay = document.getElementById('cartDrawerDimOverlay');
    const cartDrawerItemsContainer = document.getElementById('cartDrawerItemsContainer');
    const cartTotalPriceSum = document.getElementById('cartTotalPriceSum');
    const totalCartCountBadges = document.querySelectorAll('.total-cart-count');
    
    // عناصر التحكم في الـ Bottom Sheet لتفاصيل المنتج الوصفية
    const productDetailsSheet = document.getElementById('productDetailsSheet');
    const sheetDimOverlay = document.getElementById('sheetDimOverlay');
    const productSheetInteractiveContent = document.getElementById('productSheetInteractiveContent');
    
    // حاله التطبيق الداخلية (State)
    let selectedActiveCategory = 'الكل';
    let realTimeSearchQuery = '';
    let userShoppingBag = JSON.parse(localStorage.getItem('momax_v8_bag_store')) || [];
    
    // استخراج التصنيفات بشكل فريد وتضمين خيار "الكل" في البداية
    const uniqueStoreCategories = ['الكل', ...new Set(products.map(item => item.category))];

    // =================================================
    // دالة الإقلاع والتجهيز الأولي للواجهات
    // =================================================
    function bootstrapStore() {
        setupThemeMechanics();
        renderFilterChips();
        renderProductsView();
        syncCartStateWithUI();
        registerGlobalEventListeners();
        dismissGlobalLoader();
    }

    // إخفاء شاشة التحميل الترحيبية
    function dismissGlobalLoader() {
        const loader = document.getElementById('globalLoader');
        if(loader) {
            setTimeout(() => {
                loader.classList.add('fade-out');
            }, 400);
        }
    }

    // =================================================
    // بناء وحقن واجهات التصنيفات
    // =================================================
    function renderFilterChips() {
        categoriesChipsWrapper.innerHTML = uniqueStoreCategories.map(cat => `
            <button class="category-chip ${cat === selectedActiveCategory ? 'active' : ''}" data-cat-name="${cat}">
                ${cat}
            </button>
        `).join('');
    }

    // =================================================
    // بناء وعرض المنتجات بالتأثير ثلاثي الأبعاد والـ Skeletons
    // =================================================
    function renderProductsView() {
        // فلترة المنتجات بالاسم أو بمطابقة الـ ID المدخل بدقة
        let matchingProducts = products.filter(item => {
            const isCategoryMatch = selectedActiveCategory === 'الكل' || item.category === selectedActiveCategory;
            const isSearchMatch = item.name.toLowerCase().includes(realTimeSearchQuery.toLowerCase()) || 
                                  item.id.toString() === realTimeSearchQuery.trim();
            return isCategoryMatch && isSearchMatch;
        });

        if (matchingProducts.length === 0) {
            productsDynamicGrid.innerHTML = '';
            searchEmptyState.classList.remove('hidden');
            return;
        }

        searchEmptyState.classList.add('hidden');
        
        // إظهار بطاقات الهياكل التوقعية أولاً (Skeleton Loading)
        productsDynamicGrid.innerHTML = matchingProducts.map(() => `
            <div class="product-card-3d">
                <div class="card-image-view-3d"><div class="skeleton-box skeleton-img-placeholder"></div></div>
                <div class="card-info-details">
                    <div class="skeleton-box skeleton-text-line short"></div>
                    <div class="skeleton-box skeleton-text-line"></div>
                    <div class="skeleton-box skeleton-text-line"></div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:auto;">
                        <div class="skeleton-box skeleton-text-line short" style="margin:0; width:50px;"></div>
                        <div class="skeleton-box skeleton-btn-circle"></div>
                    </div>
                </div>
            </div>
        `).join('');

        // حقن المنتجات الحقيقية
        setTimeout(() => {
            productsDynamicGrid.innerHTML = matchingProducts.map(prod => `
                <div class="product-card-3d" onclick="triggerProductBottomSheet(${prod.id})">
                    <div class="card-image-view-3d">
                        <div class="skeleton-box skeleton-img-placeholder"></div>
                        <img data-src="${prod.image}" alt="${prod.name}" onload="this.classList.add('image-loaded'); this.previousElementSibling.remove();">
                    </div>
                    <div class="card-info-details">
                        <div class="card-brand-tag">${prod.category}</div>
                        <h3 class="card-product-title">${prod.name}</h3>
                        <div class="card-id-badge">ID: ${prod.id}</div>
                        <div class="card-footer-pricing">
                            <span class="card-price-text">${prod.price ? prod.price + ' ر.ي' : 'عرض مميز'}</span>
                            <button class="card-add-to-cart-btn" onclick="event.stopPropagation(); addItemToBag(${prod.id})">＋</button>
                        </div>
                    </div>
                </div>
            `).join('');
            activateIntersectionLazyLoading();
        }, 120);
    }

    // تفعيل خاصية الـ Lazy Loading
    function activateIntersectionLazyLoading() {
        const structuralImages = document.querySelectorAll('img[data-src]');
        const observerInstance = new IntersectionObserver((entries, self) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const imgNode = entry.target;
                    imgNode.src = imgNode.getAttribute('data-src');
                    imgNode.removeAttribute('data-src');
                    self.unobserve(imgNode);
                }
            });
        }, { rootMargin: '60px 0px', threshold: 0.01 });

        structuralImages.forEach(img => observerInstance.observe(img));
    }

    // =================================================
    // إدارة منطق السلة التفاعلية (Cart Logic)
    // =================================================
    window.addItemToBag = (id) => {
        const targetedProduct = products.find(p => p.id === id);
        if (!targetedProduct) return;
        
        const existingRow = userShoppingBag.find(item => item.id === id);
        if (existingRow) {
            existingRow.quantity++;
        } else {
            userShoppingBag.push({ ...targetedProduct, quantity: 1 });
        }
        
        commitBagToLocalStorage();
        syncCartStateWithUI();
        
        // إشعار بصري سريع
        if (event && event.target && event.target.classList.contains('card-add-to-cart-btn')) {
            const btn = event.target;
            btn.innerText = '✓';
            setTimeout(() => btn.innerText = '＋', 800);
        }
    };

    window.mutateRowQuantity = (id, changeAmount) => {
        const itemRow = userShoppingBag.find(i => i.id === id);
        if (!itemRow) return;
        
        itemRow.quantity += changeAmount;
        if (itemRow.quantity <= 0) {
            userShoppingBag = userShoppingBag.filter(i => i.id !== id);
        }
        
        commitBagToLocalStorage();
        syncCartStateWithUI();
    };

    window.removeItemFromBagCompletely = (id) => {
        userShoppingBag = userShoppingBag.filter(i => i.id !== id);
        commitBagToLocalStorage();
        syncCartStateWithUI();
    };

    function commitBagToLocalStorage() {
        localStorage.setItem('momax_v8_bag_store', JSON.stringify(userShoppingBag));
    }

    function syncCartStateWithUI() {
        const totalItemsCount = userShoppingBag.reduce((acc, current) => acc + current.quantity, 0);
        const aggregatedPrice = userShoppingBag.reduce((acc, current) => acc + ((current.price || 0) * current.quantity), 0);
        
        totalCartCountBadges.forEach(badge => {
            badge.innerText = totalItemsCount;
            badge.style.display = totalItemsCount > 0 ? 'inline-block' : 'none';
        });

        cartTotalPriceSum.innerText = aggregatedPrice > 0 ? `${aggregatedPrice} ر.ي` : 'حسب الطلب';

        if (userShoppingBag.length === 0) {
            cartDrawerItemsContainer.innerHTML = `
                <div class="empty-state-view">
                    <span style="font-size:2.5rem; display:block; margin-bottom:10px;">🛒</span>
                    <p>سلة التسوق فارغة حالياً</p>
                </div>`;
            return;
        }

        cartDrawerItemsContainer.innerHTML = userShoppingBag.map(item => `
            <div class="cart-item-row">
                <img src="${item.image}" alt="${item.name}" class="cart-item-thumbnail">
                <div class="cart-item-body-info">
                    <h4 class="cart-item-title-text">${item.name}</h4>
                    <div class="cart-item-price-text">${item.price ? item.price + ' ر.ي' : 'السعر عند الطلب'}</div>
                    <div class="cart-item-interactive-actions">
                        <div class="quantity-stepper">
                            <button onclick="mutateRowQuantity(${item.id}, -1)">-</button>
                            <span class="qty-number">${item.quantity}</span>
                            <button onclick="mutateRowQuantity(${item.id}, 1)">+</button>
                        </div>
                        <button class="cart-row-remove-btn" onclick="removeItemFromBagCompletely(${item.id})">حذف</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // =================================================
    // بناء ورقة تفاصيل المنتج
    // =================================================
    window.triggerProductBottomSheet = (id) => {
        const prod = products.find(p => p.id === id);
        if (!prod) return;

        const productDescription = prod.description ? prod.description.trim() : "طلبك المميّز من متجر موماكس الرسمي، مصنّع من أفضل المواد وبأعلى معايير الجودة العالمية التي نضمنها لك دائماً.";

        productSheetInteractiveContent.innerHTML = `
            <div class="sheet-product-gallery-3d">
                <img src="${prod.image}" alt="${prod.name}">
            </div>
            <div>
                <div class="sheet-meta-properties">
                    <span class="card-brand-tag" style="font-size:0.85rem;">${prod.category}</span>
                    <span style="color:var(--text-muted); font-weight:700;">ID: ${prod.id}</span>
                </div>
                <h2 class="sheet-main-title">${prod.name}</h2>
                <div class="sheet-description-text">
                    <strong>تفاصيل المنتج ووصفه:</strong>
                    <p style="margin-top: 6px;">${productDescription}</p>
                </div>
                
                <div class="sheet-checkout-bar">
                    <span class="sheet-large-price">${prod.price ? prod.price + ' <span style="font-size:0.9rem">ر.ي</span>' : 'طلب خاص'}</span>
                    <button class="action-large-btn" onclick="addItemToBag(${prod.id}); dismissProductBottomSheet();">أضف إلى السلة 🛒</button>
                </div>
            </div>
        `;

        productDetailsSheet.classList.remove('hidden');
        sheetDimOverlay.classList.remove('hidden');
        setTimeout(() => productDetailsSheet.classList.add('open-active'), 10);
    };

    window.dismissProductBottomSheet = () => {
        productDetailsSheet.classList.remove('open-active');
        setTimeout(() => {
            productDetailsSheet.classList.add('hidden');
            sheetDimOverlay.classList.add('hidden');
        }, 300);
    };

    // =================================================
    // مستمعي الأحداث والربط العام للواجهات
    // =================================================
    function registerGlobalEventListeners() {
        categoriesChipsWrapper.addEventListener('click', (e) => {
            const targetBtn = e.target.closest('.category-chip');
            if (targetBtn) {
                selectedActiveCategory = targetBtn.dataset.catName;
                renderFilterChips();
                renderProductsView();
            }
        });

        productSearchInput.addEventListener('input', (e) => {
            realTimeSearchQuery = e.target.value;
            if(realTimeSearchQuery.length > 0) {
                clearSearchBtn.classList.remove('hidden');
            } else {
                clearSearchBtn.classList.add('hidden');
            }
            renderProductsView();
        });

        clearSearchBtn.addEventListener('click', () => {
            productSearchInput.value = '';
            realTimeSearchQuery = '';
            clearSearchBtn.classList.add('hidden');
            renderProductsView();
            productSearchInput.focus();
        });

        const launchCartDrawer = () => {
            shoppingCartDrawer.classList.remove('hidden');
            cartDrawerDimOverlay.classList.remove('hidden');
            setTimeout(() => shoppingCartDrawer.classList.add('drawer-open-active'), 10);
        };
        const dismissCartDrawer = () => {
            shoppingCartDrawer.classList.remove('drawer-open-active');
            setTimeout(() => {
                shoppingCartDrawer.classList.add('hidden');
                cartDrawerDimOverlay.classList.add('hidden');
            }, 300);
        };

        document.getElementById('desktopCartTrigger').addEventListener('click', launchCartDrawer);
        document.getElementById('mobileCartTrigger').addEventListener('click', launchCartDrawer);
        document.getElementById('closeCartDrawerBtn').addEventListener('click', dismissCartDrawer);
        cartDrawerDimOverlay.addEventListener('click', dismissCartDrawer);

        document.getElementById('clearEntireCartBtn').addEventListener('click', () => {
            if(confirm('هل أنت متأكد من رغبتك في إفراغ محتويات السلة بالكامل؟')) {
                userShoppingBag = [];
                commitBagToLocalStorage();
                syncCartStateWithUI();
            }
        });

        // رسالة واتساب المؤتمتة
        document.getElementById('sendOrderToWhatsappBtn').addEventListener('click', () => {
            if (userShoppingBag.length === 0) return alert('سلتك فارغة! يرجى إضافة المنتجات أولاً.');
            
            let messageBuffer = "📦 *طلب شراء جديد من متجر موماكس MOMAX* %0A%0A";
            messageBuffer += "مرحباً، أود طلب تفاصيل المنتجات التالية المحددة من موقعكم العام:%0A%0A";
            
            userShoppingBag.forEach((item, index) => {
                messageBuffer += `${index + 1}) *${item.name}*%0A`;
                messageBuffer += `   - رقم المنتج (ID): ${item.id}%0A`;
                messageBuffer += `   - الكمية المطلوبة: ${item.quantity}%0A`;
                messageBuffer += `   - السعر: ${item.price ? item.price + ' ر.ي' : 'السعر عند الطلب'}%0A%0A`;
            });
            
            const totalSumText = cartTotalPriceSum.innerText;
            messageBuffer += `💰 *إجمالي قيمة المنتجات:* ${totalSumText}%0A%0A`;
            messageBuffer += "يرجى تأكيد استلام الطلب وتجهيزه للشحن.";
            
            window.open(`https://wa.me/967772748881?text=${messageBuffer}`, '_blank');
        });

        document.getElementById('mobileSearchFocusTrigger').addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            productSearchInput.focus();
        });
        
        document.getElementById('mobileDirectWhatsappLink').addEventListener('click', () => {
            window.open('https://wa.me/967772748881', '_blank');
        });

        document.getElementById('closeSheetCross').addEventListener('click', dismissProductBottomSheet);
        sheetDimOverlay.addEventListener('click', dismissProductBottomSheet);

        const bttFloatingBtn = document.getElementById('scrollToTopFloatingBtn');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 450) {
                bttFloatingBtn.classList.remove('hidden');
            } else {
                bttFloatingBtn.classList.add('hidden');
            }
        });
        bttFloatingBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
        
        document.getElementById('themeToggle').addEventListener('click', () => {
            document.body.classList.toggle('theme-dark');
            const isDarkActive = document.body.classList.contains('theme-dark');
            localStorage.setItem('momax_theme_preference', isDarkActive ? 'dark' : 'light');
            updateThemeIconIndicator();
        });
    }

    // =================================================
    // تهيئة الوضع الليلي
    // =================================================
    function setupThemeMechanics() {
        const preferredTheme = localStorage.getItem('momax_theme_preference');
        if (preferredTheme === 'dark') {
            document.body.classList.add('theme-dark');
        }
        updateThemeIconIndicator();
    }
    
    function updateThemeIconIndicator() {
        const toggleBtn = document.getElementById('themeToggle');
        if(toggleBtn) {
            toggleBtn.innerText = document.body.classList.contains('theme-dark') ? '☀️' : '🌙';
        }
    }

    bootstrapStore();
});