'use strict';

/* ===== PRODUCTS DATA — se lee del localStorage si el admin guardó cambios ===== */
const ADMIN_PRODUCTS_KEY = 'stride_products';

const DEFAULT_FLAT_PRODUCTS = [
  { id:'s1', name:'STRIDE Runner Pro', category:'zapatos', subcategory:'running', tag:'-30%', emoji:'👟', imageUrl:'', bg:'linear-gradient(135deg,#e8f4ff,#c7e0ff)', price:89990, originalPrice:129990, colors:['#222','#ef4444','#3b82f6'], sizes:['38','39','40','41','42','43','44'], stock:24, active:true },
  { id:'s2', name:'Urban Classic Low', category:'zapatos', subcategory:'casual', tag:'Nuevo', emoji:'👟', imageUrl:'', bg:'linear-gradient(135deg,#fff7e6,#ffe4a0)', price:59990, originalPrice:null, colors:['#f5e4c3','#222','#6b7280'], sizes:['38','39','40','41','42','43'], stock:18, active:true },
  { id:'s3', name:'Elite Training XT', category:'zapatos', subcategory:'running', tag:null, emoji:'🥿', imageUrl:'', bg:'linear-gradient(135deg,#f0fff4,#bbf7d0)', price:74990, originalPrice:null, colors:['#222','#16a34a','#fff'], sizes:['39','40','41','42','43','44','45'], stock:5, active:true },
  { id:'s4', name:'Oxford Premium', category:'zapatos', subcategory:'formal', tag:null, emoji:'👞', imageUrl:'', bg:'linear-gradient(135deg,#1a0a00,#3d1f00)', price:99990, originalPrice:null, colors:['#3d1f00','#1a0a00','#555'], sizes:['39','40','41','42','43','44'], stock:8, active:true },
  { id:'s5', name:'Street Boost 2.0', category:'zapatos', subcategory:'casual', tag:'-20%', emoji:'👟', imageUrl:'', bg:'linear-gradient(135deg,#fdf2f8,#fce7f3)', price:69990, originalPrice:87990, colors:['#ec4899','#222','#7c3aed'], sizes:['37','38','39','40','41','42'], stock:3, active:true },
  { id:'s6', name:'Veloce Sprint', category:'zapatos', subcategory:'running', tag:'Top Venta', emoji:'🏃', imageUrl:'', bg:'linear-gradient(135deg,#fefce8,#fef08a)', price:109990, originalPrice:null, colors:['#eab308','#222','#fff'], sizes:['39','40','41','42','43','44'], stock:30, active:true },
  { id:'s7', name:'Derby Elegance', category:'zapatos', subcategory:'formal', tag:null, emoji:'👞', imageUrl:'', bg:'linear-gradient(135deg,#1e1e2e,#2d2d44)', price:119990, originalPrice:null, colors:['#1e1e2e','#7c3aed','#fff'], sizes:['40','41','42','43','44'], stock:0, active:true },
  { id:'s8', name:'Canvas Daily', category:'zapatos', subcategory:'casual', tag:'-15%', emoji:'👟', imageUrl:'', bg:'linear-gradient(135deg,#f0f9ff,#bae6fd)', price:42990, originalPrice:50990, colors:['#0ea5e9','#fff','#222'], sizes:['37','38','39','40','41','42','43'], stock:45, active:true },
  { id:'b1', name:'Tote Minimalista', category:'bolsos', subcategory:'', tag:'Nuevo', emoji:'👜', imageUrl:'', bg:'linear-gradient(135deg,#fdf4ff,#e9d5ff)', price:49990, originalPrice:null, colors:['#a855f7','#222','#fff'], sizes:['Único'], stock:20, active:true },
  { id:'b2', name:'Crossbody Urban', category:'bolsos', subcategory:'', tag:'-25%', emoji:'👝', imageUrl:'', bg:'linear-gradient(135deg,#fff7ed,#fed7aa)', price:39990, originalPrice:53990, colors:['#f97316','#222','#92400e'], sizes:['S','M'], stock:12, active:true },
  { id:'b3', name:'Backpack Pro 30L', category:'bolsos', subcategory:'', tag:null, emoji:'🎒', imageUrl:'', bg:'linear-gradient(135deg,#f0fdf4,#bbf7d0)', price:69990, originalPrice:null, colors:['#16a34a','#222','#854d0e'], sizes:['Único'], stock:9, active:true },
  { id:'b4', name:'Clutch Evening', category:'bolsos', subcategory:'', tag:'Exclusivo', emoji:'👛', imageUrl:'', bg:'linear-gradient(135deg,#1a1a2e,#16213e)', price:29990, originalPrice:null, colors:['#c0c0c0','#d4af37','#222'], sizes:['Único'], stock:7, active:true },
  { id:'b5', name:'Laptop Messenger', category:'bolsos', subcategory:'', tag:null, emoji:'💼', imageUrl:'', bg:'linear-gradient(135deg,#1e1e1e,#3d3d3d)', price:84990, originalPrice:null, colors:['#222','#6b7280','#92400e'], sizes:['13"','15"','17"'], stock:4, active:true },
    { id:'b6', name:'Shopper Weekend', category:'bolsos', subcategory:'', tag:'-10%', emoji:'🛍️', imageUrl:'', bg:'linear-gradient(135deg,#fef2f2,#fecaca)', price:44990, originalPrice:49990, colors:['#ef4444','#fff','#222'], sizes:['M','L'], stock:15, active:true },
  { id:'a1', name:'Cinturón Cuero', category:'accesorios', subcategory:'', tag:'Nuevo', emoji:'🧶', imageUrl:'', bg:'linear-gradient(135deg,#451a03,#78350f)', price:24990, originalPrice:null, colors:['#78350f','#222','#d4af37'], sizes:['S','M','L','XL'], stock:25, active:true },
  { id:'a2', name:'Reloj Sport Edge', category:'accesorios', subcategory:'', tag:'-35%', emoji:'⌚', imageUrl:'', bg:'linear-gradient(135deg,#0f172a,#1e293b)', price:89990, originalPrice:139990, colors:['#222','#ef4444','#d4af37'], sizes:['38mm','42mm'], stock:6, active:true },
  { id:'a3', name:'Bufanda Premium', category:'accesorios', subcategory:'', tag:null, emoji:'🧣', imageUrl:'', bg:'linear-gradient(135deg,#fdf2f8,#fce7f3)', price:18990, originalPrice:null, colors:['#ec4899','#7c3aed','#f97316','#222'], sizes:['Único'], stock:40, active:true },
  { id:'a4', name:'Gorra Signature', category:'accesorios', subcategory:'', tag:'Top Venta', emoji:'🧢', imageUrl:'', bg:'linear-gradient(135deg,#eff6ff,#bfdbfe)', price:14990, originalPrice:null, colors:['#3b82f6','#222','#fff'], sizes:['S/M','L/XL'], stock:2, active:true },
  { id:'a5', name:'Lentes Retro', category:'accesorios', subcategory:'', tag:null, emoji:'🕶️', imageUrl:'', bg:'linear-gradient(135deg,#fef9c3,#fef08a)', price:32990, originalPrice:null, colors:['#222','#d4af37','#ef4444'], sizes:['Único'], stock:11, active:true },
  { id:'a6', name:'Pulsera Milano', category:'accesorios', subcategory:'', tag:'-20%', emoji:'📿', imageUrl:'', bg:'linear-gradient(135deg,#f0fdf4,#d1fae5)', price:19990, originalPrice:24990, colors:['#d4af37','#c0c0c0','#222'], sizes:['S','M','L'], stock:0, active:true },
];

