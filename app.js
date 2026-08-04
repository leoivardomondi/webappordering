(function () {
    const CART_KEY = 'afiCart';
    const FAVOURITES_KEY = 'afiFavourites';

    let currentStep = 'cart'; // 'cart', 'checkout', 'processing', 'confirmed'
    let leafletMap = null;
    let leafletMarker = null;

    const BRANCHES = {
        muthiga: {
            name: 'Muthiga Branch (Waiyaki Way)',
            address: 'Muthiga Shopping Centre, Waiyaki Way, Nairobi',
            phone: '0791 306 821 / 0115 776 960',
            lat: -1.2509,
            lng: 36.6657
        },
        kikuyu: {
            name: 'Kikuyu Branch (Rungiri)',
            address: 'Dagoretti Road, Rungiri, Kikuyu',
            phone: '0110 286 757',
            lat: -1.2507,
            lng: 36.6650
        },
        pitdock: {
            name: 'Pitdock Auto Branch (Ondiri Rd)',
            address: 'The Pitdock Auto, Ondiri Rd Junction, Kikuyu',
            phone: '0710 480 673',
            lat: -1.2530,
            lng: 36.6690
        }
    };

    let orderState = {
        branch: 'muthiga',
        orderType: 'delivery',
        deliveryFee: 200,
        distanceKm: 2.5,
        pinLat: -1.2520,
        pinLng: 36.6660,
        address: 'Muthiga Waiyaki Way, Nairobi',
        fullName: '',
        phone: '',
        email: '',
        paymentMethod: 'mpesa',
        confirmedOrder: null
    };

    const MENU_PRICE_CATALOG = {
        'BEEF CHEF SPECIAL': 1150,
        'AFI MBUZI CHOMA': 1200,
        'MBUZI CHOMA 1/2 KG': 1020,
        'MBUZI CHOMA 1 KG': 1980,
        'SPICY MBUZI FRY': 1080,
        'HONEY GLAZED PORK BELLY': 1150,
        'AFI PORK CHOMA': 980,
        'SPICY PORK FRY': 1050,
        'SLATHERED BBQ PORK RIBS': 1380,
        'SIGNATURE MIXED GRILL PLATTER': 2800,
        'SHARED CHOMA FEAST': 3500,
        'KIENYEJI CHICKEN FULL': 1600,
        'KIENYEJI CHICKEN HALF': 850,
        'CHAR-GRILLED WINGS': 750,
        'CHICKEN CHOMA PLATTER': 2200,
        'FRESH RAW MEAT BUTCHERY': 900,
        'PIZZA HOUSE PLATE': 950,
        'BIG MEAL COMBOS HOUSE PLATE': 950,
        'BUTTER CROISSANT': 380,
        'FRESH PASTRY BASKET': 850,
        'CINNAMON ROLL': 420,
        'CHOCOLATE COOKIE': 300,
        'CREAMY CHICKEN PASTA': 1350,
        'TOMATO BASIL PASTA': 1150,
        'GRILLED CHICKEN BOWL': 1250,
        'FRESH VEGGIE BOWL': 1050,
        'CABERNET SAUVIGNON': 900,
        'MERLOT': 850,
        'SHIRAZ': 950,
        'PINOT NOIR': 980
    };

    function parsePriceFromText(text) {
        if (!text) return 0;
        const clean = text.toString().replace(/,/g, '');
        const match = clean.match(/(\d+(?:\.\d+)?)/);
        return match ? Number(match[1]) : 0;
    }

    function resolveItemPrice(title, rawPrice, containerEl) {
        let price = Number(rawPrice);
        if (price && price > 0 && !isNaN(price)) return price;

        // Try catalog lookup by upper case title
        if (title) {
            const upperTitle = title.toUpperCase().trim();
            if (MENU_PRICE_CATALOG[upperTitle]) return MENU_PRICE_CATALOG[upperTitle];
            
            // Substring search in catalog
            for (const [catTitle, catPrice] of Object.entries(MENU_PRICE_CATALOG)) {
                if (upperTitle.includes(catTitle) || catTitle.includes(upperTitle)) {
                    return catPrice;
                }
            }
        }

        // Try container DOM text price
        if (containerEl) {
            const priceEl = containerEl.querySelector('.price, .detail-price, .food-card-price, .product-price, [data-price]');
            if (priceEl) {
                const parsed = parsePriceFromText(priceEl.dataset.price || priceEl.textContent);
                if (parsed > 0) return parsed;
            }
        }

        return 950; // Sensible default fallback
    }

    function readItems(key) {
        try {
            const items = JSON.parse(localStorage.getItem(key)) || [];
            if (key === CART_KEY && Array.isArray(items)) {
                let modified = false;
                const repaired = items.map(item => {
                    if (!item.price || item.price <= 0) {
                        modified = true;
                        return { ...item, price: resolveItemPrice(item.title, item.price, null) };
                    }
                    return item;
                });
                if (modified) {
                    localStorage.setItem(key, JSON.stringify(repaired));
                }
                return repaired;
            }
            return items;
        } catch (_error) {
            return [];
        }
    }

    function writeItems(key, items) {
        localStorage.setItem(key, JSON.stringify(items));
    }

    function formatPrice(value) {
        return Number(value || 0).toLocaleString('en-US');
    }

    function updateCartCount() {
        const count = readItems(CART_KEY).reduce((total, item) => total + Number(item.qty || 0), 0);
        document.querySelectorAll('.cart-count').forEach((badge) => {
            badge.textContent = count;
        });
    }

    function showNotice(message) {
        let notice = document.querySelector('.site-notice');
        if (!notice) {
            notice = document.createElement('div');
            notice.className = 'site-notice';
            document.body.prepend(notice);
        }
        notice.textContent = message;
        notice.classList.add('visible');
        window.setTimeout(() => notice.classList.remove('visible'), 2600);
    }

    function showCartModal(item) {
        let modal = document.querySelector('.cart-added-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.className = 'cart-added-modal';
            document.body.appendChild(modal);
        }

        const cart = readItems(CART_KEY);
        const totalCount = cart.reduce((sum, i) => sum + Number(i.qty || 0), 0);
        const totalAmount = cart.reduce((sum, i) => sum + (Number(i.price || 0) * Number(i.qty || 0)), 0);

        modal.innerHTML = `
            <div class="cart-modal-backdrop"></div>
            <div class="cart-modal-dialog">
                <button class="cart-modal-close" type="button" aria-label="Close">&times;</button>
                <div class="cart-modal-header">
                    <i class="fa-solid fa-circle-check"></i>
                    <h3>ADDED TO CART</h3>
                </div>
                <div class="cart-modal-body">
                    <div class="modal-item-preview">
                        ${item.image ? `<img src="${item.image}" alt="${item.title}">` : ''}
                        <div class="modal-item-info">
                            <h4>${item.title || 'Item'}</h4>
                            <p class="modal-item-qty">Quantity Added: <strong>${item.qty || 1}</strong></p>
                            <p class="modal-item-price">KES ${formatPrice((item.price || 0) * (item.qty || 1))}</p>
                        </div>
                    </div>
                    <div class="modal-cart-summary">
                        <p>Items in Cart: <strong>${totalCount}</strong></p>
                        <p class="modal-cart-total">Cart Subtotal: <strong>KES ${formatPrice(totalAmount)}</strong></p>
                    </div>
                </div>
                <div class="cart-modal-footer">
                    <button type="button" class="btn-modal-continue js-close-cart-modal">CONTINUE ORDERING</button>
                    <a href="cart.html" class="btn-modal-checkout">VIEW CART &amp; CHECKOUT</a>
                </div>
            </div>
        `;

        document.body.style.overflow = 'hidden';
        modal.classList.add('visible');

        const closeBtn = modal.querySelector('.cart-modal-close');
        const continueBtn = modal.querySelector('.js-close-cart-modal');
        const backdrop = modal.querySelector('.cart-modal-backdrop');

        function closeModal() {
            modal.classList.remove('visible');
            document.body.style.overflow = '';
        }

        if (closeBtn) closeBtn.onclick = closeModal;
        if (continueBtn) continueBtn.onclick = closeModal;
        if (backdrop) backdrop.onclick = closeModal;
    }

    function currentQuantity() {
        const input = document.querySelector('.quantity-control input');
        return Math.max(1, Number(input?.value || 1));
    }

    function itemFromButton(button) {
        const card = button.closest('.product-item, .menu-item-card, .product-detail-layout, .product-card, section, article');
        
        let title = button.dataset.productTitle;
        if (!title && card) {
            const titleEl = card.querySelector('h1, h2, h3, h4, .product-title, .food-card-title');
            if (titleEl) title = titleEl.textContent.trim();
        }
        if (!title) title = 'Delicious Dish';

        const price = resolveItemPrice(title, button.dataset.productPrice, card);

        let image = button.dataset.productImage;
        if (!image && card) {
            const imgEl = card.querySelector('img');
            if (imgEl) image = imgEl.src;
        }

        let url = button.dataset.productUrl || window.location.pathname.split('/').pop() || 'menu.html';

        return {
            title: title,
            price: price,
            image: image || '',
            url: url,
            qty: currentQuantity()
        };
    }

    function addToCart(item) {
        const cart = readItems(CART_KEY);
        const existing = cart.find((cartItem) => cartItem.title === item.title || (item.url && cartItem.url === item.url));
        if (existing) {
            existing.qty += item.qty;
        } else {
            cart.push(item);
        }
        writeItems(CART_KEY, cart);
        updateCartCount();
        showCartModal(item);
    }

    function addToFavourites(item) {
        const favourites = readItems(FAVOURITES_KEY);
        if (!favourites.some((fav) => fav.url === item.url)) {
            favourites.push({ ...item, qty: 1 });
            writeItems(FAVOURITES_KEY, favourites);
        }
        showNotice('Product added to favourites!');
    }

    function setCartQuantity(url, qty) {
        const cart = readItems(CART_KEY)
            .map((item) => item.url === url ? { ...item, qty: Math.max(1, qty) } : item);
        writeItems(CART_KEY, cart);
        renderCart();
        updateCartCount();
    }

    function removeFromCart(url) {
        writeItems(CART_KEY, readItems(CART_KEY).filter((item) => item.url !== url));
        renderCart();
        updateCartCount();
        showNotice('Product removed from cart.');
    }

    // Haversine distance formula in kilometers
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    function calculateDeliveryFee(distanceKm) {
        if (orderState.orderType !== 'delivery') return 0;
        if (distanceKm <= 2.0) return 100;
        if (distanceKm <= 5.0) return 200;
        if (distanceKm <= 10.0) return 350;
        return 500;
    }

    function updatePinLocation(lat, lng) {
        orderState.pinLat = lat;
        orderState.pinLng = lng;

        const branch = BRANCHES[orderState.branch] || BRANCHES.muthiga;
        const dist = calculateDistance(branch.lat, branch.lng, lat, lng);
        orderState.distanceKm = Number(dist.toFixed(1));
        orderState.deliveryFee = calculateDeliveryFee(orderState.distanceKm);

        const addrInput = document.getElementById('checkout-address');
        const feeBadge = document.getElementById('delivery-fee-badge');

        const locationString = `Pin Location (${lat.toFixed(4)}, ${lng.toFixed(4)}) • ~${orderState.distanceKm} km from ${branch.name}`;
        orderState.address = locationString;

        if (addrInput) addrInput.value = locationString;
        if (feeBadge) {
            feeBadge.textContent = `KES ${formatPrice(orderState.deliveryFee)} (${orderState.distanceKm} km)`;
        }

        updateSummaryTotals();
    }

    function updateSummaryTotals() {
        const cart = readItems(CART_KEY);
        const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
        const delFee = orderState.orderType === 'delivery' ? orderState.deliveryFee : 0;
        const grandTotal = subtotal + delFee;

        const subEl = document.getElementById('summary-subtotal');
        const feeEl = document.getElementById('summary-delivery-fee');
        const grandEl = document.getElementById('summary-grand-total');
        const payBtnEl = document.getElementById('checkout-pay-btn');

        if (subEl) subEl.textContent = `KES ${formatPrice(subtotal)}`;
        if (feeEl) {
            feeEl.textContent = delFee > 0 ? `KES ${formatPrice(delFee)}` : 'FREE';
            feeEl.style.color = delFee > 0 ? '#38bdf8' : '#25D366';
        }
        if (grandEl) grandEl.textContent = `KES ${formatPrice(grandTotal)}`;
        if (payBtnEl) payBtnEl.textContent = `PAY KES ${formatPrice(grandTotal)} NOW`;
    }

    function initInteractiveMap() {
        const mapContainer = document.getElementById('map-picker-container');
        if (!mapContainer || !window.L) return;

        const branch = BRANCHES[orderState.branch] || BRANCHES.muthiga;
        const startLat = orderState.pinLat || branch.lat;
        const startLng = orderState.pinLng || branch.lng;

        if (leafletMap) {
            leafletMap.remove();
            leafletMap = null;
        }

        leafletMap = L.map('map-picker-container').setView([startLat, startLng], 14);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap & Afi House'
        }).addTo(leafletMap);

        const redIcon = L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });

        leafletMarker = L.marker([startLat, startLng], {
            draggable: true,
            icon: redIcon
        }).addTo(leafletMap);

        leafletMarker.bindPopup('<b>Drag me</b> to pick your delivery location address!').openPopup();

        leafletMarker.on('dragend', function (e) {
            const coord = e.target.getLatLng();
            updatePinLocation(coord.lat, coord.lng);
        });

        leafletMap.on('click', function (e) {
            leafletMarker.setLatLng(e.latlng);
            updatePinLocation(e.latlng.lat, e.latlng.lng);
        });
    }

    window.detectGoogleMapsLocation = function () {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    if (leafletMap && leafletMarker) {
                        leafletMap.setView([lat, lng], 15);
                        leafletMarker.setLatLng([lat, lng]);
                    }
                    updatePinLocation(lat, lng);
                    showNotice('Location detected via GPS!');
                },
                (_err) => {
                    const branch = BRANCHES[orderState.branch] || BRANCHES.muthiga;
                    updatePinLocation(branch.lat + 0.005, branch.lng + 0.005);
                    showNotice('Location set near selected branch!');
                }
            );
        }
    };

    function processPaymentSubmit(e) {
        if (e) e.preventDefault();

        const form = document.getElementById('checkout-form');
        if (form && !form.checkValidity()) {
            form.reportValidity();
            return;
        }

        orderState.fullName = document.getElementById('checkout-name')?.value || orderState.fullName;
        orderState.phone = document.getElementById('checkout-phone')?.value || orderState.phone;
        orderState.email = document.getElementById('checkout-email')?.value || orderState.email;
        orderState.address = document.getElementById('checkout-address')?.value || orderState.address;

        if (!orderState.fullName.trim()) {
            alert('Please enter your Full Name.');
            document.getElementById('checkout-name')?.focus();
            return;
        }
        if (!orderState.phone.trim()) {
            alert('Please enter your Phone Number.');
            document.getElementById('checkout-phone')?.focus();
            return;
        }
        if (!orderState.email.trim()) {
            alert('Please enter your Email Address.');
            document.getElementById('checkout-email')?.focus();
            return;
        }
        if (orderState.orderType === 'delivery' && !orderState.address.trim()) {
            alert('Please select your delivery location on the map.');
            document.getElementById('checkout-address')?.focus();
            return;
        }

        currentStep = 'processing';
        renderCart();

        setTimeout(() => {
            const cart = readItems(CART_KEY);
            const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
            const delFee = orderState.orderType === 'delivery' ? orderState.deliveryFee : 0;
            const total = subtotal + delFee;

            orderState.confirmedOrder = {
                orderRef: 'AFI-' + Math.floor(10000 + Math.random() * 90000),
                items: [...cart],
                subtotal: subtotal,
                deliveryFee: delFee,
                distanceKm: orderState.distanceKm,
                total: total,
                branch: BRANCHES[orderState.branch] || BRANCHES.muthiga,
                orderType: orderState.orderType,
                address: orderState.address,
                fullName: orderState.fullName,
                phone: orderState.phone,
                email: orderState.email,
                paymentMethod: orderState.paymentMethod === 'mpesa' ? 'M-PESA Express STK Push' : 'Credit / Debit Card (Visa/Mastercard)',
                dateStr: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                timeStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            writeItems(CART_KEY, []);
            updateCartCount();
            currentStep = 'confirmed';
            renderCart();
        }, 2200);
    }

    function renderCart() {
        const root = document.querySelector('[data-cart-root]');
        if (!root) return;

        // STEP 4: LUXURY OFFICIAL SALES RECEIPT
        if (currentStep === 'confirmed' && orderState.confirmedOrder) {
            const ord = orderState.confirmedOrder;
            root.innerHTML = `
                <section class="menu-content">
                    <div class="receipt-card">
                        
                        <!-- RECEIPT HEADER LOGOS -->
                        <div class="receipt-header">
                            <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 12px;">
                                <img src="images/attached-brand-logo-1.png" alt="Afi Steaks &amp; Platters" style="height: 42px;">
                                <span style="font-size: 20px; font-weight: 900; color: #C8102E;">X</span>
                                <img src="images/afiboardroom (1).png" alt="Afi Boardroom" style="height: 42px;">
                            </div>
                            <h2 style="font-family: 'Playfair Display', serif; font-size: 24px; margin-bottom: 4px;">OFFICIAL SALES RECEIPT</h2>
                            <p style="font-size: 13px; color: #a0a0a0; text-transform: uppercase; letter-spacing: 1px;">Afi Steaks &amp; Platters • Premier Kenyan Grill</p>
                        </div>

                        <!-- RECEIPT METADATA BADGES -->
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; border-bottom: 1px solid #2a2a2a; padding-bottom: 16px; margin-bottom: 20px;">
                            <div>
                                <span class="order-badge-ref" style="margin: 0;">ORDER REF: #${ord.orderRef}</span>
                                <span style="display: inline-block; background: rgba(37, 211, 102, 0.15); color: #25D366; border: 1px solid #25D366; font-size: 12px; font-weight: 800; padding: 4px 12px; border-radius: 12px; margin-left: 8px;">PAID</span>
                            </div>
                            <div style="text-align: right; font-size: 13px; color: #a0a0a0;">
                                <p><strong>Date:</strong> ${ord.dateStr} at ${ord.timeStr}</p>
                                <p><strong>Payment:</strong> ${ord.paymentMethod}</p>
                            </div>
                        </div>

                        <!-- CUSTOMER & BRANCH DETAILS -->
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; background: #121212; border: 1px solid #282828; border-radius: 8px; padding: 18px; margin-bottom: 24px;">
                            <div>
                                <h4 style="color: #ffffff; font-size: 13px; text-transform: uppercase; border-bottom: 1px solid #333; padding-bottom: 6px; margin-bottom: 10px;">CUSTOMER DETAILS</h4>
                                <p style="font-size: 14px; margin-bottom: 4px;"><strong>Name:</strong> ${ord.fullName}</p>
                                <p style="font-size: 14px; margin-bottom: 4px;"><strong>Phone:</strong> ${ord.phone}</p>
                                <p style="font-size: 14px;"><strong>Email:</strong> ${ord.email}</p>
                            </div>
                            <div>
                                <h4 style="color: #ffffff; font-size: 13px; text-transform: uppercase; border-bottom: 1px solid #333; padding-bottom: 6px; margin-bottom: 10px;">FULFILLMENT BRANCH</h4>
                                <p style="font-size: 14px; margin-bottom: 4px;"><strong>Branch:</strong> ${ord.branch.name}</p>
                                <p style="font-size: 14px; margin-bottom: 4px;"><strong>Contact:</strong> ${ord.branch.phone}</p>
                                <p style="font-size: 14px;"><strong>Method:</strong> ${ord.orderType === 'delivery' ? 'Home Delivery' : 'Branch Pickup'}</p>
                            </div>
                        </div>

                        ${ord.orderType === 'delivery' ? `
                            <div style="background: #121212; border: 1px solid #282828; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px;">
                                <p style="font-size: 13px; color: #38bdf8;"><strong>Delivery Location:</strong> ${ord.address}</p>
                            </div>
                        ` : ''}

                        <!-- ITEMIZED INVOICE TABLE -->
                        <h4 style="color: #ffffff; font-size: 14px; text-transform: uppercase; margin-bottom: 8px;">ITEMIZED ORDER BILL</h4>
                        <table class="receipt-table">
                            <thead>
                                <tr>
                                    <th style="width: 50px;">QTY</th>
                                    <th>ITEM DESCRIPTION</th>
                                    <th style="text-align: right;">UNIT PRICE</th>
                                    <th style="text-align: right;">TOTAL (KES)</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${ord.items.map(i => `
                                    <tr>
                                        <td><strong>${i.qty}x</strong></td>
                                        <td>${i.title}</td>
                                        <td style="text-align: right;">KES ${formatPrice(i.price)}</td>
                                        <td style="text-align: right;"><strong>KES ${formatPrice(i.price * i.qty)}</strong></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>

                        <!-- TOTALS BREAKDOWN -->
                        <div style="margin-left: auto; max-width: 320px; text-align: right; padding-top: 10px;">
                            <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 6px; color: #a0a0a0;">
                                <span>Items Subtotal:</span>
                                <strong style="color: #ffffff;">KES ${formatPrice(ord.subtotal)}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 6px; color: #a0a0a0;">
                                <span>VAT (Included 16%):</span>
                                <strong style="color: #ffffff;">KES ${formatPrice(Math.round(ord.subtotal * 0.16))}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 12px; color: #a0a0a0;">
                                <span>Delivery Fee (${ord.distanceKm || 0} km):</span>
                                <strong style="color: ${ord.deliveryFee > 0 ? '#38bdf8' : '#25D366'}">${ord.deliveryFee > 0 ? 'KES ' + formatPrice(ord.deliveryFee) : 'FREE'}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 20px; font-weight: 900; background: #222222; border: 1px solid #333; padding: 12px 16px; border-radius: 6px; color: #25D366;">
                                <span>TOTAL PAID:</span>
                                <span>KES ${formatPrice(ord.total)}</span>
                            </div>
                        </div>

                        <!-- RECEIPT FOOTER & BARCODE -->
                        <div style="text-align: center; border-top: 1px solid #2a2a2a; margin-top: 30px; padding-top: 20px; color: #888888; font-size: 12px;">
                            <p style="margin-bottom: 8px;">Thank you for dining with Afi Steaks &amp; Platters!</p>
                            <p style="font-family: monospace; font-size: 14px; letter-spacing: 4px; color: #666666;">|||||| |||| ||| ||||||| |||| |||||</p>
                        </div>

                        <!-- PRINT & ACTION BUTTONS -->
                        <div class="btn-receipt-actions" style="display: flex; gap: 14px; justify-content: center; margin-top: 24px; flex-wrap: wrap;">
                            <a href="menu.html" class="btn-cart-primary" onclick="currentStep='cart';" style="padding: 12px 24px; font-size: 15px;">PLACE ANOTHER ORDER</a>
                            <button type="button" onclick="window.print();" class="btn-modal-continue" style="background: #C8102E; color: white; border: none; padding: 12px 24px; font-weight: 800; border-radius: 6px; cursor: pointer;">
                                <i class="fa-solid fa-print"></i> PRINT RECEIPT
                            </button>
                        </div>
                    </div>
                </section>
            `;
            return;
        }

        // STEP 3: PROCESSING PAYMENT ANIMATED SCREEN
        if (currentStep === 'processing') {
            root.innerHTML = `
                <section class="menu-content" style="text-align: center; padding: 60px 20px;">
                    <div style="background: #181818; border: 1px solid #2a2a2a; border-radius: 12px; padding: 50px 20px; max-width: 500px; margin: 0 auto;">
                        <i class="fa-solid fa-spinner fa-spin" style="font-size: 54px; color: #C8102E; margin-bottom: 20px;"></i>
                        <h2 style="color: #ffffff; font-family: 'Playfair Display', serif; margin-bottom: 10px;">Processing Your Payment...</h2>
                        <p style="color: #a0a0a0; font-size: 15px; margin-bottom: 20px;">
                            ${orderState.paymentMethod === 'mpesa' ? 'Sending M-PESA STK Push prompt to your phone (' + (orderState.phone || '07XX XXX XXX') + '). Please enter your M-PESA PIN to complete.' : 'Authorizing Card Payment with your bank...'}
                        </p>
                        <div style="background: #121212; padding: 12px; border-radius: 6px; color: #f59e0b; font-weight: 700; font-size: 14px;">
                            Please do not refresh or close this window.
                        </div>
                    </div>
                </section>
            `;
            return;
        }

        const cart = readItems(CART_KEY);

        // EMPTY CART STATE (TOTAL IS 0 BY DEFAULT)
        if (!cart.length && currentStep === 'cart') {
            root.innerHTML = `
                <section class="cart-empty">
                    <h1>MY CART</h1>
                    <p style="color: #a0a0a0; font-size: 16px; margin-bottom: 15px;">Your cart is currently empty.</p>
                    <div style="background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; padding: 16px; max-width: 340px; margin: 0 auto 25px auto;">
                        <p style="color: #ffffff; font-size: 15px; margin-bottom: 6px;">Cart Subtotal: <strong>KES 0</strong></p>
                        <p style="color: #ffffff; font-size: 18px; font-weight: 800;">Total Amount: <strong style="color: #C8102E;">KES 0</strong></p>
                    </div>
                    <a href="menu.html" class="btn-cart-primary" style="padding: 12px 28px; font-size: 16px; background: var(--theme-red, #E52321);">BROWSE MENU</a>
                </section>
            `;
            return;
        }

        const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
        const delFee = orderState.orderType === 'delivery' ? orderState.deliveryFee : 0;
        const grandTotal = subtotal + delFee;
        const vat = Math.round(subtotal * 0.16);

        // STEP 2: FULL CHECKOUT FORM VIEW
        if (currentStep === 'checkout') {
            root.innerHTML = `
                <section class="cart-page">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
                        <h1 style="margin: 0;">CHECKOUT</h1>
                        <button type="button" class="btn-cart-primary" onclick="window.setCheckoutStep('cart')" style="padding: 8px 18px; font-size: 13px; background: #282828;">&larr; BACK TO CART</button>
                    </div>

                    <form id="checkout-form" onsubmit="window.submitAfiCheckout(event)">
                        <div class="checkout-grid">
                            
                            <!-- LEFT COLUMN: INPUT FORM -->
                            <div class="checkout-form-col">
                                
                                <!-- 1. BRANCH SELECTION (REQUIRED) -->
                                <div class="checkout-block">
                                    <h3><i class="fa-solid fa-store"></i> 1. Select Afi Branch (Required)</h3>
                                    <div class="radio-card-grid">
                                        <label class="radio-card ${orderState.branch === 'muthiga' ? 'active' : ''}">
                                            <input type="radio" name="branch" value="muthiga" ${orderState.branch === 'muthiga' ? 'checked' : ''} onchange="window.updateOrderBranch('muthiga')">
                                            <span class="radio-card-title"><i class="fa-solid fa-location-dot" style="color:#C8102E;"></i> Muthiga Branch</span>
                                            <span class="radio-card-desc">Waiyaki Way, Nairobi</span>
                                        </label>
                                        <label class="radio-card ${orderState.branch === 'kikuyu' ? 'active' : ''}">
                                            <input type="radio" name="branch" value="kikuyu" ${orderState.branch === 'kikuyu' ? 'checked' : ''} onchange="window.updateOrderBranch('kikuyu')">
                                            <span class="radio-card-title"><i class="fa-solid fa-location-dot" style="color:#C8102E;"></i> Kikuyu Branch</span>
                                            <span class="radio-card-desc">Dagoretti Rd, Rungiri</span>
                                        </label>
                                        <label class="radio-card ${orderState.branch === 'pitdock' ? 'active' : ''}">
                                            <input type="radio" name="branch" value="pitdock" ${orderState.branch === 'pitdock' ? 'checked' : ''} onchange="window.updateOrderBranch('pitdock')">
                                            <span class="radio-card-title"><i class="fa-solid fa-location-dot" style="color:#C8102E;"></i> Pitdock Auto Branch</span>
                                            <span class="radio-card-desc">Ondiri Rd Junction</span>
                                        </label>
                                    </div>
                                </div>

                                <!-- 2. ORDER TYPE (DELIVERY VS TAKEAWAY) -->
                                <div class="checkout-block">
                                    <h3><i class="fa-solid fa-truck-fast"></i> 2. Order Method (Required)</h3>
                                    <div class="radio-card-grid">
                                        <label class="radio-card ${orderState.orderType === 'delivery' ? 'active' : ''}">
                                            <input type="radio" name="orderType" value="delivery" ${orderState.orderType === 'delivery' ? 'checked' : ''} onchange="window.updateOrderType('delivery')">
                                            <span class="radio-card-title"><i class="fa-solid fa-truck"></i> Doorstep Delivery</span>
                                            <span class="radio-card-desc" id="delivery-fee-badge">KES ${formatPrice(orderState.deliveryFee)} (${orderState.distanceKm} km)</span>
                                        </label>
                                        <label class="radio-card ${orderState.orderType === 'takeaway' ? 'active' : ''}">
                                            <input type="radio" name="orderType" value="takeaway" ${orderState.orderType === 'takeaway' ? 'checked' : ''} onchange="window.updateOrderType('takeaway')">
                                            <span class="radio-card-title"><i class="fa-solid fa-bag-shopping"></i> Takeaway / Pickup</span>
                                            <span class="radio-card-desc">FREE (Pick up at branch)</span>
                                        </label>
                                    </div>

                                    <!-- INTERACTIVE MAP LOCATION PIN PICKER (If delivery) -->
                                    ${orderState.orderType === 'delivery' ? `
                                        <div class="form-field" style="margin-top: 18px;">
                                            <label for="checkout-address">Delivery Address (Drag Map Pin to Choose)<span class="required">*</span></label>
                                            <input type="text" id="checkout-address" required placeholder="Drag pin on map or enter address" value="${orderState.address}">
                                            
                                            <div class="map-pin-hint">
                                                <i class="fa-solid fa-hand-pointer"></i> Drag the red location pin on the map below to set your exact delivery address &amp; calculate delivery fee:
                                            </div>
                                            
                                            <div id="map-picker-container"></div>
                                            
                                            <button type="button" class="maps-picker-btn" onclick="window.detectGoogleMapsLocation()">
                                                <i class="fa-solid fa-location-crosshairs"></i> Use GPS Location Pin
                                            </button>
                                        </div>
                                    ` : ''}
                                </div>

                                <!-- 3. CUSTOMER CONTACT DETAILS (REQUIRED) -->
                                <div class="checkout-block">
                                    <h3><i class="fa-solid fa-user"></i> 3. Customer Contact Details (Required)</h3>
                                    <div class="form-field">
                                        <label for="checkout-name">Full Name<span class="required">*</span></label>
                                        <input type="text" id="checkout-name" required placeholder="e.g. John Kamau" value="${orderState.fullName}">
                                    </div>
                                    <div class="form-group-row">
                                        <div class="form-field">
                                            <label for="checkout-phone">Phone Number (M-PESA / WhatsApp)<span class="required">*</span></label>
                                            <input type="tel" id="checkout-phone" required placeholder="e.g. 0712 345 678" value="${orderState.phone}">
                                        </div>
                                        <div class="form-field">
                                            <label for="checkout-email">Email Address (For Order Receipt)<span class="required">*</span></label>
                                            <input type="email" id="checkout-email" required placeholder="e.g. john@gmail.com" value="${orderState.email}">
                                        </div>
                                    </div>
                                </div>

                                <!-- 4. PAYMENT METHOD -->
                                <div class="checkout-block">
                                    <h3><i class="fa-solid fa-credit-card"></i> 4. Select Payment Option (Required)</h3>
                                    <div class="radio-card-grid">
                                        <label class="radio-card ${orderState.paymentMethod === 'mpesa' ? 'active' : ''}">
                                            <input type="radio" name="paymentMethod" value="mpesa" ${orderState.paymentMethod === 'mpesa' ? 'checked' : ''} onchange="window.updatePaymentMethod('mpesa')">
                                            <span class="radio-card-title"><i class="fa-solid fa-mobile-screen-button"></i> M-PESA Express</span>
                                            <span class="radio-card-desc">Instant STK Push</span>
                                        </label>
                                        <label class="radio-card ${orderState.paymentMethod === 'card' ? 'active' : ''}">
                                            <input type="radio" name="paymentMethod" value="card" ${orderState.paymentMethod === 'card' ? 'checked' : ''} onchange="window.updatePaymentMethod('card')">
                                            <span class="radio-card-title"><i class="fa-solid fa-credit-card"></i> Credit / Debit Card</span>
                                            <span class="radio-card-desc">Visa / Mastercard</span>
                                        </label>
                                    </div>

                                    ${orderState.paymentMethod === 'mpesa' ? `
                                        <div class="payment-method-box">
                                            <p style="color: #25D366; font-size: 13px; font-weight: 800; margin-bottom: 8px;"><i class="fa-solid fa-mobile-screen-button"></i> M-PESA STK PUSH PROMPT</p>
                                            <p style="color: #a0a0a0; font-size: 13px;">Upon clicking Pay, an M-PESA STK Push prompt will be sent directly to your phone. Simply enter your M-PESA PIN to authorize payment.</p>
                                        </div>
                                    ` : `
                                        <div class="payment-method-box">
                                            <p style="color: #38bdf8; font-size: 13px; font-weight: 800; margin-bottom: 12px;"><i class="fa-solid fa-shield-halved"></i> SECURE CARD PAYMENT</p>
                                            <div class="form-field">
                                                <label>Card Number</label>
                                                <input type="text" placeholder="4532 •••• •••• 8912">
                                            </div>
                                            <div class="form-group-row">
                                                <div class="form-field">
                                                    <label>Expiry Date</label>
                                                    <input type="text" placeholder="MM / YY">
                                                </div>
                                                <div class="form-field">
                                                    <label>CVV Code</label>
                                                    <input type="password" placeholder="123">
                                                </div>
                                            </div>
                                        </div>
                                    `}
                                </div>
                            </div>

                            <!-- RIGHT COLUMN: ORDER SUMMARY & PAY BUTTON -->
                            <div class="checkout-summary-col">
                                <div class="cart-summary" style="position: sticky; top: 90px;">
                                    <h3 style="color: #ffffff; font-size: 18px; border-bottom: 2px solid #C8102E; padding-bottom: 8px; margin-bottom: 16px;">CHECKOUT SUMMARY</h3>
                                    
                                    <div style="max-height: 220px; overflow-y: auto; margin-bottom: 16px; border-bottom: 1px solid #2e2e2e; padding-bottom: 10px;">
                                        ${cart.map((item) => `
                                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 13px; color: #d0d0d0;">
                                                <span>${item.qty}x ${item.title}</span>
                                                <strong>KES ${formatPrice(item.price * item.qty)}</strong>
                                            </div>
                                        `).join('')}
                                    </div>

                                    <p><span>SUB TOTAL:</span><strong id="summary-subtotal">KES ${formatPrice(subtotal)}</strong></p>
                                    <p><span>VAT (Included 16%):</span><strong>KES ${formatPrice(vat)}</strong></p>
                                    <p><span>DELIVERY FEE:</span><strong id="summary-delivery-fee" style="color: ${delFee > 0 ? '#38bdf8' : '#25D366'}">${delFee > 0 ? 'KES ' + formatPrice(delFee) : 'FREE'}</strong></p>
                                    <p class="cart-total" style="font-size: 22px; color: #ffffff; border-top: 2px solid #333; padding-top: 12px; margin-top: 12px;">
                                        <span>TOTAL TO PAY:</span><strong id="summary-grand-total" style="color: #C8102E;">KES ${formatPrice(grandTotal)}</strong>
                                    </p>
                                    
                                    <button type="submit" id="checkout-pay-btn" class="btn-cart-checkout" style="width: 100%; margin-top: 20px; padding: 16px; font-size: 18px; background: #C8102E; color: white; border: none; border-radius: 6px; font-weight: 800; cursor: pointer;">
                                        PAY KES ${formatPrice(grandTotal)} NOW &rarr;
                                    </button>
                                    
                                    <p style="text-align: center; font-size: 11px; color: #888888; margin-top: 12px;">
                                        🔒 256-Bit SSL Encrypted &amp; Instant Order Dispatch
                                    </p>
                                </div>
                            </div>
                        </div>
                    </form>
                </section>
            `;

            setTimeout(initInteractiveMap, 100);
            return;
        }

        // STEP 1: INITIAL CART LIST VIEW
        root.innerHTML = `
            <section class="cart-page">
                <h1>MY CART</h1>
                <div class="cart-list">
                    ${cart.map((item) => `
                        <article class="cart-row">
                            <a href="${item.url}" class="cart-image"><img src="${item.image}" alt="${item.title}"></a>
                            <div class="cart-info">
                                <p><span>ITEM:</span> <strong>${item.title}</strong></p>
                                <p class="cart-price">KES ${formatPrice(item.price)}</p>
                                <a href="${item.url}" class="cart-details-link">VIEW DETAILS</a>
                            </div>
                            <div class="cart-quantity" data-url="${item.url}">
                                <button type="button" data-cart-decrease>-</button>
                                <span>${item.qty}</span>
                                <button type="button" data-cart-increase>+</button>
                            </div>
                            <button type="button" class="cart-remove" data-cart-remove="${item.url}">REMOVE</button>
                        </article>
                    `).join('')}
                </div>
                <div class="cart-summary">
                    <p><span>SUB TOTAL:</span><strong>KES ${formatPrice(subtotal)}</strong></p>
                    <p><span>VAT 16%:</span><strong>KES ${formatPrice(vat)}</strong></p>
                    <p class="cart-total"><span>TOTAL:</span><strong>KES ${formatPrice(subtotal)}</strong></p>
                    <small>* Delivery fees calculated based on map pin location in next step</small>
                    <div class="cart-actions">
                        <a href="menu.html" class="btn-cart-primary">ADD MORE ITEMS</a>
                        <button type="button" class="btn-cart-checkout" onclick="window.setCheckoutStep('checkout')">PROCEED TO CHECKOUT &rarr;</button>
                    </div>
                </div>
            </section>
        `;
    }

    // Global helper methods for checkout UI
    window.setCheckoutStep = function (step) {
        currentStep = step;
        renderCart();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.updateOrderBranch = function (branchKey) {
        orderState.branch = branchKey;
        const branch = BRANCHES[branchKey] || BRANCHES.muthiga;
        orderState.pinLat = branch.lat;
        orderState.pinLng = branch.lng;
        renderCart();
    };

    window.updateOrderType = function (type) {
        orderState.orderType = type;
        renderCart();
    };

    window.updatePaymentMethod = function (method) {
        orderState.paymentMethod = method;
        renderCart();
    };

    window.submitAfiCheckout = function (e) {
        processPaymentSubmit(e);
    };

    document.addEventListener('click', (event) => {
        // Handle portion / weight size selection pills
        const portionPill = event.target.closest('.portion-pill');
        if (portionPill) {
            const card = portionPill.closest('.menu-item-card, .product-item, .product-detail-layout, .food-card, .product-card');
            if (card) {
                card.querySelectorAll('.portion-pill').forEach(p => p.classList.remove('active'));
                portionPill.classList.add('active');

                const size = portionPill.dataset.size;
                const price = portionPill.dataset.price;
                const baseTitle = portionPill.dataset.baseTitle || 
                                  card.querySelector('.menu-item-title, h1, h2, h3, h4')?.dataset.baseTitle || 
                                  card.querySelector('.menu-item-title, h1, h2, h3, h4')?.textContent.replace(/\(.*\)/, '').trim();

                const priceEl = card.querySelector('.menu-item-price, .detail-price, .price');
                if (priceEl && price) {
                    priceEl.textContent = 'KES ' + Number(price).toLocaleString();
                }

                const addBtn = card.querySelector('.js-add-to-cart, .btn-add-item, .btn-order, .btn-detail-primary');
                if (addBtn) {
                    if (baseTitle && size) {
                        addBtn.dataset.productTitle = `${baseTitle} (${size})`;
                    }
                    if (price) {
                        addBtn.dataset.productPrice = price;
                    }
                }
            }
            return;
        }

        const addButton = event.target.closest('.js-add-to-cart, .btn-order, .btn-add-item');
        if (addButton) {
            addToCart(itemFromButton(addButton));
            return;
        }

        const favButton = event.target.closest('.js-add-to-favourite');
        if (favButton) {
            addToFavourites(itemFromButton(favButton));
            return;
        }

        const decrease = event.target.closest('[data-cart-decrease]');
        if (decrease) {
            const row = decrease.closest('.cart-quantity');
            const url = row.dataset.url;
            const item = readItems(CART_KEY).find((cartItem) => cartItem.url === url);
            setCartQuantity(url, Number(item?.qty || 1) - 1);
            return;
        }

        const increase = event.target.closest('[data-cart-increase]');
        if (increase) {
            const row = increase.closest('.cart-quantity');
            const url = row.dataset.url;
            const item = readItems(CART_KEY).find((cartItem) => cartItem.url === url);
            setCartQuantity(url, Number(item?.qty || 1) + 1);
            return;
        }

        const remove = event.target.closest('[data-cart-remove]');
        if (remove) {
            removeFromCart(remove.dataset.cartRemove);
        }
    });

    document.addEventListener('DOMContentLoaded', () => {
        updateCartCount();
        renderCart();
    });
})();
