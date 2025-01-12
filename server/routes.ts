import type { Express } from "express";
import { createServer } from "http";
import { eq } from "drizzle-orm";
import { db } from "@db";
import { photos, categories } from "@db/schema";
import path from "path";
import express from "express";
import { generateThumbnail } from "./utils/image";
import { generateMissingThumbnails } from "./utils/generate-thumbnails";

export function registerRoutes(app: Express) {
  const httpServer = createServer(app);

  // Serve static files from attached_assets
  const assetsPath = path.join(process.cwd(), 'attached_assets');
  app.use('/assets', express.static(assetsPath));

  // Initialize thumbnails for existing photos
  generateMissingThumbnails().catch(console.error);

  // Get all photos with optional category filter and pagination
  app.get("/api/photos", async (req, res) => {
    const { category, page = 1, pageSize = 20 } = req.query;

    try {
      let query = db.select().from(photos);

      if (category) {
        query = query.where(eq(photos.category, category as string));
      }

      const offset = ((Number(page) || 1) - 1) * Number(pageSize);
      const results = await query
        .limit(Number(pageSize))
        .offset(offset)
        .orderBy(photos.displayOrder);

      // Transform the results to include full asset paths
      const transformedResults = results.map(photo => ({
        ...photo,
        imageUrl: `/assets/${photo.imageUrl}`,
        thumbnailUrl: photo.thumbnailUrl ? `/assets/${photo.thumbnailUrl}` : `/assets/${photo.imageUrl}`,
      }));

      res.json(transformedResults);
    } catch (error) {
      console.error('Error fetching photos:', error);
      res.status(500).json({ error: "Failed to fetch photos" });
    }
  });

  // Get all categories
  app.get("/api/categories", async (_req, res) => {
    try {
      const results = await db.select().from(categories).orderBy(categories.displayOrder);
      res.json(results);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  return httpServer;
}