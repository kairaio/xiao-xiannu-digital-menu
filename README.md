# 小仙女 Japanese Restaurant — Digital Menu + Delivery Pro

Premium, mobile-first digital ordering demonstration for **小仙女日式料理 / Xiao Xiannu Japanese Cuisine** in Cambodia.

## Features

- Original restaurant food photography
- Multi-item cart, quantity controls, removal, and item notes
- Delivery, Pickup, and Dine-In checkout
- Automatic subtotal, delivery fee, and grand total
- Complete WhatsApp/Telegram order-message handoff
- Customer order tracking
- Driver Mode with multiple delivery stops
- Admin order dashboard and delivery status controls
- Responsive smartphone, tablet, and desktop layouts

## Demo accuracy

The menu, cart, calculations, checkout form, and order-message generation are functional. Driver movement, live GPS, real-time backend synchronization, and multi-device tracking are explicitly presented as simulations. Production GPS tracking requires a backend and the driver's phone Geolocation API.

The `$39.90` set is intentionally excluded until its official name and contents are confirmed. Admin WhatsApp and Telegram contacts are intentionally not hard-coded until the restaurant provides them.

## Development

Requires Node.js 22 or newer.

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```