/* Lee los productos del admin (localStorage) o usa los defaults */
function loadStoreProducts() {
  try {
    const raw = localStorage.getItem(ADMIN_PRODUCTS_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_FLAT_PRODUCTS;
  } catch { return DEFAULT_FLAT_PRODUCTS; }
}

function buildProductSections(allProducts) {
  const active = allProducts.filter(p => p.active !== false);
  return {
    shoes:       active.filter(p => p.category === 'zapatos').map(p => ({ ...p, category: p.subcategory || 'casual' })),
    bags:        active.filter(p => p.category === 'bolsos'),
    accessories: active.filter(p => p.category === 'accesorios'),
  };
}

/* ===== CART STATE ===== */
let cart = JSON.parse(localStorage.getItem('stride_cart') || '[]');

function saveCart() {
  localStorage.setItem('stride_cart', JSON.stringify(cart));
}

/* ===== FORMAT PRICE ===== */
function fmt(n) {
  return '$' + n.toLocaleString('es-CL');
}

/* ===== RENDER PRODUCT CARD ===== */
function renderCard(p) {
  const isSale = p.originalPrice !== null;
  const card = document.createElement('div');
  card.className = 'product-card';
  card.dataset.category = p.category || '';

  const colorDots = p.colors.map(c =>
    `<div class="color-dot" style="background:${c}" title="${c}"></div>`
  ).join('');

  const sizeLabel = p.sizes[0].match(/^\d+$/) ? 'Talla' : (p.sizes[0].match(/^\d+"$/) ? 'Tamaño' : 'Tamaño');
  const sizeBtns = p.sizes.map((s, i) =>
    `<button class="size-btn ${i === 0 ? 'selected' : ''}" data-size="${s}">${s}</button>`
  ).join('');

  const imgInner = p.imageUrl
    ? `<img src="${p.imageUrl}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover" onerror="this.parentElement.innerHTML='<span style=\\'font-size:80px;filter:drop-shadow(0 8px 16px rgba(0,0,0,.2))\\'>${p.emoji}</span>'" />`
    : `<span style="font-size:80px;filter:drop-shadow(0 8px 16px rgba(0,0,0,.2))">${p.emoji}</span>`;

  card.innerHTML = `
    ${p.tag ? `<div class="product-card__badge">${p.tag}</div>` : ''}
    ${p.stock === 0 ? '<div class="product-card__badge" style="background:#6b7280">Sin Stock</div>' : ''}
    <div class="product-card__img" style="background:${p.bg}">${imgInner}</div>
    <div class="product-card__info">
      <div class="product-card__name">${p.name}</div>
      <div class="product-card__category">${p.category || 'Accesorio'}</div>
      <div class="product-card__colors">${colorDots}</div>
      <div class="product-card__sizes">${sizeBtns}</div>
      <div class="product-card__footer">
        <div class="product-card__price">
          ${isSale ? `<span class="price-original">${fmt(p.originalPrice)}</span>` : ''}
          <span class="price-current${isSale ? ' sale' : ''}">${fmt(p.price)}</span>
        </div>
        <button class="product-card__add" aria-label="Agregar al carrito" data-id="${p.id}" ${p.stock === 0 ? 'disabled style="opacity:.35;cursor:not-allowed"' : ''}>+</button>
      </div>
    </div>
  `;

  /* Size selection */
  card.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      card.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });

  /* Add to cart */
  card.querySelector('.product-card__add').addEventListener('click', () => {
    const selectedSize = card.querySelector('.size-btn.selected')?.dataset.size || p.sizes[0];
    addToCart(p, selectedSize);
  });

  return card;
}

/* ===== POPULATE GRIDS ===== */
function populateGrid(gridId, items) {
  const grid = document.getElementById(gridId);
  items.forEach(p => grid.appendChild(renderCard(p)));
}

/* ===== SHOE FILTERS ===== */
function initShoeFilters() {
  document.getElementById('shoeFilters').addEventListener('click', e => {
    if (!e.target.matches('.filter-btn')) return;
    document.querySelectorAll('#shoeFilters .filter-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    const filter = e.target.dataset.filter;
    document.querySelectorAll('#shoesGrid .product-card').forEach(card => {
      card.style.display = (filter === 'all' || card.dataset.category === filter) ? '' : 'none';
    });
  });
}

/* ===== CART LOGIC ===== */
function addToCart(product, size) {
  const key = `${product.id}-${size}`;
  const existing = cart.find(i => i.key === key);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ key, id: product.id, name: product.name, emoji: product.emoji, price: product.price, size, qty: 1 });
  }
  saveCart();
  updateCartUI();
  showToast(`"${product.name}" agregado al carrito`);
}

