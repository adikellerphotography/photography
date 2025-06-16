import type { Express } from "express";
import { createServer, type Server } from "http";
import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "@db";
import { photos, categories, photoLikes } from "@db/schema";
import path from "path";
import express from "express";
import { scanGalleries } from "./utils/scan-images";
import fs from "fs/promises";


// Helper function to get the correct category path
const getCategoryPath = (categoryName: string) => {
  return categoryName.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('_');
};

// Configure static file serving
const configureStaticFiles = (app: Express) => {
  const assetsPath = path.join(process.cwd(), 'attached_assets');
  const staticOptions = {
    setHeaders: (res: express.Response, filePath: string) => {
      if (filePath.toLowerCase().endsWith('.jpg') || filePath.toLowerCase().endsWith('.jpeg')) {
        res.setHeader('Content-Type', 'image/jpeg');
      } else if (filePath.toLowerCase().endsWith('.png')) {
        res.setHeader('Content-Type', 'image/png');
      }
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Vary', 'Accept-Encoding');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Max-Age', '86400');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Timing-Allow-Origin', '*');
    },
    maxAge: 31536000000,
    lastModified: true,
    etag: true,
    fallthrough: true,
    redirect: false,
    dotfiles: 'ignore',
    index: false
  };

  // Primary path for gallery images
  app.use('/api/photos/:category/:filename', async (req, res, next) => {
    try {
      const { category, filename } = req.params;
      const categoryPath = decodeURIComponent(category).replace(/\s+/g, '_');
      const imagePath = path.join(assetsPath, 'galleries', categoryPath, filename);

      try {
        await fs.access(imagePath, fs.constants.R_OK);
        res.sendFile(imagePath, staticOptions);
      } catch {
        next();
      }
    } catch (error) {
      next(error);
    }
  });

  // Serve files from multiple paths to ensure availability
  app.use('/attached_assets', express.static(assetsPath, staticOptions));
  app.use('/assets', express.static(path.join(assetsPath, 'galleries'), staticOptions));
  app.use('/galleries', express.static(path.join(assetsPath, 'galleries'), staticOptions));
};

