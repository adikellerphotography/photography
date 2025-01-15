import { pgTable, text, serial, timestamp, varchar, integer } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(),
  imageUrl: text("image_url").notNull(),
  thumbnailUrl: text("thumbnail_url"), 
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  displayOrder: integer("display_order").default(0).notNull(),
  likesCount: integer("likes_count").default(0),
});

export const insertPhotoSchema = createInsertSchema(photos);
export const selectPhotoSchema = createSelectSchema(photos);
export type InsertPhoto = typeof photos.$inferInsert;
export type SelectPhoto = typeof photos.$inferSelect;

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  description: text("description"),
  displayOrder: integer("display_order").default(sql`
    CASE 
      WHEN name = 'Bat Mitsva' THEN 1
      WHEN name = 'Family' THEN 2
      WHEN name = 'Women' THEN 3
      WHEN name = 'kids' THEN 4
      WHEN name = 'Yoga' THEN 5
      WHEN name = 'Modeling' THEN 6
      ELSE 10
    END
  `).notNull(),
});

export const photoLikes = pgTable("photo_likes", {
  id: serial("id").primaryKey(),
  photoId: integer("photo_id").references(() => photos.id, { onDelete: "cascade" }).notNull(),
  ipAddress: text("ip_address").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCategorySchema = createInsertSchema(categories);
export const selectCategorySchema = createSelectSchema(categories);
export type InsertCategory = typeof categories.$inferInsert;
export type SelectCategory = typeof categories.$inferSelect;

export type PhotoLike = typeof photoLikes.$inferSelect;