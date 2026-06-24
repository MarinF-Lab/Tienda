import { db, storage } from './firebase-config.js';
import {
  collection, getDocs, setDoc, deleteDoc, doc, writeBatch, addDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import {
  ref, uploadBytesResumable, getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-storage.js";

/* ===================================================================
   SEGURIDAD
   Contraseña por defecto: stride2026
   =================================================================== */
const STORAGE_KEYS = { PWD_HASH: 'stride_admin_pwd', SESSION: 'stride_admin_session' };
const DEFAULT_PWD_HASH = '4b1d979b05a909da790c0e068209131eda76030fe2bc84085c0076592b1f57be';

async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}
function getStoredHash() { return localStorage.getItem(STORAGE_KEYS.PWD_HASH) || DEFAULT_PWD_HASH; }

/* ===== SESIÓN (8 horas) ===== */
const SESSION_TTL = 8 * 60 * 60 * 1000;
function isLoggedIn() {
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION) || 'null');
    return s && (Date.now() - s.ts) < SESSION_TTL;
  } catch { return false; }
}
function createSession() { localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify({ ts: Date.now() })); }
function destroySession() { localStorage.removeItem(STORAGE_KEYS.SESSION); }

/* ===================================================================
   PRODUCTOS POR DEFECTO
   =================================================================== */
