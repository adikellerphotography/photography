import type { Express } from "express";
import { createServer, type Server } from "http";
import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "@db";
import { photos, categories, photoLikes } from "@db/schema";
import path from "path";
import express from "express";
import { scanImages } from "./utils/scan-images";
import fs from "fs/promises";


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
const getPhotos = async (req: express.Request, res: express.Response) => {
  try {
    const { category } = req.query;

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
      .where(category ? eq(photos.category, decodeURIComponent(category as string)) : undefined)
      .orderBy(photos.displayOrder);

    const results = await query;

    // If no results in database or results are incomplete, scan directory
    if (category) {
      const categoryPath = getCategoryPath(category);
      const dirPath = path.join(process.cwd(), 'attached_assets', categoryPath);
      try {
        const files = await fs.readdir(dirPath);
        const photoFiles = files
          .filter(f => (f.endsWith('.jpeg') || f.endsWith('.jpg')) && !f.includes('-thumb'))
          .sort((a, b) => {
            const numA = parseInt(a.match(/\d+/)?.[0] || '0');
            const numB = parseInt(b.match(/\d+/)?.[0] || '0');
            return numA - numB;
          });

        // Create entries for any missing photos
        for (let i = 0; i < photoFiles.length; i++) {
          const fileNum = i + 1;
          const paddedId = String(fileNum).padStart(3, '0');
          const exists = results.some(photo => photo.id === fileNum);

          if (!exists) {
            const newPhoto = {
              id: fileNum,
              title: `${category} Portrait Session`,
              category: category,
              imageUrl: `/assets/${categoryPath}/${paddedId}.jpeg`,
              thumbnailUrl: `/assets/${categoryPath}/${paddedId}-thumb.jpeg`,
              displayOrder: fileNum,
              likesCount: 0
            };
            results.push(newPhoto);
          }
        }
      } catch (err) {
        console.error('Error reading directory:', err);
      }
    }

    // Sort results by ID to ensure correct order
    results.sort((a, b) => a.id - b.id);

    console.log('Fetched photos for category:', category, 'Count:', results.length);

    const processedPhotos = await Promise.all(results.map(async (photo) => {
      const paddedId = String(photo.id).padStart(3, '0');
      const categoryPath = getCategoryPath(photo.category);
      const imageUrl = `/assets/${categoryPath}/${paddedId}.jpeg`;
      const thumbnailUrl = `/assets/${categoryPath}/${paddedId}-thumb.jpeg`;
      return {
        ...photo,
        imageUrl,
        thumbnailUrl,
        isLiked: false
      };
    }));

    console.log('Processed photos:', processedPhotos);
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

  // API Routes
  app.get("/api/photos", getPhotos);
  app.get("/api/categories", getCategories);
  app.get("/api/before-after", async (_req, res) => {
    try {
      const beforeAfterPath = path.join(process.cwd(), 'attached_assets', 'before_and_after');
      const files = await fs.readdir(beforeAfterPath);

      const imageSets = [];
      const imageMap = new Map();

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
    } catch (error) {
      console.error('Error fetching before/after images:', error);
      res.status(500).json({ error: "Failed to fetch before/after images" });
    }
  });
  app.post("/api/photos/scan", scanPhotos);
  app.post("/api/photos/:id/like", togglePhotoLike);

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

  app.get("/api/sessions/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const categoryMappings: Record<string, string> = {
        'Bat_Mitsva': 'bat_mitsva',
        'Bar_Mitsva': 'bar_mitsva',
        'Women': 'feminine',
        'Kids': 'kids',
        'Family': 'family',
        'Big Family': 'big_family',
        'Horses': 'horses',
        'Modeling': 'modeling',
        'Sweet 16': 'sweet_16',
        'Purim': 'purim',
        'Pregnancy': 'pregnancy',
        'Yoga': 'yoga'
      };

      const folderName = categoryMappings[category] || category.toLowerCase().replace(' ', '_');
      const dirPath = path.join(process.cwd(), 'attached_assets', 'facebook_posts_image', folderName); // Corrected path

      const files = await fs.readdir(dirPath);
      const imageFiles = files.filter(file => /\.(jpg|jpeg)$/i.test(file));
      const images = imageFiles.map(file => ({
        number: parseInt(file.replace(/\D/g, '')),
        url: `/attached_assets/facebook_posts_image/${folderName}/${file}` // Corrected path
      }));
      res.json(images);
    } catch (error) {
      console.error('Error fetching session images:', error);
      res.status(500).json({ error: "Failed to fetch session images" });
    }
  });

  return httpServer;
}