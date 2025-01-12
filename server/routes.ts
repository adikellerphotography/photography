import type { Express } from "express";
import { createServer } from "http";
import { eq } from "drizzle-orm";
import { db } from "@db";
import { photos, categories } from "@db/schema";
import path from "path";
import express from "express"; // Added import for express

export function registerRoutes(app: Express) {
  const httpServer = createServer(app);

  // Serve static files from attached_assets
  app.use('/assets', express.static(path.join(process.cwd(), 'attached_assets')));

  // Get all photos with optional category filter and pagination
  app.get("/api/photos", async (req, res) => {
    const { category, page = 1, pageSize = 10 } = req.query;

    try {
      let query = db.select().from(photos);

      if (category) {
        query = query.where(eq(photos.category, category as string));
      }

      const offset = ((Number(page) || 1) - 1) * Number(pageSize);
      query = query
        .limit(Number(pageSize))
        .offset(offset)
        .orderBy(photos.displayOrder);

      const results = await query;
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch photos" });
    }
  });

  // Get all categories
  app.get("/api/categories", async (_req, res) => {
    try {
      const results = await db.select().from(categories).orderBy(categories.displayOrder);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  return httpServer;
}