const DEFAULT_PRODUCTS = [
  { id:'s1', name:'STRIDE Runner Pro', category:'zapatos', subcategory:'running', tag:'-30%', emoji:'👟', imageUrl:'', images:[], bg:'linear-gradient(135deg,#e8f4ff,#c7e0ff)', price:89990, originalPrice:129990, discountPct:30, colors:['#222','#ef4444','#3b82f6'], sizes:['38','39','40','41','42','43','44'], stock:24, active:true, description:'Zapatillas de alto rendimiento para corredores exigentes.', material:'Upper: malla sintética. Suela: caucho.', origin:'Fabricado en Chile.', avgRating:0, reviewCount:0 },
  { id:'s2', name:'Urban Classic Low', category:'zapatos', subcategory:'casual', tag:'Nuevo', emoji:'👟', imageUrl:'', images:[], bg:'linear-gradient(135deg,#fff7e6,#ffe4a0)', price:59990, originalPrice:null, discountPct:null, colors:['#f5e4c3','#222','#6b7280'], sizes:['38','39','40','41','42','43'], stock:18, active:true, description:'Estilo urbano para el día a día.', material:'Cuero sintético.', origin:'Fabricado en Chile.', avgRating:0, reviewCount:0 },
  { id:'s3', name:'Elite Training XT', category:'zapatos', subcategory:'running', tag:null, emoji:'🥿', imageUrl:'', images:[], bg:'linear-gradient(135deg,#f0fff4,#bbf7d0)', price:74990, originalPrice:null, discountPct:null, colors:['#222','#16a34a','#fff'], sizes:['39','40','41','42','43','44','45'], stock:5, active:true, description:'Para entrenamientos intensos.', material:'Material técnico.', origin:'Fabricado en Chile.', avgRating:0, reviewCount:0 },
  { id:'s4', name:'Oxford Premium', category:'zapatos', subcategory:'formal', tag:null, emoji:'👞', imageUrl:'', images:[], bg:'linear-gradient(135deg,#1a0a00,#3d1f00)', price:99990, originalPrice:null, discountPct:null, colors:['#3d1f00','#1a0a00','#555'], sizes:['39','40','41','42','43','44'], stock:8, active:true, description:'Elegancia clásica.', material:'Cuero genuino.', origin:'Fabricado en Chile.', avgRating:0, reviewCount:0 },
  { id:'s5', name:'Street Boost 2.0', category:'zapatos', subcategory:'casual', tag:'-20%', emoji:'👟', imageUrl:'', images:[], bg:'linear-gradient(135deg,#fdf2f8,#fce7f3)', price:69990, originalPrice:87990, discountPct:20, colors:['#ec4899','#222','#7c3aed'], sizes:['37','38','39','40','41','42'], stock:3, active:true, description:'Estilo callejero.', material:'Tela técnica.', origin:'Fabricado en Chile.', avgRating:0, reviewCount:0 },
  { id:'s6', name:'Veloce Sprint', category:'zapatos', subcategory:'running', tag:'Top Venta', emoji:'🏃', imageUrl:'', images:[], bg:'linear-gradient(135deg,#fefce8,#fef08a)', price:109990, originalPrice:null, discountPct:null, colors:['#eab308','#222','#fff'], sizes:['39','40','41','42','43','44'], stock:30, active:true, description:'El más vendido.', material:'Malla knit.', origin:'Fabricado en Chile.', avgRating:0, reviewCount:0 },
  { id:'s7', name:'Derby Elegance', category:'zapatos', subcategory:'formal', tag:null, emoji:'👞', imageUrl:'', images:[], bg:'linear-gradient(135deg,#1e1e2e,#2d2d44)', price:119990, originalPrice:null, discountPct:null, colors:['#1e1e2e','#7c3aed','#fff'], sizes:['40','41','42','43','44'], stock:0, active:true, description:'Sofisticación en estado puro.', material:'Cuero premium.', origin:'Fabricado en Chile.', avgRating:0, reviewCount:0 },
  { id:'s8', name:'Canvas Daily', category:'zapatos', subcategory:'casual', tag:'-15%', emoji:'👟', imageUrl:'', images:[], bg:'linear-gradient(135deg,#f0f9ff,#bae6fd)', price:42990, originalPrice:50990, discountPct:15, colors:['#0ea5e9','#fff','#222'], sizes:['37','38','39','40','41','42','43'], stock:45, active:true, description:'Canvas diario.', material:'Canvas 100% algodón.', origin:'Fabricado en Chile.', avgRating:0, reviewCount:0 },
  { id:'b1', name:'Tote Minimalista', category:'bolsos', subcategory:'', tag:'Nuevo', emoji:'👜', imageUrl:'', images:[], bg:'linear-gradient(135deg,#fdf4ff,#e9d5ff)', price:49990, originalPrice:null, discountPct:null, colors:['#a855f7','#222','#fff'], sizes:['Único'], stock:20, active:true, description:'Diseño minimalista.', material:'Lona encerada.', origin:'Importado.', avgRating:0, reviewCount:0 },
  { id:'b2', name:'Crossbody Urban', category:'bolsos', subcategory:'', tag:'-25%', emoji:'👝', imageUrl:'', images:[], bg:'linear-gradient(135deg,#fff7ed,#fed7aa)', price:39990, originalPrice:53990, discountPct:25, colors:['#f97316','#222','#92400e'], sizes:['S','M'], stock:12, active:true, description:'Bolso cruzado.', material:'Cuero sintético.', origin:'Importado.', avgRating:0, reviewCount:0 },
  { id:'b3', name:'Backpack Pro 30L', category:'bolsos', subcategory:'', tag:null, emoji:'🎒', imageUrl:'', images:[], bg:'linear-gradient(135deg,#f0fdf4,#bbf7d0)', price:69990, originalPrice:null, discountPct:null, colors:['#16a34a','#222','#854d0e'], sizes:['Único'], stock:9, active:true, description:'Mochila 30L.', material:'Nylon 600D.', origin:'Importado.', avgRating:0, reviewCount:0 },
  { id:'b4', name:'Clutch Evening', category:'bolsos', subcategory:'', tag:'Exclusivo', emoji:'👛', imageUrl:'', images:[], bg:'linear-gradient(135deg,#1a1a2e,#16213e)', price:29990, originalPrice:null, discountPct:null, colors:['#c0c0c0','#d4af37','#222'], sizes:['Único'], stock:7, active:true, description:'Embrague elegante.', material:'Terciopelo.', origin:'Importado.', avgRating:0, reviewCount:0 },
  { id:'b5', name:'Laptop Messenger', category:'bolsos', subcategory:'', tag:null, emoji:'💼', imageUrl:'', images:[], bg:'linear-gradient(135deg,#1e1e1e,#3d3d3d)', price:84990, originalPrice:null, discountPct:null, colors:['#222','#6b7280','#92400e'], sizes:['13"','15"','17"'], stock:4, active:true, description:'Maletín laptop.', material:'Cuero reciclado.', origin:'Importado.', avgRating:0, reviewCount:0 },
  { id:'b6', name:'Shopper Weekend', category:'bolsos', subcategory:'', tag:'-10%', emoji:'🛍️', imageUrl:'', images:[], bg:'linear-gradient(135deg,#fef2f2,#fecaca)', price:44990, originalPrice:49990, discountPct:10, colors:['#ef4444','#fff','#222'], sizes:['M','L'], stock:15, active:true, description:'Para el fin de semana.', material:'Lona gruesa.', origin:'Importado.', avgRating:0, reviewCount:0 },
  { id:'a1', name:'Cinturón Cuero', category:'accesorios', subcategory:'', tag:'Nuevo', emoji:'🧶', imageUrl:'', images:[], bg:'linear-gradient(135deg,#451a03,#78350f)', price:24990, originalPrice:null, discountPct:null, colors:['#78350f','#222','#d4af37'], sizes:['S','M','L','XL'], stock:25, active:true, description:'Cinturón genuino.', material:'Cuero.', origin:'Fabricado en Chile.', avgRating:0, reviewCount:0 },
  { id:'a2', name:'Reloj Sport Edge', category:'accesorios', subcategory:'', tag:'-35%', emoji:'⌚', imageUrl:'', images:[], bg:'linear-gradient(135deg,#0f172a,#1e293b)', price:89990, originalPrice:139990, discountPct:35, colors:['#222','#ef4444','#d4af37'], sizes:['38mm','42mm'], stock:6, active:true, description:'Reloj deportivo.', material:'Acero inox.', origin:'Importado.', avgRating:0, reviewCount:0 },
  { id:'a3', name:'Bufanda Premium', category:'accesorios', subcategory:'', tag:null, emoji:'🧣', imageUrl:'', images:[], bg:'linear-gradient(135deg,#fdf2f8,#fce7f3)', price:18990, originalPrice:null, discountPct:null, colors:['#ec4899','#7c3aed','#f97316','#222'], sizes:['Único'], stock:40, active:true, description:'Bufanda merino.', material:'80% lana merino.', origin:'Importado.', avgRating:0, reviewCount:0 },
  { id:'a4', name:'Gorra Signature', category:'accesorios', subcategory:'', tag:'Top Venta', emoji:'🧢', imageUrl:'', images:[], bg:'linear-gradient(135deg,#eff6ff,#bfdbfe)', price:14990, originalPrice:null, discountPct:null, colors:['#3b82f6','#222','#fff'], sizes:['S/M','L/XL'], stock:2, active:true, description:'Gorra bordada.', material:'100% algodón.', origin:'Importado.', avgRating:0, reviewCount:0 },
  { id:'a5', name:'Lentes Retro', category:'accesorios', subcategory:'', tag:null, emoji:'🕶️', imageUrl:'', images:[], bg:'linear-gradient(135deg,#fef9c3,#fef08a)', price:32990, originalPrice:null, discountPct:null, colors:['#222','#d4af37','#ef4444'], sizes:['Único'], stock:11, active:true, description:'Lentes UV400.', material:'Acetato.', origin:'Importado.', avgRating:0, reviewCount:0 },
  { id:'a6', name:'Pulsera Milano', category:'accesorios', subcategory:'', tag:'-20%', emoji:'📿', imageUrl:'', images:[], bg:'linear-gradient(135deg,#f0fdf4,#d1fae5)', price:19990, originalPrice:24990, discountPct:20, colors:['#d4af37','#c0c0c0','#222'], sizes:['S','M','L'], stock:0, active:true, description:'Pulsera cuero.', material:'Cuero y acero.', origin:'Importado.', avgRating:0, reviewCount:0 },
];

const DEFAULT_CATEGORIES = [
  { id:'zapatos', name:'Zapatos', emoji:'👟', bg:'linear-gradient(135deg,#1e1e2e,#3d3d64)', color:'#3b82f6', order:0 },
  { id:'bolsos', name:'Bolsos', emoji:'👜', bg:'linear-gradient(135deg,#2e1e1e,#6d3d3d)', color:'#a855f7', order:1 },
  { id:'accesorios', name:'Accesorios', emoji:'⌚', bg:'linear-gradient(135deg,#1e2e1e,#3d6440)', color:'#16a34a', order:2 },
];

/* ===================================================================
   COLORES PREESTABLECIDOS
   =================================================================== */
