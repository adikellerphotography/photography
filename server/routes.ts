import type { Express } from "express";
import { createServer, type Server } from "http";
import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "@db";
import { photos, categories, photoLikes } from "@db/schema";
import path from "path";
import express from "express";
import { scanAndProcessImages } from "./utils/scan-images";
import fs from "fs/promises";
import { addWatermark } from "./utils/watermark";

// Helper function to get the correct category path
const getCategoryPath = (categoryName: string) => {
  if (categoryName.toLowerCase() === 'kids') {
    return 'kids';
  }
  return categoryName.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('_');
};

// Configure static file serving
const configureStaticFiles = (app: Express) => {
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
};

// Route handlers
const getPhotos = async (req: express.Request, res: express.Response) => {
  try {
    const { category } = req.query;
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 20;

    if (category && typeof category === 'string') {
      const categoryExists = await db.select({ id: categories.id })
        .from(categories)
        .where(eq(categories.name, decodeURIComponent(category)))
        .limit(1);

      if (categoryExists.length === 0) {
        return res.status(404).json({ error: "Category not found" });
      }
    }

    const query = db.select()
      .from(photos)
      .where(category ? eq(photos.category, decodeURIComponent(category as string)) : undefined);

    const results = await query
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .orderBy(sql`RANDOM()`);

    const processedPhotos = results.map(photo => {
      const categoryPath = getCategoryPath(photo.category);
      const baseFileName = photo.imageUrl.split('/').pop();
      const thumbFileName = photo.thumbnailUrl?.split('/').pop();

      if (!baseFileName) {
        return null;
      }

      return {
        ...photo,
        imageUrl: `/assets/${categoryPath}/${baseFileName}`,
        thumbnailUrl: thumbFileName ? `/assets/${categoryPath}/${thumbFileName}` : undefined,
        isLiked: false
      };
    }).filter(Boolean);

    res.json(processedPhotos);
  } catch (error: any) {
    console.error('Error fetching photos:', error);
    res.status(500).json({ error: "Failed to fetch photos", details: error.message });
  }
};

const getCategories = async (_req: express.Request, res: express.Response) => {
  try {
    const validCategories = await db
      .select()
      .from(categories)
      .orderBy(categories.displayOrder);

    const categoriesWithPhotos = await Promise.all(
      validCategories.map(async (category) => {
        const categoryPhotos = await db
          .select()
          .from(photos)
          .where(eq(photos.category, category.name))
          .orderBy(desc(photos.displayOrder))
          .limit(1);

        const categoryPath = getCategoryPath(category.name);

        if (categoryPhotos[0]) {
          const baseFileName = categoryPhotos[0].imageUrl.split('/').pop();
          const thumbFileName = categoryPhotos[0].thumbnailUrl?.split('/').pop();

          if (!baseFileName) {
            return category;
          }

          return {
            ...category,
            firstPhoto: {
              imageUrl: `/assets/${categoryPath}/${baseFileName}`,
              thumbnailUrl: thumbFileName ? `/assets/${categoryPath}/${thumbFileName}` : undefined
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
};

const getBeforeAfterSets = async (_req: express.Request, res: express.Response) => {
  try {
    const beforeAfterPath = path.join(process.cwd(), 'attached_assets', 'before_and_after');
    const files = await fs.readdir(beforeAfterPath);

    const imageSets: { id: number; beforeImage: string; afterImage: string; title: string; }[] = [];
    const imageMap = new Map<string, string>();

    files.forEach(file => {
      if (file.endsWith(' Large.jpeg') || file.endsWith(' Large.jpg')) {
        const base = file.replace(/-[12] Large\.(jpeg|jpg)$/, '');
        imageMap.set(base, (imageMap.get(base) || '') + file);
      }
    });

    let id = 1;
    imageMap.forEach((_, key) => {
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
};

const scanPhotos = async (req: express.Request, res: express.Response) => {
  try {
    const targetPath = req.query.path ? path.join(process.cwd(), 'attached_assets', req.query.path as string) : undefined;
    await scanAndProcessImages(targetPath);
    res.json({ message: "Successfully scanned and processed all images" });
  } catch (error) {
    console.error('Error scanning images:', error);
    res.status(500).json({ error: "Failed to scan images" });
  }
};

const togglePhotoLike = async (req: express.Request, res: express.Response) => {
  try {
    const photoId = parseInt(req.params.id);
    const fingerprint = req.headers['x-browser-fingerprint'] as string;

    if (!fingerprint) {
      return res.status(400).json({ error: "Browser fingerprint required" });
    }

    const photo = await db.query.photos.findFirst({
      where: eq(photos.id, photoId)
    });

    if (!photo) {
      return res.status(404).json({ error: "Photo not found" });
    }

    const existingLike = await db.query.photoLikes.findFirst({
      where: and(
        eq(photoLikes.photoId, photoId),
        eq(photoLikes.ipAddress, fingerprint)
      )
    });

    if (existingLike) {
      await db.delete(photoLikes).where(eq(photoLikes.id, existingLike.id));
      res.json({ liked: false });
    } else {
      await db.insert(photoLikes).values({ 
        photoId,
        ipAddress: fingerprint 
      });
      res.json({ liked: true });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ error: "Failed to toggle like" });
  }
};

// Register all routes
export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);

  // Configure static file serving without watermark
  const assetsPath = path.join(process.cwd(), 'attached_assets');
  app.use('/assets', express.static(assetsPath, {
    setHeaders: (res, filePath) => {
      if (filePath.toLowerCase().endsWith('.jpg') || filePath.toLowerCase().endsWith('.jpeg')) {
        res.setHeader('Content-Type', 'image/jpeg');
      }
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
  }));

  // Add download endpoint with watermark
  app.get('/download/:category/:filename', async (req, res) => {
    try {
      const { category, filename } = req.params;
      const filePath = path.join(assetsPath, category, filename);
      const exists = await fs.access(filePath).then(() => true).catch(() => false);

      if (!exists) {
        return res.status(404).send('Image not found');
      }

      const watermarkedImage = await addWatermark(filePath, true); //Added true here to add watermark for downloads
      res.type('image/jpeg');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(watermarkedImage);
    } catch (error) {
      console.error('Error serving watermarked download:', error);
      res.status(500).send('Error processing image');
    }
  });

  // API Routes
  app.get("/api/photos", getPhotos);
  app.get("/api/categories", getCategories);
  app.get("/api/before-after", getBeforeAfterSets);
  app.post("/api/photos/scan", scanPhotos);
  app.post("/api/photos/:id/like", togglePhotoLike);

  // Watermarked photo route - removed watermarking
  app.get('/api/photos/:category/:filename', async (req, res) => {
    try {
      const { category, filename } = req.params;
      const imagePath = path.join(process.cwd(), 'attached_assets', category, filename);

      const exists = await fs.access(imagePath).then(() => true).catch(() => false);
      if (!exists) {
        return res.status(404).send('Image not found');
      }

      res.type('image/jpeg').sendFile(imagePath); // Removed watermarking here
    } catch (error) {
      console.error('Error serving image:', error);
      res.status(500).send('Error processing image');
    }
  });

  return httpServer;
}