# Database Layer

Powered by **Drizzle ORM** with a PostgreSQL backend.

## Files
| File | Purpose |
|------|---------|
| `schema.ts` | All table definitions, enum types, custom `geography` type, and Drizzle relations |
| `index.ts` | Exports the `db` client (singleton) and `asyncDb` for transactions |

## Schema Overview

### Enums
| Enum | Values |
|------|--------|
| `OrderStatus` | `pending`, `confirmed`, `preparing`, `ready`, `served`, `cancelled` |
| `BillStatus` | `unpaid`, `paid`, `refunded`, `partially_paid` |
| `StaffRole` | `owner`, `staff`, `customer` |
| `TableSessionStatus` | `occupied`, `vacant`, `not_available` |
| `DietaryType` | `veg`, `non-veg`, `vegan`, `jain` |

### Business Logic Tables
| Table | Description |
|-------|-------------|
| `stores` | Store profile: name, category, location (PostGIS), UPI ID, weekly timing |
| `menu_items` | Menu entries with price, offer price, dietary type, prep time |
| `tables` | Physical tables per store with occupancy tracking |
| `table_sessions` | Active dining sessions linking a table to a time period |
| `orders` | Orders within a session including payment & status |
| `order_items` | Line items of each order (snapshotted price and name at time of order) |
| `store_ratings` | User ratings and reviews for stores |

### Auth Tables (Better Auth)
`user`, `session`, `account`, `verification` — managed by the Better Auth library.

## Relations
- `store` → many `user`, `table`, `order`
- `order` → one `table`, one `store`, one `tableSession`, many `orderItem`
- `tableSession` → one `store`, one `table`, many `order`

## Migrations
```bash
bun drizzle-kit generate  # Generate migration SQL
bun drizzle-kit push      # Push schema directly to DB (dev)
```
