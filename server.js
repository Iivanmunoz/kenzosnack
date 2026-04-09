// ============================================================
//  SNACK PAWS — Servidor Node.js
//  Express + Mercado Pago + Nodemailer + Auth JWT 🐾
// ============================================================

require('dotenv').config();
const express    = require('express');
const nodemailer = require('nodemailer');
const path       = require('path');
const fs         = require('fs');
const jwt        = require('jsonwebtoken');
const bcrypt     = require('bcryptjs');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');

const app  = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'kenzo_snack_jwt_secret_2025';

// ─── Mercado Pago Client ─────────────────────────────────────
const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
  options: { timeout: 5000 },
});

// ─── Middlewares ─────────────────────────────────────────────
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ─── Users Store (JSON file) ──────────────────────────────────
const USERS_FILE = path.join(__dirname, 'users.json');

const loadUsers = () => {
  if (!fs.existsSync(USERS_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')); } catch { return []; }
};

const saveUsers = (users) => {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

// ─── Auth Middleware ──────────────────────────────────────────
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No autorizado' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Acceso denegado' });
  next();
};

// ─── Nodemailer ──────────────────────────────────────────────
const createTransporter = () =>
  nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

// ─── Email al CLIENTE ─────────────────────────────────────────
const buildClientEmail = (order, paymentId) => {
  const itemsHTML = order.items
    .map(item => `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #f0e8d5;font-family:'Georgia',serif;color:#3c1a0c;">
          ${item.emoji} ${item.name}
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid #f0e8d5;text-align:center;color:#6b4226;">
          ${item.qty}
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid #f0e8d5;text-align:right;font-weight:bold;color:#3c1a0c;">
          $${(item.price * item.qty).toFixed(2)}
        </td>
      </tr>`)
    .join('');

  return `
  <!DOCTYPE html>
  <html lang="es">
  <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
  <body style="margin:0;padding:0;background:#fcf8ee;font-family:'Georgia',serif;">
    <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(60,26,12,.12);">
      <div style="background:linear-gradient(135deg,#3c1a0c 0%,#6b3a1f 100%);padding:40px 32px;text-align:center;">
        <div style="font-size:48px;margin-bottom:8px;">🐾</div>
        <h1 style="margin:0;color:#e4bf65;font-size:28px;font-weight:700;letter-spacing:1px;">SNACK PAWS</h1>
        <p style="margin:8px 0 0;color:#f6ebcb;font-size:14px;opacity:.8;">Snacks naturales para tu mejor amigo</p>
      </div>
      <div style="padding:40px 32px;">
        <div style="background:#d4edda;border:1px solid #c3e6cb;border-radius:10px;padding:14px 20px;margin-bottom:24px;text-align:center;">
          <span style="color:#155724;font-size:15px;font-weight:700;">✅ ¡Pago confirmado por Mercado Pago!</span>
          ${paymentId ? `<br><span style="color:#6c757d;font-size:12px;">ID de pago: #${paymentId}</span>` : ''}
        </div>
        <h2 style="color:#3c1a0c;font-size:22px;margin:0 0 8px;">¡Gracias por tu pedido, ${order.customerName}!</h2>
        <p style="color:#6b4226;margin:0 0 24px;line-height:1.6;">
          Tu pago fue procesado exitosamente. Te contactaremos pronto para coordinar la entrega.
        </p>
        <div style="background:#fcf8ee;border-radius:12px;padding:24px;margin-bottom:24px;">
          <h3 style="color:#3c1a0c;margin:0 0 16px;font-size:16px;text-transform:uppercase;letter-spacing:.5px;">📋 Detalle</h3>
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#e4bf65;">
                <th style="padding:10px 16px;text-align:left;color:#3c1a0c;font-size:13px;">Producto</th>
                <th style="padding:10px 16px;text-align:center;color:#3c1a0c;font-size:13px;">Cant.</th>
                <th style="padding:10px 16px;text-align:right;color:#3c1a0c;font-size:13px;">Subtotal</th>
              </tr>
            </thead>
            <tbody>${itemsHTML}</tbody>
          </table>
          <div style="text-align:right;margin-top:16px;padding-top:16px;border-top:2px solid #e4bf65;">
            <span style="font-size:20px;font-weight:bold;color:#3c1a0c;">Total: $${order.total.toFixed(2)} MXN</span>
          </div>
        </div>
      </div>
      <div style="background:#3c1a0c;padding:24px 32px;text-align:center;">
        <p style="margin:0;color:#e4bf65;font-size:13px;">🐾 Snack Paws — Amor natural en cada bocado</p>
      </div>
    </div>
  </body></html>`;
};

// ─── Email al NEGOCIO ─────────────────────────────────────────
const buildBusinessEmail = (order, paymentId, mpStatus) => {
  const itemsList = order.items
    .map(i => `• ${i.emoji} ${i.name} x${i.qty} = $${(i.price * i.qty).toFixed(2)}`)
    .join('\n');

  return `
  <!DOCTYPE html>
  <html lang="es">
  <head><meta charset="UTF-8"></head>
  <body style="margin:0;padding:0;background:#fcf8ee;font-family:sans-serif;">
    <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;">
      <div style="background:#e4bf65;padding:24px 32px;">
        <h1 style="margin:0;color:#3c1a0c;font-size:22px;">💰 Pedido PAGADO — Mercado Pago</h1>
        <p style="margin:4px 0 0;color:#3c1a0c;opacity:.7;font-size:13px;">
          ${new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}
          ${paymentId ? ' · ID MP: #' + paymentId : ''}
        </p>
      </div>
      <div style="padding:32px;">
        <div style="background:#d4edda;border:1px solid #c3e6cb;border-radius:8px;padding:12px 16px;margin-bottom:20px;">
          <strong style="color:#155724;">✅ Estado MP: ${mpStatus || 'approved'}</strong>
        </div>
        <h3 style="color:#3c1a0c;">👤 Cliente</h3>
        <p><strong>Nombre:</strong> ${order.customerName}</p>
        <p><strong>Email:</strong> ${order.customerEmail}</p>
        <p><strong>Teléfono:</strong> ${order.customerPhone}</p>
        ${order.notes ? `<p><strong>Notas:</strong> ${order.notes}</p>` : ''}
        <hr style="border:1px solid #f6ebcb;margin:20px 0;">
        <h3 style="color:#3c1a0c;">📦 Productos</h3>
        <pre style="background:#fcf8ee;padding:16px;border-radius:8px;color:#3c1a0c;line-height:1.8;">${itemsList}</pre>
        <h2 style="color:#3c1a0c;text-align:right;">Total cobrado: $${order.total.toFixed(2)} MXN</h2>
      </div>
    </div>
  </body></html>`;
};

// ─── Helper: enviar emails ────────────────────────────────────
const sendConfirmationEmails = async (order, paymentId, mpStatus) => {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"Snack Paws 🐾" <${process.env.EMAIL_USER}>`,
      to: order.customerEmail,
      subject: `✅ ¡Pago confirmado, ${order.customerName}! — Snack Paws`,
      html: buildClientEmail(order, paymentId),
    });
    await transporter.sendMail({
      from: `"Snack Paws Sistema" <${process.env.EMAIL_USER}>`,
      to: process.env.BUSINESS_EMAIL || process.env.EMAIL_USER,
      subject: `💰 Pedido PAGADO de ${order.customerName} — $${order.total.toFixed(2)} MXN`,
      html: buildBusinessEmail(order, paymentId, mpStatus),
    });
    console.log(`📧 Emails enviados para pedido de ${order.customerName}`);
  } catch (err) {
    console.error('❌ Error enviando emails:', err.message);
  }
};

