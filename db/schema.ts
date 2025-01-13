import { pgTable, text, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  displayOrder: serial("display_order"),
  thumbnailUrl: text("thumbnail_url"), // Will store path to 1.jpeg by default
});

export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 })
    .notNull()
    .references(() => categories.name, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  displayOrder: serial("display_order"),
});

// Schema types
export const insertCategorySchema = createInsertSchema(categories);
export const selectCategorySchema = createSelectSchema(categories);
export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

export const insertPhotoSchema = createInsertSchema(photos);
export const selectPhotoSchema = createSelectSchema(photos);
export type Photo = typeof photos.$inferSelect;
export type InsertPhoto = typeof photos.$inferInsert;