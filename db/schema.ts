import { pgTable, text, serial, timestamp, varchar, integer, json, unique } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(),
  imageUrl: text("image_url").notNull(),
  thumbnailUrl: text("thumbnail_url"), 
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  displayOrder: serial("display_order"),
  likesCount: integer("likes_count").default(0),
  metadata: json("metadata").$type<{
    tags?: string[],
    colorPalette?: string[],
    style?: string[],
  }>(),
});

export const photoRelations = relations(photos, ({ many }) => ({
  recommendations: many(photoRecommendations),
  likes: many(photoLikes),
}));

export const photoRecommendations = pgTable("photo_recommendations", {
  id: serial("id").primaryKey(),
  sourcePhotoId: integer("source_photo_id").references(() => photos.id, { onDelete: "cascade" }).notNull(),
  recommendedPhotoId: integer("recommended_photo_id").references(() => photos.id, { onDelete: "cascade" }).notNull(),
  score: integer("score").default(0).notNull(), // Higher score means stronger recommendation
  reason: text("reason"), // Why this photo is recommended
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  // Ensure we don't have duplicate recommendations
  uniqueRecommendation: unique().on(table.sourcePhotoId, table.recommendedPhotoId),
}));

export const recommendationRelations = relations(photoRecommendations, ({ one }) => ({
  sourcePhoto: one(photos, {
    fields: [photoRecommendations.sourcePhotoId],
    references: [photos.id],
  }),
  recommendedPhoto: one(photos, {
    fields: [photoRecommendations.recommendedPhotoId],
    references: [photos.id],
  }),
}));

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  description: text("description"),
  displayOrder: serial("display_order"),
});

export const photoLikes = pgTable("photo_likes", {
  id: serial("id").primaryKey(),
  photoId: integer("photo_id").references(() => photos.id, { onDelete: "cascade" }).notNull(),
  ipAddress: text("ip_address").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const photoLikesRelations = relations(photoLikes, ({ one }) => ({
  photo: one(photos, {
    fields: [photoLikes.photoId],
    references: [photos.id],
  }),
}));

// Schema types
export const insertPhotoSchema = createInsertSchema(photos);
export const selectPhotoSchema = createSelectSchema(photos);
export type InsertPhoto = typeof photos.$inferInsert;
export type SelectPhoto = typeof photos.$inferSelect;

export const insertCategorySchema = createInsertSchema(categories);
export const selectCategorySchema = createSelectSchema(categories);
export type InsertCategory = typeof categories.$inferInsert;
export type SelectCategory = typeof categories.$inferSelect;

export type PhotoLike = typeof photoLikes.$inferSelect;
export type PhotoRecommendation = typeof photoRecommendations.$inferSelect;