// ═══════════════════════════════════════════════════════════
//  AUTH ENDPOINTS
// ═══════════════════════════════════════════════════════════

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email y contraseña requeridos.' });

  // Check admin credentials from .env
  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASS
  ) {
    const user = { id: 'admin', name: process.env.ADMIN_NAME || 'Administrador', email, role: 'admin' };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user });
  }

  // Check client users
  const users = loadUsers();
  const found = users.find(u => u.email === email);
  if (!found) return res.status(401).json({ error: 'Correo no registrado.' });

  const match = await bcrypt.compare(password, found.passwordHash);
  if (!match) return res.status(401).json({ error: 'Contraseña incorrecta.' });

  const user = { id: found.id, name: found.name, email: found.email, role: 'client' };
  const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user });
});

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Todos los campos son requeridos.' });
  if (password.length < 6) return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });

  const users = loadUsers();
  if (users.find(u => u.email === email)) return res.status(409).json({ error: 'Este correo ya está registrado.' });

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = { id: `user_${Date.now()}`, name, email, passwordHash, role: 'client', createdAt: new Date().toISOString() };
  users.push(newUser);
  saveUsers(users);

  const user = { id: newUser.id, name, email, role: 'client' };
  const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
  console.log(`👤 Nuevo cliente registrado: ${name} <${email}>`);
  res.status(201).json({ token, user });
});

// GET /api/auth/me
app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// GET /api/admin/clients  (admin only)
app.get('/api/admin/clients', authMiddleware, adminOnly, (req, res) => {
  const users = loadUsers().map(({ passwordHash, ...u }) => u);
  res.json({ users, total: users.length });
});

// ═══════════════════════════════════════════════════════════
//  MERCADO PAGO ENDPOINTS
// ═══════════════════════════════════════════════════════════

