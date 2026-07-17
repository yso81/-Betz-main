import express from "express";
import * as dotenv from 'dotenv';
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const envPath = path.resolve(process.cwd(), '.env.local');
const fallbackEnvPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath, override: true });
dotenv.config({ path: fallbackEnvPath, override: true });

async function startServer() {
  const { default: authRoutes } = await import("./server/routes/auth");
  const { default: challengeRoutes } = await import("./server/routes/challenges");
  const { default: systemRoutes } = await import("./server/routes/system");
  const { default: uploadRoutes } = await import("./server/routes/upload");

  const app = express();
  const PORT = Number(process.env.PORT || 3000);
  const HOST = process.env.HOST || '0.0.0.0';

  app.use(express.json());

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  app.use('/uploads', express.static(uploadsDir));

  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API REQUEST] ${req.method} ${req.path}`);
    }
    next();
  });

  // Dev-only file exploration
  if (process.env.NODE_ENV !== 'production') {
    app.get("/api/dev/files", (_req, res) => {
      function getAllFiles(dirPath: string, arrayOfFiles: string[] = []) {
        try {
          const files = fs.readdirSync(dirPath);
          files.forEach((file) => {
            const fullPath = path.join(dirPath, file);
            if (fs.statSync(fullPath).isDirectory()) {
              if (file !== "node_modules" && file !== ".git" && file !== "dist") {
                getAllFiles(fullPath, arrayOfFiles);
              }
            } else {
              arrayOfFiles.push(path.relative(process.cwd(), fullPath));
            }
          });
        } catch (e) {
          // ignore errors
        }
        return arrayOfFiles;
      }
      try {
        const files = getAllFiles(process.cwd());
        res.json({ files });
      } catch (err: unknown) {
        res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
      }
    });
  }

  // Mount route groups
  app.use("/api/auth", authRoutes);
  app.use("/api/challenges", challengeRoutes);
  app.use("/api/system", systemRoutes);
  app.use("/api/upload", uploadRoutes);

  // Legacy route: user enrollments
  app.get("/api/users/:userId/challenges", async (req, res) => {
    const { dbEngine } = await import("./src/backendDb_supa");
    try {
      const data = await dbEngine.getUserEnrollments(req.params.userId);
      res.json(data);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch user enrollments" });
    }
  });

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} already in use. Set PORT to a free port and retry.`);
      process.exit(1);
    }
    throw err;
  });
}

startServer();
