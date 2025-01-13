import type { Express } from "express";
import { createServer, type Server } from "http";
import { eq, desc } from "drizzle-orm";
import { db } from "@db";
import { photos, categories } from "@db/schema";
import path from "path";
import fs from "fs/promises";
import express from "express";

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);

  // Serve static files from attached_assets and its subdirectories
  const assetsPath = path.join(process.cwd(), 'attached_assets');
  app.use('/assets', express.static(assetsPath, {
    setHeaders: (res, filePath) => {
      if (filePath.toLowerCase().endsWith('.jpg') || filePath.toLowerCase().endsWith('.jpeg')) {
        res.setHeader('Content-Type', 'image/jpeg');
      } else if (filePath.toLowerCase().endsWith('.png')) {
        res.setHeader('Content-Type', 'image/png');
      }
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    },
    dotfiles: 'ignore',
    fallthrough: true,
    index: false
  }));

  // Get before/after images
  app.get("/api/before-after-images", async (_req, res) => {
    try {
      const beforeAfterPath = path.join(assetsPath, 'before_and_after');

      // Create the directory if it doesn't exist
      try {
        await fs.access(beforeAfterPath);
      } catch {
        await fs.mkdir(beforeAfterPath, { recursive: true });
      }

      const files = await fs.readdir(beforeAfterPath);
      const imageMap = new Map<string, { raw: string; edited: string }>();

      // Group raw and edited images
      files.forEach(file => {
        if (file.endsWith('-1 Large.jpg') || file.endsWith('-1 Large.jpeg')) {
          const baseName = file.replace('-1 Large', ''); // Remove '-1 Large' suffix
          const editedFile = files.find(f => 
            f === `${baseName.slice(0, -4)}-2 Large${baseName.slice(-4)}` // Preserve file extension
          );

          if (editedFile) {
            imageMap.set(baseName, {
              raw: file,
              edited: editedFile
            });
          }
        }
      });

      // Convert to array format
      const images = Array.from(imageMap.entries()).map(([name, files], index) => ({
        id: index + 1,
        title: name.slice(0, -4).replace(/_/g, ' '), // Remove extension and replace underscores
        rawImage: `/assets/before_and_after/${encodeURIComponent(files.raw)}`,
        editedImage: `/assets/before_and_after/${encodeURIComponent(files.edited)}`
      }));

      res.json(images);
    } catch (error) {
      console.error('Error fetching before/after images:', error);
      res.status(500).json({ error: "Failed to fetch before/after images" });
    }
  });

  // Get photos for a specific category
  app.get("/api/photos", async (req, res) => {
    try {
      const { category } = req.query;
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 20;

      if (category && typeof category === 'string') {
        const decodedCategory = decodeURIComponent(category);
        const results = await db.select()
          .from(photos)
          .where(eq(photos.category, decodedCategory))
          .limit(pageSize)
          .offset((page - 1) * pageSize)
          .orderBy(desc(photos.displayOrder));

        const processedPhotos = results.map(photo => {
          const categoryPath = photo.category.replace(/\s+/g, '_');
          return {
            ...photo,
            imageUrl: `/assets/${categoryPath}/${encodeURIComponent(photo.imageUrl)}`,
            thumbnailUrl: photo.thumbnailUrl ? 
              `/assets/${categoryPath}/${encodeURIComponent(photo.thumbnailUrl)}` : 
              undefined,
            isLiked: false
          };
        });

        res.json(processedPhotos);
      } else {
        res.json([]);
      }
    } catch (error: any) {
      console.error('Error fetching photos:', error);
      res.status(500).json({ error: "Failed to fetch photos", details: error.message });
    }
  });

  // Get all categories with their first photos
  app.get("/api/categories", async (_req, res) => {
    try {
      const results = await db.select().from(categories).orderBy(categories.displayOrder);

      const categoriesWithPhotos = await Promise.all(
        results.map(async (category) => {
          const categoryPhotos = await db
            .select()
            .from(photos)
            .where(eq(photos.category, category.name))
            .orderBy(desc(photos.displayOrder))
            .limit(1);

          const categoryPath = category.name.replace(/\s+/g, '_');

          if (categoryPhotos[0]) {
            return {
              ...category,
              firstPhoto: {
                imageUrl: `/assets/${categoryPath}/${encodeURIComponent(categoryPhotos[0].imageUrl)}`,
                thumbnailUrl: categoryPhotos[0].thumbnailUrl ?
                  `/assets/${categoryPath}/${encodeURIComponent(categoryPhotos[0].thumbnailUrl)}` :
                  undefined
              }
            };
          }
          return category;
        })
      );

      res.json(categoriesWithPhotos);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  return httpServer;
}