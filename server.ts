import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'node:path';
import fs from 'node:fs';
import { storageEngine } from './server/storageEngine';
import { FileCategory } from './src/utils/fileSystemLogic';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json());

// --- REST API Endpoints ---

// System drives
app.get('/api/system/drives', (req, res) => {
  try {
    const drives = storageEngine.getDrives();
    res.json({ drives });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Browse filesystem directory
app.get('/api/fs/browse', (req, res) => {
  try {
    const p = (req.query.path as string) || 'C:\\';
    const data = storageEngine.browseDirectory(p);
    res.json(data);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Create folder
app.post('/api/fs/create-folder', (req, res) => {
  try {
    const { parentPath, name } = req.body;
    if (!parentPath || !name) {
      return res.status(400).json({ error: 'parentPath and name are required' });
    }
    const createdPath = storageEngine.createFolder(parentPath, name);
    res.json({ success: true, path: createdPath });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Rename item
app.post('/api/fs/rename', (req, res) => {
  try {
    const { targetPath, newName } = req.body;
    if (!targetPath || !newName) {
      return res.status(400).json({ error: 'targetPath and newName are required' });
    }
    const updatedPath = storageEngine.rename(targetPath, newName);
    res.json({ success: true, path: updatedPath });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Delete item
app.post('/api/fs/delete', (req, res) => {
  try {
    const { targetPath, permanent } = req.body;
    if (!targetPath) {
      return res.status(400).json({ error: 'targetPath is required' });
    }
    storageEngine.deleteItem(targetPath, !!permanent);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Copy item
app.post('/api/fs/copy', (req, res) => {
  try {
    const { srcPath, destFolder, conflictRule } = req.body;
    const result = storageEngine.copyItem(srcPath, destFolder, conflictRule);
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Move item
app.post('/api/fs/move', (req, res) => {
  try {
    const { srcPath, destFolder, conflictRule } = req.body;
    const result = storageEngine.moveItem(srcPath, destFolder, conflictRule);
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Duplicate item
app.post('/api/fs/duplicate', (req, res) => {
  try {
    const { targetPath } = req.body;
    const dupPath = storageEngine.duplicateItem(targetPath);
    res.json({ success: true, path: dupPath });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Media library queries (Photos, Videos, Audio, Documents, Downloads, etc.)
app.get('/api/media/all', (req, res) => {
  try {
    const category = req.query.category as FileCategory | undefined;
    const subCategory = req.query.subCategory as string | undefined;
    const files = storageEngine.getAllIndexedFiles(category, subCategory);
    res.json({ count: files.length, items: files });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Serve media file content (with mime types & streaming range)
app.get('/api/media/content', (req, res) => {
  try {
    const virtualPath = req.query.path as string;
    if (!virtualPath) return res.status(400).send('Path required');

    const phys = storageEngine.toPhysicalPath(virtualPath);
    if (!fs.existsSync(phys)) return res.status(404).send('File not found');

    const ext = path.extname(phys).toLowerCase();
    const mimeMap: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.svg': 'image/svg+xml',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.pdf': 'application/pdf',
      '.txt': 'text/plain',
      '.md': 'text/markdown',
      '.json': 'application/json'
    };

    const contentType = mimeMap[ext] || 'application/octet-stream';
    const stat = fs.statSync(phys);

    // Support range requests for video/audio seeking
    const range = req.headers.range;
    if (range && (contentType.startsWith('video/') || contentType.startsWith('audio/'))) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
      const chunksize = end - start + 1;
      const fileStream = fs.createReadStream(phys, { start, end });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stat.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType,
      });
      fileStream.pipe(res);
    } else {
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', stat.size);
      res.setHeader('Cache-Control', 'public, max-age=3600');
      fs.createReadStream(phys).pipe(res);
    }
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

// Read text / markdown content for document preview
app.get('/api/media/text', (req, res) => {
  try {
    const virtualPath = req.query.path as string;
    const phys = storageEngine.toPhysicalPath(virtualPath);
    if (!fs.existsSync(phys)) return res.status(404).json({ error: 'File not found' });
    const content = fs.readFileSync(phys, 'utf8');
    res.json({ content });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Universal Search
app.get('/api/search', (req, res) => {
  try {
    const q = (req.query.q as string) || '';
    const scope = req.query.category as FileCategory | undefined;
    const items = storageEngine.search(q, scope);
    res.json({ count: items.length, items });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Storage analysis & breakdown
app.get('/api/storage/analyze', (req, res) => {
  try {
    const data = storageEngine.getStorageAnalysis();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Safe cleanup action
app.post('/api/storage/clean', (req, res) => {
  try {
    const { itemPaths } = req.body;
    if (!Array.isArray(itemPaths)) {
      return res.status(400).json({ error: 'itemPaths array required' });
    }
    let freedBytes = 0;
    for (const p of itemPaths) {
      try {
        const phys = storageEngine.toPhysicalPath(p);
        if (fs.existsSync(phys)) {
          const stat = fs.statSync(phys);
          freedBytes += stat.size;
          storageEngine.deleteItem(p, true); // permanent delete for chosen cleanup
        }
      } catch {
        // continue with other files
      }
    }
    res.json({ success: true, freedBytes });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Favourites
app.get('/api/favourites', (req, res) => {
  try {
    const items = storageEngine.getFavourites();
    res.json({ count: items.length, items });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/favourites/toggle', (req, res) => {
  try {
    const { path: virtualPath } = req.body;
    const result = storageEngine.toggleFavourite(virtualPath);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Collections
app.get('/api/collections', (req, res) => {
  try {
    const collections = storageEngine.getCollections();
    res.json({ collections });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/collections', (req, res) => {
  try {
    const { name, description } = req.body;
    const col = storageEngine.createCollection(name, description);
    res.json(col);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/collections/:id/add', (req, res) => {
  try {
    const { itemPath } = req.body;
    const col = storageEngine.addToCollection(req.params.id, itemPath);
    res.json(col);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/collections/:id/remove', (req, res) => {
  try {
    const { itemPath } = req.body;
    const col = storageEngine.removeFromCollection(req.params.id, itemPath);
    res.json(col);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/collections/:id', (req, res) => {
  try {
    storageEngine.deleteCollection(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Settings
app.get('/api/settings', (req, res) => {
  try {
    const settings = storageEngine.getSettings();
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/settings', (req, res) => {
  try {
    const updated = storageEngine.updateSettings(req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Indexing manual rescan
app.post('/api/indexing/scan', (req, res) => {
  try {
    const all = storageEngine.getAllIndexedFiles();
    res.json({ success: true, count: all.length, status: 'completed' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Serve static assets from public (fonts, icons, media)
app.use(express.static(path.resolve(process.cwd(), 'public')));

// Mount Vite or serve static assets
async function startServer() {
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(process.cwd(), 'dist'))) {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Files Studio backend & frontend active at http://localhost:${PORT}`);
  });
}

startServer();
