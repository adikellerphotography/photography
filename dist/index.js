var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express3 from "express";

// server/routes.ts
import { createServer } from "http";
import { eq, and, sql as sql3 } from "drizzle-orm";

// db/index.ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

// db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  categories: () => categories,
  insertCategorySchema: () => insertCategorySchema,
  insertPhotoSchema: () => insertPhotoSchema,
  likes: () => likes,
  photoLikes: () => photoLikes,
  photos: () => photos,
  selectCategorySchema: () => selectCategorySchema,
  selectPhotoSchema: () => selectPhotoSchema
});
import { pgTable, text, serial, timestamp, varchar, integer } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
var likes = pgTable("likes", {
  id: serial("id").primaryKey(),
  photoId: integer("photo_id").references(() => photos.id),
  createdAt: timestamp("created_at").defaultNow()
});
var photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(),
  imageUrl: text("image_url").notNull().unique(),
  thumbnailUrl: text("thumbnail_url"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  displayOrder: integer("display_order").default(0).notNull(),
  likesCount: integer("likes_count").default(0)
});
var insertPhotoSchema = createInsertSchema(photos);
var selectPhotoSchema = createSelectSchema(photos);
var categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  description: text("description"),
  displayOrder: integer("display_order").notNull()
});
var photoLikes = pgTable("photo_likes", {
  id: serial("id").primaryKey(),
  photoId: integer("photo_id").references(() => photos.id, { onDelete: "cascade" }).notNull(),
  ipAddress: text("ip_address").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var insertCategorySchema = createInsertSchema(categories);
var selectCategorySchema = createSelectSchema(categories);

// db/index.ts
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var sql = neon(process.env.DATABASE_URL);
var db = drizzle(sql, { schema: schema_exports });

// server/routes.ts
import path2 from "path";
import express from "express";

// server/utils/scan-images.ts
import path from "path";
import fs from "fs/promises";
import { sql as sql2 } from "drizzle-orm";
async function scanDirectory(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const files = entries.filter((entry) => entry.isFile() && /\.(jpg|jpeg)$/i.test(entry.name)).map((entry) => entry.name);
  return files.sort();
}
async function scanGalleries(targetPath) {
  try {
    const assetsPath = targetPath || path.join(process.cwd(), "attached_assets", "galleries");
    console.log("\n=== Starting Image Scan ===");
    console.log("Assets path:", assetsPath);
    await db.delete(photos);
    await db.delete(categories);
    const entries = await fs.readdir(assetsPath, { withFileTypes: true });
    const dirs = entries.filter((entry) => entry.isDirectory() && !entry.name.startsWith(".")).map((entry) => entry.name);
    console.log("Found directories:", dirs);
    for (const [categoryIndex, dir] of dirs.entries()) {
      const displayName = dir.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
      await db.insert(categories).values({
        name: displayName,
        displayOrder: categoryIndex + 1,
        description: `${displayName} Photography Sessions`
      });
      const dirPath = path.join(assetsPath, dir);
      const imageFiles = await scanDirectory(dirPath);
      console.log(`Processing ${imageFiles.length} images in ${dir}`);
      for (const [imageIndex, imageFile] of imageFiles.entries()) {
        try {
          const baseName = path.parse(imageFile).name;
          const ext = path.parse(imageFile).ext.toLowerCase();
          const id = parseInt(baseName) || imageIndex + 1;
          const thumbName = `${baseName}-thumb${ext}`;
          const thumbExists = imageFiles.includes(thumbName);
          const imageUrl = `/photography/attached_assets/galleries/${dir}/${imageFile}`;
          const thumbnailUrl = thumbExists ? `/photography/attached_assets/galleries/${dir}/${thumbName}` : imageUrl;
          await db.insert(photos).values({
            id,
            title: `${displayName} Portrait Session`,
            category: displayName,
            imageUrl,
            thumbnailUrl,
            displayOrder: id
          }).onConflictDoUpdate({
            target: [photos.id],
            set: {
              imageUrl,
              thumbnailUrl,
              displayOrder: id
            }
          });
        } catch (error) {
          console.error(`Error processing ${imageFile}:`, error);
        }
      }
    }
    const photoCount = await db.select({ count: sql2`count(*)` }).from(photos);
    const categoryCount = await db.select({ count: sql2`count(*)` }).from(categories);
    console.log("=== Scan Complete ===");
    console.log(`Total photos in database: ${photoCount[0].count}`);
    console.log(`Total categories in database: ${categoryCount[0].count}`);
  } catch (error) {
    console.error("Error during image scan:", error);
    throw error;
  }
}

// server/routes.ts
import fs2 from "fs/promises";
var getCategoryPath = (categoryName) => {
  return categoryName.split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join("_");
};
var configureStaticFiles = (app) => {
  const assetsPath = path2.join(process.cwd(), "attached_assets");
  const staticOptions = {
    setHeaders: (res, filePath) => {
      if (filePath.toLowerCase().endsWith(".jpg") || filePath.toLowerCase().endsWith(".jpeg")) {
        res.setHeader("Content-Type", "image/jpeg");
      } else if (filePath.toLowerCase().endsWith(".png")) {
        res.setHeader("Content-Type", "image/png");
      }
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      res.setHeader("Accept-Ranges", "bytes");
      res.setHeader("Vary", "Accept-Encoding");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      res.setHeader("Cross-Origin-Resource-Policy", "same-site");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
      res.setHeader("Access-Control-Max-Age", "86400");
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Timing-Allow-Origin", "*");
    },
    maxAge: 31536e6,
    lastModified: true,
    etag: true,
    fallthrough: true,
    redirect: false,
    dotfiles: "ignore",
    index: false
  };
  app.use("/photography/attached_assets/galleries/:category/:filename", async (req, res, next) => {
    try {
      const { category, filename } = req.params;
      const categoryPath = decodeURIComponent(category).replace(/\s+/g, "_");
      const imagePath = path2.join(assetsPath, "galleries", categoryPath, filename);
      try {
        await fs2.access(imagePath, fs2.constants.R_OK);
        res.sendFile(imagePath, staticOptions);
      } catch {
        next();
      }
    } catch (error) {
      next(error);
    }
  });
  app.use("/photography/attached_assets", express.static(assetsPath, staticOptions));
  app.use("/assets", express.static(path2.join(assetsPath, "galleries"), staticOptions));
  app.use("/galleries", express.static(path2.join(assetsPath, "galleries"), staticOptions));
};
var getPhotos = async (req, res) => {
  try {
    const { category } = req.query;
    if (!category || typeof category !== "string") {
      return res.status(400).json({ error: "Category parameter is required" });
    }
    console.log("Fetching photos for category:", category);
    const decodedCategory = decodeURIComponent(category);
    console.log("Fetching photos for category:", decodedCategory);
    const categoryExists = await db.select({ id: categories.id }).from(categories).where(eq(categories.name, decodedCategory)).limit(1);
    if (categoryExists.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }
    const categoryPath = getCategoryPath(decodedCategory);
    const dirPath = path2.join(process.cwd(), "attached_assets", "galleries", categoryPath);
    let results = [];
    try {
      const files = await fs2.readdir(dirPath);
      const photoFiles = [];
      for (const file of files) {
        if ((file.endsWith(".jpeg") || file.endsWith(".jpg")) && !file.includes("-thumb")) {
          try {
            await fs2.access(path2.join(dirPath, file), fs2.constants.R_OK);
            photoFiles.push(file);
          } catch {
            continue;
          }
        }
      }
      photoFiles.sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || "0");
        const numB = parseInt(b.match(/\d+/)?.[0] || "0");
        return numA - numB;
      });
      results = photoFiles.map((file, index) => {
        const fileNum = parseInt(file.match(/\d+/)?.[0] || "0");
        return {
          id: fileNum,
          title: `${decodedCategory} Portrait Session`,
          category: decodedCategory,
          imageUrl: file,
          thumbnailUrl: file.replace(".jpeg", "-thumb.jpeg"),
          displayOrder: index + 1,
          likesCount: 0
        };
      });
    } catch (err) {
      console.error("Error reading directory:", err);
      results = [];
    }
    results.sort((a, b) => a.id - b.id);
    console.log("Fetched photos for category:", category, "Count:", results.length);
    const processedPhotos = await Promise.all(results.map(async (photo) => {
      const paddedId = String(photo.id).padStart(3, "0");
      const categoryPath2 = photo.category.replace(/\s+/g, "_");
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
    console.log("Processed photos:", processedPhotos);
    res.json(processedPhotos);
  } catch (error) {
    console.error("Error fetching photos:", error);
    res.status(500).json({ error: "Failed to fetch photos", details: error.message });
  }
};
var getCategories = async (_req, res) => {
  try {
    const validCategories = await db.select().from(categories).orderBy(categories.displayOrder);
    const categoriesWithPhotos = await Promise.all(
      validCategories.map(async (category) => {
        const categoryPhotos = await db.select().from(photos).where(eq(photos.category, category.name)).orderBy(sql3`RANDOM()`);
        const categoryPath = getCategoryPath(category.name);
        if (categoryPhotos[0]) {
          const baseFileName = categoryPhotos[0].imageUrl.split("/").pop();
          const thumbFileName = categoryPhotos[0].thumbnailUrl?.split("/").pop();
          if (!baseFileName) {
            return category;
          }
          return {
            ...category,
            firstPhoto: {
              imageUrl: `/assets/${categoryPath}/${baseFileName}`,
              thumbnailUrl: thumbFileName ? `/assets/${categoryPath}/${thumbFileName}` : void 0
            }
          };
        }
        return category;
      })
    );
    res.json(categoriesWithPhotos);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};
var getBeforeAfterSets = async (_req, res) => {
  try {
    const beforeAfterPath = path2.join(process.cwd(), "attached_assets", "before_and_after");
    const files = await fs2.readdir(beforeAfterPath);
    const imageSets = [];
    const imageMap = /* @__PURE__ */ new Map();
    files.forEach((file) => {
      if (file.endsWith(" Large.jpeg") || file.endsWith(" Large.jpg")) {
        const base = file.replace(/-[12] Large\.(jpeg|jpg)$/, "");
        imageMap.set(base, (imageMap.get(base) || "") + file);
      }
    });
    let id = 1;
    imageMap.forEach((_, key) => {
      const beforeFile = files.find((f) => f.startsWith(key) && f.includes("-1 Large"));
      const afterFile = files.find((f) => f.startsWith(key) && f.includes("-2 Large"));
      if (beforeFile && afterFile) {
        imageSets.push({
          id: id++,
          title: key.replace(/_/g, " "),
          beforeImage: `/assets/before_and_after/${encodeURIComponent(beforeFile)}`,
          afterImage: `/assets/before_and_after/${encodeURIComponent(afterFile)}`
        });
      }
    });
    res.json(imageSets);
  } catch (error) {
    console.error("Error fetching before/after images:", error);
    res.status(500).json({ error: "Failed to fetch before/after images", details: error.message });
  }
};
var scanPhotos = async (req, res) => {
  try {
    const targetPath = req.query.path ? path2.join(process.cwd(), "attached_assets", req.query.path) : void 0;
    await scanGalleries(targetPath);
    res.json({ message: "Successfully scanned and processed all images" });
  } catch (error) {
    console.error("Error scanning images:", error);
    res.status(500).json({ error: "Failed to scan images" });
  }
};
var togglePhotoLike = async (req, res) => {
  try {
    const photoId = parseInt(req.params.id);
    const fingerprint = req.headers["x-browser-fingerprint"];
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
    console.error("Error toggling like:", error);
    res.status(500).json({ error: "Failed to toggle like" });
  }
};
function registerRoutes(app) {
  const httpServer = createServer(app);
  configureStaticFiles(app);
  app.get("/version", (_req, res) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.json({ version: Date.now().toString() });
  });
  app.get("/download/:category/:filename", async (req, res) => {
    try {
      const { category, filename } = req.params;
      const filePath = path2.join(process.cwd(), "attached_assets", category, filename);
      res.download(filePath);
    } catch (error) {
      console.error("Error serving download:", error);
      res.status(500).send("Error processing image");
    }
  });
  app.get("/photography/attached_assets/galleries", getPhotos);
  app.get("/api/categories", getCategories);
  app.get("/api/before-after", getBeforeAfterSets);
  app.post("/photography/attached_assets/galleries/scan", scanPhotos);
  app.post("/photography/attached_assets/galleries/:id/like", togglePhotoLike);
  app.get("/photography/attached_assets/galleries/:category/:filename", async (req, res) => {
    try {
      const { category, filename } = req.params;
      const categoryPath = decodeURIComponent(category).replace(/\s+/g, "_");
      const commonHeaders = {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
        "Cross-Origin-Resource-Policy": "cross-origin",
        "Content-Type": "image/jpeg",
        "Vary": "Accept-Encoding"
      };
      const baseDir = path2.join(process.cwd(), "attached_assets", "galleries", categoryPath);
      try {
        const files = await fs2.readdir(baseDir);
        const actualFile = files.find(
          (file) => file.toLowerCase() === filename.toLowerCase()
        );
        if (actualFile) {
          const imagePath = path2.join(baseDir, actualFile);
          await fs2.access(imagePath, fs2.constants.R_OK);
          console.log("Serving image from:", imagePath);
          res.set(commonHeaders).sendFile(imagePath);
          return;
        }
        res.status(404).json({
          error: "Image not found",
          path: filename
        });
      } catch (err) {
        console.error(`Error serving image: ${filename}`, err);
        res.status(404).json({
          error: "Image not found",
          path: filename
        });
      }
    } catch (error) {
      console.error("Error serving image:", error);
      res.status(500).json({
        error: "Error processing image",
        details: error.message
      });
    }
  });
  app.get("/api/sessions/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const categoryMappings = {
        "Bat_Mitzvah": "bat_mitzvah",
        "Bar_Mitzvah": "bar_mitzvah",
        "Women": "feminine",
        "Kids": "kids",
        "Family": "family",
        "Big Family": "big_family",
        "Horses": "horses",
        "Modeling": "modeling",
        "Sweet 16": "sweet_16",
        "Purim": "purim",
        "Pregnancy": "pregnancy",
        "Yoga": "yoga",
        "Artful Nude": "artful_nude",
        "Femininity": "femininity"
      };
      const folderName = categoryMappings[category] || category.toLowerCase().replace(" ", "_");
      const dirPath = path2.join(process.cwd(), "attached_assets", "galleries", folderName);
      try {
        const files = await fs2.readdir(dirPath);
        const imageFiles = files.filter((file) => /\.(jpg|jpeg)$/i.test(file)).sort((a, b) => parseInt(a) - parseInt(b));
        const baseUrl = req.protocol + "://" + req.get("host");
        const images = imageFiles.map((file) => ({
          number: parseInt(file.replace(/\D/g, "")),
          url: `${baseUrl}/assets/facebook_posts_image/${folderName}/${file}`
        }));
        res.json(images);
      } catch (err) {
        console.error("Error reading directory:", err);
        res.status(404).json({ error: "Category not found" });
      }
    } catch (error) {
      console.error("Error fetching session images:", error);
      res.status(500).json({ error: "Failed to fetch session images" });
    }
  });
  app.use("/assets", express.static(path2.join(process.cwd(), "attached_assets")));
  app.use("/assets/galleries", express.static(path2.join(process.cwd(), "attached_assets/galleries")));
  app.use("/assets/facebook_posts_image", express.static(path2.join(process.cwd(), "attached_assets/facebook_posts_image")));
  app.use("/api/static", express.static(path2.join(process.cwd(), "attached_assets")));
  return httpServer;
}

