import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const port = process.env.PORT || 3000;
const root = path.dirname(fileURLToPath(import.meta.url));

app.use(express.static(root, { etag: false, maxAge: 0, setHeaders: (res) => { res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private'); } }));

app.get('/', (_req, res) => {
  res.sendFile(path.join(root, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Afi Steaks & Platters is running at http://localhost:${port}`);
});
