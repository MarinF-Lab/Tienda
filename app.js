import { db } from './firebase-config.js';
import {
  collection, getDocs, addDoc, query, where
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

/* ===== PRODUCTOS POR DEFECTO ===== */
const DEFAULT_PRODUCTS = [
  { id:'s1', name:'STRIDE Runner Pro', category:'zapatos', subcategory:'running', tag:'-30%', emoji:'👟', imageUrl:'', images:[], bg:'linear-gradient(135deg,#e8f4ff,#c7e0ff)', price:89990, originalPrice:129990, colors:['#222','#ef4444','#3b82f6'], sizes:['38','39','40','41','42','43','44'], stock:24, active:true, description:'Zapatillas de alto rendimiento para corredores exigentes. Suela de amortiguación reactiva y upper transpirable.', material:'Upper: malla sintética. Suela: caucho de alta tracción.', origin:'Fabricado en Chile.' },
  { id:'s2', name:'Urban Classic Low', category:'zapatos', subcategory:'casual', tag:'Nuevo', emoji:'👟', imageUrl:'', images:[], bg:'linear-gradient(135deg,#fff7e6,#ffe4a0)', price:59990, originalPrice:null, colors:['#f5e4c3','#222','#6b7280'], sizes:['38','39','40','41','42','43'], stock:18, active:true, description:'Estilo urbano minimalista para el día a día.', material:'Cuero sintético premium.', origin:'Fabricado en Chile.' },
  { id:'s3', name:'Elite Training XT', category:'zapatos', subcategory:'running', tag:null, emoji:'🥿', imageUrl:'', images:[], bg:'linear-gradient(135deg,#f0fff4,#bbf7d0)', price:74990, originalPrice:null, colors:['#222','#16a34a','#fff'], sizes:['39','40','41','42','43','44','45'], stock:5, active:true, description:'Para entrenamientos de alta intensidad.', material:'Material técnico de alta resistencia.', origin:'Fabricado en Chile.' },
  { id:'s4', name:'Oxford Premium', category:'zapatos', subcategory:'formal', tag:null, emoji:'👞', imageUrl:'', images:[], bg:'linear-gradient(135deg,#1a0a00,#3d1f00)', price:99990, originalPrice:null, colors:['#3d1f00','#1a0a00','#555'], sizes:['39','40','41','42','43','44'], stock:8, active:true, description:'Elegancia clásica para ocasiones especiales.', material:'Cuero genuino.', origin:'Fabricado en Chile.' },
  { id:'s5', name:'Street Boost 2.0', category:'zapatos', subcategory:'casual', tag:'-20%', emoji:'👟', imageUrl:'', images:[], bg:'linear-gradient(135deg,#fdf2f8,#fce7f3)', price:69990, originalPrice:87990, colors:['#ec4899','#222','#7c3aed'], sizes:['37','38','39','40','41','42'], stock:3, active:true, description:'Estilo callejero con máximo confort.', material:'Tela técnica y foam moldeado.', origin:'Fabricado en Chile.' },
  { id:'s6', name:'Veloce Sprint', category:'zapatos', subcategory:'running', tag:'Top Venta', emoji:'🏃', imageUrl:'', images:[], bg:'linear-gradient(135deg,#fefce8,#fef08a)', price:109990, originalPrice:null, colors:['#eab308','#222','#fff'], sizes:['39','40','41','42','43','44'], stock:30, active:true, description:'El modelo más vendido de nuestra colección running.', material:'Malla knit y suela de carbono.', origin:'Fabricado en Chile.' },
  { id:'s7', name:'Derby Elegance', category:'zapatos', subcategory:'formal', tag:null, emoji:'👞', imageUrl:'', images:[], bg:'linear-gradient(135deg,#1e1e2e,#2d2d44)', price:119990, originalPrice:null, colors:['#1e1e2e','#7c3aed','#fff'], sizes:['40','41','42','43','44'], stock:0, active:true, description:'La sofisticación en su máxima expresión.', material:'Cuero de primera calidad.', origin:'Fabricado en Chile.' },
  { id:'s8', name:'Canvas Daily', category:'zapatos', subcategory:'casual', tag:'-15%', emoji:'👟', imageUrl:'', images:[], bg:'linear-gradient(135deg,#f0f9ff,#bae6fd)', price:42990, originalPrice:50990, colors:['#0ea5e9','#fff','#222'], sizes:['37','38','39','40','41','42','43'], stock:45, active:true, description:'Comodidad diaria en tela canvas resistente.', material:'Canvas 100% algodón.', origin:'Fabricado en Chile.' },
  { id:'b1', name:'Tote Minimalista', category:'bolsos', subcategory:'', tag:'Nuevo', emoji:'👜', imageUrl:'', images:[], bg:'linear-gradient(135deg,#fdf4ff,#e9d5ff)', price:49990, originalPrice:null, colors:['#a855f7','#222','#fff'], sizes:['Único'], stock:20, active:true, description:'Diseño limpio para el día a día.', material:'Lona encerada.', origin:'Importado.' },
  { id:'b2', name:'Crossbody Urban', category:'bolsos', subcategory:'', tag:'-25%', emoji:'👝', imageUrl:'', images:[], bg:'linear-gradient(135deg,#fff7ed,#fed7aa)', price:39990, originalPrice:53990, colors:['#f97316','#222','#92400e'], sizes:['S','M'], stock:12, active:true, description:'Bolso cruzado para la vida urbana.', material:'Cuero sintético.', origin:'Importado.' },
  { id:'b3', name:'Backpack Pro 30L', category:'bolsos', subcategory:'', tag:null, emoji:'🎒', imageUrl:'', images:[], bg:'linear-gradient(135deg,#f0fdf4,#bbf7d0)', price:69990, originalPrice:null, colors:['#16a34a','#222','#854d0e'], sizes:['Único'], stock:9, active:true, description:'Mochila profesional de 30 litros.', material:'Nylon 600D resistente al agua.', origin:'Importado.' },
  { id:'b4', name:'Clutch Evening', category:'bolsos', subcategory:'', tag:'Exclusivo', emoji:'👛', imageUrl:'', images:[], bg:'linear-gradient(135deg,#1a1a2e,#16213e)', price:29990, originalPrice:null, colors:['#c0c0c0','#d4af37','#222'], sizes:['Único'], stock:7, active:true, description:'Embrague elegante para noches especiales.', material:'Terciopelo con herrajes dorados.', origin:'Importado.' },
  { id:'b5', name:'Laptop Messenger', category:'bolsos', subcategory:'', tag:null, emoji:'💼', imageUrl:'', images:[], bg:'linear-gradient(135deg,#1e1e1e,#3d3d3d)', price:84990, originalPrice:null, colors:['#222','#6b7280','#92400e'], sizes:['13"','15"','17"'], stock:4, active:true, description:'Maletín mensajero profesional con compartimento acolchado para laptop.', material:'Cuero reciclado.', origin:'Importado.' },
  { id:'b6', name:'Shopper Weekend', category:'bolsos', subcategory:'', tag:'-10%', emoji:'🛍️', imageUrl:'', images:[], bg:'linear-gradient(135deg,#fef2f2,#fecaca)', price:44990, originalPrice:49990, colors:['#ef4444','#fff','#222'], sizes:['M','L'], stock:15, active:true, description:'El compañero perfecto para tus escapadas de fin de semana.', material:'Lona gruesa.', origin:'Importado.' },
  { id:'a1', name:'Cinturón Cuero', category:'accesorios', subcategory:'', tag:'Nuevo', emoji:'🧶', imageUrl:'', images:[], bg:'linear-gradient(135deg,#451a03,#78350f)', price:24990, originalPrice:null, colors:['#78350f','#222','#d4af37'], sizes:['S','M','L','XL'], stock:25, active:true, description:'Cinturón de cuero genuino con hebilla metálica.', material:'Cuero de primera.', origin:'Fabricado en Chile.' },
  { id:'a2', name:'Reloj Sport Edge', category:'accesorios', subcategory:'', tag:'-35%', emoji:'⌚', imageUrl:'', images:[], bg:'linear-gradient(135deg,#0f172a,#1e293b)', price:89990, originalPrice:139990, colors:['#222','#ef4444','#d4af37'], sizes:['38mm','42mm'], stock:6, active:true, description:'Reloj deportivo con cronómetro y resistencia al agua.', material:'Caja de acero inoxidable. Correa de silicona.', origin:'Importado.' },
  { id:'a3', name:'Bufanda Premium', category:'accesorios', subcategory:'', tag:null, emoji:'🧣', imageUrl:'', images:[], bg:'linear-gradient(135deg,#fdf2f8,#fce7f3)', price:18990, originalPrice:null, colors:['#ec4899','#7c3aed','#f97316','#222'], sizes:['Único'], stock:40, active:true, description:'Bufanda de lana merino ultra suave.', material:'80% lana merino, 20% acrílico.', origin:'Importado.' },
  { id:'a4', name:'Gorra Signature', category:'accesorios', subcategory:'', tag:'Top Venta', emoji:'🧢', imageUrl:'', images:[], bg:'linear-gradient(135deg,#eff6ff,#bfdbfe)', price:14990, originalPrice:null, colors:['#3b82f6','#222','#fff'], sizes:['S/M','L/XL'], stock:2, active:true, description:'Gorra con logo bordado y cierre ajustable.', material:'100% algodón.', origin:'Importado.' },
  { id:'a5', name:'Lentes Retro', category:'accesorios', subcategory:'', tag:null, emoji:'🕶️', imageUrl:'', images:[], bg:'linear-gradient(135deg,#fef9c3,#fef08a)', price:32990, originalPrice:null, colors:['#222','#d4af37','#ef4444'], sizes:['Único'], stock:11, active:true, description:'Lentes de sol con protección UV400.', material:'Marco acetato. Lentes policarbonato.', origin:'Importado.' },
  { id:'a6', name:'Pulsera Milano', category:'accesorios', subcategory:'', tag:'-20%', emoji:'📿', imageUrl:'', images:[], bg:'linear-gradient(135deg,#f0fdf4,#d1fae5)', price:19990, originalPrice:24990, colors:['#d4af37','#c0c0c0','#222'], sizes:['S','M','L'], stock:0, active:true, description:'Pulsera de cuero con detalles metálicos.', material:'Cuero y acero inoxidable.', origin:'Importado.' },
];

const DEFAULT_CATEGORIES = [
  { id:'zapatos', name:'Zapatos', emoji:'👟', bg:'linear-gradient(135deg, #1e1e2e 0%, #2d2d44 50%, #3d3d64 100%)', color:'#3b82f6', order:0 },
  { id:'bolsos', name:'Bolsos', emoji:'👜', bg:'linear-gradient(135deg, #2e1e1e 0%, #44282d 50%, #6d3d3d 100%)', color:'#a855f7', order:1 },
  { id:'accesorios', name:'Accesorios', emoji:'⌚', bg:'linear-gradient(135deg, #1e2e1e 0%, #2d4428 50%, #3d6440 100%)', color:'#16a34a', order:2 },
];

/* ===== CARGAR DESDE FIRESTORE ===== */
async function loadStoreProducts() {
  try {
    const snapshot = await getDocs(collection(db, 'products'));
    if (!snapshot.empty) return snapshot.docs.map(d => d.data());
  } catch (e) {
    console.warn('Firestore no disponible, usando datos por defecto', e);
  }
  return [...DEFAULT_PRODUCTS];
}

async function loadCategories() {
  try {
    const snapshot = await getDocs(collection(db, 'categories'));
    if (!snapshot.empty) {
      return snapshot.docs.map(d => d.data()).sort((a,b) => (a.order||0) - (b.order||0));
    }
  } catch(e) {}
  return [...DEFAULT_CATEGORIES];
}

/* ===== CACHÉ GLOBAL ===== */
let allProductsCache = [];

/* ===== CARRITO ===== */
let cart = JSON.parse(localStorage.getItem('stride_cart') || '[]');
function saveCart() { localStorage.setItem('stride_cart', JSON.stringify(cart)); }
function fmt(n) { return '$' + Number(n).toLocaleString('es-CL'); }

/* ===== ESTRELLAS ===== */
function starsHtml(avg, count) {
  if (!count) return '';
  const stars = [1,2,3,4,5].map(i =>
    `<span class="star${i <= Math.round(avg) ? ' filled' : ''}">★</span>`
  ).join('');
  return `<div class="stars-display">${stars}</div><span class="rating-text">${avg.toFixed(1)} (${count} reseñas)</span>`;
}

/* ===== TARJETA DE PRODUCTO ===== */
function renderCard(p) {
  const isSale = p.originalPrice != null && p.originalPrice > 0;
  const card = document.createElement('div');
  card.className = 'product-card';
  card.dataset.category = p.subcategory || p.category || '';

  const colorDots = (p.colors||[]).map(c =>
    `<div class="color-dot" style="background:${c}" title="${c}"></div>`
  ).join('');

  const sizeBtns = (p.sizes||[]).map((s, i) =>
    `<button class="size-btn ${i === 0 ? 'selected' : ''}" data-size="${s}">${s}</button>`
  ).join('');

  const mainImg = (p.images && p.images.length) ? p.images[0] : p.imageUrl;
  const imgInner = mainImg
    ? `<img src="${mainImg}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none';this.nextElementSibling.style.display='block'" /><span style="display:none;font-size:80px;filter:drop-shadow(0 8px 16px rgba(0,0,0,.2))">${p.emoji||'📦'}</span>`
    : `<span style="font-size:80px;filter:drop-shadow(0 8px 16px rgba(0,0,0,.2))">${p.emoji||'📦'}</span>`;

  const avgRating = p.avgRating || 0;
  const reviewCount = p.reviewCount || 0;

  card.innerHTML = `
    ${p.tag ? `<div class="product-card__badge">${p.tag}</div>` : ''}
    ${p.stock === 0 ? '<div class="product-card__badge" style="background:#6b7280;left:auto;right:12px">Sin Stock</div>' : ''}
    <div class="product-card__img" style="background:${p.bg||'#f3f4f6'}">${imgInner}</div>
    <div class="product-card__info">
      <div class="product-card__name">${p.name}</div>
      <div class="product-card__category">${p.subcategory || p.category || 'Accesorio'}</div>
      ${reviewCount ? `<div class="pdp-stars" style="margin-bottom:8px;font-size:13px">${starsHtml(avgRating, reviewCount)}</div>` : ''}
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

  card.querySelector('.product-card__img').addEventListener('click', () => openPDP(p.id));
  card.querySelector('.product-card__name').addEventListener('click', () => openPDP(p.id));

  card.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      card.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });

  card.querySelector('.product-card__add').addEventListener('click', e => {
    e.stopPropagation();
    if (p.stock === 0) return;
    const selectedSize = card.querySelector('.size-btn.selected')?.dataset.size || (p.sizes||[])[0];
    addToCart(p, selectedSize);
  });

  return card;
}

/* ===== SECCIONES DINÁMICAS ===== */
function renderDynamicSections(products, categories) {
  const navLinks = document.getElementById('navCatLinks');
  navLinks.innerHTML = categories.map(c =>
    `<li><a href="#section-${c.id}">${c.name}</a></li>`
  ).join('') + '<li><a href="#ofertas">Ofertas</a></li>';

  const footerLinks = document.getElementById('footerCatLinks');
  if (footerLinks) {
    footerLinks.innerHTML = categories.map(c =>
      `<li><a href="#section-${c.id}">${c.name}</a></li>`
    ).join('') + '<li><a href="#ofertas">Ofertas</a></li>';
  }

  const catGrid = document.getElementById('catGrid');
  catGrid.innerHTML = categories.slice(0, 3).map(c => `
    <div class="category-card" onclick="scrollTo('#section-${c.id}')">
      <div class="category-card__img" style="background:${c.bg||'linear-gradient(135deg,#1e1e2e,#3d3d64)'}">
        <span>${c.emoji||'📦'}</span>
      </div>
      <div class="category-card__info">
        <h3>${c.name}</h3>
        <span>Ver todo →</span>
      </div>
    </div>
  `).join('');

  const container = document.getElementById('dynamicSections');
  container.innerHTML = '';

  categories.forEach((cat, i) => {
    const catProducts = products.filter(p => p.category === cat.id && p.active !== false);
    const subcats = [...new Set(catProducts.map(p => p.subcategory).filter(Boolean))];

    const section = document.createElement('section');
    section.className = `products-section${i % 2 === 1 ? ' products-section--alt' : ''}`;
    section.id = `section-${cat.id}`;

    const filtersHtml = subcats.length ? `
      <div class="filters" id="filters-${cat.id}">
        <button class="filter-btn active" data-filter="all">Todos</button>
        ${subcats.map(s => `<button class="filter-btn" data-filter="${s}">${s.charAt(0).toUpperCase()+s.slice(1)}</button>`).join('')}
      </div>` : '';

    section.innerHTML = `
      <div class="container">
        <div class="section-header">
          <h2>${cat.name}</h2>
          ${filtersHtml}
        </div>
        <div class="products-grid" id="grid-${cat.id}"></div>
      </div>
    `;
    container.appendChild(section);

    const grid = section.querySelector(`#grid-${cat.id}`);
    catProducts.forEach(p => grid.appendChild(renderCard(p)));

    if (subcats.length) {
      const filtersEl = section.querySelector(`#filters-${cat.id}`);
      filtersEl.addEventListener('click', e => {
        if (!e.target.matches('.filter-btn')) return;
        filtersEl.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        const f = e.target.dataset.filter;
        grid.querySelectorAll('.product-card').forEach(c => {
          c.style.display = (f === 'all' || c.dataset.category === f) ? '' : 'none';
        });
      });
    }
  });
}

