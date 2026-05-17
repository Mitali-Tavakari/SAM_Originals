// ══════════════════════════════════════
// CART STATE
// ══════════════════════════════════════

let cart = [];
let isGift = false;

function cartTotal() {
  return cart.reduce((s, i) => s + (i.price * i.qty), 0);
}

function cartItemCount() {
  return cart.reduce((s, i) => s + i.qty, 0);
}

function updateCartBadge() {
  const n = cartItemCount();
  const el = document.getElementById('cart-count');
  el.textContent = n;
  el.classList.toggle('show', n > 0);
}

// ══════════════════════════════════════
// CART DRAWER
// ══════════════════════════════════════

function openCart() {
  renderCart();
  document.getElementById('cart-overlay').classList.add('open');
  document.getElementById('cart-drawer').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cart-overlay').classList.remove('open');
  document.getElementById('cart-drawer').classList.remove('open');
  document.body.style.overflow = '';
}

function renderCart() {
  const container = document.getElementById('cart-items-container');
  const footer = document.getElementById('cart-footer');

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">BAG</div>
        <p>Your cart is empty</p>
        <p style="font-size:12px;margin-top:8px;">Head to the shop and find your piece</p>
      </div>`;
    footer.innerHTML = `<button class="cart-continue" onclick="closeCart();showPage('shop')">Browse the Shop</button>`;
    return;
  }

  container.innerHTML = cart.map((item, idx) => `
    <div class="cart-item">
      <div class="cart-item-img" style="background:${item.color}20;">${item.ph}</div>
      <div class="cart-item-details">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-size">Size: ${item.size}</div>
        <div class="cart-item-qty-row">
          <button class="cqb" onclick="cartChangeQty(${idx}, -1)">−</button>
          <span class="cqn">${item.qty}</span>
          <button class="cqb" onclick="cartChangeQty(${idx}, 1)">+</button>
        </div>
        <div class="cart-item-price">AED ${item.price * item.qty}</div>
        <button class="cart-item-remove" onclick="removeCartItem(${idx})">Remove</button>
      </div>
    </div>
  `).join('');

  footer.innerHTML = `
    <div class="cart-subtotal"><span>Subtotal (${cartItemCount()} items)</span><span>AED ${cartTotal()}</span></div>
    <div class="cart-subtotal"><span>Delivery</span><span style="color:var(--green);">Calculated at checkout</span></div>
    <div class="cart-total">
      <span class="cart-total-label">Total</span>
      <span class="cart-total-price">AED ${cartTotal()}</span>
    </div>
    <button class="cart-checkout-btn" onclick="openCheckout()">Proceed to Checkout</button>
    <button class="cart-continue" onclick="closeCart()">Continue Shopping</button>
  `;
}

function cartChangeQty(idx, d) {
  cart[idx].qty = Math.max(1, Math.min(5, cart[idx].qty + d));
  updateCartBadge();
  renderCart();
}

function removeCartItem(idx) {
  cart.splice(idx, 1);
  updateCartBadge();
  renderCart();
}

// ══════════════════════════════════════
// CHECKOUT MODAL
// ══════════════════════════════════════

function openCheckout() {
  closeCart();
  renderModalSummary();
  selectGift(false);
  document.getElementById('checkout-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCheckout() {
  document.getElementById('checkout-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

function renderModalSummary() {
  const el = document.getElementById('modal-order-summary');
  const items = cart.map(i =>
    `<div class="order-sum-item">
      <span class="name">${i.name} × ${i.qty} <span style="color:var(--muted);font-size:11px;">(${i.size})</span></span>
      <span class="price">AED ${i.price * i.qty}</span>
    </div>`
  ).join('');

  el.innerHTML = `
    <div class="order-sum-title">Items</div>
    ${items}
    <div class="order-sum-divider"></div>
    <div class="order-sum-total">
      <span class="name">Total</span>
      <span class="price">AED ${cartTotal()}</span>
    </div>
  `;
}

function selectGift(yes) {
  isGift = yes;
  const giftNo   = document.getElementById('gift-no');
  const giftYes  = document.getElementById('gift-yes');
  const giftOpts = document.getElementById('gift-options');

  if (yes) {
    giftYes.classList.add('selected');
    giftNo.classList.remove('selected');
    giftOpts.classList.add('show');
  } else {
    giftNo.classList.add('selected');
    giftYes.classList.remove('selected');
    giftOpts.classList.remove('show');
  }
}

function proceedToWhatsApp() {
  const fname    = document.getElementById('f-fname').value.trim();
  const lname    = document.getElementById('f-lname').value.trim();
  const phone    = document.getElementById('f-phone').value.trim();
  const apt      = document.getElementById('f-apt').value.trim();
  const street   = document.getElementById('f-street').value.trim();
  const emirate  = document.getElementById('f-emirate').value;
  const landmark = document.getElementById('f-landmark').value.trim();

  if (!fname || !lname || !phone || !apt || !street || !emirate) {
    showToast('Please fill in all required fields', '⚠️');
    return;
  }

  const recipName  = isGift ? document.getElementById('f-recip').value.trim() : '';
  const giftMsg    = isGift ? document.getElementById('f-gift-msg').value.trim() : '';

  if (isGift && !recipName) {
    showToast("Please enter the recipient's name", '⚠️');
    return;
  }

  // Build WhatsApp message
  let msg = `🖤 *SAM_ORIGINALS — New Order*\n\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `🛍️ *ORDER DETAILS*\n━━━━━━━━━━━━━━━━━━━━\n`;
  cart.forEach(item => {
    msg += `• ${item.name}\n  Size: ${item.size} | Qty: ${item.qty} | AED ${item.price * item.qty}\n`;
  });
  msg += `\n💰 *TOTAL: AED ${cartTotal()}*\n`;
  msg += `\n━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `📦 *DELIVERY ADDRESS*\n━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `Name: ${fname} ${lname}\n`;
  msg += `Phone: ${phone}\n`;
  msg += `Address: ${apt}, ${street}\n`;
  msg += `Emirate: ${emirate}\n`;
  if (landmark) msg += `Landmark: ${landmark}\n`;

  if (isGift) {
    msg += `\n━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `🎁 *GIFT ORDER*\n━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `This is a gift for: ${recipName}\n`;
    msg += `Gift wrapped: ✅ Yes\n`;
    msg += giftMsg ? `Personal message: "${giftMsg}"\n` : `Personal message: None\n`;
  }

  msg += `\n━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `Please confirm this order and let me know the delivery timeline. Thank you! 🙏`;

  const encoded = encodeURIComponent(msg);
  window.open(`https://wa.me/971504840410?text=${encoded}`, '_blank');

  cart = [];
  updateCartBadge();
  closeCheckout();
  showToast('Redirecting to WhatsApp — thanks!', '🎉');
}
