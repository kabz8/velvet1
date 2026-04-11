import { pgTable, serial, text, timestamp, boolean, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const siteSettingsTable = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  storeName: text("store_name").notNull().default("Velvet"),
  storeEmail: text("store_email"),
  storePhone: text("store_phone"),
  storeAddress: text("store_address"),
  announcementBar: text("announcement_bar"),
  announcementBarEnabled: boolean("announcement_bar_enabled").notNull().default(false),
  socialFacebook: text("social_facebook"),
  socialInstagram: text("social_instagram"),
  socialTwitter: text("social_twitter"),
  socialWhatsapp: text("social_whatsapp"),
  footerText: text("footer_text"),
  cashOnDeliveryEnabled: boolean("cash_on_delivery_enabled").notNull().default(true),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  socialImageUrl: text("social_image_url"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const ageGateSettingsTable = pgTable("age_gate_settings", {
  id: serial("id").primaryKey(),
  enabled: boolean("enabled").notNull().default(true),
  title: text("title").notNull().default("Adults Only"),
  message: text("message").notNull().default("This store contains products intended for adults only. Please confirm you are 18 years of age or older to continue."),
  confirmLabel: text("confirm_label").notNull().default("I am 18+, Enter"),
  exitLabel: text("exit_label").notNull().default("Exit"),
  backgroundImageUrl: text("background_image_url"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const shippingSettingsTable = pgTable("shipping_settings", {
  id: serial("id").primaryKey(),
  nairobiCountyFee: numeric("nairobi_county_fee", { precision: 12, scale: 2 }).notNull().default("300"),
  outsideNairobiFee: numeric("outside_nairobi_fee", { precision: 12, scale: 2 }).notNull().default("450"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettingsTable).omit({ id: true, updatedAt: true });
export const insertAgeGateSettingsSchema = createInsertSchema(ageGateSettingsTable).omit({ id: true, updatedAt: true });
export const insertShippingSettingsSchema = createInsertSchema(shippingSettingsTable).omit({ id: true, updatedAt: true });
export type SiteSettings = typeof siteSettingsTable.$inferSelect;
export type AgeGateSettings = typeof ageGateSettingsTable.$inferSelect;
export type ShippingSettings = typeof shippingSettingsTable.$inferSelect;
