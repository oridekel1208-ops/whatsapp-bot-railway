// lib/db.js
// PostgreSQL helper for Render

const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is required');

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false } // required for Render Postgres
});

// ----------------------- TABLES -----------------------
// Example DB functions (you can use JSON, SQLite, or Supabase here)
let botsMemory = []; // temp if not using DB

export async function getBotByPhoneNumberId(phoneId) {
  return botsMemory.find(b => b.phone_number_id === phoneId);
}

export async function updateBotState(botId, userNumber, newState) {
  const bot = botsMemory.find(b => b.id === botId);
  if (!bot) return;
  bot.userStates = bot.userStates || {};
  bot.userStates[userNumber] = newState;
}

export async function addBot(bot) {
  botsMemory.push(bot);
}

async function ensureTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS clients (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      phone_number_id TEXT NOT NULL UNIQUE,
      whatsapp_business_account_id TEXT,
      access_token TEXT NOT NULL,
      verify_token TEXT NOT NULL,
      is_verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id BIGSERIAL PRIMARY KEY,
      client_id BIGINT REFERENCES clients(id) ON DELETE CASCADE,
      whatsapp_id TEXT,
      from_number TEXT,
      to_number TEXT,
      direction TEXT,
      body TEXT,
      provider_payload JSONB,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS bot_settings (
      id BIGSERIAL PRIMARY KEY,
      client_id BIGINT REFERENCES clients(id) ON DELETE CASCADE,
      settings JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
  `);
}

// ----------------------- MESSAGES -----------------------
async function insertMessage({ client_id = null, whatsapp_id = null, from_number, to_number, direction, body = null, provider_payload = null }) {
  await ensureTables();
  const res = await pool.query(
    `INSERT INTO messages (client_id, whatsapp_id, from_number, to_number, direction, body, provider_payload)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *;`,
    [client_id, whatsapp_id, from_number, to_number, direction, body, provider_payload]
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

// ----------------------- CLIENTS -----------------------
async function createClient({ name, phone_number_id, whatsapp_business_account_id = null, access_token, verify_token }) {
  await ensureTables();
  const res = await pool.query(
    `INSERT INTO clients (name, phone_number_id, whatsapp_business_account_id, access_token, verify_token)
     VALUES ($1,$2,$3,$4,$5) RETURNING *;`,
    [name, phone_number_id, whatsapp_business_account_id, access_token, verify_token]
  );
  return res.rows[0];
}

async function getClientByPhoneNumberId(phone_number_id) {
  await ensureTables();
  const res = await pool.query(
    `SELECT * FROM clients WHERE phone_number_id = $1 LIMIT 1;`,
    [phone_number_id]
  );
  return res.rows[0] || null;
}

async function getClientById(id) {
  await ensureTables();
  const res = await pool.query(
    `SELECT * FROM clients WHERE id = $1 LIMIT 1;`,
    [id]
  );
  return res.rows[0] || null;
}

async function markClientVerified(id, verified = true) {
  await ensureTables();
  const res = await pool.query(
    `UPDATE clients SET is_verified = $1, updated_at = now() WHERE id = $2 RETURNING *;`,
    [verified, id]
  );
  return res.rows[0];
}

module.exports = {
  pool,
  ensureTables,
  insertMessage,
  getRecentMessages,
  createClient,
  getClientByPhoneNumberId,
  getClientById,
  markClientVerified
};
