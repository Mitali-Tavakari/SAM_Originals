// ══════════════════════════════════════
// PAGE ROUTING
// ══════════════════════════════════════

function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.remove('active');
    if (a.id === 'nav-' + name) a.classList.add('active');
  });
  window.scrollTo(0, 0);
}

function showProductDetail(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  renderProductDetail(p);
  showPage('product');
}

// ══════════════════════════════════════
// RENDER PRODUCT CARD
// ══════════════════════════════════════

function renderProductCard(p) {
  const sold      = p.stock === 0;
  const stockWarn = p.stock > 0 && p.stock <= 5;

  return `
    <div class="product-card ${sold ? 'sold-out' : ''}" onclick="showProductDetail(${p.id})">
      <div class="prod-img" style="background:${p.color}15;">
        ${p.img 
  ? `<img src="${p.img}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;display:block;">`
  : `<div class="prod-img-ph">${p.ph}</div>`
}
        <div class="prod-badge ${p.badge === 'limited' ? 'bl' : p.badge === 'new' ? 'bn' : 'bs'}">${p.badgeText}</div>
        ${stockWarn ? `<div class="stock-pill">Only ${p.stock} left</div>` : ''}
        <div class="prod-overlay">
          <button class="prod-overlay-btn" onclick="event.stopPropagation();${sold ? `showToast('This item is sold out','🔔')` : `showProductDetail(${p.id})`}">
            ${sold ? 'Notify Me' : 'Quick View'}
          </button>
        </div>
      </div>
      <div class="prod-info">
        <div class="prod-coll">${p.collection}</div>
        <div class="prod-name">${p.name}</div>
        <div class="prod-price-row">
          <div class="prod-price">${sold ? `<span class="orig">AED ${p.price}</span>Sold Out` : `AED ${p.price}`}</div>
          ${sold ? `<button class="notify-mini" onclick="event.stopPropagation();showToast('We will notify you when back in stock','🔔')">Notify Me</button>` : ''}
        </div>
      </div>
    </div>`;
}

// ══════════════════════════════════════
// RENDER SHOP & HOME GRIDS
// ══════════════════════════════════════

function renderShopGrid(filter = 'all') {
  let list = PRODUCTS;
  if (filter === 'drop01')     list = PRODUCTS.filter(p => p.category === 'drop01');
  else if (filter === 'archive')   list = PRODUCTS.filter(p => p.category === 'archive');
  else if (filter === 'available') list = PRODUCTS.filter(p => p.stock > 0);
  else if (filter === 'sold')      list = PRODUCTS.filter(p => p.stock === 0);

  document.getElementById('shop-products-grid').innerHTML = list.map(p => renderProductCard(p)).join('');
  document.getElementById('shop-count').textContent = `${list.length} Item${list.length !== 1 ? 's' : ''}`;
}

function filterProducts(f, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderShopGrid(f);
}

function renderHomeGrid() {
  const featured = PRODUCTS.filter(p => p.stock > 0).slice(0, 3);
  document.getElementById('home-products-grid').innerHTML = featured.map(p => renderProductCard(p)).join('');
}

// ══════════════════════════════════════
// PRODUCT DETAIL
// ══════════════════════════════════════

let selectedSize = null;
let selectedQty  = 1;
let currentProduct = null;

const WA_SVG = `<svg class="wa-svg" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>`;