// Route handlers
const getPhotos = async (req: express.Request, res: express.Response) => {
  try {
    const { category } = req.query;

    if (!category || typeof category !== 'string') {
      return res.status(400).json({ error: "Category parameter is required" });
    }

    console.log('Fetching photos for category:', category);

    const decodedCategory = decodeURIComponent(category);
    console.log('Fetching photos for category:', decodedCategory);

    const categoryExists = await db.select({ id: categories.id })
      .from(categories)
      .where(eq(categories.name, decodedCategory))
      .limit(1);

    if (categoryExists.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    const categoryPath = getCategoryPath(decodedCategory);
    const dirPath = path.join(process.cwd(), 'attached_assets', 'galleries', categoryPath);
    let results = [];

    try {
      const files = await fs.readdir(dirPath);
      const photoFiles = [];

      for (const file of files) {
        if ((file.endsWith('.jpeg') || file.endsWith('.jpg')) && !file.includes('-thumb')) {
          try {
            await fs.access(path.join(dirPath, file), fs.constants.R_OK);
            photoFiles.push(file);
          } catch {
            continue;
          }
        }
      }

      photoFiles.sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || '0');
        const numB = parseInt(b.match(/\d+/)?.[0] || '0');
        return numA - numB;
      });

      results = photoFiles.map((file, index) => {
        const fileNum = parseInt(file.match(/\d+/)?.[0] || '0');
        return {
          id: fileNum,
          title: `${decodedCategory} Portrait Session`,
          category: decodedCategory,
          imageUrl: file,
          thumbnailUrl: file.replace('.jpeg', '-thumb.jpeg'),
          displayOrder: index + 1,
          likesCount: 0
        };
      });
    } catch (err) {
      console.error('Error reading directory:', err);
      results = [];
    }


    // Sort results by ID to ensure correct order
    results.sort((a, b) => a.id - b.id);

    console.log('Fetched photos for category:', category, 'Count:', results.length);

    const processedPhotos = await Promise.all(results.map(async (photo) => {
      const paddedId = String(photo.id).padStart(3, '0');
      const categoryPath = photo.category.replace(/\s+/g, '_');
      const imageUrl = `${paddedId}.jpeg`;
      const thumbnailUrl = `${paddedId}-thumb.jpeg`;
      return {
        ...photo,
        id: photo.id,
        title: photo.title || `${category} Portrait Session`,
        category: photo.category,
        imageUrl,
        thumbnailUrl,
        displayOrder: photo.displayOrder || photo.id,
        likesCount: photo.likesCount || 0,
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
          .orderBy(sql`RANDOM()`); // Changed to random order

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
    await scanGalleries(targetPath);
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

  // Version endpoint for cache busting
  app.get('/version', (_req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.json({ version: Date.now().toString() });
  });

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
  app.get("/api/before-after", getBeforeAfterSets);
  app.post("/api/photos/scan", scanPhotos);
  app.post("/api/photos/:id/like", togglePhotoLike);
  app.get('/api/photos/:category/:filename', async (req, res) => {
    try {
      const { category, filename } = req.params;
      const categoryPath = decodeURIComponent(category).replace(/\s+/g, '_');

      const commonHeaders = {
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
        'Cross-Origin-Resource-Policy': 'cross-origin',
        'Content-Type': 'image/jpeg',
        'Vary': 'Accept-Encoding'
      };

      // Always use galleries path
      const baseDir = path.join(process.cwd(), 'attached_assets', 'galleries', categoryPath);

      try {
        // Get actual files in directory
        const files = await fs.readdir(baseDir);

        // Try to find case-insensitive match
        const actualFile = files.find(file => 
          file.toLowerCase() === filename.toLowerCase()
        );

        if (actualFile) {
          const imagePath = path.join(baseDir, actualFile);
          await fs.access(imagePath, fs.constants.R_OK);
          console.log('Serving image from:', imagePath);
          res.set(commonHeaders).sendFile(imagePath);
          return;
        }

        res.status(404).json({ 
          error: 'Image not found',
          path: filename
        });
      } catch (err) {
        console.error(`Error serving image: ${filename}`, err);
        res.status(404).json({ 
          error: 'Image not found',
          path: filename
        });
      }

    } catch (error) {
      console.error('Error serving image:', error);
      res.status(500).json({ 
        error: 'Error processing image',
        details: error.message 
      });
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
        'Yoga': 'yoga',
        'Artful Nude': 'artful_nude',
        'Femininity': 'femininity'
      };

      const folderName = categoryMappings[category] || category.toLowerCase().replace(' ', '_');
      const dirPath = path.join(process.cwd(), 'attached_assets', 'galleries', folderName);

      try {
        const files = await fs.readdir(dirPath);
        const imageFiles = files
          .filter(file => /\.(jpg|jpeg)$/i.test(file))
          .sort((a, b) => parseInt(a) - parseInt(b));

        const baseUrl = req.protocol + '://' + req.get('host');
        const images = imageFiles.map(file => ({
          number: parseInt(file.replace(/\D/g, '')),
          url: `${baseUrl}/assets/facebook_posts_image/${folderName}/${file}`
        }));
        res.json(images);
      } catch (err) {
        console.error('Error reading directory:', err);
        res.status(404).json({ error: "Category not found" });
      }
    } catch (error) {
      console.error('Error fetching session images:', error);
      res.status(500).json({ error: "Failed to fetch session images" });
    }
  });

  // Serve static assets
  app.use('/assets', express.static(path.join(process.cwd(), 'attached_assets')));
  app.use('/assets/galleries', express.static(path.join(process.cwd(), 'attached_assets/galleries')));
  app.use('/assets/facebook_posts_image', express.static(path.join(process.cwd(), 'attached_assets/facebook_posts_image')));
  app.use('/api/static', express.static(path.join(process.cwd(), 'attached_assets')));

  return httpServer;
}