function removeFromCart(key) {
  cart = cart.filter(i => i.key !== key);
  saveCart();
  updateCartUI();
}

function updateQty(key, delta) {
  const item = cart.find(i => i.key === key);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) { removeFromCart(key); return; }
  saveCart();
  updateCartUI();
}

function cartTotal() {
  return cart.reduce((sum, i) => sum + i.price * i.qty, 0);
}

function updateCartUI() {
  const total = cartTotal();
  const count = cart.reduce((s, i) => s + i.qty, 0);

  document.getElementById('cartBadge').textContent = count;
  document.getElementById('cartSubtotal').textContent = fmt(total);
  document.getElementById('cartShipping').textContent = total >= 50000 ? 'Gratis' : fmt(3990);
  document.getElementById('cartTotal').textContent = fmt(total >= 50000 ? total : total + 3990);

  const itemsEl = document.getElementById('cartItems');
  const emptyEl = document.getElementById('cartEmpty');
  const footerEl = document.getElementById('cartFooter');

  emptyEl.style.display = cart.length ? 'none' : 'flex';
  footerEl.style.display = cart.length ? 'block' : 'none';

  /* Rebuild item list (keep empty placeholder) */
  Array.from(itemsEl.children).forEach(c => { if (c !== emptyEl) c.remove(); });

  cart.forEach(item => {
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `
      <div class="cart-item__emoji">${item.emoji}</div>
      <div class="cart-item__details">
        <div class="cart-item__name">${item.name}</div>
        <div class="cart-item__meta">Talla: ${item.size}</div>
        <div class="cart-item__qty">
          <button class="qty-btn" data-key="${item.key}" data-delta="-1">−</button>
          <span class="qty-display">${item.qty}</span>
          <button class="qty-btn" data-key="${item.key}" data-delta="1">+</button>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px">
        <div class="cart-item__price">${fmt(item.price * item.qty)}</div>
        <button class="cart-item__remove" data-key="${item.key}" aria-label="Eliminar">🗑</button>
      </div>
    `;
    el.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', () => updateQty(btn.dataset.key, +btn.dataset.delta));
    });
    el.querySelector('.cart-item__remove').addEventListener('click', () => removeFromCart(item.dataset?.key || item.key));
    el.querySelector('.cart-item__remove').addEventListener('click', () => removeFromCart(item.key));
    itemsEl.appendChild(el);
  });
}

