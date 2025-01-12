import type { Express } from "express";
import { createServer, type Server } from "http";
import { eq } from "drizzle-orm";
import { db } from "@db";
import { photos, categories } from "@db/schema";
import path from "path";
import express from "express";
import { generateThumbnail } from "./utils/image";
import { generateMissingThumbnails } from "./utils/generate-thumbnails";

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);

  // Serve static files from attached_assets
  const assetsPath = path.join(process.cwd(), 'attached_assets');
  app.use('/assets', express.static(assetsPath));

  // Initialize thumbnails for existing photos
  generateMissingThumbnails().catch(console.error);

  // Get all photos with optional category filter and pagination
  app.get("/api/photos", async (req, res) => {
    try {
      const { category } = req.query;
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 20;

      console.log('Fetching photos with category:', category);

      let query = db.select().from(photos);

      // Only apply category filter if it's provided
      if (category && typeof category === 'string') {
        query = query.where(eq(photos.category, category));
      }

      const offset = (page - 1) * pageSize;
      const results = await query
        .limit(pageSize)
        .offset(offset)
        .orderBy(photos.displayOrder);

      console.log(`Found ${results.length} photos for category:`, category);

      // Transform the results to include full asset paths
      const transformedResults = results.map(photo => ({
        ...photo,
        imageUrl: `/assets/${photo.imageUrl}`,
        thumbnailUrl: photo.thumbnailUrl ? `/assets/${photo.thumbnailUrl}` : null,
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