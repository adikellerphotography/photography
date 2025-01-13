import type { Express } from "express";
import { createServer, type Server } from "http";
import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "@db";
import { photos, categories } from "@db/schema";
import path from "path";
import express from "express";
import { scanAndProcessImages } from "./utils/scan-images";
import fs from "fs/promises";

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

  // Get photos for a specific category
  app.get("/api/photos", async (req, res) => {
    try {
      const { category } = req.query;
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 20;

      console.log('Fetching photos with params:', { category, page, pageSize });

      const query = category 
        ? db.select().from(photos).where(eq(photos.category, category as string))
        : db.select().from(photos);

      const results = await query
        .limit(pageSize)
        .offset((page - 1) * pageSize)
        .orderBy(desc(photos.displayOrder));

      console.log(`Found ${results.length} photos for category ${category}`);

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
    } catch (error: any) {
      console.error('Error fetching photos:', error);
      res.status(500).json({ error: "Failed to fetch photos", details: error.message });
    }
  });

  // Get before and after image sets
  app.get("/api/before-after", async (_req, res) => {
    try {
      const beforeAfterPath = path.join(assetsPath, 'before_and_after');
      const files = await fs.readdir(beforeAfterPath);

      const imageSets: { id: number; beforeImage: string; afterImage: string; title: string; }[] = [];
      const imageMap = new Map<string, string>();

      files.forEach(file => {
        if (file.endsWith(' Large.jpeg') || file.endsWith(' Large.jpg')) {
          const base = file.replace(/^\d+\s*-/, '').replace(/-[12] Large\.(jpeg|jpg)$/, '');
          imageMap.set(base, (imageMap.get(base) || '') + file);
        }
      });

      let id = 1;
      imageMap.forEach((value, key) => {
        const beforeFile = files.find(f => f.includes(key) && f.includes('-1 Large'));
        const afterFile = files.find(f => f.includes(key) && f.includes('-2 Large'));

        if (beforeFile && afterFile) {
          const title = key
            .replace(/_/g, ' ')
            .replace(/([A-Z])/g, ' $1')
            .trim()
            .replace(/\s+/g, ' ')
            .replace(/^./, str => str.toUpperCase());

          imageSets.push({
            id: id++,
            title: title || 'Photo Comparison',
            beforeImage: `/assets/before_and_after/${encodeURIComponent(beforeFile)}`,
            afterImage: `/assets/before_and_after/${encodeURIComponent(afterFile)}`
          });
        }
      });

      imageSets.sort((a, b) => a.title.localeCompare(b.title));
      res.json(imageSets);
    } catch (error: any) {
      console.error('Error fetching before/after images:', error);
      res.status(500).json({ error: "Failed to fetch before/after images", details: error.message });
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
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: "Failed to fetch categories", details: error.message });
    }
  });

  // Rescan and process all images
  app.post("/api/photos/scan", async (_req, res) => {
    try {
      console.log('Starting image scan process...');
      await scanAndProcessImages();
      console.log('Image scan completed successfully');
      res.json({ message: "Successfully scanned and processed all images" });
    } catch (error: any) {
      console.error('Error scanning images:', error);
      res.status(500).json({ error: "Failed to scan images", details: error.message });
    }
  });

  return httpServer;
}