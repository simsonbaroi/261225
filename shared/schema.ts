import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Medical item prices table - only stores prices, categories are hardcoded
export const medicalItemPrices = sqliteTable("medical_item_prices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  category: text("category").notNull(),
  name: text("name").notNull(),
  price: real("price").notNull(),
  currency: text("currency").notNull().default("BDT"),
  description: text("description"),
  isOutpatient: integer("is_outpatient", { mode: "boolean" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const insertMedicalItemPriceSchema = createInsertSchema(medicalItemPrices).omit({
  id: true,
  createdAt: true,
});

export type InsertMedicalItemPrice = z.infer<typeof insertMedicalItemPriceSchema>;
export type MedicalItemPrice = typeof medicalItemPrices.$inferSelect;

// Legacy interface for compatibility - maps to the new price table
export type MedicalItem = MedicalItemPrice;
export type InsertMedicalItem = InsertMedicalItemPrice;

// Bills table for saved calculations
export const bills = sqliteTable("bills", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type", { enum: ["outpatient", "inpatient"] }).notNull(),
  sessionId: text("session_id").notNull(), // For browser session persistence
  billData: text("bill_data").notNull(), // JSON string of bill items
  daysAdmitted: integer("days_admitted").default(1),
  total: real("total").notNull(),
  currency: text("currency").notNull().default("BDT"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const insertBillSchema = createInsertSchema(bills).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBill = z.infer<typeof insertBillSchema>;
export type Bill = typeof bills.$inferSelect;
