import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = join(__dirname, 'data.json');
const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Ensure data file exists
if (!existsSync(DATA_FILE)) {
  writeFileSync(DATA_FILE, JSON.stringify({ prayers: {}, dailyRecords: [], settings: {} }, null, 2));
}

// Load data
app.get('/api/data', (req, res) => {
  try {
    const raw = readFileSync(DATA_FILE, 'utf-8');
    res.json(JSON.parse(raw));
  } catch (e) {
    res.status(500).json({ error: 'Failed to read data' });
  }
});

// Save data
app.post('/api/data', (req, res) => {
  try {
    const data = req.body;
    writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to save data' });
  }
});

// Export
app.get('/api/export', (req, res) => {
  try {
    const raw = readFileSync(DATA_FILE, 'utf-8');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=qada-backup.json');
    res.send(raw);
  } catch (e) {
    res.status(500).json({ error: 'Failed to export' });
  }
});

// Import
app.post('/api/import', (req, res) => {
  try {
    const data = req.body;
    writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true, message: 'Import successful' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to import' });
  }
});

app.listen(PORT, () => {
  console.log(`Qada Salah backend running on http://localhost:${PORT}`);
});