// ─── POST /api/create-preference ─────────────────────────────
app.post('/api/create-preference', async (req, res) => {
  const { customerName, customerEmail, customerPhone, notes, items, total } = req.body;

  if (!customerName || !customerEmail || !customerPhone || !items?.length) {
    return res.status(400).json({ success: false, message: 'Faltan datos requeridos.' });
  }

  const BASE_URL = process.env.APP_BASE_URL || `http://localhost:${PORT}`;

  try {
    const preference = new Preference(mpClient);
    const result = await preference.create({
      body: {
        items: items.map(item => ({
          id:          String(item.id),
          title:       item.name,
          description: `Snack natural para perros — ${item.name}`,
          quantity:    Number(item.qty),
          unit_price:  Number(item.price),
          currency_id: 'MXN',
        })),
        payer: {
          name:  customerName,
          email: customerEmail,
          phone: { number: String(customerPhone) },
        },
        back_urls: {
          success: `${BASE_URL}/pago-exitoso.html`,
          failure: `${BASE_URL}/pago-fallido.html`,
          pending: `${BASE_URL}/pago-pendiente.html`,
        },
        auto_return: 'approved',
        notification_url: `${BASE_URL}/api/mp-webhook`,
        metadata: {
          customer_name:  customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          notes:          notes || '',
          items:          JSON.stringify(items),
          total:          total,
        },
        external_reference: `snackpaws-${Date.now()}`,
        expires: true,
        expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        statement_descriptor: 'SNACK PAWS',
      },
    });

    const isSandbox   = process.env.MP_ACCESS_TOKEN?.startsWith('TEST-');
    const checkoutUrl = isSandbox ? result.sandbox_init_point : result.init_point;
    console.log(`✅ Preferencia MP creada: ${result.id} — ${customerName}`);
    res.json({ success: true, preferenceId: result.id, checkoutUrl });
  } catch (err) {
    console.error('❌ Error creando preferencia MP:', JSON.stringify(err?.cause ?? err));
    res.status(500).json({ success: false, message: 'Error al conectar con Mercado Pago.' });
  }
});

// ─── POST /api/mp-webhook ─────────────────────────────────────
app.post('/api/mp-webhook', async (req, res) => {
  res.sendStatus(200);
  const { type, data } = req.body;
  if (type !== 'payment' || !data?.id) return;
  try {
    const paymentClient = new Payment(mpClient);
    const payment = await paymentClient.get({ id: data.id });
    console.log(`🔔 Webhook — Pago #${payment.id} — Estado: ${payment.status}`);
    if (payment.status !== 'approved') return;
    const meta = payment.metadata || {};
    const order = {
      customerName:  meta.customer_name  || 'Cliente',
      customerEmail: meta.customer_email || '',
      customerPhone: meta.customer_phone || '',
      notes:         meta.notes          || '',
      items:         JSON.parse(meta.items || '[]'),
      total:         meta.total || payment.transaction_amount,
    };
    if (!order.customerEmail) return;
    await sendConfirmationEmails(order, payment.id, payment.status);
    console.log(`🎉 Pedido confirmado — ${order.customerName}`);
  } catch (err) {
    console.error('❌ Error procesando webhook:', err.message);
  }
});

// ─── GET /api/payment-status/:preferenceId ────────────────────
app.get('/api/payment-status/:preferenceId', async (req, res) => {
  try {
    const preference = new Preference(mpClient);
    const result = await preference.get({ preferenceId: req.params.preferenceId });
    res.json({ success: true, status: result.status, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── Protect dashboard.html ──────────────────────────────────
app.get('/dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// ─── Catch-all ────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.post('/api/stripe-charge', authMiddleware, async (req, res) => {
  const { paymentMethodId, customerName, customerEmail, customerPhone,
          customerAddress, petName, petBreed, petSize, notes, items, total } = req.body;
  try {
    // 1. Cobrar con Stripe
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // centavos
      currency: 'mxn',
      payment_method: paymentMethodId,
      confirm: true,
      return_url: `${process.env.APP_BASE_URL}/pago-exitoso.html`,
      description: `Kenzo Snack — Pedido de ${customerName}`,
      receipt_email: customerEmail,
    });

    // 2. Guardar/actualizar datos del cliente (mascota + dirección)
    const users = loadUsers();
    const idx = users.findIndex(u => u.id === req.user.id);
    if (idx !== -1) {
      users[idx].address  = customerAddress;
      users[idx].phone    = customerPhone;
      users[idx].pet      = { name: petName, breed: petBreed, size: petSize };
      users[idx].orders   = [...(users[idx].orders || []), {
        id: intent.id, total, items, notes, date: new Date().toISOString(), status: intent.status
      }];
      saveUsers(users);
    }

    // 3. Emails de confirmación
    await sendConfirmationEmails({ customerName, customerEmail, customerPhone, notes, items, total }, intent.id, intent.status);

    res.json({ success: true, intentId: intent.id, status: intent.status });
  } catch (err) {
    console.error('❌ Stripe error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── Iniciar servidor ─────────────────────────────────────────
app.listen(PORT, () => {
  const isSandbox = process.env.MP_ACCESS_TOKEN?.startsWith('TEST-');
  console.log(`
  ╔═══════════════════════════════════════════════╗
  ║   🐾  SNACK PAWS — Servidor Activo            ║
  ║   http://localhost:${PORT}                       ║
  ║   Mercado Pago: ${isSandbox ? '🟡 MODO PRUEBAS (TEST)' : '🟢 PRODUCCIÓN'}      ║
  ║   Auth: 🔐 JWT activo                         ║
  ╚═══════════════════════════════════════════════╝
  `);
});
