/* ============================================================
   KENZO SNACK — script-3d.js
   Carga DESPUÉS de script.js y antes de </body>
   Requiere: Three.js + VanillaTilt (ver index.html actualizado)
   ============================================================ */

/* ── Three.js Hero Background ─────────────────────────────── */
(function initHeroThree() {
  const hero = document.querySelector('.hero');
  if (!hero || typeof THREE === 'undefined') return;

  const canvas = document.createElement('canvas');
  canvas.id = 'hero-canvas';
  hero.insertBefore(canvas, hero.firstChild);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const setSize = () => {
    renderer.setSize(hero.offsetWidth, hero.offsetHeight);
    camera.aspect = hero.offsetWidth / hero.offsetHeight;
    camera.updateProjectionMatrix();
  };

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 500);
  camera.position.z = 8;
  setSize();

  // Warm ambient + point lights
  scene.add(new THREE.AmbientLight(0xe4bf65, 0.5));
  const pt1 = new THREE.PointLight(0xf0d88a, 2, 30);
  pt1.position.set(4, 6, 4);
  scene.add(pt1);
  const pt2 = new THREE.PointLight(0xc9a340, 1, 20);
  pt2.position.set(-6, -4, 2);
  scene.add(pt2);

  // ── Particles (paw trail effect)
  const pCount = 500;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    pPos[i*3]   = (Math.random() - .5) * 30;
    pPos[i*3+1] = (Math.random() - .5) * 20;
    pPos[i*3+2] = (Math.random() - .5) * 15 - 2;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const particles = new THREE.Points(pGeo,
    new THREE.PointsMaterial({ color: 0xe4bf65, size: 0.06, transparent: true, opacity: 0.5, sizeAttenuation: true })
  );
  scene.add(particles);

  // ── Floating icosahedron (bone gem)
  const icoMesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.8, 1),
    new THREE.MeshPhongMaterial({
      color: 0xe4bf65, wireframe: false, transparent: true, opacity: 0.06,
      emissive: 0xe4bf65, emissiveIntensity: 0.15,
    })
  );
  icoMesh.position.set(5, 0, -2);
  scene.add(icoMesh);

  const icoWire = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.8, 1),
    new THREE.MeshBasicMaterial({ color: 0xe4bf65, wireframe: true, transparent: true, opacity: 0.12 })
  );
  icoWire.position.copy(icoMesh.position);
  scene.add(icoWire);

  // ── Torus rings
  const addRing = (r, tube, x, y, z, color, op) => {
    const m = new THREE.Mesh(
      new THREE.TorusGeometry(r, tube, 8, 64),
      new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: op })
    );
    m.position.set(x, y, z);
    scene.add(m);
    return m;
  };
  const ring1 = addRing(3.5, 0.03, -4, 1, -3, 0xe4bf65, 0.07);
  const ring2 = addRing(2.2, 0.025, 5, -2, -4, 0xc9a340, 0.05);
  const ring3 = addRing(1.5, 0.035, 0, 2, -1, 0xf0d88a, 0.09);

  // Mouse parallax
  let tMx = 0, tMy = 0;
  document.addEventListener('mousemove', e => {
    tMx = (e.clientX / innerWidth  - .5) * 2;
    tMy = (e.clientY / innerHeight - .5) * 2;
  });
  window.addEventListener('resize', setSize);

  const clock = new THREE.Clock();
  (function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    particles.rotation.y = t * 0.02;
    particles.rotation.x = t * 0.007;
    icoMesh.rotation.y = t * 0.12; icoMesh.rotation.x = t * 0.07;
    icoWire.rotation.copy(icoMesh.rotation);
    ring1.rotation.x = t * .15; ring1.rotation.y = t * .08;
    ring2.rotation.y = -t * .1; ring2.rotation.z = t * .06;
    ring3.rotation.x = -t * .18; ring3.rotation.z = t * .12;
    camera.position.x += (tMx * .5 - camera.position.x) * .04;
    camera.position.y += (-tMy * .3 - camera.position.y) * .04;
    renderer.render(scene, camera);
  })();
})();

/* ── VanillaTilt on Product Cards ─────────────────────────── */
(function patchRenderProducts() {
  if (typeof renderProducts === 'undefined' || typeof VanillaTilt === 'undefined') return;

  const _orig = renderProducts;
  window.renderProducts = function() {
    _orig.apply(this, arguments);
    setTimeout(() => {
      VanillaTilt.init(document.querySelectorAll('.product-card'), {
        max: 12,
        speed: 400,
        glare: true,
        'max-glare': 0.18,
        perspective: 800,
      });
    }, 100);
  };
})();

/* ── Auth Navbar ──────────────────────────────────────────── */
(function initAuthNav() {
  const actionsBar = document.querySelector('.nav-inner > div');
  if (!actionsBar) return;

  const user = JSON.parse(localStorage.getItem('kenzo_user') || 'null');

  if (!user) {
    // Show login button
    const loginBtn = document.createElement('a');
    loginBtn.href = '/login.html';
    loginBtn.className = 'nav-auth-btn';
    loginBtn.innerHTML = '👤 <span>Acceder</span>';
    actionsBar.insertBefore(loginBtn, actionsBar.firstChild);
  } else {
    // Show user dropdown
    const menu = document.createElement('div');
    menu.className = 'nav-user-menu';
    const initial = (user.name || 'U')[0].toUpperCase();
    menu.innerHTML = `
      <button class="nav-user-trigger" id="userTrigger">
        <div class="nav-user-avatar">${initial}</div>
        <span>${user.name?.split(' ')[0] || 'Mi cuenta'}</span>
        <span style="font-size:10px;opacity:.6">▼</span>
      </button>
      <div class="nav-dropdown" id="userDropdown">
        <a href="#">🐾 Mis Pedidos</a>
        <a href="#">⚙️ Mi Perfil</a>
        ${user.role === 'admin' ? '<a href="/dashboard.html">📊 Dashboard Admin</a>' : ''}
        <div class="drop-divider"></div>
        <button onclick="authLogout()">🚪 Cerrar sesión</button>
      </div>`;
    actionsBar.insertBefore(menu, actionsBar.firstChild);

    document.getElementById('userTrigger').addEventListener('click', (e) => {
      e.stopPropagation();
      document.getElementById('userDropdown').classList.toggle('open');
    });
    document.addEventListener('click', () =>
      document.getElementById('userDropdown')?.classList.remove('open')
    );
  }
})();

window.authLogout = function() {
  localStorage.removeItem('kenzo_token');
  localStorage.removeItem('kenzo_user');
  window.location.reload();
};

/* ── Sync products from dashboard edits ───────────────────── */
(function syncDashboardProducts() {
  const saved = localStorage.getItem('kenzo_products');
  if (saved && typeof PRODUCTS !== 'undefined') {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length) {
        PRODUCTS.length = 0;
        parsed.forEach(p => PRODUCTS.push(p));
      }
    } catch (_) {}
  }
})();
