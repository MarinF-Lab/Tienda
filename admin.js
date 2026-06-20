import { db } from './firebase-config.js';
import {
  collection, getDocs, setDoc, deleteDoc, doc, writeBatch
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

/* ===================================================================
   SEGURIDAD — contraseña como hash SHA-256 en localStorage
   Contraseña por defecto: stride2026
   =================================================================== */
const STORAGE_KEYS = { PWD_HASH: 'stride_admin_pwd', SESSION: 'stride_admin_session' };
const DEFAULT_PWD_HASH = '4b1d979b05a909da790c0e068209131eda76030fe2bc84085c0076592b1f57be';

async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}
function getStoredHash() {
  return localStorage.getItem(STORAGE_KEYS.PWD_HASH) || DEFAULT_PWD_HASH;
}

/* ===== SESIÓN (8 horas) ===== */
const SESSION_TTL = 8 * 60 * 60 * 1000;
function isLoggedIn() {
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION) || 'null');
    return s && (Date.now() - s.ts) < SESSION_TTL;
  } catch { return false; }
}
function createSession() {
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify({ ts: Date.now() }));
}
function destroySession() {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
}

/* ===================================================================
   PRODUCTOS POR DEFECTO
   =================================================================== */
const DEFAULT_PRODUCTS = [
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

/* ===================================================================
   FIRESTORE — cache en memoria para no hacer múltiples lecturas
   =================================================================== */
let productsCache = [];

async function refreshProducts() {
  const snapshot = await getDocs(collection(db, 'products'));
  productsCache = snapshot.docs.map(d => d.data());
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
  const snapshot = await getDocs(collection(db, 'products'));
  if (!snapshot.empty) return;
  const batch = writeBatch(db);
  DEFAULT_PRODUCTS.forEach(p => batch.set(doc(db, 'products', p.id), p));
  await batch.commit();
  productsCache = [...DEFAULT_PRODUCTS];
}

function loadProducts() { return productsCache; }

/* ===================================================================
   HELPERS
   =================================================================== */
function fmt(n) { return '$' + Number(n).toLocaleString('es-CL'); }
function genId() { return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }

let toastTimer;
function toast(msg, type = '') {
  const el = document.getElementById('adminToast');
  el.textContent = msg;
  el.className = 'admin-toast show' + (type ? ' ' + type : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
}

function confirm(title, msg, onOk) {
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
const VIEWS = ['dashboard', 'products', 'add', 'settings'];
const TITLES = { dashboard: 'Dashboard', products: 'Productos', add: 'Agregar Producto', settings: 'Configuración' };

function showView(name) {
  VIEWS.forEach(v => {
    document.getElementById('view-' + v).style.display = v === name ? '' : 'none';
  });
  document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.view === name));
  document.getElementById('pageTitle').textContent = TITLES[name];
  if (name === 'dashboard') renderDashboard();
  if (name === 'products') renderProductsTable();
  if (name === 'add') {
    const editId = document.getElementById('editProductId').value;
    document.getElementById('formTitle').textContent = editId ? 'Editar Producto' : 'Agregar Producto';
    document.getElementById('submitProductBtn').textContent = editId ? 'Guardar Cambios' : 'Guardar Producto';
  }
}

/* ===================================================================
   DASHBOARD
   =================================================================== */
function renderDashboard() {
  const products = loadProducts();
  const inStock = products.filter(p => p.stock > 0).length;
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 5);
  const outOfStock = products.filter(p => p.stock === 0);
  const inventoryValue = products.reduce((s, p) => s + p.price * p.stock, 0);

  document.getElementById('statProducts').textContent = products.length;
  document.getElementById('statInStock').textContent = inStock;
  document.getElementById('statLowStock').textContent = lowStock.length + outOfStock.length;
  document.getElementById('statValue').textContent = fmt(inventoryValue);

  const critical = [...outOfStock, ...lowStock].sort((a, b) => a.stock - b.stock);
  document.getElementById('lowStockCount').textContent = critical.length + ' productos';
  const listEl = document.getElementById('lowStockList');
  listEl.innerHTML = critical.length === 0
    ? '<div style="padding:20px;text-align:center;color:#9ca3af;font-size:13px">Todo en orden ✓</div>'
    : critical.map(p => `
        <div class="low-stock-item">
          <span class="low-stock-item__name">${p.emoji} ${p.name}</span>
          <span class="low-stock-item__stock ${p.stock === 0 ? 'stock-0' : 'stock-low'}">
            ${p.stock === 0 ? 'Sin stock' : p.stock + ' restantes'}
          </span>
        </div>`).join('');

  const cats = [
    { name:'Zapatos', key:'zapatos', color:'#3b82f6' },
    { name:'Bolsos', key:'bolsos', color:'#a855f7' },
    { name:'Accesorios', key:'accesorios', color:'#16a34a' },
  ];
  document.getElementById('categoryStats').innerHTML = cats.map(c => {
    const count = products.filter(p => p.category === c.key).length;
    const pct = products.length ? Math.round(count / products.length * 100) : 0;
    return `<div class="cat-stat">
      <div class="cat-stat__header"><span class="cat-stat__name">${c.name}</span><span class="cat-stat__count">${count} productos</span></div>
      <div class="cat-stat__bar"><div class="cat-stat__fill" style="width:${pct}%;background:${c.color}"></div></div>
    </div>`;
  }).join('');
}

