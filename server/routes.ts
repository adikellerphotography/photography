import type { Express } from "express";
import { createServer, type Server } from "http";
import { eq, and, desc } from "drizzle-orm";
import { db } from "@db";
import { photos, categories, photoLikes } from "@db/schema";
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

  // Get all categories with their first photo
  app.get("/api/categories-with-photos", async (_req, res) => {
    try {
      const categoriesList = await db.select().from(categories).orderBy(categories.displayOrder);

      const categoriesWithPhotos = await Promise.all(
        categoriesList.map(async (category) => {
          // Get first photo for this category
          const firstPhoto = await db
            .select()
            .from(photos)
            .where(eq(photos.category, category.name))
            .orderBy(photos.displayOrder)
            .limit(1);

          return {
            ...category,
            firstPhoto: firstPhoto[0] ? {
              imageUrl: `/assets/${firstPhoto[0].imageUrl}`,
              thumbnailUrl: firstPhoto[0].thumbnailUrl ? `/assets/${firstPhoto[0].thumbnailUrl}` : null
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
      const ipAddress = req.ip;

      // Start with a base query
      const query = db.select().from(photos);

      // Only apply category filter if a specific category is requested
      if (category && typeof category === 'string') {
        query.where(eq(photos.category, category));
      }

      const results = await query
        .limit(pageSize)
        .offset((page - 1) * pageSize)
        .orderBy(photos.displayOrder);

      // Get likes for each photo for the current IP
      const photosWithLikes = await Promise.all(
        results.map(async (photo) => {
          const liked = await db
            .select()
            .from(photoLikes)
            .where(
              and(
                eq(photoLikes.photoId, photo.id),
                eq(photoLikes.ipAddress, ipAddress)
              )
            );

          return {
            ...photo,
            imageUrl: `/assets/${photo.imageUrl}`,
            thumbnailUrl: photo.thumbnailUrl ? `/assets/${photo.thumbnailUrl}` : null,
            isLiked: liked.length > 0,
          };
        })
      );

      res.json(photosWithLikes);
    } catch (error) {
      console.error('Error fetching photos:', error);
      res.status(500).json({ error: "Failed to fetch photos" });
    }
  });

  // Like/Unlike a photo
  app.post("/api/photos/:id/like", async (req, res) => {
    try {
      const photoId = parseInt(req.params.id);
      const ipAddress = req.ip;

      // Check if the user has already liked this photo
      const existingLike = await db
        .select()
        .from(photoLikes)
        .where(
          and(
            eq(photoLikes.photoId, photoId),
            eq(photoLikes.ipAddress, ipAddress)
          )
        );

      if (existingLike.length > 0) {
        // Unlike: Remove the like
        await db
          .delete(photoLikes)
          .where(
            and(
              eq(photoLikes.photoId, photoId),
              eq(photoLikes.ipAddress, ipAddress)
            )
          );

        // Update likes count
        await db
          .update(photos)
          .set({ likesCount: photos.likesCount - 1 })
          .where(eq(photos.id, photoId));

        res.json({ liked: false });
      } else {
        // Like: Add new like
        await db.insert(photoLikes).values({
          photoId,
          ipAddress,
        });

        // Update likes count
        await db
          .update(photos)
          .set({ likesCount: photos.likesCount + 1 })
          .where(eq(photos.id, photoId));

        res.json({ liked: true });
      }
    } catch (error) {
      console.error('Error handling photo like:', error);
      res.status(500).json({ error: "Failed to process like" });
    }
  });

  // Add new photos to Bat Mitsva gallery
  app.post("/api/photos/import", async (_req, res) => {
    try {
      // All Bat Mitsva photos
      const allBatMitsvaPhotos = [
        // First batch
        'M68A0072-Edit Large.jpeg',
        'IMG_8772_2-Edi333t Large.jpeg',
        'IMG_8705-Edit_5 Large.jpeg',
        'IMG_8613-Edit Large.jpeg',
        'IMG_7383-Edit Large.jpeg',
        'IMG_7023-Edit-2 Large.jpeg',
        'IMG_6916-Edit Large.jpeg',
        'IMG_6901-Edit Large.jpeg',
        'IMG_6797-Edit Large.jpeg',
        'IMG_6788-Edit-2 Large.jpeg',
        'IMG_6449-Edit-2 Large.jpeg',
        'IMG_4737-Edit-2 Large.jpeg',
        'IMG_4541-Edit Large.jpeg',
        'IMG_3863-Edit Large.jpeg',
        'IMG_3623-Edit Large.jpeg',
        'IMG_0266-Edit Large.jpeg',
        'IMG_0652-Edit Large.jpeg',
        'IMG_3326-Edit-Edit-2 Large.jpeg',
        '0Z9A7935-Edit_c Large.jpeg',
        '0Z9A1019-Edit-Edit-2 Large.jpeg',
        // Second batch
        'M68A1645-Edit Large.jpeg',
        'M68A1636-Edit Large.jpeg',
        'M68A1601-Edit-Edit-Edit Large.jpeg',
        'M68A1579-Edit Large.jpeg',
        'M68A1544-Edit-2 Large.jpeg',
        'M68A1428-Edit-2 Large.jpeg',
        'M68A1179-Edit Large.jpeg',
        'M68A1155-Edit-Edit Large.jpeg',
        'M68A1153-Edit-2 Large.jpeg',
        'M68A1142-Edit-Edit-2 Large.jpeg',
        'M68A1113-Edit Large.jpeg',
        'M68A0978-Edit Large.jpeg',
        'M68A0959-Edit Large.jpeg',
        'M68A0928-Edit-Edit-2 Large.jpeg',
        'M68A0863-Edit Large.jpeg',
        'M68A0863-Edit-2 Large.jpeg',
        'M68A0765-Edit-Edit Large.jpeg',
        'M68A0544-Edit Large.jpeg',
        'M68A0460-Edit-2 Large.jpeg',
        'M68A0288-Edit Large.jpeg',
        // Third batch
        'M68A7513-Edit-3 Large.jpeg',
        'M68A6026-Edit Large.jpeg',
        'M68A5912-Edit Large.jpeg',
        'M68A5559-Edit-2 Large.jpeg',
        'M68A4737-Edit Large.jpeg',
        'M68A4619-Edit Large.jpeg',
        'M68A4569-Edit Large.jpeg',
        'M68A4524-Edit-Edit Large.jpeg',
        'M68A4365-Edit Large.jpeg',
        'M68A4130-Edit Large.jpeg',
        'M68A2939-Edit-Edit Large.jpeg',
        'M68A2406-Edit-Edit Large.jpeg',
        'M68A2385-Edit Large.jpeg',
        'M68A2178-Edit Large.jpeg',
        'M68A2253-Edit-Edit-2 Large.jpeg',
        'M68A2233-Edit-3 Large.jpeg',
        'M68A2032-Edit Large.jpeg',
        'M68A1788-Edit-Edit-2 Large.jpeg',
        'M68A1724-Edit Large.jpeg',
        'M68A1697-Edit-Edit Large.jpeg',
        // Fourth batch
        'M68A9805-Edit Large.jpeg',
        'M68A9744-Edit-3 Large.jpeg',
        'M68A9567-Edit-2 Large.jpeg',
        'M68A9608-Edit-2 Large.jpeg',
        'M68A9628-Edit Large.jpeg',
        'M68A9158-Edit Large.jpeg',
        'M68A9120-Edit Large.jpeg',
        'M68A8976-Edit Large.jpeg',
        'M68A8807-Edit-2 Large.jpeg',
        'M68A8544-Edit Large.jpeg',
        'M68A8246-Edit Large.jpeg'
      ];

      // Get existing photos to avoid duplicates
      const existingPhotos = await db
        .select({ imageUrl: photos.imageUrl })
        .from(photos)
        .where(eq(photos.category, "Bat Mitsva"));

      const existingUrls = new Set(existingPhotos.map(p => p.imageUrl));

      // Filter out any photos that already exist
      const newPhotos = allBatMitsvaPhotos.filter(photo => !existingUrls.has(photo));

      // If there are new photos to add
      if (newPhotos.length > 0) {
        // Get the current maximum display order
        const lastPhoto = await db
          .select()
          .from(photos)
          .where(eq(photos.category, "Bat Mitsva"))
          .orderBy(desc(photos.displayOrder))
          .limit(1);

        const startOrder = lastPhoto.length > 0 ? lastPhoto[0].displayOrder + 1 : 1;

        // Insert new photos with continuing display order
        for (let i = 0; i < newPhotos.length; i++) {
          const photo = newPhotos[i];
          await db.insert(photos).values({
            title: photo.replace(/\.[^/.]+$/, ""),
            category: "Bat Mitsva",
            imageUrl: photo,
            displayOrder: startOrder + i
          });
        }

        // Ensure category exists
        await db.insert(categories)
          .values({ name: "Bat Mitsva", displayOrder: 1 })
          .onConflictDoNothing();

        res.json({ message: `Successfully imported ${newPhotos.length} new photos` });
      } else {
        res.json({ message: "No new photos to import" });
      }
    } catch (error) {
      console.error('Error importing photos:', error);
      res.status(500).json({ error: "Failed to import photos" });
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