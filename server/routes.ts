import type { Express } from "express";
import { createServer, type Server } from "http";
import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "@db";
import { photos, categories } from "@db/schema";
import path from "path";
import fs from "fs/promises";
import express from "express";
import { scanAndProcessImages } from "./utils/scan-images";

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);

  // Serve static files from attached_assets and its subdirectories
  const assetsPath = path.join(process.cwd(), 'attached_assets');
  app.use('/assets', express.static(assetsPath, {
    setHeaders: (res, filePath) => {
      // Ensure proper content type for images
      if (filePath.toLowerCase().endsWith('.jpg') || filePath.toLowerCase().endsWith('.jpeg')) {
        res.setHeader('Content-Type', 'image/jpeg');
      } else if (filePath.toLowerCase().endsWith('.png')) {
        res.setHeader('Content-Type', 'image/png');
      }
      // Set cache control headers
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
      const files = await fs.readdir(beforeAfterPath);

      const imageMap = new Map<string, { raw: string; edited: string }>();

      // Group raw and edited images
      files.forEach(file => {
        if (file.endsWith('-1 Large.jpg') || file.endsWith('-1 Large.jpeg')) {
          const baseName = file.slice(0, -11); // Remove '-1 Large.jpg' or '-1 Large.jpeg'
          const editedFile = files.find(f => 
            f === `${baseName}-2 Large.jpg` || f === `${baseName}-2 Large.jpeg`
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
        title: name.replace(/_/g, ' '),
        rawImage: `/assets/before_and_after/${encodeURIComponent(files.raw)}`,
        editedImage: `/assets/before_and_after/${encodeURIComponent(files.edited)}`
      }));

      console.log('Found before/after images:', images);
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

      console.log('Fetching photos with params:', { category, page, pageSize });

      // Build query with category filter
      let query = db.select().from(photos);

      if (category && typeof category === 'string') {
        const decodedCategory = decodeURIComponent(category);
        console.log('Filtering by category:', decodedCategory);
        query = query.where(eq(photos.category, decodedCategory));
      }

      // Execute query with pagination
      const results = await query
        .limit(pageSize)
        .offset((page - 1) * pageSize)
        .orderBy(desc(photos.displayOrder));

      console.log(`Found ${results.length} photos for category ${category}`);

      // Process photos and add full URLs
      const processedPhotos = results.map(photo => {
        const categoryPath = photo.category.replace(/\s+/g, '_');
        const processedPhoto = {
          ...photo,
          imageUrl: `/assets/${categoryPath}/${encodeURIComponent(photo.imageUrl)}`,
          thumbnailUrl: photo.thumbnailUrl ? 
            `/assets/${categoryPath}/${encodeURIComponent(photo.thumbnailUrl)}` : 
            undefined,
          isLiked: false
        };

        return processedPhoto;
      });

      res.json(processedPhotos);
    } catch (error: any) {
      console.error('Error fetching photos:', error);
      res.status(500).json({ error: "Failed to fetch photos", details: error.message });
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