/* ===== CART DRAWER TOGGLE ===== */
function openCart() {
  document.getElementById('cartDrawer').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  document.getElementById('cartDrawer').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
  document.body.style.overflow = '';
}
document.getElementById('cartToggle').addEventListener('click', openCart);
document.getElementById('cartClose').addEventListener('click', closeCart);
document.getElementById('cartOverlay').addEventListener('click', closeCart);

/* ===== CHECKOUT ===== */
function openCheckout() {
  closeCart();
  document.getElementById('checkoutOverlay').style.display = 'flex';
  document.body.style.overflow = 'hidden';
  renderOrderSummaryMini();
}
function closeCheckout() {
  document.getElementById('checkoutOverlay').style.display = 'none';
  document.body.style.overflow = '';
}
document.getElementById('checkoutBtn').addEventListener('click', openCheckout);
document.getElementById('checkoutClose').addEventListener('click', closeCheckout);
document.getElementById('checkoutOverlay').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeCheckout();
});

/* Steps navigation */
function goToStep(n) {
  [1,2,3].forEach(i => {
    const s = document.getElementById(`step${i}`);
    s.classList.remove('active','done');
    if (i < n) s.classList.add('done');
    else if (i === n) s.classList.add('active');
  });
  document.getElementById('checkoutForm1').style.display = n === 1 ? 'block' : 'none';
  document.getElementById('checkoutForm2').style.display = n === 2 ? 'block' : 'none';
  document.getElementById('checkoutSuccess').style.display = n === 3 ? 'block' : 'none';
}

document.getElementById('checkoutForm1').addEventListener('submit', e => {
  e.preventDefault();
  goToStep(2);
});
document.getElementById('backToStep1').addEventListener('click', () => goToStep(1));

document.getElementById('checkoutForm2').addEventListener('submit', e => {
  e.preventDefault();
  const orderNum = 'STR-' + String(Date.now()).slice(-6);
  document.getElementById('orderNum').textContent = '#' + orderNum;
  goToStep(3);
  cart = [];
  saveCart();
  updateCartUI();
});

document.getElementById('continueShopping').addEventListener('click', () => {
  closeCheckout();
  goToStep(1);
  document.getElementById('checkoutForm1').reset();
  document.getElementById('checkoutForm2').reset();
});

/* Payment method toggle */
document.querySelectorAll('input[name="payment"]').forEach(radio => {
  radio.addEventListener('change', () => {
    const isCard = radio.value === 'webpay';
    document.getElementById('cardForm').style.display = isCard ? 'block' : 'none';
    document.getElementById('transferInfo').style.display = isCard ? 'none' : 'block';
  });
});

/* Card number formatting */
document.getElementById('cardNumber')?.addEventListener('input', e => {
  let v = e.target.value.replace(/\D/g, '').slice(0,16);
  e.target.value = v.replace(/(.{4})/g, '$1 ').trim();
});
document.getElementById('cardExpiry')?.addEventListener('input', e => {
  let v = e.target.value.replace(/\D/g, '').slice(0,4);
  if (v.length >= 2) v = v.slice(0,2) + '/' + v.slice(2);
  e.target.value = v;
});

/* Order summary mini */
function renderOrderSummaryMini() {
  const el = document.getElementById('orderSummaryMini');
  const total = cartTotal();
  const shipping = total >= 50000 ? 0 : 3990;
  el.innerHTML = `
    <h5>Resumen del Pedido</h5>
    ${cart.map(i => `<div class="summary-item"><span>${i.name} × ${i.qty} (${i.size})</span><span>${fmt(i.price * i.qty)}</span></div>`).join('')}
    <div class="summary-item"><span>Envío</span><span>${shipping === 0 ? 'Gratis' : fmt(shipping)}</span></div>
    <div class="summary-total"><span>Total</span><span>${fmt(total + shipping)}</span></div>
  `;
}

/* ===== TOAST ===== */
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

/* ===== SMOOTH SCROLL ===== */
window.scrollTo = function(target) {
  if (typeof target === 'string') {
    const el = document.querySelector(target);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    window.scrollTo(target);
  }
};

/* ===== INIT ===== */
const PRODUCTS = buildProductSections(loadStoreProducts());
populateGrid('shoesGrid', PRODUCTS.shoes);
populateGrid('bagsGrid', PRODUCTS.bags);
populateGrid('accGrid', PRODUCTS.accessories);
initShoeFilters();
updateCartUI();