function renderProductDetail(p) {
  currentProduct = p;
  selectedSize   = null;
  selectedQty    = 1;

  const sold      = p.stock === 0;
  const stockWarn = p.stock > 0 && p.stock <= 5;

  const sizesHTML = p.sizes.map(s => `
    <button class="size-opt ${p.unavail.includes(s) ? 'unavail' : ''}"
      onclick="${p.unavail.includes(s) ? '' : `selectSize('${s}',this)`}"
      data-size="${s}">${s}</button>
  `).join('');

  document.getElementById('product-detail-content').innerHTML = `
    <div class="prod-detail-imgs">
      <div class="prod-detail-main-img" style="background:${p.color}20;">
        <div class="prod-detail-stripe"></div>
        ${p.img 
  ? `<img src="${p.img}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;" id="main-product-img">`
  : `<div class="prod-detail-main-ph">${p.ph}</div>`
}
      </div>
      <div class="prod-thumbs">
  ${(p.imgs || [p.img]).map((src, i) => `
    <div class="prod-thumb ${i===0?'active':''}" onclick="swapImage('${src}', this)" style="overflow:hidden;padding:0;">
      <img src="${src}" style="width:100%;height:100%;object-fit:cover;" alt="View ${i+1}">
    </div>
  `).join('')}
</div>
    </div>
    <div class="prod-detail-info">
      <div class="prod-detail-badges">
        <span class="prod-badge ${p.badge === 'limited' ? 'bl' : p.badge === 'new' ? 'bn' : 'bs'}" style="position:static;">${p.badgeText}</span>
      </div>
      <div class="prod-detail-coll">${p.collection}</div>
      <div class="prod-detail-name">${p.name}</div>
      <div class="prod-detail-price">AED ${p.price}</div>
      ${stockWarn ? `<div class="stock-warning"><div class="stock-dot"></div>Only ${p.stock} left in stock — order soon</div>` : ''}
      ${sold ? `<div class="stock-warning" style="color:var(--muted2);">⚫ This item is sold out</div>` : ''}
      <p class="prod-desc">${p.desc}</p>
      <div class="size-label">
        Select Size
        <span class="size-guide-link" onclick="showToast('Size guide: XS=34-36, S=36-38, M=38-40, L=40-42, XL=42-44, XXL=44-46 (chest in inches)','📏')">Size Guide</span>
      </div>
      <div class="size-grid" id="size-grid-${p.id}">${sizesHTML}</div>
      <div class="qty-row">
        <span class="qty-label">Qty</span>
        <button class="qty-btn" onclick="changeQty(-1)">−</button>
        <div class="qty-num" id="qty-display">1</div>
        <button class="qty-btn" onclick="changeQty(1)">+</button>
      </div>
      <button class="add-to-cart-btn" id="atc-btn" onclick="addToCart(${p.id})" ${sold ? 'disabled' : ''}>
        ${sold ? 'Sold Out — Notify Me' : 'Add to Cart'}
      </button>
      <a href="https://wa.me/971504840410?text=Hi!%20I%27m%20interested%20in%20the%20${encodeURIComponent(p.name)}%20(AED%20${p.price})"
         target="_blank" class="whatsapp-enquiry">
        ${WA_SVG}
        Enquire on WhatsApp
      </a>
      <div class="prod-meta">
        <div class="prod-meta-row"><span class="k">Material</span><span class="v">${p.fabric}</span></div>
        <div class="prod-meta-row"><span class="k">Care</span><span class="v">${p.care}</span></div>
        <div class="prod-meta-row"><span class="k">Origin</span><span class="v">Designed in Sharjah, UAE</span></div>
        <div class="prod-meta-row"><span class="k">Drop</span><span class="v">${p.collection}</span></div>
      </div>
      <div class="ugc-section">
        <div class="ugc-title">Who Wore It</div>
        <div class="ugc-placeholder">Community photos coming soon — be the first to rep this piece and tag us @sam_originals</div>
      </div>
    </div>
  `;

  // Related products
  const related = PRODUCTS.filter(x => x.id !== p.id && x.stock > 0).slice(0, 3);
  document.getElementById('related-products-sec').innerHTML = `
    <div style="max-width:1200px;margin:0 auto;padding:0 40px;">
      <div class="sec-label">You Might Also Like</div>
      <div class="sec-title" style="margin-bottom:28px;">Related <span class="g">Pieces</span></div>
      <div class="products-grid">${related.map(x => renderProductCard(x)).join('')}</div>
    </div>
  `;
}

function selectSize(s, btn) {
  document.querySelectorAll('.size-opt').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedSize = s;
}

function changeQty(d) {
  selectedQty = Math.max(1, Math.min(5, selectedQty + d));
  document.getElementById('qty-display').textContent = selectedQty;
}

function swapImage(src, thumb) {
  document.getElementById('main-product-img').src = src;
  document.querySelectorAll('.prod-thumb').forEach(t => t.classList.remove('active'));
  thumb.classList.add('active');
}

function addToCart(productId) {
  if (!selectedSize) {
    showToast('Please select a size first', '⚠️');
    return;
  }
  const p = PRODUCTS.find(x => x.id === productId);
  if (!p || p.stock === 0) return;

  const existing = cart.find(i => i.id === productId && i.size === selectedSize);
  if (existing) {
    existing.qty = Math.min(existing.qty + selectedQty, 5);
  } else {
    cart.push({ id: p.id, name: p.name, price: p.price, size: selectedSize, qty: selectedQty, ph: p.ph, color: p.color });
  }
  updateCartBadge();
  showToast(`${p.name} (${selectedSize}) added to cart`, '✓');
}

// ══════════════════════════════════════
// TOAST
// ══════════════════════════════════════

let toastTimer = null;

function showToast(msg, icon = '✓') {
  const t = document.getElementById('toast');
  t.innerHTML = `<span class="t-gold">${icon}</span> ${msg}`;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}

// ══════════════════════════════════════
// WAITLIST
// ══════════════════════════════════════

function joinWaitlist() {
  const inp = document.getElementById('waitlist-email');
  if (inp.value && inp.value.includes('@')) {
    showToast("You're on the list — stay ready", '🔥');
    inp.value = '';
    inp.placeholder = "✓ You're on the list!";
    setTimeout(() => { inp.placeholder = 'your@email.com'; }, 4000);
  } else {
    inp.style.borderColor = 'rgba(201,150,58,.8)';
    setTimeout(() => inp.style.borderColor = 'rgba(201,150,58,.25)', 2000);
    showToast('Please enter a valid email', '⚠️');
  }
}

// ══════════════════════════════════════
// COUNTDOWN
// ══════════════════════════════════════

const dropDate = new Date();
dropDate.setDate(dropDate.getDate() + 21);
dropDate.setHours(dropDate.getHours() + 14, 33, 7, 0);

function updateCountdown() {
  const dist = dropDate - Date.now();
  if (dist < 0) return;
  const d = Math.floor(dist / 864e5);
  const h = Math.floor((dist % 864e5) / 36e5);
  const m = Math.floor((dist % 36e5) / 6e4);
  const s = Math.floor((dist % 6e4) / 1e3);
  const pad = n => String(n).padStart(2, '0');
  ['days', 'hrs', 'min', 'sec'].forEach((id, i) => {
    const el = document.getElementById('d-' + id);
    if (el) el.textContent = pad([d, h, m, s][i]);
  });
}

setInterval(updateCountdown, 1000);

// ══════════════════════════════════════
// INIT
// ══════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  renderHomeGrid();
  renderShopGrid();
  selectGift(false);
  updateCountdown();
});