const PRESET_COLORS = [
  { name:'Negro',      hex:'#1a1a1a' },
  { name:'Blanco',     hex:'#ffffff' },
  { name:'Gris',       hex:'#6b7280' },
  { name:'Gris claro', hex:'#d1d5db' },
  { name:'Rojo',       hex:'#ef4444' },
  { name:'Rosa',       hex:'#ec4899' },
  { name:'Naranja',    hex:'#f97316' },
  { name:'Amarillo',   hex:'#eab308' },
  { name:'Verde',      hex:'#16a34a' },
  { name:'Azul',       hex:'#3b82f6' },
  { name:'Celeste',    hex:'#0ea5e9' },
  { name:'Morado',     hex:'#7c3aed' },
  { name:'Lila',       hex:'#a855f7' },
  { name:'Café',       hex:'#92400e' },
  { name:'Beige',      hex:'#f5e4c3' },
  { name:'Dorado',     hex:'#d4af37' },
  { name:'Plateado',   hex:'#c0c0c0' },
  { name:'Marino',     hex:'#1e293b' },
];

function parseColor(c) {
  if (!c) return { name:'Color', hex:'#ccc' };
  if (typeof c === 'string' && c.includes('|')) { const [n,h]=c.split('|'); return {name:n.trim(),hex:h.trim()}; }
  const hex = (c||'').trim().toLowerCase();
  const preset = PRESET_COLORS.find(p => p.hex.toLowerCase() === hex);
  if (preset) return { ...preset };
  const nameMatch = PRESET_COLORS.find(p => p.name.toLowerCase() === hex);
  if (nameMatch) return { ...nameMatch };
  return { name:'Color', hex: c };
}

/* ===================================================================
   FIRESTORE CACHE
   =================================================================== */
let productsCache = [];
let categoriesCache = [];
let reviewsCache = [];
let selectedColors = [];

async function refreshProducts() {
  const snapshot = await getDocs(collection(db, 'products'));
  productsCache = snapshot.docs.map(d => d.data());
}

async function refreshCategories() {
  const snapshot = await getDocs(collection(db, 'categories'));
  categoriesCache = snapshot.docs.map(d => d.data()).sort((a,b)=>(a.order||0)-(b.order||0));
}

async function refreshReviews() {
  const snapshot = await getDocs(collection(db, 'reviews'));
  reviewsCache = snapshot.docs.map(d => ({id: d.id, ...d.data()}))
    .sort((a,b) => (b.createdAt||0) - (a.createdAt||0));
}

async function upsertProduct(product) {
  await setDoc(doc(db, 'products', product.id), product);
  const idx = productsCache.findIndex(p => p.id === product.id);
  if (idx >= 0) productsCache[idx] = product;
  else productsCache.push(product);
}

async function removeProduct(id) {
  await deleteDoc(doc(db, 'products', id));
  productsCache = productsCache.filter(p => p.id !== id);
}

async function seedIfEmpty() {
  const [pSnap, cSnap] = await Promise.all([
    getDocs(collection(db, 'products')),
    getDocs(collection(db, 'categories')),
  ]);
  const batch = writeBatch(db);
  let needCommit = false;

  if (pSnap.empty) {
    DEFAULT_PRODUCTS.forEach(p => batch.set(doc(db, 'products', p.id), p));
    productsCache = [...DEFAULT_PRODUCTS];
    needCommit = true;
  }
  if (cSnap.empty) {
    DEFAULT_CATEGORIES.forEach(c => batch.set(doc(db, 'categories', c.id), c));
    categoriesCache = [...DEFAULT_CATEGORIES];
    needCommit = true;
  }
  if (needCommit) await batch.commit();
}

/* ===================================================================
   HELPERS
   =================================================================== */
function fmt(n) { return '$' + Number(n).toLocaleString('es-CL'); }
function genId() { return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }
function genCatId(name) { return name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'') + '-' + Date.now().toString(36).slice(-3); }

let toastTimer;
function toast(msg, type = '') {
  const el = document.getElementById('adminToast');
  el.textContent = msg;
  el.className = 'admin-toast show' + (type ? ' ' + type : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
}

function confirmDialog(title, msg, onOk) {
  const modal = document.getElementById('confirmModal');
  document.getElementById('confirmTitle').textContent = title;
  document.getElementById('confirmMsg').textContent = msg;
  modal.style.display = 'flex';
  const close = () => { modal.style.display = 'none'; };
  document.getElementById('confirmOk').onclick = async () => { close(); await onOk(); };
  document.getElementById('confirmCancel').onclick = close;
}

/* ===================================================================
   NAVEGACIÓN
   =================================================================== */
const VIEWS = ['dashboard', 'products', 'add', 'categories', 'reviews', 'settings'];
const TITLES = { dashboard:'Dashboard', products:'Productos', add:'Agregar Producto', categories:'Categorías', reviews:'Reseñas', settings:'Configuración' };

function showView(name) {
  VIEWS.forEach(v => {
    document.getElementById('view-' + v).style.display = v === name ? '' : 'none';
  });
  document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.view === name));
  document.getElementById('pageTitle').textContent = TITLES[name] || name;
  if (name === 'dashboard') renderDashboard();
  if (name === 'products') renderProductsTable();
  if (name === 'categories') renderCategoriesView();
  if (name === 'reviews') renderReviewsView();
  if (name === 'add') {
    const editId = document.getElementById('editProductId').value;
    document.getElementById('formTitle').textContent = editId ? 'Editar Producto' : 'Agregar Producto';
    document.getElementById('submitProductBtn').textContent = editId ? 'Actualizar Producto' : 'Guardar Producto';
  }
}

/* ===================================================================
   DASHBOARD
   =================================================================== */
function renderDashboard() {
  document.getElementById('statProducts').textContent = productsCache.length;
  document.getElementById('statInStock').textContent = productsCache.filter(p => p.stock > 0).length;
  const lowStock = productsCache.filter(p => p.stock > 0 && p.stock <= 5);
  const outOfStock = productsCache.filter(p => p.stock === 0);
  document.getElementById('statLowStock').textContent = lowStock.length + outOfStock.length;
  document.getElementById('statValue').textContent = fmt(productsCache.reduce((s, p) => s + p.price * p.stock, 0));
  document.getElementById('statReviews').textContent = reviewsCache.length;

  const critical = [...outOfStock, ...lowStock].sort((a, b) => a.stock - b.stock);
  document.getElementById('lowStockCount').textContent = critical.length + ' productos';
  const listEl = document.getElementById('lowStockList');
  listEl.innerHTML = critical.length === 0
    ? '<div style="padding:20px;text-align:center;color:#9ca3af;font-size:13px">Todo en orden ✓</div>'
    : critical.map(p => `
        <div class="low-stock-item">
          <span class="low-stock-item__name">${p.emoji||''} ${p.name}</span>
          <span class="low-stock-item__stock ${p.stock === 0 ? 'stock-0' : 'stock-low'}">
            ${p.stock === 0 ? 'Sin stock' : p.stock + ' restantes'}
          </span>
        </div>`).join('');

  document.getElementById('categoryStats').innerHTML = categoriesCache.map(c => {
    const count = productsCache.filter(p => p.category === c.id).length;
    const pct = productsCache.length ? Math.round(count / productsCache.length * 100) : 0;
    return `<div class="cat-stat">
      <div class="cat-stat__header"><span class="cat-stat__name">${c.emoji||''} ${c.name}</span><span class="cat-stat__count">${count} productos</span></div>
      <div class="cat-stat__bar"><div class="cat-stat__fill" style="width:${pct}%;background:${c.color||'#6366f1'}"></div></div>
    </div>`;
  }).join('');
}