/* ===== PDP MODAL ===== */
let currentPDPProduct = null;
let selectedReviewRating = 0;

function openPDP(productId) {
  const p = allProductsCache.find(x => x.id === productId);
  if (!p) return;
  currentPDPProduct = p;

  const overlay = document.getElementById('pdpOverlay');

  /* Badges */
  const badgesEl = document.getElementById('pdpBadges');
  badgesEl.innerHTML = '';
  if (p.tag) {
    const b = document.createElement('span');
    b.className = 'pdp-badge';
    b.textContent = p.tag;
    badgesEl.appendChild(b);
  }
  if (p.stock === 0) {
    const b = document.createElement('span');
    b.className = 'pdp-badge pdp-badge--out';
    b.textContent = 'Sin Stock';
    badgesEl.appendChild(b);
  }

  /* Basic info */
  document.getElementById('pdpName').textContent = p.name;
  document.getElementById('pdpSubcat').textContent = (p.subcategory || p.category || '').toUpperCase();

  /* Stars (from cached avg) */
  const starsEl = document.getElementById('pdpStars');
  starsEl.innerHTML = starsHtml(p.avgRating||0, p.reviewCount||0) || '<span style="color:#9ca3af;font-size:13px">Sin reseñas aún</span>';

  /* Price */
  const pricesEl = document.getElementById('pdpPrices');
  const isSale = p.originalPrice != null && p.originalPrice > 0;
  pricesEl.innerHTML = `
    ${isSale ? `<span class="pdp-price-original">${fmt(p.originalPrice)}</span>` : ''}
    <span class="pdp-price-current${isSale ? ' sale' : ''}">${fmt(p.price)}</span>
  `;

  /* Gallery */
  const allImgs = [...(p.images||[])];
  if (p.imageUrl && !allImgs.includes(p.imageUrl)) allImgs.unshift(p.imageUrl);
  renderGallery(allImgs, p.emoji||'📦', p.bg||'#f3f4f6');

  /* Colors */
  const colorsEl = document.getElementById('pdpColors');
  colorsEl.innerHTML = (p.colors||[]).map(c =>
    `<div class="pdp-color-dot" style="background:${c}" title="${c}"></div>`
  ).join('');
  colorsEl.querySelectorAll('.pdp-color-dot').forEach((dot, i) => {
    if (i === 0) dot.classList.add('selected');
    dot.addEventListener('click', () => {
      colorsEl.querySelectorAll('.pdp-color-dot').forEach(d => d.classList.remove('selected'));
      dot.classList.add('selected');
    });
  });

  /* Sizes */
  const sizesEl = document.getElementById('pdpSizes');
  sizesEl.innerHTML = (p.sizes||[]).map((s, i) =>
    `<button class="pdp-size-btn${i===0?' selected':''}" data-size="${s}">${s}</button>`
  ).join('');
  sizesEl.querySelectorAll('.pdp-size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      sizesEl.querySelectorAll('.pdp-size-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });

  /* Cart button */
  const cartBtn = document.getElementById('pdpCartBtn');
  cartBtn.disabled = p.stock === 0;
  cartBtn.onclick = () => {
    const size = sizesEl.querySelector('.pdp-size-btn.selected')?.dataset.size || (p.sizes||[])[0];
    addToCart(p, size);
    closePDP();
  };

  /* Description */
  const descEl = document.getElementById('pdpDescBody');
  descEl.textContent = p.description || 'Descripción no disponible.';
  document.getElementById('pdpDescAccordion').style.display = p.description ? '' : 'none';

  /* Specs */
  const specsEl = document.getElementById('pdpSpecsBody');
  const specParts = [];
  if (p.material) specParts.push(`<strong>Material:</strong> ${p.material}`);
  if (p.origin) specParts.push(`<strong>Origen:</strong> ${p.origin}`);
  specsEl.innerHTML = specParts.length ? specParts.join('<br/>') : 'Información no disponible.';

  /* Reviews */
  loadAndRenderReviews(productId);
  resetReviewForm();

  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closePDP() {
  const overlay = document.getElementById('pdpOverlay');
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  currentPDPProduct = null;
}

