// ============================================================
//  SNACK PAWS — Servidor Node.js
//  Express + Nodemailer + MercadoPago | Snacks naturales para perros 🐾
// ============================================================

require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors'); // Importante para permitir peticiones desde el frontend
const path = require('path');
const { MercadoPagoConfig, Preference } = require('mercadopago');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Configuración de Mercado Pago ──────────────────────────
// Asegúrate de tener MP_ACCESS_TOKEN en tu archivo .env
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-00000000-0000-0000-0000-000000000000' 
});

// ─── Middlewares ────────────────────────────────────────────
app.use(cors()); // Habilitar CORS
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ─── Configuración de Nodemailer ────────────────────────────
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// ─── Plantilla de email para el CLIENTE ─────────────────────
const buildClientEmail = (order) => {
  const itemsHTML = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 16px; border-bottom:1px solid #f0e8d5; font-family:'Georgia',serif; color:#3c1a0c;">
          ${item.emoji || '🐾'} ${item.name || item.title}
        </td>
        <td style="padding:12px 16px; border-bottom:1px solid #f0e8d5; text-align:center; color:#6b4226;">
          ${item.quantity || item.qty}
        </td>
        <td style="padding:12px 16px; border-bottom:1px solid #f0e8d5; text-align:right; font-weight:bold; color:#3c1a0c;">
          $${((item.unit_price || item.price) * (item.quantity || item.qty)).toFixed(2)}
        </td>
      </tr>`
    )
    .join('');

  return `
  <!DOCTYPE html>
  <html lang="es">
  <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
  <body style="margin:0;padding:0;background:#fcf8ee;font-family:'Georgia',serif;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(60,26,12,0.12);">
      
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#3c1a0c 0%,#6b3a1f 100%);padding:40px 32px;text-align:center;">
        <div style="font-size:48px;margin-bottom:8px;">🐾</div>
        <h1 style="margin:0;color:#e4bf65;font-size:28px;font-weight:700;letter-spacing:1px;">SNACK PAWS</h1>
        <p style="margin:8px 0 0;color:#f6ebcb;font-size:14px;opacity:.8;">Snacks naturales para tu mejor amigo</p>
      </div>

      <!-- Body -->
      <div style="padding:40px 32px;">
        <h2 style="color:#3c1a0c;font-size:22px;margin:0 0 8px;">¡Gracias por tu pedido, ${order.customerName}! 🎉</h2>
        <p style="color:#6b4226;margin:0 0 24px;line-height:1.6;">
          Hemos recibido tu pedido con éxito.
        </p>

        <!-- Order Details -->
        <div style="background:#fcf8ee;border-radius:12px;padding:24px;margin-bottom:24px;">
          <h3 style="color:#3c1a0c;margin:0 0 16px;font-size:16px;text-transform:uppercase;letter-spacing:.5px;">📋 Detalle de tu pedido</h3>
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#e4bf65;">
                <th style="padding:10px 16px;text-align:left;color:#3c1a0c;font-size:13px;border-radius:8px 0 0 0;">Producto</th>
                <th style="padding:10px 16px;text-align:center;color:#3c1a0c;font-size:13px;">Cant.</th>
                <th style="padding:10px 16px;text-align:right;color:#3c1a0c;font-size:13px;border-radius:0 8px 0 0;">Subtotal</th>
              </tr>
            </thead>
            <tbody>${itemsHTML}</tbody>
          </table>
          <div style="text-align:right;margin-top:16px;padding-top:16px;border-top:2px solid #e4bf65;">
            <span style="font-size:20px;font-weight:bold;color:#3c1a0c;">Total: $${Number(order.total).toFixed(2)} MXN</span>
          </div>
        </div>

        <!-- Customer Info -->
        <div style="background:#f6ebcb;border-radius:12px;padding:20px;margin-bottom:24px;">
          <h3 style="color:#3c1a0c;margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:.5px;">📍 Información de contacto</h3>
          <p style="margin:4px 0;color:#3c1a0c;"><strong>Nombre:</strong> ${order.customerName}</p>
          <p style="margin:4px 0;color:#3c1a0c;"><strong>Email:</strong> ${order.customerEmail}</p>
          <p style="margin:4px 0;color:#3c1a0c;"><strong>Teléfono:</strong> ${order.customerPhone}</p>
          ${order.notes ? `<p style="margin:8px 0 0;color:#3c1a0c;"><strong>Notas:</strong> ${order.notes}</p>` : ''}
        </div>
      </div>

      <!-- Footer -->
      <div style="background:#3c1a0c;padding:24px 32px;text-align:center;">
        <p style="margin:0;color:#e4bf65;font-size:13px;">🐾 Snack Paws — Amor natural en cada bocado</p>
      </div>
    </div>
  </body>
  </html>`;
};

// ─── Plantilla de email para el NEGOCIO ─────────────────────
const buildBusinessEmail = (order) => {
  const itemsList = order.items
    .map((item) => `• ${item.emoji || '🐾'} ${item.name || item.title} x${item.quantity || item.qty} = $${((item.unit_price || item.price) * (item.quantity || item.qty)).toFixed(2)}`)
    .join('\n');

  return `
  <!DOCTYPE html>
  <html lang="es">
  <head><meta charset="UTF-8"></head>
  <body style="margin:0;padding:0;background:#fcf8ee;font-family:sans-serif;">
    <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(60,26,12,0.12);">
      <div style="background:#e4bf65;padding:24px 32px;">
        <h1 style="margin:0;color:#3c1a0c;font-size:22px;">🛒 Nuevo Pedido Recibido</h1>
        <p style="margin:4px 0 0;color:#3c1a0c;opacity:.7;font-size:13px;">${new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}</p>
      </div>
      <div style="padding:32px;">
        <h3 style="color:#3c1a0c;">👤 Cliente</h3>
        <p><strong>Nombre:</strong> ${order.customerName}</p>
        <p><strong>Email:</strong> ${order.customerEmail}</p>
        <p><strong>Teléfono:</strong> ${order.customerPhone}</p>
        ${order.notes ? `<p><strong>Notas:</strong> ${order.notes}</p>` : ''}
        <hr style="border:1px solid #f6ebcb;margin:20px 0;">
        <h3 style="color:#3c1a0c;">📦 Productos</h3>
        <pre style="background:#fcf8ee;padding:16px;border-radius:8px;color:#3c1a0c;line-height:1.8;">${itemsList}</pre>
        <h2 style="color:#3c1a0c;text-align:right;">Total: $${Number(order.total).toFixed(2)} MXN</h2>
      </div>
    </div>
  </body>
  </html>`;
};

// ─── API: Crear Preferencia de Mercado Pago ──────────────────
app.post('/api/create_preference', async (req, res) => {
  try {
    const { items, customerName, customerEmail, customerPhone } = req.body;

    // Convertir items al formato de Mercado Pago
    const mpItems = items.map(item => ({
      id: String(item.id),
      title: item.name,
      quantity: Number(item.qty),
      unit_price: Number(item.price),
      currency_id: 'MXN',
      description: item.desc || item.name,
      picture_url: 'https://www.snackpaws.com/images/logo.png', // URL de ejemplo
    }));

    const body = {
      items: mpItems,
      payer: {
        name: customerName,
        email: customerEmail,
        phone: {
          number: customerPhone
        },
      },
      back_urls: {
        success: `http://localhost:${PORT}/success`, // Cambiar por tu URL real
        failure: `http://localhost:${PORT}/failure`,
        pending: `http://localhost:${PORT}/pending`,
      },
      auto_return: 'approved',
      // notification_url: 'https://tu-dominio.com/webhook', // Opcional: para recibir notificaciones
    };

    const preference = new Preference(client);
    const result = await preference.create({ body });

    res.json({ 
      id: result.id, // ID de la preferencia
      init_point: result.init_point // URL para redirigir (opcional si usas el brick)
    });

  } catch (error) {
    console.error('❌ Error creando preferencia:', error);
    res.status(500).json({ error: 'Error al crear la preferencia de pago' });
  }
});

