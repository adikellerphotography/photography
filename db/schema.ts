import { pgTable, text, serial, timestamp, varchar, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(),
  imageUrl: text("image_url").notNull(),
  thumbnailUrl: text("thumbnail_url"), // Making it nullable initially
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  displayOrder: serial("display_order"),
  isFeatured: boolean("is_featured").default(false),
});

export const insertPhotoSchema = createInsertSchema(photos);
export const selectPhotoSchema = createSelectSchema(photos);
export type InsertPhoto = typeof photos.$inferInsert;
export type SelectPhoto = typeof photos.$inferSelect;

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  description: text("description"),
  displayOrder: serial("display_order"),
  featuredPhotoId: integer("featured_photo_id").references(() => photos.id),
});

export const insertCategorySchema = createInsertSchema(categories);
export const selectCategorySchema = createSelectSchema(categories);
export type InsertCategory = typeof categories.$inferInsert;
export type SelectCategory = typeof categories.$inferSelect;