function renderGallery(imgs, emoji, bg) {
  const thumbsEl = document.getElementById('pdpThumbs');
  const mainEl = document.getElementById('pdpMainImg');

  if (!imgs.length) {
    thumbsEl.innerHTML = '';
    mainEl.innerHTML = `<span style="font-size:120px;filter:drop-shadow(0 8px 24px rgba(0,0,0,.15))">${emoji}</span>`;
    mainEl.style.background = bg;
    return;
  }

  function setMain(src) {
    mainEl.innerHTML = `<img src="${src}" alt="Producto" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none'" />`;
    mainEl.style.background = bg;
  }

  setMain(imgs[0]);

  if (imgs.length > 1) {
    thumbsEl.innerHTML = imgs.map((src, i) => `
      <div class="pdp-thumb${i===0?' active':''}" data-src="${src}">
        <img src="${src}" alt="img ${i+1}" onerror="this.parentElement.style.display='none'" />
      </div>
    `).join('');
    thumbsEl.querySelectorAll('.pdp-thumb').forEach(th => {
      th.addEventListener('click', () => {
        thumbsEl.querySelectorAll('.pdp-thumb').forEach(t => t.classList.remove('active'));
        th.classList.add('active');
        setMain(th.dataset.src);
      });
    });
  } else {
    thumbsEl.innerHTML = '';
  }
}