/* ===================================================================
   CATEGORÍAS SELECTOR — populate dynamically
   =================================================================== */
function populateCategorySelects() {
  const selects = ['pCategory', 'categoryFilter'];
  selects.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const isFilter = id === 'categoryFilter';
    el.innerHTML = isFilter
      ? '<option value="">Todas las categorías</option>'
      : '<option value="">Seleccionar...</option>';
    categoriesCache.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.emoji||''} ${c.name}`;
      el.appendChild(opt);
    });
  });
}

/* ===================================================================
   TABLA DE PRODUCTOS
   =================================================================== */
let searchQuery = '';
let categoryFilterValue = '';

function starsAdminHtml(avg, count) {
  if (!count) return '<span style="color:#d1d5db;font-size:11px">—</span>';
  return `<div class="stars-mini">${[1,2,3,4,5].map(i=>`<span class="star-mini${i<=Math.round(avg)?' filled':''}">★</span>`).join('')}</div><span style="font-size:11px;color:#6b7280">${avg.toFixed(1)} (${count})</span>`;
}

function renderProductsTable() {
  const tbody = document.getElementById('productsTableBody');
  const filtered = productsCache.filter(p => {
    const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery);
    const matchCat = !categoryFilterValue || p.category === categoryFilterValue;
    return matchSearch && matchCat;
  });

  tbody.innerHTML = filtered.map(p => {
    const mainImg = (p.images && p.images.length) ? p.images[0] : p.imageUrl;
    const thumb = mainImg
      ? `<div class="product-thumb"><img src="${mainImg}" alt="${p.name}" onerror="this.parentElement.innerHTML='${p.emoji||'📦'}'" /></div>`
      : `<div class="product-thumb">${p.emoji||'📦'}</div>`;
    const catLabel = categoriesCache.find(c => c.id === p.category)?.name || p.category;
    return `
      <tr data-id="${p.id}">
        <td>${thumb}</td>
        <td><div class="product-name-cell">${p.name}</div></td>
        <td><span class="cat-badge cat-${p.category}">${catLabel}</span></td>
        <td><div style="display:flex;align-items:center;gap:4px"><span>$</span>
          <input class="price-input" type="number" value="${p.price}" data-field="price" data-id="${p.id}" min="0" />
        </div></td>
        <td><div style="display:flex;align-items:center;gap:4px"><span>%</span>
          <input class="price-input" type="number" value="${p.discountPct||''}" placeholder="0" data-field="discountPct" data-id="${p.id}" min="0" max="99" style="width:60px" />
        </div></td>
        <td><input class="stock-input" type="number" value="${p.stock}" data-field="stock" data-id="${p.id}" min="0" /></td>
        <td><span><span class="status-badge ${p.active !== false ? 'status-active' : 'status-inactive'}"></span>${p.active !== false ? 'Activo' : 'Inactivo'}</span></td>
        <td><div class="action-btns">
          <button class="action-btn" title="Editar" data-action="edit" data-id="${p.id}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="action-btn action-btn--delete" title="Eliminar" data-action="delete" data-id="${p.id}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
          </button>
        </div></td>
      </tr>`;
  }).join('');

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;color:#9ca3af">No se encontraron productos.</td></tr>';
  }

  tbody.querySelectorAll('.price-input, .stock-input').forEach(input => {
    input.addEventListener('blur', async () => {
      const product = productsCache.find(x => x.id === input.dataset.id);
      if (!product) return;
      let val = input.value === '' ? null : Number(input.value);
      product[input.dataset.field] = val;
      if (input.dataset.field === 'discountPct' && val && product.price) {
        product.originalPrice = Math.round(product.price / (1 - val / 100));
        product.tag = product.tag || `-${val}%`;
      }
      await upsertProduct(product);
      toast('Guardado ✓', 'success');
      renderDashboard();
    });
  });

  tbody.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const { action, id } = btn.dataset;
      if (action === 'edit') editProduct(id);
      if (action === 'delete') {
        const p = productsCache.find(x => x.id === id);
        confirmDialog('Eliminar producto', `¿Eliminar "${p?.name}"? Esta acción no se puede deshacer.`, async () => {
          await removeProduct(id);
          renderProductsTable();
          renderDashboard();
          toast('Producto eliminado', 'error');
        });
      }
    });
  });
}

/* ===================================================================
   IMÁGENES (currentImages array para el formulario)
   =================================================================== */
let currentImages = [];

function renderImagesGrid() {
  const grid = document.getElementById('imagesGrid');
  grid.innerHTML = currentImages.map((url, i) => `
    <div class="img-thumb-wrap">
      <img src="${url}" alt="img ${i+1}" onerror="this.style.opacity='.3'" />
      <button class="img-thumb-remove" data-index="${i}" title="Eliminar">✕</button>
    </div>
  `).join('');
  grid.querySelectorAll('.img-thumb-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      currentImages.splice(parseInt(btn.dataset.index), 1);
      renderImagesGrid();
    });
  });
}

document.getElementById('imageFileInput').addEventListener('change', async e => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { toast('La imagen supera 5 MB', 'error'); return; }

  const productId = document.getElementById('editProductId').value || genId();
  const storageRef = ref(storage, `products/${productId}/${Date.now()}_${file.name}`);

  const progressWrap = document.getElementById('uploadProgress');
  const progressBar = document.getElementById('progressBar');
  const uploadStatus = document.getElementById('uploadStatus');
  progressWrap.style.display = 'flex';
  progressBar.style.width = '0%';
  uploadStatus.textContent = 'Subiendo imagen...';

  try {
    const task = uploadBytesResumable(storageRef, file);
    task.on('state_changed',
      snap => {
        const pct = (snap.bytesTransferred / snap.totalBytes * 100).toFixed(0);
        progressBar.style.width = pct + '%';
        uploadStatus.textContent = `Subiendo... ${pct}%`;
      },
      err => {
        progressWrap.style.display = 'none';
        toast('Error al subir: ' + err.message, 'error');
      },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        currentImages.push(url);
        renderImagesGrid();
        progressWrap.style.display = 'none';
        toast('Imagen subida ✓', 'success');
      }
    );
  } catch(err) {
    progressWrap.style.display = 'none';
    toast('Error: ' + err.message, 'error');
  }
  e.target.value = '';
});

/* Auto-compute originalPrice from discountPct */
document.getElementById('pDiscountPct').addEventListener('input', () => {
  const price = parseFloat(document.getElementById('pPrice').value);
  const pct = parseFloat(document.getElementById('pDiscountPct').value);
  if (price > 0 && pct > 0 && pct < 100) {
    const orig = Math.round(price / (1 - pct / 100));
    document.getElementById('pOriginalPrice').value = orig;
  }
});

/* ===================================================================
   SELECTOR DE COLORES
   =================================================================== */
function renderColorPicker() {
  const presetRow = document.getElementById('colorPresetsRow');
  if (!presetRow) return;
  presetRow.innerHTML = PRESET_COLORS.map(c => `
    <button type="button" class="color-preset-btn${selectedColors.some(s=>s.hex===c.hex)?' active':''}"
      data-name="${c.name}" data-hex="${c.hex}" title="${c.name}"
      style="background:${c.hex}${c.hex==='#ffffff'?';outline:1.5px solid #d1d5db;outline-offset:-1px':''}"></button>
  `).join('');
  presetRow.querySelectorAll('.color-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.name, hex = btn.dataset.hex;
      const idx = selectedColors.findIndex(s => s.hex === hex);
      if (idx >= 0) selectedColors.splice(idx, 1);
      else selectedColors.push({ name, hex });
      renderColorPicker();
    });
  });
  const listEl = document.getElementById('selectedColorsList');
  if (!listEl) return;
  if (!selectedColors.length) {
    listEl.innerHTML = '<span style="color:#9ca3af;font-size:12px">Ningún color seleccionado</span>';
    return;
  }
  listEl.innerHTML = selectedColors.map((c, i) => `
    <span class="color-chip">
      <span class="color-chip-dot" style="background:${c.hex}${c.hex==='#ffffff'?';border:1px solid #d1d5db':''}"></span>
      ${c.name}
      <button type="button" class="color-chip-remove" data-idx="${i}" title="Quitar">×</button>
    </span>
  `).join('');
  listEl.querySelectorAll('.color-chip-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedColors.splice(+btn.dataset.idx, 1);
      renderColorPicker();
    });
  });
}

/* ===================================================================
   FORMULARIO AGREGAR / EDITAR
   =================================================================== */
function clearForm() {
  document.getElementById('editProductId').value = '';
  document.getElementById('productForm').reset();
  currentImages = [];
  renderImagesGrid();
  selectedColors = [];
  renderColorPicker();
}

function editProduct(id) {
  const p = productsCache.find(x => x.id === id);
  if (!p) return;
  document.getElementById('editProductId').value = p.id;
  document.getElementById('pName').value = p.name;
  document.getElementById('pCategory').value = p.category;
  document.getElementById('pSubcategory').value = p.subcategory || '';
  document.getElementById('pDescription').value = p.description || '';
  document.getElementById('pMaterial').value = p.material || '';
  document.getElementById('pOrigin').value = p.origin || '';
  document.getElementById('pImageUrl').value = p.imageUrl || '';
  document.getElementById('pEmoji').value = p.emoji || '';
  document.getElementById('pPrice').value = p.price;
  document.getElementById('pDiscountPct').value = p.discountPct || '';
  document.getElementById('pOriginalPrice').value = p.originalPrice || '';
  document.getElementById('pStock').value = p.stock;
  document.getElementById('pTag').value = p.tag || '';
  document.getElementById('pBg').value = p.bg || '';
  document.getElementById('pSizes').value = (p.sizes || []).join(',');
  document.getElementById('pSizeGuideText').value = p.sizeGuideText || '';
  currentImages = [...(p.images || [])];
  renderImagesGrid();
  selectedColors = (p.colors || []).map(parseColor);
  renderColorPicker();
  showView('add');
}

/* Fill form from imported product data (without saving) */
function fillProductFormFromImport(p) {
  document.getElementById('editProductId').value = p.id || '';
  document.getElementById('pName').value = p.name || '';
  document.getElementById('pCategory').value = p.category || '';
  document.getElementById('pSubcategory').value = p.subcategory || '';
  document.getElementById('pDescription').value = p.description || '';
  document.getElementById('pMaterial').value = p.material || '';
  document.getElementById('pOrigin').value = p.origin || '';
  document.getElementById('pImageUrl').value = p.imageUrl || '';
  document.getElementById('pEmoji').value = p.emoji || '';
  document.getElementById('pPrice').value = p.price || '';
  document.getElementById('pDiscountPct').value = p.discountPct || '';
  document.getElementById('pOriginalPrice').value = p.originalPrice || '';
  document.getElementById('pStock').value = p.stock !== undefined ? p.stock : '';
  document.getElementById('pTag').value = p.tag || '';
  document.getElementById('pBg').value = p.bg || '';
  document.getElementById('pSizes').value = (p.sizes || []).join(',');
  document.getElementById('pSizeGuideText').value = p.sizeGuideText || '';
  currentImages = [...(p.images || [])];
  renderImagesGrid();
  selectedColors = (p.colors || []).map(parseColor);
  renderColorPicker();
  document.getElementById('formTitle').textContent = 'Completar datos del producto';
  document.getElementById('submitProductBtn').textContent = 'Actualizar Producto';
  showView('add');
}

document.getElementById('productForm').addEventListener('submit', async e => {
  e.preventDefault();
  const editId = document.getElementById('editProductId').value;
  const imageUrl = document.getElementById('pImageUrl').value.trim();

  const data = {
    id: editId || genId(),
    name: document.getElementById('pName').value.trim(),
    category: document.getElementById('pCategory').value,
    subcategory: document.getElementById('pSubcategory').value.trim(),
    description: document.getElementById('pDescription').value.trim(),
    material: document.getElementById('pMaterial').value.trim(),
    origin: document.getElementById('pOrigin').value.trim(),
    imageUrl: imageUrl,
    images: currentImages.length ? currentImages : (imageUrl ? [imageUrl] : []),
    emoji: document.getElementById('pEmoji').value.trim() || '📦',
    price: Number(document.getElementById('pPrice').value),
    discountPct: document.getElementById('pDiscountPct').value ? Number(document.getElementById('pDiscountPct').value) : null,
    originalPrice: document.getElementById('pOriginalPrice').value ? Number(document.getElementById('pOriginalPrice').value) : null,
    stock: Number(document.getElementById('pStock').value),
    tag: document.getElementById('pTag').value.trim() || null,
    bg: document.getElementById('pBg').value.trim() || 'linear-gradient(135deg,#f3f4f6,#e5e7eb)',
    sizes: document.getElementById('pSizes').value.split(',').map(s => s.trim()).filter(Boolean),
    colors: selectedColors.map(c => `${c.name}|${c.hex}`),
    sizeGuideText: document.getElementById('pSizeGuideText').value.trim() || null,
    active: true,
    avgRating: productsCache.find(x => x.id === editId)?.avgRating || 0,
    reviewCount: productsCache.find(x => x.id === editId)?.reviewCount || 0,
  };

  const btn = document.getElementById('submitProductBtn');
  btn.textContent = 'Guardando...';
  btn.disabled = true;
  await upsertProduct(data);
  btn.disabled = false;
  toast(editId ? 'Producto actualizado ✓' : 'Producto agregado ✓', 'success');
  clearForm();
  showView('products');
});

document.getElementById('cancelEdit').addEventListener('click', () => { clearForm(); showView('products'); });

/* ===================================================================
   BÚSQUEDA Y FILTROS
   =================================================================== */
document.getElementById('productSearch').addEventListener('input', e => {
  searchQuery = e.target.value.toLowerCase().trim();
  renderProductsTable();
});
document.getElementById('categoryFilter').addEventListener('change', e => {
  categoryFilterValue = e.target.value;
  renderProductsTable();
});

/* ===================================================================
   EXCEL IMPORT / EXPORT (SheetJS)
   =================================================================== */
function exportProductsExcel() {
  const rows = productsCache.map(p => ({
    'ID': p.id,
    'Nombre': p.name,
    'Categoria': p.category,
    'Subcategoria': p.subcategory || '',
    'Emoji': p.emoji || '',
    'Precio': p.price,
    'Precio_Original': p.originalPrice || '',
    'Descuento_%': p.discountPct || '',
    'Stock': p.stock,
    'Tallas': (p.sizes || []).join(','),
    'Colores': (p.colors || []).join(','),
    'Badge': p.tag || '',
    'Fondo_CSS': p.bg || '',
    'Descripcion': p.description || '',
    'Material': p.material || '',
    'Origen': p.origin || '',
    'Activo': p.active !== false ? 'Si' : 'No',
    'Imagen_URL': p.imageUrl || '',
    'Imagenes': (p.images || []).join('|'),
    'Guia_Tallas': p.sizeGuideText || '',
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Productos');
  XLSX.writeFile(wb, `stride-productos-${new Date().toISOString().slice(0,10)}.xlsx`);
  toast('Excel exportado ✓', 'success');
}

let importPreviewData = [];

async function importProductsExcel(file) {
  const reader = new FileReader();
  reader.onload = async e => {
    try {
      const wb = XLSX.read(e.target.result, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

      if (!rows.length) { toast('El archivo está vacío', 'error'); return; }

      importPreviewData = rows.map(row => ({
        id: String(row['ID'] || '').trim() || genId(),
        name: String(row['Nombre'] || '').trim(),
        category: String(row['Categoria'] || row['Categoría'] || 'zapatos').trim().toLowerCase(),
        subcategory: String(row['Subcategoria'] || row['Subcategoría'] || '').trim(),
        emoji: String(row['Emoji'] || '📦').trim(),
        price: Number(row['Precio']) || 0,
        originalPrice: row['Precio_Original'] ? Number(row['Precio_Original']) : null,
        discountPct: row['Descuento_%'] ? Number(row['Descuento_%']) : null,
        stock: Number(row['Stock']) || 0,
        sizes: row['Tallas'] ? String(row['Tallas']).split(',').map(s=>s.trim()).filter(Boolean) : [],
        colors: row['Colores'] ? String(row['Colores']).split(',').map(c => {
          const t = c.trim();
          const parsed = parseColor(t);
          if (parsed.name !== 'Color') return `${parsed.name}|${parsed.hex}`;
          const byName = PRESET_COLORS.find(p => p.name.toLowerCase() === t.toLowerCase());
          return byName ? `${byName.name}|${byName.hex}` : t;
        }).filter(Boolean) : [],
        tag: String(row['Badge'] || '').trim() || null,
        bg: String(row['Fondo_CSS'] || 'linear-gradient(135deg,#f3f4f6,#e5e7eb)').trim(),
        description: String(row['Descripcion'] || row['Descripción'] || '').trim(),
        material: String(row['Material'] || '').trim(),
        origin: String(row['Origen'] || '').trim(),
        active: String(row['Activo'] || 'Si').trim() !== 'No',
        imageUrl: String(row['Imagen_URL'] || '').trim(),
        images: row['Imagenes'] ? String(row['Imagenes']).split('|').map(s=>s.trim()).filter(Boolean) : [],
        sizeGuideText: String(row['Guia_Tallas'] || '').trim() || null,
        avgRating: 0,
        reviewCount: 0,
      }));

      showImportPreview();
    } catch(err) {
      console.error(err);
      toast('Error al leer el archivo. Verifica el formato.', 'error');
    }
  };
  reader.readAsBinaryString(file);
}

function showImportPreview() {
  const modal = document.getElementById('importPreviewModal');
  document.getElementById('importPreviewTitle').textContent = `Importación — ${importPreviewData.length} productos`;
  const content = document.getElementById('importPreviewContent');
  content.innerHTML = `
    <table class="products-table" style="min-width:600px">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Categoría</th>
          <th>Precio</th>
          <th>Stock</th>
          <th>Imagen</th>
          <th>Acción</th>
        </tr>
      </thead>
      <tbody>
        ${importPreviewData.map((p, i) => {
          const hasImg = p.imageUrl || (p.images && p.images.length);
          return `<tr>
            <td style="font-weight:600">${p.name || '—'}</td>
            <td>${p.category}</td>
            <td>${fmt(p.price)}</td>
            <td>${p.stock}</td>
            <td><span class="${hasImg ? 'import-has-img' : 'import-no-img'}">${hasImg ? '✓ Con imagen' : '⚠ Sin imagen'}</span></td>
            <td><button class="action-btn" data-import-index="${i}" title="Editar este producto">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button></td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  `;

  content.querySelectorAll('[data-import-index]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.importIndex);
      modal.style.display = 'none';
      fillProductFormFromImport(importPreviewData[idx]);
    });
  });

  modal.style.display = 'flex';
}