// server/vite.ts
import express2 from "express";
import fs3 from "fs";
import path4, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path3, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  base: "/",
  plugins: [react(), runtimeErrorOverlay(), themePlugin()],
  resolve: {
    alias: {
      "@": path3.resolve(__dirname, "client", "src"),
      "@shared": path3.resolve(__dirname, "shared")
    }
  },
  root: path3.resolve(__dirname, "client"),
  build: {
    outDir: path3.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app, server) {
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: {
      middlewareMode: true,
      hmr: { server }
    },
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path4.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs3.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(`src="/src/main.tsx"`, `src="/src/main.tsx?v=${nanoid()}"`);
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = path4.resolve(__dirname2, "public");
  if (!fs3.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express2.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path4.resolve(distPath, "index.html"));
  });
}

// server/index.ts
import path5 from "path";
var setupMiddleware = (app) => {
  app.use(express3.json());
  app.use(express3.urlencoded({ extended: false }));
  app.use((_req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    next();
  });
  app.use((req, res, next) => {
    const start = Date.now();
    const path6 = req.path;
    let capturedJsonResponse;
    const originalResJson = res.json;
    res.json = function(bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };
    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path6.startsWith("/api")) {
        let logLine = `${req.method} ${path6} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }
        if (logLine.length > 80) {
          logLine = logLine.slice(0, 79) + "\u2026";
        }
        log(logLine);
      }
    });
    next();
  });
};
var setupErrorHandler = (app) => {
  app.use((err, _req, res, _next) => {
    console.error("\u{1F534} Server error:", {
      message: err.message,
      stack: err.stack,
      status: err.status || err.statusCode,
      details: err.details || err.errors || "No additional details"
    });
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({
      message,
      status,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
};
var initializeServer = async () => {
  try {
    const app = express3();
    setupMiddleware(app);
    const server = registerRoutes(app);
    setupErrorHandler(app);
    if (process.env.NODE_ENV === "production") {
      serveStatic(app);
      const staticOptions = {
        maxAge: "1y",
        etag: true,
        lastModified: true,
        setHeaders: (res) => {
          res.setHeader("Cache-Control", "public, max-age=31536000");
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
        }
      };
      app.use("/assets", express3.static(path5.join(process.cwd(), "attached_assets", "galleries"), staticOptions));
      app.use("/assets/before_and_after", express3.static(path5.join(process.cwd(), "attached_assets", "before_and_after"), staticOptions));
      app.use("/assets/facebook_posts_image", express3.static(path5.join(process.cwd(), "attached_assets", "facebook_posts_image"), staticOptions));
      log("\u{1F680} Running in production mode");
    } else {
      await setupVite(app, server);
      log("\u{1F6E0}\uFE0F Running in development mode");
    }
    const PORT = parseInt(process.env.PORT || "5000", 10);
    server.listen(PORT, "0.0.0.0", () => {
      log(`\u2728 Server running on port ${PORT}`);
      log(`\u{1F30D} Environment: ${process.env.NODE_ENV || "development"}`);
    });
    return server;
  } catch (error) {
    console.error("\u274C Failed to start server:", error);
    process.exit(1);
  }
};
initializeServer();