/* ===== RESEÑAS ===== */
async function loadAndRenderReviews(productId) {
  const listEl = document.getElementById('pdpReviewsList');
  const summaryEl = document.getElementById('pdpReviewsSummary');
  listEl.innerHTML = '<div class="reviews-loading">Cargando reseñas...</div>';

  try {
    const q = query(collection(db, 'reviews'), where('productId', '==', productId));
    const snap = await getDocs(q);
    const reviews = snap.docs.map(d => ({id: d.id, ...d.data()}))
      .sort((a, b) => (b.createdAt||0) - (a.createdAt||0));

    if (!reviews.length) {
      summaryEl.innerHTML = '';
      listEl.innerHTML = '<div class="reviews-empty">Sé el primero en dejar una reseña.</div>';
      return;
    }

    const avg = reviews.reduce((s, r) => s + (r.rating||0), 0) / reviews.length;
    summaryEl.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px">
        <span class="reviews-avg">${avg.toFixed(1)}</span>
        <div>
          <div class="stars-display">${[1,2,3,4,5].map(i => `<span class="star${i<=Math.round(avg)?' filled':''}">★</span>`).join('')}</div>
          <span style="font-size:13px;color:#6b7280">${reviews.length} reseñas</span>
        </div>
      </div>
    `;

    listEl.innerHTML = '';
    reviews.forEach(r => {
      const el = document.createElement('div');
      el.className = 'review-card';
      const date = r.createdAt ? new Date(r.createdAt).toLocaleDateString('es-CL') : '';
      el.innerHTML = `
        <div class="review-card__header">
          <span class="review-card__author">${r.author}</span>
          <span class="review-card__date">${date}</span>
        </div>
        <div class="review-card__stars">${[1,2,3,4,5].map(i => `<span class="star${i<=(r.rating||0)?' filled':''}">★</span>`).join('')}</div>
        <div class="review-card__comment">${r.comment}</div>
      `;
      listEl.appendChild(el);
    });
  } catch(e) {
    listEl.innerHTML = '<div class="reviews-empty">No se pudieron cargar las reseñas.</div>';
  }
}

function resetReviewForm() {
  document.getElementById('reviewForm').reset();
  selectedReviewRating = 0;
  document.querySelectorAll('.star-pick').forEach(s => s.classList.remove('active'));
}

/* Star picker */
document.querySelectorAll('.star-pick').forEach(star => {
  star.addEventListener('click', () => {
    selectedReviewRating = parseInt(star.dataset.val);
    document.querySelectorAll('.star-pick').forEach(s => {
      s.classList.toggle('active', parseInt(s.dataset.val) <= selectedReviewRating);
    });
  });
});

document.getElementById('reviewForm').addEventListener('submit', async e => {
  e.preventDefault();
  if (!currentPDPProduct) return;
  if (!selectedReviewRating) { showToast('Selecciona una calificación'); return; }
  const author = document.getElementById('reviewName').value.trim();
  const comment = document.getElementById('reviewComment').value.trim();

  try {
    await addDoc(collection(db, 'reviews'), {
      productId: currentPDPProduct.id,
      author,
      rating: selectedReviewRating,
      comment,
      createdAt: Date.now(),
    });
    showToast('¡Reseña publicada!');
    loadAndRenderReviews(currentPDPProduct.id);
    resetReviewForm();
  } catch(e) {
    showToast('Error al publicar la reseña');
  }
});

/* PDP close */
document.getElementById('pdpClose').addEventListener('click', closePDP);
document.getElementById('pdpOverlay').addEventListener('click', e => {
  if (e.target === e.currentTarget) closePDP();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closePDP();
    closeSizeGuide();
  }
});

/* ===== GUÍA DE TALLAS ===== */
const SHOE_GUIDE = `
<p class="sg-section-title">Zapatos — Tallas EU / US / CM</p>
<table class="sg-table">
  <thead><tr><th>EU</th><th>US Hombre</th><th>US Mujer</th><th>CM</th></tr></thead>
  <tbody>
    <tr><td>36</td><td>4</td><td>5.5</td><td>22.5</td></tr>
    <tr><td>37</td><td>5</td><td>6.5</td><td>23.5</td></tr>
    <tr><td>38</td><td>6</td><td>7.5</td><td>24</td></tr>
    <tr><td>39</td><td>7</td><td>8.5</td><td>25</td></tr>
    <tr><td>40</td><td>7.5</td><td>9</td><td>25.5</td></tr>
    <tr><td>41</td><td>8</td><td>9.5</td><td>26</td></tr>
    <tr><td>42</td><td>9</td><td>10.5</td><td>27</td></tr>
    <tr><td>43</td><td>10</td><td>11.5</td><td>28</td></tr>
    <tr><td>44</td><td>11</td><td>12.5</td><td>29</td></tr>
    <tr><td>45</td><td>12</td><td>13.5</td><td>30</td></tr>
  </tbody>
</table>
<p class="sg-note">Para medir tu pie: traza el contorno sobre papel y mide desde el talón hasta el dedo más largo.</p>
`;

const CLOTHING_GUIDE = `
<p class="sg-section-title">Ropa & Accesorios — Tabla de Tallas</p>
<table class="sg-table">
  <thead><tr><th>Talla</th><th>XS</th><th>S</th><th>M</th><th>L</th><th>XL</th></tr></thead>
  <tbody>
    <tr><td>Pecho (cm)</td><td>78–82</td><td>82–86</td><td>86–90</td><td>90–96</td><td>96–104</td></tr>
    <tr><td>Cintura (cm)</td><td>60–64</td><td>64–68</td><td>68–72</td><td>72–78</td><td>78–86</td></tr>
    <tr><td>Cadera (cm)</td><td>84–88</td><td>88–92</td><td>92–96</td><td>96–102</td><td>102–110</td></tr>
  </tbody>
</table>
<p class="sg-note">Medidas aproximadas. Para mayor precisión, mide sobre ropa interior.</p>
`;

document.getElementById('openSizeGuide').addEventListener('click', () => {
  const cat = currentPDPProduct?.category || '';
  const custom = currentPDPProduct?.sizeGuideText;
  const sgBody = document.getElementById('sgBody');

  if (custom) {
    sgBody.innerHTML = `<div class="sg-custom">${custom}</div>`;
  } else if (cat === 'zapatos') {
    sgBody.innerHTML = SHOE_GUIDE;
  } else {
    sgBody.innerHTML = CLOTHING_GUIDE;
  }

  document.getElementById('sgOverlay').style.display = 'flex';
});

function closeSizeGuide() {
  document.getElementById('sgOverlay').style.display = 'none';
}

document.getElementById('sgClose').addEventListener('click', closeSizeGuide);
document.getElementById('sgOverlay').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeSizeGuide();
});

/* ===== CARRITO LÓGICA ===== */
function addToCart(product, size) {
  const key = `${product.id}-${size}`;
  const existing = cart.find(i => i.key === key);
  if (existing) { existing.qty++; }
  else {
    const mainImg = (product.images && product.images.length) ? product.images[0] : product.imageUrl;
    cart.push({ key, id: product.id, name: product.name, emoji: product.emoji||'📦', imageUrl: mainImg||'', price: product.price, size, qty: 1 });
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

function cartTotal() { return cart.reduce((sum, i) => sum + i.price * i.qty, 0); }

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

  Array.from(itemsEl.children).forEach(c => { if (c !== emptyEl) c.remove(); });

  cart.forEach(item => {
    const el = document.createElement('div');
    el.className = 'cart-item';
    const thumb = item.imageUrl
      ? `<img src="${item.imageUrl}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none'" />`
      : item.emoji;
    el.innerHTML = `
      <div class="cart-item__emoji">${thumb}</div>
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
    el.querySelector('.cart-item__remove').addEventListener('click', () => removeFromCart(item.key));
    itemsEl.appendChild(el);
  });
}