document.getElementById('importPreviewClose').addEventListener('click', () => {
  document.getElementById('importPreviewModal').style.display = 'none';
});
document.getElementById('importPreviewClose2').addEventListener('click', () => {
  document.getElementById('importPreviewModal').style.display = 'none';
});

document.getElementById('importSaveAllBtn').addEventListener('click', async () => {
  if (!importPreviewData.length) return;
  const btn = document.getElementById('importSaveAllBtn');
  btn.textContent = 'Guardando...';
  btn.disabled = true;
  try {
    const batch = writeBatch(db);
    importPreviewData.forEach(p => batch.set(doc(db, 'products', p.id), p));
    await batch.commit();
    importPreviewData.forEach(p => {
      const idx = productsCache.findIndex(x => x.id === p.id);
      if (idx >= 0) productsCache[idx] = p; else productsCache.push(p);
    });
    document.getElementById('importPreviewModal').style.display = 'none';
    renderProductsTable();
    renderDashboard();
    toast(`${importPreviewData.length} productos guardados ✓`, 'success');
  } catch(err) {
    toast('Error al guardar: ' + err.message, 'error');
  }
  btn.textContent = 'Guardar todos los productos';
  btn.disabled = false;
});

/* Listeners export / import */
document.getElementById('exportBtn').addEventListener('click', exportProductsExcel);
document.getElementById('exportBtnSettings').addEventListener('click', exportProductsExcel);

