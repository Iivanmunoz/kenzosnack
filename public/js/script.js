/* ============================================================
   SNACK PAWS — JavaScript Principal
   Cart, Animaciones, Pedidos
   ============================================================ */

'use strict';

// ─── Estado Global ───────────────────────────────────────────
let cart = [];
let cartOpen = false;
let modalOpen = false;

// ─── Datos de Productos ──────────────────────────────────────
const PRODUCTS = [
  {
    id: 1,
    name: 'Patas de Pollo',
    category: 'Aves',
    emoji: '🍗',
    price: 45,
    unit: '100g',
    desc: 'Deshidratadas naturalmente. Ricas en colágeno para articulaciones sanas.',
    badge: 'popular',
    badgeText: '⭐ Popular',
    tags: ['todos', 'aves'],
  },
  {
    id: 2,
    name: 'Orejas de Res',
    category: 'Res',
    emoji: '🐄',
    price: 65,
    unit: 'pieza',
    desc: 'Limpiadoras dentales naturales. Horas de entretenimiento garantizadas.',
    badge: 'popular',
    badgeText: '⭐ Popular',
    tags: ['todos', 'res'],
  },
  {
    id: 3,
    name: 'Hígado de Pollo',
    category: 'Aves',
    emoji: '🫀',
    price: 50,
    unit: '100g',
    desc: 'Superalimento rico en hierro y vitaminas. Premio favorito de los perritos.',
    badge: null,
    tags: ['todos', 'aves'],
  },
  {
    id: 4,
    name: 'Tráquea de Res',
    category: 'Res',
    emoji: '🦴',
    price: 70,
    unit: 'pieza',
    desc: 'Alta en glucosamina y condroitina. Ideal para la salud articular.',
    badge: 'new',
    badgeText: '✨ Nuevo',
    tags: ['todos', 'res'],
  },
  {
    id: 5,
    name: 'Pulmón de Res',
    category: 'Res',
    emoji: '🫁',
    price: 60,
    unit: '100g',
    desc: 'Bajo en grasa, alto en proteína. Perfecto para perros con dieta especial.',
    badge: null,
    tags: ['todos', 'res'],
  },
  {
    id: 6,
    name: 'Cuero de Cerdo',
    category: 'Cerdo',
    emoji: '🐷',
    price: 40,
    unit: '100g',
    desc: 'Crujiente y delicioso. Excelente limpiador dental natural.',
    badge: null,
    tags: ['todos', 'cerdo'],
  },
  {
    id: 7,
    name: 'Corazón de Pollo',
    category: 'Aves',
    emoji: '❤️',
    price: 55,
    unit: '100g',
    desc: 'Músculo magro rico en taurina. Ideal para la salud cardiovascular.',
    badge: 'new',
    badgeText: '✨ Nuevo',
    tags: ['todos', 'aves'],
  },
  {
    id: 8,
    name: 'Costilla de Cerdo',
    category: 'Cerdo',
    emoji: '🥩',
    price: 75,
    unit: 'pieza',
    desc: 'Para razas medianas y grandes. Snack de larga duración.',
    badge: null,
    tags: ['todos', 'cerdo'],
  },
];

const TESTIMONIALS = [
  { text: '"Max ya no quiere otro snack. Las orejas de res son su premio favorito ¡y han mejorado su higiene dental mucho!"', name: 'Laura García', pet: 'Dueña de Max 🐕 Golden', emoji: '👩' },
  { text: '"Los hígados de pollo son increíbles como premio de entrenamiento. Mi perro los adora y yo estoy tranquila que son naturales."', name: 'Roberto M.', pet: 'Dueño de Thor 🐕 Husky', emoji: '👨' },
  { text: '"Calidad excelente, llegaron super bien empacados. La tráquea le dura horas a mi Bulldoggie. ¡100% recomendados!"', name: 'Sofía R.', pet: 'Dueña de Mochi 🐕 Bulldog', emoji: '👩' },
  { text: '"Busqué mucho snacks naturales en México y estos son los mejores que he probado. Sin conservadores y se nota la diferencia."', name: 'Carlos V.', pet: 'Dueño de Luna 🐕 Labrador', emoji: '🧑' },
  { text: '"Las patas de pollo ayudaron muchísimo con las articulaciones de mi perrita mayor. Son un producto de calidad premium."', name: 'Ana Torres', pet: 'Dueña de Coco 🐕 Poodle', emoji: '👩' },
  { text: '"Pedí por primera vez y quedé encantada. El envío rápido, los productos fresquísimos. Mi Simba los devora con gusto."', name: 'Patricia L.', pet: 'Dueña de Simba 🐕 Shih Tzu', emoji: '👩' },
];

