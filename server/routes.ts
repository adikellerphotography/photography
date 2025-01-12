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

  // Get all categories with their featured photos
  app.get("/api/categories", async (_req, res) => {
    try {
      const results = await db
        .select({
          id: categories.id,
          name: categories.name,
          description: categories.description,
          displayOrder: categories.displayOrder,
          featuredPhoto: {
            id: photos.id,
            imageUrl: photos.imageUrl,
            thumbnailUrl: photos.thumbnailUrl,
          },
        })
        .from(categories)
        .leftJoin(photos, eq(categories.featuredPhotoId, photos.id))
        .orderBy(categories.displayOrder);

      // Transform the results to include full asset paths for featured photos
      const transformedResults = results.map(category => ({
        ...category,
        featuredPhoto: category.featuredPhoto ? {
          ...category.featuredPhoto,
          imageUrl: `/assets/${category.featuredPhoto.imageUrl}`,
          thumbnailUrl: category.featuredPhoto.thumbnailUrl 
            ? `/assets/${category.featuredPhoto.thumbnailUrl}`
            : null,
        } : null,
      }));

      res.json(transformedResults);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  // Initial photo import with categories
  app.post("/api/photos/import", async (_req, res) => {
    try {
      // First clear existing photos
      await db.delete(photos);

      // Define photos by category with featured photos marked
      const photosByCategory = {
        "Bat Mitsva": {
          photos: [
            'IMG_3623-Edit.jpg',
            'IMG_6916-Edit.jpg',
            'IMG_8613-Edit.jpg',
            'IMG_8705-Edit_5.jpg',
            'IMG_8772_2-Edi333t.jpg'
          ],
          featuredPhoto: 'IMG_8613-Edit.jpg'
        },
        "Family": {
          photos: [
            'M68A2437-Edit.jpg',
            'M68A2630-Edit-1.jpg',
            'M68A5762-Edit-2.jpg',
            'M68A9100-Edit-2.jpg',
            'M68A9203-Edit.jpg',
            'M68A9494-Edit.jpg'
          ],
          featuredPhoto: 'M68A2630-Edit-1.jpg'
        }
      };

      // Insert photos for each category and track featured photos
      const featuredPhotoIds: Record<string, number> = {};

      for (const [category, { photos: photoList, featuredPhoto }] of Object.entries(photosByCategory)) {
        for (const [index, photo] of photoList.entries()) {
          const isFeatured = photo === featuredPhoto;
          const result = await db.insert(photos).values({
            title: photo.replace(/\.[^/.]+$/, ""),
            category: category,
            imageUrl: photo,
            displayOrder: index + 1,
            isFeatured: isFeatured
          }).returning({ id: photos.id });

          if (isFeatured && result[0]) {
            featuredPhotoIds[category] = result[0].id;
          }
        }
      }

      // Initialize categories with featured photos
      for (const [index, category] of Object.entries(Object.keys(photosByCategory))) {
        await db.insert(categories).values({
          name: category,
          displayOrder: Number(index) + 1,
          featuredPhotoId: featuredPhotoIds[category]
        }).onConflictDoUpdate({
          target: categories.name,
          set: { featuredPhotoId: featuredPhotoIds[category] }
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