function handleImportFile(file) {
  if (!file) return;
  if (!window.XLSX) { toast('SheetJS no cargado aún, espera un momento', 'error'); return; }
  importProductsExcel(file);
}

document.getElementById('importFile').addEventListener('change', e => {
  handleImportFile(e.target.files[0]);
  e.target.value = '';
});
document.getElementById('importFileSettings').addEventListener('change', e => {
  handleImportFile(e.target.files[0]);
  e.target.value = '';
});

/* ===================================================================
   RESET
   =================================================================== */
document.getElementById('resetProductsBtn').addEventListener('click', () => {
  confirmDialog('Restaurar productos', '¿Reemplazar todos los productos por los de fábrica?', async () => {
    const batch = writeBatch(db);
    productsCache.forEach(p => batch.delete(doc(db, 'products', p.id)));
    DEFAULT_PRODUCTS.forEach(p => batch.set(doc(db, 'products', p.id), p));
    await batch.commit();
    productsCache = [...DEFAULT_PRODUCTS];
    renderProductsTable();
    renderDashboard();
    toast('Productos restaurados', 'success');
  });
});

/* ===================================================================
   CATEGORÍAS
   =================================================================== */
function renderCategoriesView() {
  const listEl = document.getElementById('categoriesList');
  if (!categoriesCache.length) {
    listEl.innerHTML = '<div style="padding:20px;text-align:center;color:#9ca3af">No hay categorías. Agrega una.</div>';
    return;
  }
  listEl.innerHTML = categoriesCache.map(c => `
    <div class="category-row">
      <div class="category-row__emoji">${c.emoji||'📦'}</div>
      <div class="category-row__info">
        <div class="category-row__name">
          <span class="category-color-dot" style="background:${c.color||'#ccc'}"></span>
          ${c.name}
        </div>
        <div class="category-row__meta">ID: ${c.id} · Orden: ${c.order||0} · ${productsCache.filter(p=>p.category===c.id).length} productos</div>
      </div>
      <div class="category-row__actions">
        <button class="action-btn" data-cat-action="edit" data-cat-id="${c.id}" title="Editar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="action-btn action-btn--delete" data-cat-action="delete" data-cat-id="${c.id}" title="Eliminar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
        </button>
      </div>
    </div>
  `).join('');

  listEl.querySelectorAll('[data-cat-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const { catAction, catId } = btn.dataset;
      if (catAction === 'edit') openCatForm(catId);
      if (catAction === 'delete') {
        const c = categoriesCache.find(x => x.id === catId);
        const pCount = productsCache.filter(p => p.category === catId).length;
        confirmDialog('Eliminar categoría', `¿Eliminar "${c?.name}"? Hay ${pCount} productos en esta categoría.`, async () => {
          await deleteDoc(doc(db, 'categories', catId));
          categoriesCache = categoriesCache.filter(x => x.id !== catId);
          populateCategorySelects();
          renderCategoriesView();
          renderDashboard();
          toast('Categoría eliminada', 'error');
        });
      }
    });
  });
}