/* ===================================================================
   TABLA DE PRODUCTOS
   =================================================================== */
let searchQuery = '';
let categoryFilterValue = '';

function renderProductsTable() {
  const products = loadProducts();
  const tbody = document.getElementById('productsTableBody');
  const filtered = products.filter(p => {
    const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery);
    const matchCat = !categoryFilterValue || p.category === categoryFilterValue;
    return matchSearch && matchCat;
  });

  tbody.innerHTML = filtered.map(p => {
    let stockClass = p.stock === 0 ? 'stock-out' : (p.stock <= 5 ? 'stock-low-badge' : 'stock-ok');
    const thumb = p.imageUrl
      ? `<div class="product-thumb"><img src="${p.imageUrl}" alt="${p.name}" onerror="this.parentElement.textContent='${p.emoji}'" /></div>`
      : `<div class="product-thumb">${p.emoji}</div>`;
    return `
      <tr data-id="${p.id}">
        <td>${thumb}</td>
        <td><div class="product-name-cell">${p.name}</div></td>
        <td><span class="cat-badge cat-${p.category}">${p.category}</span></td>
        <td><div style="display:flex;align-items:center;gap:6px"><span>$</span>
          <input class="price-input" type="number" value="${p.price}" data-field="price" data-id="${p.id}" min="0" />
        </div></td>
        <td><div style="display:flex;align-items:center;gap:6px"><span>$</span>
          <input class="price-input" type="number" value="${p.originalPrice || ''}" placeholder="—" data-field="originalPrice" data-id="${p.id}" min="0" />
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

  /* Edición inline — guarda en Firestore al perder foco */
  tbody.querySelectorAll('.price-input, .stock-input').forEach(input => {
    input.addEventListener('blur', async () => {
      const product = productsCache.find(x => x.id === input.dataset.id);
      if (!product) return;
      const val = input.value === '' ? null : Number(input.value);
      product[input.dataset.field] = val;
      await upsertProduct(product);
      toast('Guardado en Firebase ✓', 'success');
      renderDashboard();
    });
  });

  tbody.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const { action, id } = btn.dataset;
      if (action === 'edit') editProduct(id);
      if (action === 'delete') {
        const p = productsCache.find(x => x.id === id);
        confirm('Eliminar producto', `¿Eliminar "${p?.name}"? Esta acción no se puede deshacer.`, async () => {
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
   FORMULARIO AGREGAR / EDITAR
   =================================================================== */
function clearForm() {
  document.getElementById('editProductId').value = '';
  document.getElementById('productForm').reset();
  updateImagePreview();
}

function editProduct(id) {
  const p = productsCache.find(x => x.id === id);
  if (!p) return;
  document.getElementById('editProductId').value = p.id;
  document.getElementById('pName').value = p.name;
  document.getElementById('pCategory').value = p.category;
  document.getElementById('pSubcategory').value = p.subcategory || '';
  document.getElementById('pImageUrl').value = p.imageUrl || '';
  document.getElementById('pEmoji').value = p.emoji || '';
  document.getElementById('pPrice').value = p.price;
  document.getElementById('pOriginalPrice').value = p.originalPrice || '';
  document.getElementById('pStock').value = p.stock;
  document.getElementById('pTag').value = p.tag || '';
  document.getElementById('pBg').value = p.bg || '';
  document.getElementById('pSizes').value = (p.sizes || []).join(',');
  document.getElementById('pColors').value = (p.colors || []).join(',');
  updateImagePreview();
  showView('add');
}

function updateImagePreview() {
  const url = document.getElementById('pImageUrl')?.value.trim();
  const emoji = document.getElementById('pEmoji')?.value || '📦';
  const preview = document.getElementById('imagePreview');
  if (!preview) return;
  preview.innerHTML = url
    ? `<img src="${url}" alt="preview" onerror="this.parentElement.innerHTML='<span style=\\'font-size:48px\\'>${emoji}</span>'" />`
    : `<span style="font-size:48px">${emoji}</span>`;
}

document.getElementById('pImageUrl').addEventListener('input', updateImagePreview);
document.getElementById('pEmoji').addEventListener('input', updateImagePreview);

document.getElementById('productForm').addEventListener('submit', async e => {
  e.preventDefault();
  const editId = document.getElementById('editProductId').value;
  const data = {
    id: editId || genId(),
    name: document.getElementById('pName').value.trim(),
    category: document.getElementById('pCategory').value,
    subcategory: document.getElementById('pSubcategory').value.trim(),
    imageUrl: document.getElementById('pImageUrl').value.trim(),
    emoji: document.getElementById('pEmoji').value.trim() || '📦',
    price: Number(document.getElementById('pPrice').value),
    originalPrice: document.getElementById('pOriginalPrice').value ? Number(document.getElementById('pOriginalPrice').value) : null,
    stock: Number(document.getElementById('pStock').value),
    tag: document.getElementById('pTag').value.trim() || null,
    bg: document.getElementById('pBg').value.trim() || 'linear-gradient(135deg,#f3f4f6,#e5e7eb)',
    sizes: document.getElementById('pSizes').value.split(',').map(s => s.trim()).filter(Boolean),
    colors: document.getElementById('pColors').value.split(',').map(c => c.trim()).filter(Boolean),
    active: true,
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

document.getElementById('cancelEdit').addEventListener('click', () => {
  clearForm();
  showView('products');
});

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
   EXPORT / IMPORT
   =================================================================== */
function exportProducts() {
  const data = JSON.stringify(loadProducts(), null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `stride-productos-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast('Backup exportado ✓', 'success');
}

async function importProducts(file) {
  const reader = new FileReader();
  reader.onload = async e => {
    try {
      const data = JSON.parse(e.target.result);
      if (!Array.isArray(data)) throw new Error();
      const batch = writeBatch(db);
      productsCache.forEach(p => batch.delete(doc(db, 'products', p.id)));
      data.forEach(p => batch.set(doc(db, 'products', p.id), p));
      await batch.commit();
      productsCache = data;
      renderProductsTable();
      renderDashboard();
      toast(`${data.length} productos importados ✓`, 'success');
    } catch {
      toast('Archivo inválido', 'error');
    }
  };
  reader.readAsText(file);
}

document.getElementById('exportBtn').addEventListener('click', exportProducts);
document.getElementById('exportBtnSettings').addEventListener('click', exportProducts);
document.getElementById('importFile').addEventListener('change', e => {
  if (e.target.files[0]) importProducts(e.target.files[0]);
  e.target.value = '';
});
document.getElementById('importFileSettings').addEventListener('change', e => {
  if (e.target.files[0]) importProducts(e.target.files[0]);
  e.target.value = '';
});

document.getElementById('resetProductsBtn').addEventListener('click', () => {
  confirm('Restaurar productos', 'Se reemplazarán todos los productos por los de fábrica. ¿Continuar?', async () => {
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
    errEl.style.display = 'block';
    return;
  }
  if (newVal.length < 6) {
    errEl.textContent = 'Mínimo 6 caracteres.';
    errEl.style.display = 'block';
    return;
  }
  if (newVal !== confirmVal) {
    errEl.textContent = 'Las contraseñas no coinciden.';
    errEl.style.display = 'block';
    return;
  }
  errEl.style.display = 'none';
  localStorage.setItem(STORAGE_KEYS.PWD_HASH, await sha256(newVal));
  document.getElementById('changePasswordForm').reset();
  toast('Contraseña actualizada ✓', 'success');
});

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

  /* Mostrar estado de carga */
  document.getElementById('pageTitle').textContent = 'Cargando...';
  try {
    await seedIfEmpty();
    await refreshProducts();
  } catch (err) {
    console.error('Error cargando productos de Firebase:', err);
    toast('Error al conectar con Firebase', 'error');
  }
  showView('dashboard');
}

if (isLoggedIn()) {
  showAdmin();
}