// ─── DOM Elements ────────────────────────────────────────────
const $nav = document.getElementById('navbar');
const $cartOverlay = document.getElementById('cartOverlay');
const $cartSidebar = document.getElementById('cartSidebar');
const $cartItems = document.getElementById('cartItems');
const $cartCount = document.getElementById('cartCount');
const $cartSubtotal = document.getElementById('cartSubtotal');
const $productsGrid = document.getElementById('productsGrid');
const $modalOverlay = document.getElementById('modalOverlay');
const $modal = document.getElementById('modal');
const $toastContainer = document.getElementById('toastContainer');

// ─── Utils ───────────────────────────────────────────────────
const fmt = (n) => `$${n.toFixed(2)} MXN`;

const showToast = (msg, icon = '🐾') => {
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
  $toastContainer.appendChild(t);
  setTimeout(() => {
    t.classList.add('removing');
    setTimeout(() => t.remove(), 300);
  }, 3000);
};

// ─── Navbar ──────────────────────────────────────────────────
window.addEventListener('scroll', () => {
  $nav.classList.toggle('scrolled', window.scrollY > 50);
});

// Hamburger
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger?.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  hamburger.classList.toggle('open');
});

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger?.classList.remove('open');
  });
});

// ─── Scroll Reveal ───────────────────────────────────────────
const observer = new IntersectionObserver(
  (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
  { threshold: 0.12 }
);
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ─── Paw Print Decorations ───────────────────────────────────
const pawContainer = document.getElementById('heroPaws');
const pawEmojis = ['🐾', '🐾', '🐾'];

if (pawContainer) {
  pawEmojis.forEach((paw, i) => {
    const el = document.createElement('div');
    el.className = 'paw-deco';
    el.textContent = paw;
    el.style.cssText = `
      left: ${Math.random() * 100}%;
      animation-duration: ${8 + Math.random() * 8}s;
      animation-delay: ${i * 2}s;
      font-size: ${32 + Math.random() * 32}px;
    `;
    pawContainer.appendChild(el);
  });
}

// ─── Filter Tabs ─────────────────────────────────────────────
let activeFilter = 'todos';

document.querySelectorAll('.filter-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    activeFilter = tab.dataset.filter;
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    renderProducts();
  });
});

// ─── Render Products ─────────────────────────────────────────
const renderProducts = () => {
  const filtered = activeFilter === 'todos'
    ? PRODUCTS
    : PRODUCTS.filter(p => p.tags.includes(activeFilter));

  $productsGrid.innerHTML = '';

  filtered.forEach((product, i) => {
    const card = document.createElement('div');
    card.className = 'product-card reveal';
    if (i < 3) card.style.transitionDelay = `${i * .1}s`;

    const inCart = cart.find(c => c.id === product.id);

    card.innerHTML = `
      ${product.badge ? `<span class="product-badge ${product.badge}">${product.badgeText}</span>` : ''}
      <div class="product-img">
        <div class="product-shine"></div>
        <span class="product-emoji">${product.emoji}</span>
      </div>
      <div class="product-info">
        <div class="product-category">${product.category}</div>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-desc">${product.desc}</p>
        <div class="product-footer">
          <div class="product-price">
            ${fmt(product.price)} <span>/ ${product.unit}</span>
          </div>
          <button 
            class="add-btn ${inCart ? 'added' : ''}" 
            data-id="${product.id}" 
            aria-label="Agregar ${product.name} al carrito"
          >
            ${inCart ? '✓' : '+'}
          </button>
        </div>
      </div>
    `;

    card.querySelector('.add-btn').addEventListener('click', () => addToCart(product.id));
    $productsGrid.appendChild(card);
    setTimeout(() => observer.observe(card), 50);
  });
};

// ─── Cart ────────────────────────────────────────────────────
const addToCart = (id) => {
  const product = PRODUCTS.find(p => p.id === id);
  const existing = cart.find(c => c.id === id);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  updateCartUI();
  renderProducts();
  showToast(`${product.name} agregado al carrito`, product.emoji);

  // Badge bump animation
  $cartCount.classList.remove('bump');
  void $cartCount.offsetWidth;
  $cartCount.classList.add('bump');
  setTimeout(() => $cartCount.classList.remove('bump'), 300);
};

const removeFromCart = (id) => {
  cart = cart.filter(c => c.id !== id);
  updateCartUI();
  renderProducts();
};