// ─── API: Procesar Pedido (Envío de correo) ──────────────────
app.post('/api/order', async (req, res) => {
  const { customerName, customerEmail, customerPhone, notes, items, total } = req.body;

  if (!customerName || !customerEmail || !customerPhone || !items?.length) {
    return res.status(400).json({ success: false, message: 'Faltan datos requeridos.' });
  }

  const order = { customerName, customerEmail, customerPhone, notes, items, total };

  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"Snack Paws 🐾" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: `✅ ¡Tu pedido fue recibido, ${customerName}! — Snack Paws`,
      html: buildClientEmail(order),
    });

    await transporter.sendMail({
      from: `"Snack Paws Sistema" <${process.env.EMAIL_USER}>`,
      to: process.env.BUSINESS_EMAIL || process.env.EMAIL_USER,
      subject: `🛒 Nuevo pedido de ${customerName} — $${Number(total).toFixed(2)} MXN`,
      html: buildBusinessEmail(order),
    });

    console.log(`✅ Pedido procesado: ${customerName} — $${Number(total).toFixed(2)} MXN`);
    res.json({ success: true, message: 'Pedido recibido. ¡Revisa tu correo!' });

  } catch (error) {
    console.error('❌ Error enviando correo:', error.message);
    res.status(500).json({
      success: false,
      message: 'Pedido recibido, pero hubo un problema al enviar el correo. Contáctanos directamente.',
    });
  }
});

// ─── Catch-all: servir index.html ───────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Iniciar servidor ────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║   🐾 SNACK PAWS — Servidor Activo   ║
  ║   http://localhost:${PORT}              ║
  ╚══════════════════════════════════════╝
  `);
});