/* ===== CARRITO DRAWER ===== */
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

document.getElementById('checkoutForm1').addEventListener('submit', e => { e.preventDefault(); goToStep(2); });
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

document.querySelectorAll('input[name="payment"]').forEach(radio => {
  radio.addEventListener('change', () => {
    const isCard = radio.value === 'webpay';
    document.getElementById('cardForm').style.display = isCard ? 'block' : 'none';
    document.getElementById('transferInfo').style.display = isCard ? 'none' : 'block';
  });
});

document.getElementById('cardNumber')?.addEventListener('input', e => {
  let v = e.target.value.replace(/\D/g, '').slice(0,16);
  e.target.value = v.replace(/(.{4})/g, '$1 ').trim();
});
document.getElementById('cardExpiry')?.addEventListener('input', e => {
  let v = e.target.value.replace(/\D/g, '').slice(0,4);
  if (v.length >= 2) v = v.slice(0,2) + '/' + v.slice(2);
  e.target.value = v;
});

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

/* ===== SCROLL SUAVE ===== */
const _nativeScrollTo = window.scrollTo.bind(window);
window.scrollTo = function(target) {
  if (typeof target === 'string') {
    const el = document.querySelector(target);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    _nativeScrollTo(target);
  }
};

/* ===== INIT ===== */
async function init() {
  const [allProducts, categories] = await Promise.all([loadStoreProducts(), loadCategories()]);
  allProductsCache = allProducts;
  renderDynamicSections(allProducts, categories);
  updateCartUI();
}

init();
