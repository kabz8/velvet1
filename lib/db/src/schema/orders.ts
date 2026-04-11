import { pgTable, serial, text, timestamp, numeric, boolean, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { productsTable } from "./products";

export const orderStatusEnum = pgEnum("order_status", ["pending", "confirmed", "processing", "out_for_delivery", "delivered", "cancelled"]);
export const deliveryRegionEnum = pgEnum("delivery_region", ["nairobi", "outside_nairobi"]);
export const paymentMethodEnum = pgEnum("payment_method", ["cash_on_delivery", "manual_payment", "pending"]);

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  status: orderStatusEnum("status").notNull().default("pending"),
  customerName: text("customer_name"),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email"),
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  deliveryAddress: text("delivery_address").notNull(),
  deliveryRegion: deliveryRegionEnum("delivery_region").notNull(),
  shippingFee: numeric("shipping_fee", { precision: 12, scale: 2 }).notNull().default("0"),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
  discountAmount: numeric("discount_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  total: numeric("total", { precision: 12, scale: 2 }).notNull(),
  couponCode: text("coupon_code"),
  notes: text("notes"),
  internalNotes: text("internal_notes"),
  paymentMethod: paymentMethodEnum("payment_method").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orderItemsTable = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => ordersTable.id, { onDelete: "cascade" }),
  productId: integer("product_id").references(() => productsTable.id),
  productTitle: text("product_title").notNull(),
  productImageUrl: text("product_image_url"),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  totalPrice: numeric("total_price", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOrderItemSchema = createInsertSchema(orderItemsTable).omit({ id: true, createdAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
export type OrderItem = typeof orderItemsTable.$inferSelect;