const updateQty = (id, delta) => {
  const item = cart.find(c => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  else updateCartUI();
};

const getTotal = () => cart.reduce((sum, i) => sum + i.price * i.qty, 0);
const getCount = () => cart.reduce((sum, i) => sum + i.qty, 0);

const updateCartUI = () => {
  const count = getCount();
  const total = getTotal();

  $cartCount.textContent = count;
  $cartSubtotal.textContent = fmt(total);

  if (cart.length === 0) {
    $cartItems.innerHTML = `
      <div class="cart-empty">
        <span class="cart-empty-emoji">🛒</span>
        <p>Tu carrito está vacío.<br>¡Agrega algunos snacks!</p>
      </div>
    `;
    return;
  }

  $cartItems.innerHTML = cart.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <div class="cart-item-emoji">${item.emoji}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${fmt(item.price)} / ${item.unit}</div>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn" data-action="dec" data-id="${item.id}">−</button>
        <span class="qty-display">${item.qty}</span>
        <button class="qty-btn" data-action="inc" data-id="${item.id}">+</button>
      </div>
      <div class="cart-item-total">${fmt(item.price * item.qty)}</div>
    </div>
  `).join('');

  $cartItems.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      const action = btn.dataset.action;
      updateQty(id, action === 'inc' ? 1 : -1);
    });
  });
};

// Open / Close Cart
const openCart = () => {
  cartOpen = true;
  $cartOverlay.classList.add('open');
  $cartSidebar.classList.add('open');
  document.body.style.overflow = 'hidden';
};

const closeCart = () => {
  cartOpen = false;
  $cartOverlay.classList.remove('open');
  $cartSidebar.classList.remove('open');
  document.body.style.overflow = '';
};

document.getElementById('cartBtn')?.addEventListener('click', openCart);
document.getElementById('cartBtn2')?.addEventListener('click', openCart);
document.getElementById('cartClose')?.addEventListener('click', closeCart);
$cartOverlay?.addEventListener('click', (e) => { if (e.target === $cartOverlay) closeCart(); });

// ─── Checkout Modal ──────────────────────────────────────────
const openModal = () => {
  if (cart.length === 0) {
    showToast('Agrega productos primero', '⚠️');
    return;
  }

    const user = JSON.parse(localStorage.getItem('kenzo_user') || 'null');
  if (!user) {
    showToast('Debes iniciar sesión para comprar 🐾', '🔐');
    setTimeout(() => window.location.href = '/login.html', 1500);
    return;
  }
  
  closeCart();
  initStripe();
  populateOrderSummary();
  $modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  modalOpen = true;
};

const closeModal = () => {
  $modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
  modalOpen = false;
};

document.getElementById('checkoutBtn')?.addEventListener('click', openModal);
document.getElementById('closeModal')?.addEventListener('click', closeModal);
$modalOverlay?.addEventListener('click', (e) => { if (e.target === $modalOverlay) closeModal(); });

const populateOrderSummary = () => {
  const summaryEl = document.getElementById('orderSummaryItems');
  const totalEl = document.getElementById('orderSummaryTotal');
  if (!summaryEl || !totalEl) return;

  summaryEl.innerHTML = cart.map(item => `
    <div class="order-summary-item">
      <span>${item.emoji} ${item.name} ×${item.qty}</span>
      <span>${fmt(item.price * item.qty)}</span>
    </div>
  `).join('');

  totalEl.innerHTML = `<span>Total</span><span>${fmt(getTotal())}</span>`;
};

// ─── Order Form Submission ───────────────────────────────────
const orderForm = document.getElementById('orderForm');
const submitBtn = document.getElementById('submitBtn');

orderForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (cart.length === 0) {
    showToast('Tu carrito está vacío', '⚠️');
    return;
  }

  const payload = {
    customerName: document.getElementById('customerName').value.trim(),
    customerEmail: document.getElementById('customerEmail').value.trim(),
    customerPhone: document.getElementById('customerPhone').value.trim(),
    notes: document.getElementById('orderNotes').value.trim(),
    items: cart.map(i => ({
      id: i.id, name: i.name, emoji: i.emoji,
      price: i.price, qty: i.qty, unit: i.unit,
    })),
    total: getTotal(),
  };

  // Loading state
  submitBtn.disabled = true;
  submitBtn.innerHTML = `<span class="spinner"></span> Conectando con Mercado Pago...`;

  try {
    // Creamos la preferencia de pago en el servidor
    const { paymentMethod, error } = await stripeInstance.createPaymentMethod({
      type: 'card',
      card: stripeCardElement,
      billing_details: { name: customerName, email: customerEmail, phone: customerPhone }
    });
    if (error) { showError(error.message); return; }

    const res = await fetch('/api/stripe-charge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('kenzo_token')}` },
      body: JSON.stringify({
        paymentMethodId: paymentMethod.id,
        customerName, customerEmail: user.email, customerPhone,
        customerAddress: `${document.getElementById('customerAddress').value}, ${document.getElementById('customerDelegacion').value}, CP ${document.getElementById('customerCP').value}`, petName: document.getElementById('petName').value,
        petBreed: document.getElementById('petBreed').value,
        petSize: document.getElementById('petSize').value,
        notes: document.getElementById('orderNotes').value,
        items, total
      })
    });

    const data = await res.json();

    if (data.success && data.checkoutUrl) {
      // Mostramos pantalla de transición antes de redirigir a MP
      document.getElementById('orderFormContainer').style.display = 'none';
      document.getElementById('redirectingScreen').style.display = 'block';

      // Redirigimos al checkout de Mercado Pago después de un breve momento
      setTimeout(() => {
        window.location.href = data.checkoutUrl;
      }, 1800);
    } else {
      throw new Error(data.message || 'No se pudo conectar con Mercado Pago.');
    }
  } catch (err) {
    showToast(err.message || 'Error al conectar. Intenta de nuevo.', '❌');
    submitBtn.disabled = false;
    submitBtn.innerHTML = `🏦 Pagar con Mercado Pago`;
  }
});

