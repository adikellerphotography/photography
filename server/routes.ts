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
    const { category, page = 1, pageSize = 20 } = req.query;

    try {
      let query = db.select().from(photos);

      if (category) {
        query = query.where(eq(photos.category, String(category)));
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

  // Initial photo import
  app.post("/api/photos/import", async (_req, res) => {
    try {
      // First clear existing photos
      await db.delete(photos);

      // Family photos
      const familyPhotos = [
        'IMG_3472-Edit.jpg', 'IMG_7812-Edit-3.jpg', 'IMG_7949-Edit.jpg',
        'IMG_8400-Edit 2.jpg', 'IMG_8686-Edit-2.jpg', 'M68A0073-Edit.jpg',
        'M68A0338-Edit.jpg', 'M68A1950-Edit.jpg', 'M68A2437-Edit.jpg',
        'M68A2630-Edit-1.jpg', 'M68A5762-Edit-2.jpg', 'M68A9100-Edit-2.jpg',
        'M68A9203-Edit.jpg', 'M68A9494-Edit.jpg'
      ];

      // Insert Family photos
      for (const photo of familyPhotos) {
        await db.insert(photos).values({
          title: photo.replace(/\.[^/.]+$/, ""),
          category: "Family",
          imageUrl: photo,
          displayOrder: familyPhotos.indexOf(photo) + 1
        });
      }

      res.json({ message: "Photos imported successfully" });
    } catch (error) {
      console.error('Error importing photos:', error);
      res.status(500).json({ error: "Failed to import photos" });
    }
  });

  return httpServer;
}