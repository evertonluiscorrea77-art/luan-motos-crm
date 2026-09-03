import { sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const motorcycles = sqliteTable("motorcycles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  brand: text("brand").notNull(), model: text("model").notNull(), version: text("version").notNull().default(""),
  year: integer("year").notNull(), mileage: integer("mileage").notNull().default(0), engine: text("engine").notNull().default(""), color: text("color").notNull().default(""),
  purchasePrice: real("purchase_price"), minimumPrice: real("minimum_price"), salePrice: real("sale_price"), askingPrice: real("asking_price"),
  ownership: text("ownership").notNull().default("propria"), status: text("status").notNull().default("disponivel"),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false), published: integer("published", { mode: "boolean" }).notNull().default(true),
  description: text("description").notNull().default(""), features: text("features").notNull().default("[]"), images: text("images").notNull().default("[]"),
  acquiredAt: text("acquired_at").notNull().default(sql`CURRENT_TIMESTAMP`), soldAt: text("sold_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`), updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("idx_motorcycles_status_published").on(table.status, table.published), index("idx_motorcycles_acquired_at").on(table.acquiredAt)]);

export const leads = sqliteTable("leads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(), phone: text("phone").notNull(), email: text("email").notNull().default(""), source: text("source").notNull().default("manual"),
  motorcycleId: integer("motorcycle_id").references(() => motorcycles.id), stage: text("stage").notNull().default("novo"), notes: text("notes").notNull().default(""),
  followUpAt: text("follow_up_at"), saleValue: real("sale_value"), profit: real("profit"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`), updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("idx_leads_stage").on(table.stage), index("idx_leads_follow_up_at").on(table.followUpAt)]);

export const goals = sqliteTable("goals", {
  id: integer("id").primaryKey({ autoIncrement: true }), month: text("month").notNull().unique(),
  salesTarget: integer("sales_target").notNull().default(5), revenueTarget: real("revenue_target").notNull().default(0), profitTarget: real("profit_target").notNull().default(0),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const adMetrics = sqliteTable("ad_metrics", {
  id: integer("id").primaryKey({ autoIncrement: true }), month: text("month").notNull(), channel: text("channel").notNull(),
  investment: real("investment").notNull().default(0), leads: integer("leads").notNull().default(0), sales: integer("sales").notNull().default(0), revenue: real("revenue").notNull().default(0), profit: real("profit").notNull().default(0),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("idx_ad_metrics_month_channel").on(table.month, table.channel)]);
