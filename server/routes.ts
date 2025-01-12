import type { Express } from "express";
import { createServer, type Server } from "http";
import { eq, and } from "drizzle-orm";
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

      let query = db.select().from(photos);

      if (category && typeof category === 'string') {
        query = query.where(eq(photos.category, category));
      }

      const offset = (page - 1) * pageSize;
      const results = await query
        .limit(pageSize)
        .offset(offset)
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
          .set({
            likesCount: photos.likesCount - 1,
          })
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
          .set({
            likesCount: photos.likesCount + 1,
          })
          .where(eq(photos.id, photoId));

        res.json({ liked: true });
      }
    } catch (error) {
      console.error('Error handling photo like:', error);
      res.status(500).json({ error: "Failed to process like" });
    }
  });

  // Initial photo import
  app.post("/api/photos/import", async (_req, res) => {
    try {
      // First clear existing photos
      await db.delete(photos);

      // Define Bat Mitsva photos
      const batMitsvaPhotos = [
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
        '0Z9A1019-Edit-Edit-2 Large.jpeg'
      ];

      // Shuffle the photos array for random order
      const shuffledPhotos = [...batMitsvaPhotos].sort(() => Math.random() - 0.5);

      // Insert photos with random display order
      for (const [index, photo] of shuffledPhotos.entries()) {
        await db.insert(photos).values({
          title: photo.replace(/\.[^/.]+$/, ""),
          category: "Bat Mitsva",
          imageUrl: photo,
          displayOrder: index + 1,
          likesCount: 0
        });
      }

      // Ensure category exists
      await db.insert(categories).values([
        { name: "Bat Mitsva", displayOrder: 1 }
      ]).onConflictDoNothing();

      res.json({ message: "Photos imported successfully" });
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