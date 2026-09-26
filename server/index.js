import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './routes/api.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const CLIENT_DIST = path.join(__dirname, '..', 'client', 'dist');

// In dev, only allow the Vite dev server's origin. In production the
// client is served by this same Express app, so CORS doesn't matter —
// but the setting is still read from env instead of hardcoded either way.
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

app.use('/api', apiRouter);

// In production, serve the built React app and let it handle client-side routes.
app.use(express.static(CLIENT_DIST));
app.get("/{*splat}", (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(CLIENT_DIST, 'index.html'), (err) => {
    if (err) next();
  });
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