document.getElementById('successCloseBtn')?.addEventListener('click', () => {
  document.getElementById('orderFormContainer').style.display = 'block';
  document.getElementById('successScreen').style.display = 'none';
  orderForm.reset();
  closeModal();
});

// ─── Testimonials Auto-Clone ─────────────────────────────────
const initTestimonials = () => {
  const track = document.getElementById('testimonialsTrack');
  if (!track) return;

  TESTIMONIALS.forEach(t => {
    const card = `
      <div class="testimonial-card">
        <div class="testimonial-stars">★★★★★</div>
        <p class="testimonial-text">${t.text}</p>
        <div class="testimonial-author">
          <div class="testimonial-avatar">${t.emoji}</div>
          <div>
            <div class="testimonial-name">${t.name}</div>
            <div class="testimonial-pet">${t.pet}</div>
          </div>
        </div>
      </div>
    `;
    track.innerHTML += card;
  });

  // Clone for seamless loop
  track.innerHTML += track.innerHTML;
};

// ─── Animated Counters ───────────────────────────────────────
const animateCounter = (el, target, duration = 2000) => {
  let start = 0;
  const step = target / (duration / 16);
  const interval = setInterval(() => {
    start = Math.min(start + step, target);
    el.textContent = Math.round(start) + (el.dataset.suffix || '');
    if (start >= target) clearInterval(interval);
  }, 16);
};

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      document.querySelectorAll('.stat-number[data-target]').forEach(el => {
        animateCounter(el, parseInt(el.dataset.target));
      });
      statsObserver.disconnect();
    }
  });
}, { threshold: .5 });

const statsBar = document.querySelector('.stats-bar');
if (statsBar) statsObserver.observe(statsBar);

// ─── Parallax Hero ───────────────────────────────────────────
document.addEventListener('mousemove', (e) => {
  const blobs = document.querySelectorAll('.hero-blob');
  const x = (e.clientX / window.innerWidth - .5) * 20;
  const y = (e.clientY / window.innerHeight - .5) * 20;

  blobs.forEach((blob, i) => {
    const factor = (i + 1) * .5;
    blob.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
  });
});

// ─── Keyboard Events ─────────────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (modalOpen) closeModal();
    else if (cartOpen) closeCart();
  }
});
// ─── Stripe Init ─────────────────────────────────────────────
let stripeCardElement = null;
let stripeInstance = null;

const initStripe = () => {
  if (stripeInstance) return;
  stripeInstance = Stripe('pk_test_TU_PUBLISHABLE_KEY'); // ← tu key de Stripe
  const elements = stripeInstance.elements();
  stripeCardElement = elements.create('card', {
    style: {
      base: { color: '#3c1a0c', fontFamily: '"DM Sans", sans-serif', fontSize: '15px',
              '::placeholder': { color: '#9b6b3e' } },
      invalid: { color: '#e53e3e' }
    }
  });
  stripeCardElement.mount('#stripe-card-element');
  stripeCardElement.on('change', e => {
    document.getElementById('stripe-card-errors').textContent = e.error?.message || '';
  });
};

// ─── Init ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  updateCartUI();
  initTestimonials();
});
