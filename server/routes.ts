import type { Express } from "express";
import { createServer, type Server } from "http";
import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "@db";
import { photos, categories, photoLikes, users, userFavorites } from "@db/schema";
import path from "path";
import express from "express";
import session from "express-session";
import passport from "passport";
import bcrypt from "bcryptjs";
import MemoryStore from "memorystore";
import { isAuthenticated } from "./middleware/auth";
import "./middleware/auth";  // Initialize passport configuration

const SessionStore = MemoryStore(session);

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);

  // Session configuration
  app.use(session({
    store: new SessionStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Initialize passport and restore authentication state from session
  app.use(passport.initialize());
  app.use(passport.session());

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password } = req.body;

      // Check if user already exists
      const existingUser = await db.query.users.findFirst({
        where: eq(users.username, username),
      });

      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const [user] = await db.insert(users)
        .values({ username, password: hashedPassword })
        .returning();

      // Log the user in
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error logging in after registration" });
        }
        return res.json({ id: user.id, username: user.username });
      });
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  app.post("/api/auth/login", passport.authenticate('local'), (req, res) => {
    const user = req.user as any;
    res.json({ id: user.id, username: user.username });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/user", (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = req.user as any;
    res.json({ id: user.id, username: user.username });
  });

  // Likes and favorites routes
  app.post("/api/photos/:id/like", isAuthenticated, async (req, res) => {
    try {
      const photoId = parseInt(req.params.id);
      const userId = (req.user as any).id;

      // Check if the user has already liked this photo
      const existingLike = await db
        .select()
        .from(photoLikes)
        .where(
          and(
            eq(photoLikes.photoId, photoId),
            eq(photoLikes.userId, userId)
          )
        );

      if (existingLike.length > 0) {
        // Unlike: Remove the like
        await db
          .delete(photoLikes)
          .where(
            and(
              eq(photoLikes.photoId, photoId),
              eq(photoLikes.userId, userId)
            )
          );

        // Update likes count
        const photo = await db.query.photos.findFirst({
          where: eq(photos.id, photoId),
        });

        if (photo) {
          await db
            .update(photos)
            .set({ likesCount: Math.max(0, photo.likesCount - 1) })
            .where(eq(photos.id, photoId));
        }

        res.json({ liked: false });
      } else {
        // Like: Add new like
        await db.insert(photoLikes).values({
          photoId,
          userId,
        });

        // Update likes count
        const photo = await db.query.photos.findFirst({
          where: eq(photos.id, photoId),
        });

        if (photo) {
          await db
            .update(photos)
            .set({ likesCount: photo.likesCount + 1 })
            .where(eq(photos.id, photoId));
        }

        res.json({ liked: true });
      }
    } catch (error) {
      console.error('Error handling photo like:', error);
      res.status(500).json({ error: "Failed to process like" });
    }
  });

  app.post("/api/photos/:id/favorite", isAuthenticated, async (req, res) => {
    try {
      const photoId = parseInt(req.params.id);
      const userId = (req.user as any).id;

      // Check if the photo is already favorited
      const existingFavorite = await db
        .select()
        .from(userFavorites)
        .where(
          and(
            eq(userFavorites.photoId, photoId),
            eq(userFavorites.userId, userId)
          )
        );

      if (existingFavorite.length > 0) {
        // Remove from favorites
        await db
          .delete(userFavorites)
          .where(
            and(
              eq(userFavorites.photoId, photoId),
              eq(userFavorites.userId, userId)
            )
          );

        res.json({ favorited: false });
      } else {
        // Add to favorites
        await db.insert(userFavorites).values({
          photoId,
          userId,
        });

        res.json({ favorited: true });
      }
    } catch (error) {
      console.error('Error handling favorite:', error);
      res.status(500).json({ error: "Failed to process favorite" });
    }
  });

  app.get("/api/user/favorites", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const favorites = await db
        .select({
          id: photos.id,
          title: photos.title,
          description: photos.description,
          category: photos.category,
          imageUrl: photos.imageUrl,
          thumbnailUrl: photos.thumbnailUrl,
          uploadedAt: photos.uploadedAt,
          likesCount: photos.likesCount,
        })
        .from(userFavorites)
        .innerJoin(photos, eq(userFavorites.photoId, photos.id))
        .where(eq(userFavorites.userId, userId))
        .orderBy(desc(userFavorites.createdAt));

      res.json(favorites);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      res.status(500).json({ error: "Failed to fetch favorites" });
    }
  });

  // Get all photos with optional category filter and pagination
  app.get("/api/photos", async (req, res) => {
    try {
      const { category } = req.query;
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 20;

      // Build query with category filter
      const baseQuery = category && typeof category === 'string'
        ? db.select().from(photos).where(eq(photos.category, category))
        : db.select().from(photos);

      // Execute query with pagination and random ordering
      const results = await baseQuery
        .limit(pageSize)
        .offset((page - 1) * pageSize)
        .orderBy(sql`RANDOM()`);

      // Get likes for each photo for the current user
      const photosWithLikes = await Promise.all(
        results.map(async (photo) => {
          const liked = await db
            .select()
            .from(photoLikes)
            .where(
              and(
                eq(photoLikes.photoId, photo.id),
                eq(photoLikes.userId, (req.user as any)?.id) //Use userId if authenticated
              )
            );

          // Replace spaces with underscores in category name for URLs
          const categoryPath = photo.category.replace(/\s+/g, '_');

          return {
            ...photo,
            imageUrl: `/assets/${categoryPath}/${photo.imageUrl}`,
            thumbnailUrl: photo.thumbnailUrl ?
              `/assets/${categoryPath}/${photo.thumbnailUrl}` :
              undefined,
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

  // Serve static files from attached_assets and its subdirectories
  const assetsPath = path.join(process.cwd(), 'attached_assets');
  app.use('/assets', express.static(assetsPath, {
    setHeaders: (res, filePath) => {
      // Set proper content type for images
      if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
        res.setHeader('Content-Type', 'image/jpeg');
      } else if (filePath.endsWith('.png')) {
        res.setHeader('Content-Type', 'image/png');
      }
    }
  }));

  return httpServer;
}