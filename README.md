# tableOS Backend ⚙️

The event-driven API engine for tableOS, built with **Bun**, **ElysiaJS**, and **Socket.IO**.

## 🔌 Core Responsibilities

- **Event Hub**: Broadcasting real-time order and payment updates between guests and staff.
- **REST API**: Providing highly performant endpoints for menu management and order creation.
- **Database Orchestration**: Managing sessions, tables, and transactional order data with PostgreSQL.
- **Authentication**: Secure OTP-based authentication via Better Auth.

## 🚦 API Reference

### Customer (Public)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/customer/menu/list` | POST | Fetch store-specific menu catalog |
| `/customer/order/create` | POST | Initiate a new order or payment session |
| `/customer/order/status` | GET | Verify order payment/processing status |
| `/customer/order/bill` | GET | Fetch itemized session summary |

### Owner (Protected)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/owner/orders` | GET | Stream all active sessions and pending orders |
| `/owner/orders/verify` | POST | Verify UPI payment intents |
| `/owner/orders/:id/status` | PUT | Transition order (Accepted → Preparing → Ready → Served) |
| `/owner/orders/session-end` | POST | Finalize session and free table metadata |

## 🛰️ WebSocket Events (Real-time)

| Event | Type | Description |
|-------|------|-------------|
| `order:confirmed` | Server → Client | Broadcast payment verification to guest |
| `order:status:updated` | Server → Client | Notify guest of kitchen progress |
| `session:closed` | Server → Client | Notify guest of session termination |
| `bill:payment:intent` | Client → Server | Notify owner of a pending UPI slide-to-pay |

## 🏗️ Database Schema (Drizzle)

- `users`: Authenticated staff members.
- `stores`: Restaurant configuration and UPI settings.
- `menu_items`: Digital catalog entries.
- `tables`: Physical floor layout metadata.
- `orders`: Transactional order history.
- `table_sessions`: Active dining session state tracking.

## 🚀 Development

```bash
bun install
bun db:push  # Sync Drizzle schema with PostgreSQL
bun dev      # Start dev server on port 8000
```
