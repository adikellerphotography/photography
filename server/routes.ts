import type { Express } from "express";
import { createServer, type Server } from "http";
import { eq, desc } from "drizzle-orm";
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

  // Ensure assets directory exists
  const ensureDirectory = async (dirPath: string) => {
    try {
      await fs.access(dirPath);
    } catch {
      console.log(`Creating directory: ${dirPath}`);
      await fs.mkdir(dirPath, { recursive: true });
    }
  };

  // Initialize directories
  ensureDirectory(assetsPath).catch(console.error);

  app.use('/assets', express.static(assetsPath, {
    setHeaders: (res, filePath) => {
      if (filePath.toLowerCase().endsWith('.jpg') || filePath.toLowerCase().endsWith('.jpeg')) {
        res.setHeader('Content-Type', 'image/jpeg');
      } else if (filePath.toLowerCase().endsWith('.png')) {
        res.setHeader('Content-Type', 'image/png');
      }
      // Disable cache for development
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    },
    fallthrough: true,
    index: false
  }));

  // Error handler for static files
  app.use('/assets', (err: any, req: any, res: any, next: any) => {
    console.error('Static file error:', err);
    res.status(404).json({ error: 'File not found' });
  });

  // Get photos for a specific category
  app.get("/api/photos", async (req, res) => {
    try {
      const { category } = req.query;
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 20;

      console.log('Fetching photos with params:', { category, page, pageSize });

      const query = db.select().from(photos);
      if (category && typeof category === 'string') {
        const decodedCategory = decodeURIComponent(category);
        console.log('Filtering by category:', decodedCategory);
        query.where(eq(photos.category, decodedCategory));
      }

      const results = await query
        .orderBy(desc(photos.displayOrder))
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      console.log(`Found ${results.length} photos for category ${category}`);

      const processedPhotos = results.map(photo => {
        try {
          const categoryPath = photo.category.replace(/\s+/g, '_');
          return {
            ...photo,
            imageUrl: `/assets/${encodeURIComponent(categoryPath)}/${encodeURIComponent(photo.imageUrl)}`,
            thumbnailUrl: photo.thumbnailUrl
              ? `/assets/${encodeURIComponent(categoryPath)}/${encodeURIComponent(photo.thumbnailUrl)}`
              : undefined
          };
        } catch (error) {
          console.error(`Error processing photo ${photo.id}:`, error);
          return null;
        }
      }).filter(Boolean);

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

      // Group matching before and after images
      const imageSets: { id: number; beforeImage: string; afterImage: string; title: string; }[] = [];
      const imageMap = new Map<string, string>();

      // First, collect all images
      files.forEach(file => {
        if (file.endsWith(' Large.jpeg') || file.endsWith(' Large.jpg')) {
          const base = file.replace(/-[12] Large\.(jpeg|jpg)$/, '');
          imageMap.set(base, (imageMap.get(base) || '') + file);
        }
      });

      // Then, create pairs
      let id = 1;
      imageMap.forEach((value, key) => {
        const beforeFile = files.find(f => f.startsWith(key) && f.includes('-1 Large'));
        const afterFile = files.find(f => f.startsWith(key) && f.includes('-2 Large'));

        if (beforeFile && afterFile) {
          imageSets.push({
            id: id++,
            title: key.replace(/_/g, ' '),
            beforeImage: `/assets/before_and_after/${encodeURIComponent(beforeFile)}`,
            afterImage: `/assets/before_and_after/${encodeURIComponent(afterFile)}`
          });
        }
      });

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

      // Get a photo for each category
      const categoriesWithPhotos = await Promise.all(
        results.map(async (category) => {
          const categoryPhotos = await db
            .select()
            .from(photos)
            .where(eq(photos.category, category.name))
            .orderBy(desc(photos.displayOrder))
            .limit(1);

          const categoryPath = category.name.replace(/\s+/g, '_');
          console.log(`Processing category: ${category.name}, path: ${categoryPath}`);

          if (categoryPhotos[0]) {
            const photoData = {
              ...category,
              firstPhoto: {
                imageUrl: `/assets/${categoryPath}/${encodeURIComponent(categoryPhotos[0].imageUrl)}`,
                thumbnailUrl: categoryPhotos[0].thumbnailUrl ?
                  `/assets/${categoryPath}/${encodeURIComponent(categoryPhotos[0].thumbnailUrl)}` :
                  undefined
              }
            };
            console.log('Category photo data:', photoData.firstPhoto);
            return photoData;
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

  // Rescan and process all images
  app.post("/api/photos/scan", async (_req, res) => {
    try {
      console.log('Starting image scan process...');
      await scanAndProcessImages();
      console.log('Image scan completed successfully');
      res.json({ message: "Successfully scanned and processed all images" });
    } catch (error) {
      console.error('Error scanning images:', error);
      res.status(500).json({ error: "Failed to scan images" });
    }
  });

  return httpServer;
}