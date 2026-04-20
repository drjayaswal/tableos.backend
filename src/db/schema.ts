/**
 * src/db/schema.ts
 * 
 * Defines the database schema, including tables, enums, custom types, and their relations
 * using Drizzle ORM. This schema covers the domains of store management, order life cycle,
 * table sessions, and multi-actor authentication.
 */
import { relations, type $Type } from "drizzle-orm";
import {
  pgTable, text, timestamp, integer, decimal,
  boolean, jsonb, pgEnum, numeric, index, customType
} from "drizzle-orm/pg-core";

export const StoreCategory = pgEnum("store_type", ["cafe", "hotel", "restaurant"]);
export const StoreCurrency = pgEnum("currency", ["INR", "USD", "EUR"]);
export const OrderStatus = pgEnum("order_status", ["pending", "confirmed", "preparing", "ready", "served", "cancelled"]);
export const BillStatus = pgEnum("bill_status", ["unpaid", "paid", "refunded", "partially_paid"]);
export const StaffRole = pgEnum("staff_role", ["owner", "staff", "customer"]);
export const PaymentMethod = pgEnum("payment_method", ["cash", "upi", "card"]);
export const DietaryType = pgEnum("dietary_type", ["veg", "non-veg", "vegan", "jain"]);
export const TableSessionStatus = pgEnum("table_session_status", ["occupied", "vacant", "not_available"]);
export const menuCategoryEnum = pgEnum(
  "menu_categories",[
    "beverages",
    "coffee_tea",
    "alcohol",
    "appetizers",
    "soups",
    "salads",
    "small_plates",
    "sandwiches",
    "entrees",
    "mains_land",
    "mains_sea",
    "pasta_pizza",
    "sides",
    "sauces_dips",
    "desserts",
    "pastries",
    "kids_menu",     
    "specials",
    "others"
  ]
);
export const geography = customType<{ data: string }>({
  dataType() {
    return "geography(point, 4326)";
  },
});
export type Timing = {
  is_open: boolean;
  open_time: string;
  close_time: string;
};

export type WeeklyTiming = {
  monday: Timing;
  tuesday: Timing;
  wednesday: Timing;
  thursday: Timing;
  friday: Timing;
  saturday: Timing;
  sunday: Timing;
};

const DEFAULT_TIMING: WeeklyTiming = {
  monday: { is_open: true, open_time: "09:00", close_time: "18:00" },
  tuesday: { is_open: true, open_time: "09:00", close_time: "18:00" },
  wednesday: { is_open: true, open_time: "09:00", close_time: "18:00" },
  thursday: { is_open: true, open_time: "09:00", close_time: "18:00" },
  friday: { is_open: true, open_time: "09:00", close_time: "18:00" },
  saturday: { is_open: false, open_time: "00:00", close_time: "00:00" },
  sunday: { is_open: false, open_time: "00:00", close_time: "00:00" },
};

// ----------------------------------------------------
// Business Logic Tables
// ----------------------------------------------------

