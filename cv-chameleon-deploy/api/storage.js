import db, { initTables } from './db.js';

// Flag to track if tables have been initialized
let tablesInitialized = false;

async function ensureTables() {
  if (!tablesInitialized) {
    await initTables();
    tablesInitialized = true;
  }
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Ensure tables exist on first request
    await ensureTables();

    if (req.method === 'GET') {
      return handleGet(req, res);
    } else if (req.method === 'POST') {
      return handlePost(req, res);
    } else if (req.method === 'DELETE') {
      return handleDelete(req, res);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Storage API error:', error);
    return res.status(500).json({ error: error.message });
  }
}

async function handleGet(req, res) {
  const { type, id } = req.query;

  if (id) {
    // Get specific item by ID
    const table = type === 'activity' ? 'cv_activity' : 'cv_resumes';
    const result = await db.execute({
      sql: `SELECT * FROM ${table} WHERE id = ?`,
      args: [id]
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }

    const row = result.rows[0];
    if (table === 'cv_resumes') {
      return res.status(200).json({
        id: row.id,
        filename: row.filename,
        data: JSON.parse(row.resume_json),
        created_at: row.created_at
      });
    }
    return res.status(200).json(row);
  }

  if (type === 'resumes') {
    // Get all saved resumes
    const result = await db.execute(
      'SELECT id, filename, resume_json, created_at FROM cv_resumes ORDER BY created_at DESC'
    );

    const resumes = result.rows.map(row => ({
      id: row.id,
      filename: row.filename,
      data: JSON.parse(row.resume_json),
      created_at: row.created_at
    }));

    return res.status(200).json({ resumes });
  }

  if (type === 'activity') {
    // Get activity log (last 100 entries)
    const result = await db.execute(
      'SELECT * FROM cv_activity ORDER BY timestamp DESC LIMIT 100'
    );

    return res.status(200).json({ activity: result.rows });
  }

  if (type === 'preferences') {
    // Get all preferences
    const result = await db.execute('SELECT key, value FROM cv_preferences');

    const preferences = {};
    for (const row of result.rows) {
      try {
        preferences[row.key] = JSON.parse(row.value);
      } catch {
        preferences[row.key] = row.value;
      }
    }

    return res.status(200).json({ preferences });
  }

  return res.status(400).json({ error: 'Missing or invalid type parameter. Use: resumes, activity, or preferences' });
}

async function handlePost(req, res) {
  const { type, data, key, value } = req.body;

  if (!type) {
    return res.status(400).json({ error: 'Missing type in request body' });
  }

  if (type === 'resume') {
    if (!data || !data.filename) {
      return res.status(400).json({ error: 'Missing data or filename for resume' });
    }

    const result = await db.execute({
      sql: 'INSERT INTO cv_resumes (filename, resume_json) VALUES (?, ?) RETURNING id, created_at',
      args: [data.filename, JSON.stringify(data)]
    });

    // Log the activity
    await db.execute({
      sql: 'INSERT INTO cv_activity (message, type) VALUES (?, ?)',
      args: [`Saved resume: ${data.filename}`, 'save']
    });

    return res.status(201).json({
      success: true,
      id: result.rows[0].id,
      created_at: result.rows[0].created_at
    });
  }

  if (type === 'activity') {
    if (!data || !data.message) {
      return res.status(400).json({ error: 'Missing data.message for activity' });
    }

    const result = await db.execute({
      sql: 'INSERT INTO cv_activity (message, type) VALUES (?, ?) RETURNING id, timestamp',
      args: [data.message, data.type || 'info']
    });

    return res.status(201).json({
      success: true,
      id: result.rows[0].id,
      timestamp: result.rows[0].timestamp
    });
  }

  if (type === 'preference') {
    if (!key) {
      return res.status(400).json({ error: 'Missing key for preference' });
    }

    const valueStr = typeof value === 'object' ? JSON.stringify(value) : String(value);

    await db.execute({
      sql: `INSERT INTO cv_preferences (key, value) VALUES (?, ?)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      args: [key, valueStr]
    });

    return res.status(201).json({ success: true, key, value });
  }

  return res.status(400).json({ error: 'Invalid type. Use: resume, activity, or preference' });
}

async function handleDelete(req, res) {
  const { id, type } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Missing id parameter' });
  }

  const table = type === 'activity' ? 'cv_activity' : 'cv_resumes';

  // Get item info before deleting (for activity log)
  const existing = await db.execute({
    sql: `SELECT * FROM ${table} WHERE id = ?`,
    args: [id]
  });

  if (existing.rows.length === 0) {
    return res.status(404).json({ error: 'Item not found' });
  }

  await db.execute({
    sql: `DELETE FROM ${table} WHERE id = ?`,
    args: [id]
  });

  // Log the deletion if it was a resume
  if (table === 'cv_resumes') {
    const filename = existing.rows[0].filename;
    await db.execute({
      sql: 'INSERT INTO cv_activity (message, type) VALUES (?, ?)',
      args: [`Deleted resume: ${filename}`, 'delete']
    });
  }

  return res.status(200).json({ success: true, deleted: id });
}
