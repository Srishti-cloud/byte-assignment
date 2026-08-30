const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { Pool } = require('pg');
const client = require('prom-client');
require('dotenv').config();

const app = express();
const port = Number(process.env.PORT || 4000);

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests processed by the application',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'Latency of HTTP requests in milliseconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [10, 50, 100, 200, 500, 1000, 2000, 5000],
  registers: [register],
});

app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use((req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const route = req.route ? req.route.path : req.originalUrl;

    httpRequestsTotal.labels(req.method, route, String(res.statusCode)).inc();
    httpRequestDuration.labels(req.method, route, String(res.statusCode)).observe(duration);
  });

  next();
});

const fallbackItems = [
  {
    id: 1,
    title: 'Initial account review',
    description: 'A sample record to validate the happy path during local development.',
    status: 'new',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Customer onboarding',
    description: 'This record represents a newly onboarded customer waiting for validation.',
    status: 'in_progress',
    createdAt: new Date().toISOString(),
  },
];

const connectionString = process.env.DATABASE_URL || 'postgres://byteadmin:BytePass123!@localhost:5432/byteapp';
const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

let dbReady = false;

async function initDatabase() {
  if (!process.env.DATABASE_URL) {
    dbReady = false;
    return false;
  }

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT DEFAULT 'new',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    const { rowCount } = await pool.query('SELECT 1 FROM items');

    if (rowCount === 0) {
      await pool.query(
        `INSERT INTO items (title, description, status, created_at)
         VALUES ($1, $2, $3, NOW()), ($4, $5, $6, NOW())`,
        [
          'Initial account review',
          'A sample record to validate the happy path during local development.',
          'new',
          'Customer onboarding',
          'This record represents a newly onboarded customer waiting for validation.',
          'in_progress',
        ]
      );
    }

    dbReady = true;
    return true;
  } catch (error) {
    dbReady = false;
    console.warn('PostgreSQL unavailable, using in-memory fallback:', error.message);
    return false;
  }
}

async function readItemsFromDb() {
  const { rows } = await pool.query(
    'SELECT id, title, description, status, created_at AS "createdAt" FROM items ORDER BY id DESC'
  );

  return rows.map((item) => ({
    ...item,
    createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
  }));
}

async function getItems() {
  if (dbReady) {
    return readItemsFromDb();
  }

  return [...fallbackItems];
}

async function getItemById(id) {
  if (dbReady) {
    const { rows } = await pool.query(
      'SELECT id, title, description, status, created_at AS "createdAt" FROM items WHERE id = $1',
      [id]
    );

    if (!rows.length) {
      return null;
    }

    const item = rows[0];
    return {
      ...item,
      createdAt: new Date(item.createdAt).toISOString(),
    };
  }

  return fallbackItems.find((entry) => entry.id === Number(id)) || null;
}

async function createItem({ title, description, status = 'new' }) {
  if (dbReady) {
    const { rows } = await pool.query(
      `INSERT INTO items (title, description, status) VALUES ($1, $2, $3)
       RETURNING id, title, description, status, created_at AS "createdAt"`,
      [title.trim(), description.trim(), status]
    );

    const item = rows[0];
    return {
      ...item,
      createdAt: new Date(item.createdAt).toISOString(),
    };
  }

  const newItem = {
    id: fallbackItems.length ? fallbackItems[0].id + 1 : 1,
    title: title.trim(),
    description: description.trim(),
    status,
    createdAt: new Date().toISOString(),
  };

  fallbackItems.unshift(newItem);
  return newItem;
}

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.get('/health', async (req, res) => {
  try {
    if (!dbReady) {
      await initDatabase();
    }

    if (dbReady) {
      await pool.query('SELECT 1');
    }

    res.json({
      status: 'ok',
      service: 'assignment-backend',
      database: dbReady ? 'postgres' : 'memory',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Database health check failed',
    });
  }
});

app.get('/api/items', async (req, res) => {
  try {
    if (!dbReady) {
      await initDatabase();
    }

    const items = await getItems();
    res.json({
      success: true,
      data: items,
      count: items.length,
      source: dbReady ? 'postgres' : 'memory',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to load items' });
  }
});

app.get('/api/items/:id', async (req, res) => {
  try {
    if (!dbReady) {
      await initDatabase();
    }

    const item = await getItemById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    return res.json({ success: true, data: item });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to fetch item' });
  }
});

app.post('/api/items', async (req, res) => {
  const { title, description, status = 'new' } = req.body || {};

  if (!title || !description) {
    return res.status(400).json({
      success: false,
      message: 'Title and description are required.',
    });
  }

  try {
    if (!dbReady) {
      await initDatabase();
    }

    const newItem = await createItem({ title, description, status });

    return res.status(201).json({
      success: true,
      message: 'Item created successfully.',
      data: newItem,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to create item' });
  }
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

module.exports = app;
