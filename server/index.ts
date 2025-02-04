import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from 'path'; //Import path module

const setupMiddleware = (app: express.Express) => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // CORS headers for development
  app.use((_req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });

  // Request logging
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined;

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
};

const setupErrorHandler = (app: express.Express) => {
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('🔴 Server error:', {
      message: err.message,
      stack: err.stack,
      status: err.status || err.statusCode,
      details: err.details || err.errors || 'No additional details'
    });

    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({
      message,
      status,
      timestamp: new Date().toISOString()
    });
  });
};

const initializeServer = async () => {
  try {
    const app = express();
    setupMiddleware(app);

    const server = registerRoutes(app);
    setupErrorHandler(app);

    if (process.env.NODE_ENV === "production") {
      serveStatic(app);
      app.use('/assets', express.static(path.join(process.cwd(), 'public', 'assets'))); //This line was already present.
      app.use('/attached_assets', express.static(path.join(process.cwd(), 'attached_assets'))); //Added this line
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

    return server;
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

initializeServer();