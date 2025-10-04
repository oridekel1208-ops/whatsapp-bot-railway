// lib/db.js
// Minimal helper using 'pg'. Creates messages table if missing and supports SSL for external databases.

const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Updated Pool with SSL for external DBs
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false, // Required for many cloud DBs with self-signed certificates
  },
});

async function ensureTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id BIGSERIAL PRIMARY KEY,
      whatsapp_id TEXT,
      from_number TEXT,
      to_number TEXT,
      direction TEXT,  -- 'inbound' or 'outbound'
      body TEXT,
      provider_payload JSONB,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);
}

async function insertMessage({ whatsapp_id = null, from_number, to_number, direction, body = null, provider_payload = null }) {
  await ensureTables();
  const res = await pool.query(
    `INSERT INTO messages (whatsapp_id, from_number, to_number, direction, body, provider_payload)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *;`,
    [whatsapp_id, from_number, to_number, direction, body, provider_payload]
  );
  return res.rows[0];
}

async function getRecentMessages(limit = 100) {
  await ensureTables();
  const res = await pool.query(
    `SELECT * FROM messages ORDER BY created_at DESC LIMIT $1;`,
    [limit]
  );
  return res.rows;
}

module.exports = { pool, insertMessage, getRecentMessages };
