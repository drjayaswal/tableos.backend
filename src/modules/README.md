# Backend Modules

Each module is a self-contained domain slice with its own routes, services, and (optionally) models.

## `auth/`
Better Auth integration for OTP-based authentication.
- Flow: `checkUser` → `sendOtp` → `verifyOtp` → JWT session
- Roles: `owner`, `staff`, `customer`
- OTP delivery: email

## `customer/`
Public-facing endpoints, no authentication required.

### Routes
| Route | Purpose |
|-------|---------|
| `POST /customer/menu/list` | Returns all menu items + store info (UPI ID, name) for a given `storeId` |
| `POST /customer/order/create` | Creates a new order, starts/resumes a table session, returns `orderId` + `tableSessionId` |
| `GET /customer/order/status` | Returns current `paymentStatus` and `orderStatus` for an order (used for polling fallback) |
| `GET /customer/order/bill` | Returns full session details including all orders and items for a professional bill view |

### Order Creation Logic
When a customer places an order:
1. A `tableSession` is found or created for the table.
2. A new `order` record is inserted with status `pending` and `paymentStatus` `unpaid`.
3. `orderItem` records are inserted for each cart item.
4. The order is broadcast to the store's Socket.IO room so the dashboard updates instantly.

## `owner/`
Protected endpoints for the restaurant owner/staff dashboard.

### Sub-modules
- **store**: Store creation, settings (UPI ID, timing, address)
- **tables**: Table management and QR code generation
- **menu**: Full CRUD for menu items
- **orders**: Live order management, payment verification, status transitions, session end

See [`owner/readme.md`](./owner/readme.md) for full details.
