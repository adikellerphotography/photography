import type { Express } from "express";
import { createServer, type Server } from "http";
import { eq, desc, not } from "drizzle-orm";
import { db } from "@db";
import { photos, categories } from "@db/schema";
import path from "path";
import express from "express";

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);

  // Serve static files from attached_assets
  app.use('/assets', express.static(path.join(process.cwd(), 'attached_assets'), {
    setHeaders: (res, filePath) => {
      if (filePath.toLowerCase().match(/\.(jpg|jpeg)$/)) {
        res.setHeader('Content-Type', 'image/jpeg');
      }
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
  }));

  // Get all categories (excluding "before and after")
  app.get("/api/categories", async (_req, res) => {
    try {
      const results = await db.select()
        .from(categories)
        .where(not(eq(categories.name, "before and after")))
        .orderBy(categories.displayOrder);

      const processedCategories = results.map(category => ({
        ...category,
        thumbnailUrl: category.thumbnailUrl || `/assets/${category.name.replace(/\s+/g, '_')}/1.jpeg`
      }));

      res.json(processedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  // Get photos by category with pagination
  app.get("/api/photos", async (req, res) => {
    try {
      const { category } = req.query;
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 20;

      if (!category) {
        return res.status(400).json({ error: "Category is required" });
      }

      const results = await db.select()
        .from(photos)
        .where(eq(photos.category, category as string))
        .orderBy(desc(photos.displayOrder))
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      const processedPhotos = results.map(photo => ({
        ...photo,
        imageUrl: `/assets/${photo.category.replace(/\s+/g, '_')}/${photo.imageUrl}`,
        thumbnailUrl: photo.thumbnailUrl ? 
          `/assets/${photo.category.replace(/\s+/g, '_')}/${photo.thumbnailUrl}` : 
          undefined
      }));

      res.json(processedPhotos);
    } catch (error) {
      console.error('Error fetching photos:', error);
      res.status(500).json({ error: "Failed to fetch photos" });
    }
  });

  return httpServer;
}