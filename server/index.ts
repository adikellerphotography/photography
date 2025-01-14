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

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Test database connection before anything else
    console.log("Testing database connection...");
    console.log("Database URL configured:", !!process.env.DATABASE_URL);
    console.log("Database host:", process.env.PGHOST);
    console.log("Database port:", process.env.PGPORT);

    // Verify database connection with retries
    let connected = false;
    let retries = 3;
    let lastError: Error | null = null;

    while (!connected && retries > 0) {
      try {
        const result = await db.execute(sql`SELECT 1`);
        if (result) {
          connected = true;
          log("Database connection successful");
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`Database connection attempt failed (${retries} retries left):`, lastError.message);
        retries--;
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
        }
      }
    }

    if (!connected) {
      throw new Error(`Failed to connect to database after multiple attempts. Last error: ${lastError?.message || 'Unknown error'}`);
    }

    // Register API routes before setting up Vite
    const server = registerRoutes(app);

    // Global error handler with improved logging
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error('Server error:', {
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

    // Setup static file serving or development server
    if (process.env.NODE_ENV === "production") {
      serveStatic(app);
      log("Running in production mode");
    } else {
      await setupVite(app, server);
      log("Running in development mode");
    }

    // Use port 5000 as specified in .replit
    const PORT = parseInt(process.env.PORT || "5000", 10);

    server.listen(PORT, "0.0.0.0", () => {
      log(`Server running on port ${PORT}`);
      log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();