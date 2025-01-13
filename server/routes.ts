import type { Express } from "express";
import { createServer, type Server } from "http";
import { eq, desc } from "drizzle-orm";
import { db } from "@db";
import { photos, categories } from "@db/schema";
import path from "path";
import express from "express";

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);

  // Serve static files from attached_assets
  const assetsPath = path.join(process.cwd(), 'attached_assets');
  app.use('/assets', express.static(assetsPath));

  // Get all photos (with optional category filter)
  app.get("/api/photos", async (req, res) => {
    try {
      const { category } = req.query;
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 20;

      let query = db.select().from(photos);

      if (category && typeof category === 'string') {
        query = query.where(eq(photos.category, category));
      }

      const results = await query
        .limit(pageSize)
        .offset((page - 1) * pageSize)
        .orderBy(desc(photos.displayOrder));

      const processedPhotos = results.map(photo => ({
        ...photo,
        imageUrl: `/assets/${photo.category.replace(/\s+/g, '_')}/${photo.imageUrl}`,
        thumbnailUrl: photo.thumbnailUrl ? 
          `/assets/${photo.category.replace(/\s+/g, '_')}/${photo.thumbnailUrl}` : 
          undefined
      }));

      res.json(processedPhotos);
    } catch (error: any) {
      console.error('Error fetching photos:', error);
      res.status(500).json({ error: "Failed to fetch photos" });
    }
  });

  // Get all categories
  app.get("/api/categories", async (_req, res) => {
    try {
      const results = await db.select().from(categories)
        .orderBy(desc(categories.displayOrder));
      res.json(results);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  return httpServer;
}