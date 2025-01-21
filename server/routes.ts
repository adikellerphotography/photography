import type { Express } from "express";
import { createServer, type Server } from "http";
import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "@db";
import { photos, categories, photoLikes } from "@db/schema";
import path from "path";
import express from "express";
import { scanImages } from "./utils/scan-images";
import fs from "fs/promises";
import router from './routes-api';


// Helper function to get the correct category path
const getCategoryPath = (categoryName: string) => {
  const categoryMappings: Record<string, string> = {
    'kids': 'kids',
    'Bat Mitsva': 'Bat_Mitsva',
    'Family': 'Family',
    'Horses': 'Horses',
    'Modeling': 'Modeling',
    'Women': 'Women',
    'Yoga': 'Yoga'
  };
  return categoryMappings[categoryName] || categoryName.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('_');
};

// Configure static file serving
const configureStaticFiles = (app: Express) => {
  const assetsPath = path.join(process.cwd(), 'attached_assets');
  app.use('/attached_assets', express.static(assetsPath, {
    setHeaders: (res, filePath) => {
      if (filePath.toLowerCase().endsWith('.jpg') || filePath.toLowerCase().endsWith('.jpeg')) {
        res.setHeader('Content-Type', 'image/jpeg');
      } else if (filePath.toLowerCase().endsWith('.png')) {
        res.setHeader('Content-Type', 'image/png');
      }
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // Added immutable caching
    },
    dotfiles: 'ignore',
    fallthrough: true,
    index: false
  }));
};

// Route handlers
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
    await scanImages(targetPath);
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

  // Configure static file serving  - Enhanced for better caching
  configureStaticFiles(app);

  // Add download endpoint - simple file serve
  app.get('/download/:category/:filename', async (req, res) => {
    try {
      const { category, filename } = req.params;
      const filePath = path.join(process.cwd(), 'attached_assets', category, filename);
      res.download(filePath);
    } catch (error) {
      console.error('Error serving download:', error);
      res.status(500).send('Error processing image');
    }
  });

  app.use(router);


  app.get('/api/photos/:category/:filename', async (req, res) => {
    try {
      const { category, filename } = req.params;
      const noWatermark = req.query.no_watermark === 'true';
      let imagePath = path.join(process.cwd(), 'attached_assets', category, filename);

      // Attempt to find non-watermarked version if available
      if (noWatermark) {
        const nonWatermarkedPath = path.join(process.cwd(), 'attached_assets', category, 'nowatermark', filename);
        try {
          await fs.access(nonWatermarkedPath);
          imagePath = nonWatermarkedPath;
        } catch (err) {
          // Ignore error if non-watermarked version is not found
        }
      }

      const exists = await fs.access(imagePath).then(() => true).catch(() => false);
      if (!exists) {
        return res.status(404).send('Image not found');
      }

      res.type('image/jpeg').sendFile(imagePath, {
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable', // Added immutable caching
          'Content-Type': 'image/jpeg'
        }
      });
    } catch (error) {
      console.error('Error serving image:', error);
      res.status(500).send('Error processing image');
    }
  });

  app.get("/api/before-after", getBeforeAfterSets);
  app.post("/api/photos/scan", scanPhotos);
  app.post("/api/photos/:id/like", togglePhotoLike);

  return httpServer;
}