function openCatForm(catId) {
  const formEl = document.getElementById('categoryForm');
  formEl.style.display = '';
  if (catId) {
    const c = categoriesCache.find(x => x.id === catId);
    document.getElementById('catFormTitle').textContent = 'Editar Categoría';
    document.getElementById('editCatId').value = c.id;
    document.getElementById('catName').value = c.name;
    document.getElementById('catEmoji').value = c.emoji || '';
    document.getElementById('catOrder').value = c.order || 0;
    document.getElementById('catColor').value = c.color || '';
    document.getElementById('catBg').value = c.bg || '';
  } else {
    document.getElementById('catFormTitle').textContent = 'Nueva Categoría';
    document.getElementById('editCatId').value = '';
    document.getElementById('catName').value = '';
    document.getElementById('catEmoji').value = '';
    document.getElementById('catOrder').value = categoriesCache.length;
    document.getElementById('catColor').value = '';
    document.getElementById('catBg').value = '';
  }
  formEl.scrollIntoView({ behavior:'smooth' });
}

document.getElementById('addCategoryBtn').addEventListener('click', () => openCatForm(null));
document.getElementById('cancelCatEdit').addEventListener('click', () => {
  document.getElementById('categoryForm').style.display = 'none';
});

document.getElementById('saveCatBtn').addEventListener('click', async () => {
  const name = document.getElementById('catName').value.trim();
  if (!name) { toast('El nombre es obligatorio', 'error'); return; }
  const editId = document.getElementById('editCatId').value;
  const catId = editId || genCatId(name);
  const catData = {
    id: catId,
    name,
    emoji: document.getElementById('catEmoji').value.trim() || '📦',
    order: parseInt(document.getElementById('catOrder').value) || 0,
    color: document.getElementById('catColor').value.trim() || '#6366f1',
    bg: document.getElementById('catBg').value.trim() || 'linear-gradient(135deg,#1e1e2e,#3d3d64)',
  };
  await setDoc(doc(db, 'categories', catId), catData);
  const idx = categoriesCache.findIndex(x => x.id === catId);
  if (idx >= 0) categoriesCache[idx] = catData; else categoriesCache.push(catData);
  categoriesCache.sort((a,b) => (a.order||0) - (b.order||0));
  populateCategorySelects();
  renderCategoriesView();
  renderDashboard();
  document.getElementById('categoryForm').style.display = 'none';
  toast('Categoría guardada ✓', 'success');
});

