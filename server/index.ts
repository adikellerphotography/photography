import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { db } from "@db";
import { sql } from "drizzle-orm";

const app = express();

// Basic middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add CORS headers for development
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Logging middleware with improved error handling
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    try {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    } catch (error) {
      console.error('Error in json response:', error);
      next(error);
    }
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        try {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        } catch (error) {
          console.error('Error stringifying response:', error);
        }
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

const initializeServer = async () => {
  try {
    // Register API routes
    const server = registerRoutes(app);

    // Global error handler with improved logging
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error('🔴 Server error:', {
        message: err.message,
        stack: err.stack,
        status: err.status || err.statusCode
      });
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({
        message,
        status,
        timestamp: new Date().toISOString()
      });
    });

    // Setup static file serving with improved error handling
    if (process.env.NODE_ENV === "production") {
      serveStatic(app);
      log("🚀 Running in production mode");
    } else {
      await setupVite(app, server);
      log("🛠️ Running in development mode");
    }

    const PORT = parseInt(process.env.PORT || "5000", 10);

    server.listen(PORT, "0.0.0.0", () => {
      log(`✨ Server running on port ${PORT}`);
      log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Test database connection
    try {
      await db.execute(sql`SELECT 1`);
      log("✅ Database connection successful");
    } catch (error) {
      console.error("❌ Database connection failed:", error);
    }

    return server;
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Start the server
initializeServer();