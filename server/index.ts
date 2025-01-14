import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import fs from "fs/promises";
import { initialize as initializeDb } from "@db";

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add CORS headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Ensure required directories exist
const ensureDirectories = async () => {
  const assetsPath = path.join(process.cwd(), 'attached_assets');
  const categoriesPath = path.join(assetsPath, 'categories');
  const beforeAfterPath = path.join(assetsPath, 'before_and_after');

  try {
    await fs.access(assetsPath);
    await fs.access(categoriesPath).catch(() => fs.mkdir(categoriesPath, { recursive: true }));
    await fs.access(beforeAfterPath).catch(() => fs.mkdir(beforeAfterPath, { recursive: true }));
    console.log('Required directories verified/created');
  } catch (err) {
    console.log('Creating required directories...');
    await fs.mkdir(assetsPath, { recursive: true });
    await fs.mkdir(categoriesPath, { recursive: true });
    await fs.mkdir(beforeAfterPath, { recursive: true });
  }
};

// Start server
(async () => {
  try {
    // Initialize database first
    await initializeDb();

    // Ensure directories exist before starting the server
    await ensureDirectories();

    const server = registerRoutes(app);

    if (process.env.NODE_ENV !== "production") {
      // In development mode, use Vite's dev server
      await setupVite(app, server);
    } else {
      // In production mode, serve static files
      serveStatic(app);
    }

    const PORT = parseInt(process.env.PORT || '5000', 10);
    server.listen(PORT, "0.0.0.0", () => {
      log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();