/* ===================================================================
   RESEÑAS
   =================================================================== */
let reviewSearchQuery = '';
let reviewRatingFilter = '';

function renderReviewsView() {
  const total = reviewsCache.length;
  const avg = total ? (reviewsCache.reduce((s,r) => s+(r.rating||0), 0) / total) : 0;

  document.getElementById('reviewsStats').innerHTML = `
    <div class="reviews-stat-card">
      <div><div class="reviews-stat-card__value">${total}</div><div class="reviews-stat-card__label">Total reseñas</div></div>
    </div>
    <div class="reviews-stat-card">
      <div><div class="reviews-stat-card__value">${avg.toFixed(1)} ★</div><div class="reviews-stat-card__label">Promedio general</div></div>
    </div>
    <div class="reviews-stat-card">
      <div><div class="reviews-stat-card__value">${reviewsCache.filter(r=>r.rating>=4).length}</div><div class="reviews-stat-card__label">Reseñas positivas (≥4★)</div></div>
    </div>
  `;

  const filtered = reviewsCache.filter(r => {
    const productName = productsCache.find(p => p.id === r.productId)?.name || r.productId;
    const matchSearch = !reviewSearchQuery ||
      productName.toLowerCase().includes(reviewSearchQuery) ||
      (r.author||'').toLowerCase().includes(reviewSearchQuery);
    const matchRating = !reviewRatingFilter || String(r.rating) === reviewRatingFilter;
    return matchSearch && matchRating;
  });

  const tbody = document.getElementById('reviewsTableBody');
  if (!filtered.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:#9ca3af">No hay reseñas aún.</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(r => {
    const productName = productsCache.find(p => p.id === r.productId)?.name || r.productId;
    const stars = [1,2,3,4,5].map(i => `<span class="star-mini${i<=(r.rating||0)?' filled':''}">★</span>`).join('');
    const date = r.createdAt ? new Date(r.createdAt).toLocaleDateString('es-CL') : '—';
    return `
      <tr>
        <td style="font-weight:600;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${productName}</td>
        <td>${r.author}</td>
        <td><div class="stars-mini">${stars}</div></td>
        <td class="review-comment-cell">${r.comment}</td>
        <td style="white-space:nowrap">${date}</td>
        <td>
          <button class="action-btn action-btn--delete" data-review-id="${r.id}" title="Eliminar reseña">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
          </button>
        </td>
      </tr>
    `;
  }).join('');

  tbody.querySelectorAll('[data-review-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      confirmDialog('Eliminar reseña', '¿Eliminar esta reseña? Esta acción no se puede deshacer.', async () => {
        await deleteDoc(doc(db, 'reviews', btn.dataset.reviewId));
        reviewsCache = reviewsCache.filter(r => r.id !== btn.dataset.reviewId);
        renderReviewsView();
        renderDashboard();
        toast('Reseña eliminada', 'error');
      });
    });
  });
}

document.getElementById('reviewSearch').addEventListener('input', e => {
  reviewSearchQuery = e.target.value.toLowerCase().trim();
  renderReviewsView();
});
document.getElementById('reviewRatingFilter').addEventListener('change', e => {
  reviewRatingFilter = e.target.value;
  renderReviewsView();
});

/* ===================================================================
   CAMBIO DE CONTRASEÑA
   =================================================================== */
document.getElementById('changePasswordForm').addEventListener('submit', async e => {
  e.preventDefault();
  const errEl = document.getElementById('pwdError');
  const currentVal = document.getElementById('currentPwd').value;
  const newVal = document.getElementById('newPwd').value;
  const confirmVal = document.getElementById('confirmPwd').value;

  if (await sha256(currentVal) !== getStoredHash()) {
    errEl.textContent = 'La contraseña actual es incorrecta.';
    errEl.style.display = 'block'; return;
  }
  if (newVal.length < 6) {
    errEl.textContent = 'Mínimo 6 caracteres.';
    errEl.style.display = 'block'; return;
  }
  if (newVal !== confirmVal) {
    errEl.textContent = 'Las contraseñas no coinciden.';
    errEl.style.display = 'block'; return;
  }
  errEl.style.display = 'none';
  localStorage.setItem(STORAGE_KEYS.PWD_HASH, await sha256(newVal));
  document.getElementById('changePasswordForm').reset();
  toast('Contraseña actualizada ✓', 'success');
});

renderColorPicker();

/* ===================================================================
   LOGIN / LOGOUT
   =================================================================== */
document.getElementById('loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const hash = await sha256(document.getElementById('loginPassword').value);
  const errEl = document.getElementById('loginError');
  if (hash === getStoredHash()) {
    errEl.style.display = 'none';
    createSession();
    await showAdmin();
  } else {
    errEl.style.display = 'block';
    document.getElementById('loginPassword').value = '';
    document.getElementById('loginPassword').focus();
  }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  destroySession();
  document.getElementById('adminApp').style.display = 'none';
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('loginPassword').value = '';
});

document.getElementById('togglePwd').addEventListener('click', () => {
  const input = document.getElementById('loginPassword');
  input.type = input.type === 'password' ? 'text' : 'password';
});

/* ===== SIDEBAR ===== */
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.dataset.view === 'add') clearForm();
    showView(btn.dataset.view);
  });
});

/* ===================================================================
   INIT
   =================================================================== */
async function showAdmin() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('adminApp').style.display = 'grid';
  document.getElementById('topbarDate').textContent = new Date().toLocaleDateString('es-CL', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  document.getElementById('pageTitle').textContent = 'Cargando...';

  try {
    await seedIfEmpty();
    await Promise.all([refreshProducts(), refreshCategories(), refreshReviews()]);
  } catch(err) {
    console.error(err);
    toast('Error al conectar con Firebase', 'error');
  }

  populateCategorySelects();
  showView('dashboard');
}

if (isLoggedIn()) { showAdmin(); }
