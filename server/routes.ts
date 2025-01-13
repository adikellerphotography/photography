import type { Express } from "express";
import { createServer, type Server } from "http";
import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "@db";
import { photos, categories } from "@db/schema";
import path from "path";
import express from "express";
import { generateThumbnail } from "./utils/image";
import { generateMissingThumbnails } from "./utils/generate-thumbnails";
import { scanAndProcessImages } from "./utils/scan-images";

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);

  // Serve static files from attached_assets and its subdirectories
  const assetsPath = path.join(process.cwd(), 'attached_assets');
  app.use('/assets', express.static(assetsPath, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
        res.setHeader('Content-Type', 'image/jpeg');
      } else if (filePath.endsWith('.png')) {
        res.setHeader('Content-Type', 'image/png');
      }
    }
  }));

  // Initialize thumbnails for existing photos
  generateMissingThumbnails().catch(console.error);

  // Get all categories with a random photo from each
  app.get("/api/categories-with-photos", async (_req, res) => {
    try {
      const categoriesList = await db.select().from(categories).orderBy(categories.displayOrder);

      const categoriesWithPhotos = await Promise.all(
        categoriesList.map(async (category) => {
          // Get random photo for this category
          const randomPhoto = await db
            .select()
            .from(photos)
            .where(eq(photos.category, category.name))
            .orderBy(sql`RANDOM()`)
            .limit(1);

          return {
            ...category,
            firstPhoto: randomPhoto[0] ? {
              imageUrl: `/assets/${category.name.replace(/\s+/g, '_')}/${randomPhoto[0].imageUrl}`,
              thumbnailUrl: randomPhoto[0].thumbnailUrl ?
                `/assets/${category.name.replace(/\s+/g, '_')}/${randomPhoto[0].thumbnailUrl}` :
                undefined
            } : undefined
          };
        })
      );

      res.json(categoriesWithPhotos);
    } catch (error) {
      console.error('Error fetching categories with photos:', error);
      res.status(500).json({ error: "Failed to fetch categories with photos" });
    }
  });

  // Get all photos with optional category filter and pagination
  app.get("/api/photos", async (req, res) => {
    try {
      const { category } = req.query;
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 20;

      // Build query with category filter
      const baseQuery = category && typeof category === 'string'
        ? db.select().from(photos).where(eq(photos.category, category))
        : db.select().from(photos);

      // Execute query with pagination
      const results = await baseQuery
        .limit(pageSize)
        .offset((page - 1) * pageSize)
        .orderBy(desc(photos.displayOrder));

      // Process photos and add full URLs
      const processedPhotos = results.map(photo => {
        const categoryPath = photo.category.replace(/\s+/g, '_');
        return {
          ...photo,
          imageUrl: `/assets/${categoryPath}/${photo.imageUrl}`,
          thumbnailUrl: photo.thumbnailUrl ?
            `/assets/${categoryPath}/${photo.thumbnailUrl}` :
            undefined,
          isLiked: false // Default to false until likes system is implemented
        };
      });

      res.json(processedPhotos);
    } catch (error) {
      console.error('Error fetching photos:', error);
      res.status(500).json({ error: "Failed to fetch photos" });
    }
  });


  // Get all categories
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
            .limit(1);

          const firstPhoto = categoryPhotos[0];
          if (firstPhoto) {
            const categoryPath = category.name.replace(/\s+/g, '_');
            return {
              ...category,
              firstPhoto: {
                imageUrl: `/assets/${categoryPath}/${firstPhoto.imageUrl}`,
                thumbnailUrl: firstPhoto.thumbnailUrl ?
                  `/assets/${categoryPath}/${firstPhoto.thumbnailUrl}` :
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

  // Setup initial categories if needed
  app.post("/api/categories/setup", async (_req, res) => {
    try {
      const categoryOrder = [
        { name: "Bat Mitsva", order: 1, description: "Bat Mitsva celebrations and ceremonies" },
        { name: "Kids", order: 2, description: "Children photography sessions" },
        { name: "Family", order: 3, description: "Family portraits and gatherings" },
        { name: "Yoga", order: 4, description: "Yoga photography sessions" },
        { name: "Women", order: 5, description: "Women portraits and professional shots" },
        { name: "Modeling", order: 6, description: "Professional modeling photography" }
      ];

      for (const cat of categoryOrder) {
        await db.insert(categories)
          .values({
            name: cat.name,
            displayOrder: cat.order,
            description: cat.description
          })
          .onConflictDoUpdate({
            target: categories.name,
            set: {
              displayOrder: cat.order,
              description: cat.description
            }
          });
      }

      res.json({ message: "Categories setup completed" });
    } catch (error) {
      console.error('Error setting up categories:', error);
      res.status(500).json({ error: "Failed to set up categories" });
    }
  });

  // Scan and process all images
  app.post("/api/photos/scan", async (_req, res) => {
    try {
      await scanAndProcessImages();
      res.json({ message: "Successfully scanned and processed all images" });
    } catch (error) {
      console.error('Error scanning images:', error);
      res.status(500).json({ error: "Failed to scan images" });
    }
  });

  return httpServer;
}