export const store = pgTable("stores", {
  id: text("id").primaryKey(),
  name: text("store_name").notNull(),
  slug: text("slug").unique().notNull(),
  category: StoreCategory("category").notNull(),
  currency: StoreCurrency("currency").default('INR'),
  location: geography("location").notNull(),
  address: text("address"),
  ownerEmail: text("owner_email"),
  rating: numeric("rating", { precision: 3, scale: 2 }).default("0.00"),
  tables: integer("tables").default(1),
  upiId: text("upi_id"),
  timing: jsonb("timing").$type<WeeklyTiming>().default(DEFAULT_TIMING),
  createdAt: timestamp("created_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
}, (table) => [
  index("store_slug_idx").on(table.slug),
  index("location_idx").using("gist", table.location),
]);
export const menuItem = pgTable("menu_items", {
  id: text("id").primaryKey(),
  storeId: text("store_id").references(() => store.id).notNull(),
  category: menuCategoryEnum("category").default("others").notNull(),
  dietaryType: DietaryType("dietary_type").default("veg").notNull(),
  itemName: text("item_name").notNull(),
  itemDescription: text("item_description"),
  basePrice: decimal("base_price", { precision: 12, scale: 2 }).notNull(),
  offerPrice: decimal("offer_price", { precision: 12, scale: 2 }),
  preparationTime: text("preparation_time"),
  isAvailable: boolean("is_available").default(true),
  labels: jsonb("labels").$type<string[]>().default([]).notNull(),
  itemImages: jsonb("item_images").$type<string[]>().default([]).notNull(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => [
  index("item_store_available_idx").on(table.storeId, table.isAvailable),
]);
export const table = pgTable("tables", {
  id: text("id").primaryKey(),
  storeId: text("store_id").references(() => store.id).notNull(),
  tableLabel: text("table_label").notNull(),
  isOccupied: boolean("is_occupied").default(false),
  isActive: boolean("is_active").default(true),
}, (table) => [
  index("table_store_idx").on(table.storeId)
]);
export const tableSession = pgTable("table_sessions", {
  id: text("id").primaryKey(),
  tableId: text("table_id").references(() => table.id).notNull(),
  storeId: text("store_id").references(() => store.id).notNull(),
  startTime: timestamp("start_time").defaultNow(),
  status: TableSessionStatus("status").default('occupied'),
  endTime: timestamp("end_time"),
});
// ----------------------------------------------------
// Order Management Tables
// ----------------------------------------------------

export const order = pgTable("orders", {
  id: text("id").primaryKey(),
  storeId: text("store_id").references(() => store.id).notNull(),
  tableId: text("table_id").references(() => table.id).notNull(),
  tableSessionId: text("table_session_id").references(() => tableSession.id),
  customerId: text("customer_id").references(() => user.id),
  orderStatus: OrderStatus("order_status").default('pending'),
  paymentStatus: BillStatus("payment_status").default('unpaid'),
  paymentMethod: PaymentMethod("payment_method").default("cash"),
  billSubtotal: decimal("bill_subtotal", { precision: 12, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 12, scale: 2 }).default("0.00"),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  orderedAt: timestamp("ordered_at").defaultNow(),
}, (table) => [
  index("order_store_status_idx").on(table.storeId, table.orderStatus),
]);
export const orderItem = pgTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id").references(() => order.id).notNull(),
  menuItemId: text("menu_item_id").references(() => menuItem.id).notNull(),
  quantity: integer("quantity").notNull(),
  soldAtPrice: decimal("sold_at_price", { precision: 12, scale: 2 }).notNull(),
  itemNameAtOrder: text("item_name_at_order").notNull(),
  customerNote: text("customer_note"),
});
export const storeRating = pgTable("store_ratings", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => user.id).notNull(),
  storeId: text("store_id").references(() => store.id).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("rating_store_idx").on(table.storeId)
]);
// ----------------------------------------------------
// Authentication and Authorizations (Better Auth)
// ----------------------------------------------------

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull(),
  image: text("image"),
  role: StaffRole("role").default('customer'),
  storeId: text("store_id").references(() => store.id),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});
export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId").notNull().references(() => user.id),
});
export const account = pgTable("account", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull().references(() => user.id),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  password: text("password"),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});
export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt"),
  updatedAt: timestamp("updatedAt"),
});
export const storeRelations = relations(store, ({ many }) => ({
  staff: many(user),
  tables: many(table),
  orders: many(order),
}));
export const orderRelations = relations(order, ({ one, many }) => ({
  details: many(orderItem),
  table: one(table, { fields: [order.tableId], references: [table.id] }),
  store: one(store, { fields: [order.storeId], references: [store.id] }),
  session: one(tableSession, { fields: [order.tableSessionId], references: [tableSession.id] }),
}));
export const tableSessionRelations = relations(tableSession, ({ one, many }) => ({
  store: one(store, { fields: [tableSession.storeId], references: [store.id] }),
  table: one(table, { fields: [tableSession.tableId], references: [table.id] }),
  orders: many(order)
}));

export const orderItemRelations = relations(orderItem, ({ one }) => ({
  order: one(order, { fields: [orderItem.orderId], references: [order.id] })
}));