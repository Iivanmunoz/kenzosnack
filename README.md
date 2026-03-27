# 🐾 Snack Paws — Tienda de Snacks Naturales para Perros

Sitio web / tienda en línea para venta de snacks naturales deshidratados para perros. Construido con **HTML5, CSS3, JavaScript vanilla y Node.js**.

## ✨ Características

- 🎨 Diseño premium con animaciones fluidas (estilo Apple / Netflix)
- 🛒 Carrito de compras con sidebar animado
- 📧 Envío de correo automático al cliente y al negocio
- 📱 100% Responsivo (mobile-first)
- 🎭 Transiciones y parallax effects
- 🔍 Filtros de productos por categoría
- ⭐ Carrusel de testimonios animado
- 🎯 Contador de estadísticas animado

---

## 🚀 Instalación Rápida

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/snack-paws.git
cd snack-paws
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
# Copia el archivo de ejemplo
cp .env.example .env

# Edita el archivo .env con tus datos
nano .env  # o abre con tu editor favorito
```

Llena el archivo `.env` con tus datos:
```env
PORT=3000
EMAIL_USER=tuemail@gmail.com
EMAIL_PASS=tu_contraseña_de_aplicacion
BUSINESS_EMAIL=tunegocio@gmail.com
BUSINESS_NAME=Snack Paws
```

### 4. Iniciar el servidor
```bash
npm start
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador. 🎉

---

## 📧 Configurar Gmail para envíos

Para que los correos funcionen necesitas una **Contraseña de Aplicación** de Gmail (no tu contraseña normal).

**Pasos:**
1. Ve a [myaccount.google.com](https://myaccount.google.com)
2. **Seguridad** → **Verificación en 2 pasos** (actívala si no la tienes)
3. **Seguridad** → **Contraseñas de aplicaciones**
4. Selecciona "Correo" y "Otro dispositivo"
5. Copia la contraseña de 16 caracteres generada
6. Pégala en `EMAIL_PASS` en tu `.env`

---

## 📁 Estructura del Proyecto

```
snack-paws/
├── public/
│   ├── index.html          # Frontend principal
│   ├── css/
│   │   └── style.css       # Todos los estilos
│   └── js/
│       └── script.js       # Lógica del frontend
├── server.js               # Servidor Node.js + API
├── package.json
├── .env.example            # Template de variables de entorno
├── .env                    # ⚠️ NO subir a GitHub
├── .gitignore
└── README.md
```

---

## 🌐 Despliegue

### Render.com (Gratis)
1. Crea cuenta en [render.com](https://render.com)
2. New → Web Service → conecta tu repositorio de GitHub
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Agrega las variables de entorno en el panel de Render

### Railway (Alternativa)
1. [railway.app](https://railway.app) → Deploy from GitHub
2. Agrega las variables de entorno en Settings → Variables

### Heroku
```bash
heroku create snack-paws
heroku config:set EMAIL_USER=... EMAIL_PASS=... BUSINESS_EMAIL=...
git push heroku main
```

---

## 🎨 Paleta de Colores

| Color | Código | Uso |
|-------|--------|-----|
| Crema | `#f6ebcb` | Fondos secundarios |
| Dorado | `#e4bf65` | Acentos, CTAs |
| Marfil | `#fcf8ee` | Fondo principal |
| Café oscuro | `#3c1a0c` | Texto, headers, backgrounds |

---

## 🛠️ Personalización

### Cambiar productos
Edita el array `PRODUCTS` en `public/js/script.js`:
```javascript
const PRODUCTS = [
  {
    id: 1,
    name: 'Nombre del Producto',
    category: 'Categoría',
    emoji: '🍗',
    price: 45,
    unit: '100g',
    desc: 'Descripción del producto...',
    badge: 'popular', // null | 'popular' | 'new'
    badgeText: '⭐ Popular',
    tags: ['todos', 'aves'], // Para los filtros
  },
  // ... más productos
];
```

### Cambiar dirección y contacto
Busca en `public/index.html` la sección `location-section` y actualiza:
- Dirección
- Teléfono
- Email
- Horarios

### Agregar más filtros
En `index.html` agrega un botón en `.filter-tabs` y en cada producto agrega el tag correspondiente.

---

## 📦 Dependencias

| Paquete | Versión | Uso |
|---------|---------|-----|
| express | ^4.18.2 | Servidor web |
| nodemailer | ^6.9.7 | Envío de correos |
| dotenv | ^16.3.1 | Variables de entorno |

---

## 🔧 API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/order` | Procesar pedido y enviar correos |
| GET | `*` | Servir el frontend (SPA) |

**Body del POST `/api/order`:**
```json
{
  "customerName": "Juan Pérez",
  "customerEmail": "juan@email.com",
  "customerPhone": "55 1234 5678",
  "notes": "Sin picante 😄",
  "items": [
    { "id": 1, "name": "Patas de Pollo", "emoji": "🍗", "price": 45, "qty": 2, "unit": "100g" }
  ],
  "total": 90
}
```

---

## 📝 Licencia

MIT — Úsalo libremente para tu negocio 🐾

---

*Hecho con ❤️ para los mejores amigos del mundo*
