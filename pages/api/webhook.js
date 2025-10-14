// lib/db.js
// PostgreSQL helper for bots/clients/messages

const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is required');

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }, // Render requirement
});

// ----------------------- TABLES -----------------------
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
    CREATE TABLE IF NOT EXISTS bots (
      id BIGSERIAL PRIMARY KEY,
      client_id BIGINT REFERENCES clients(id) ON DELETE CASCADE,
      name TEXT,
      access_token TEXT,
      config JSONB DEFAULT '{}'::jsonb,
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
}

// ----------------------- CLIENTS -----------------------
async function createClient({ name, phone_number_id, access_token, verify_token }) {
  await ensureTables();
  const res = await pool.query(
    `INSERT INTO clients (name, phone_number_id, access_token, verify_token)
     VALUES ($1,$2,$3,$4) RETURNING *;`,
    [name, phone_number_id, access_token, verify_token]
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
    `UPDATE clients SET is_verified=$1, updated_at=now() WHERE id=$2 RETURNING *;`,
    [verified, id]
  );
  return res.rows[0];
}

async function updateClientAccessToken(clientId, newToken) {
  await ensureTables();
  const res = await pool.query(
    `UPDATE clients SET access_token=$1, updated_at=now() WHERE id=$2 RETURNING *;`,
    [newToken, clientId]
  );
  return res.rows[0];
}

// ----------------------- BOTS -----------------------
async function addBot({ client_id, name, access_token, config = {} }) {
  await ensureTables();
  const res = await pool.query(
    `INSERT INTO bots (client_id, name, access_token, config)
     VALUES ($1,$2,$3,$4) RETURNING *;`,
    [client_id, name, access_token, config]
  );
  return res.rows[0];
}

async function getBots() {
  await ensureTables();
  const res = await pool.query(`
    SELECT bots.*, clients.phone_number_id, clients.name AS client_name
    FROM bots LEFT JOIN clients ON bots.client_id = clients.id
    ORDER BY bots.id DESC;
  `);
  return res.rows;
}

async function getBotById(botId) {
  await ensureTables();
  const res = await pool.query(
    `SELECT * FROM bots WHERE id=$1 LIMIT 1;`,
    [botId]
  );
  return res.rows[0] || null;
}

async function getBotByClientId(clientId) {
  await ensureTables();
  const res = await pool.query(
    `SELECT * FROM bots WHERE client_id=$1 ORDER BY id ASC LIMIT 1;`,
    [clientId]
  );
  return res.rows[0] || null;
}

async function updateBotAccessToken(botId, newToken) {
  await ensureTables();
  const res = await pool.query(
    `UPDATE bots SET access_token=$1, updated_at=now() WHERE id=$2 RETURNING *;`,
    [newToken, botId]
  );
  return res.rows[0];
}

async function updateBotState(botId, userNumber, newState) {
  await ensureTables();
  const res = await pool.query(
    `UPDATE bots
     SET config = jsonb_set(config, '{userStates,"${userNumber}"}', $1::jsonb, true),
         updated_at = now()
     WHERE id=$2
     RETURNING *;`,
    [JSON.stringify(newState), botId]
  );
  return res.rows[0];
}

// ----------------------- MESSAGES -----------------------
async function insertMessage({ client_id, whatsapp_id, from_number, to_number, direction, body, provider_payload }) {
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

// ----------------------- EXPORT -----------------------
module.exports = {
  pool,
  ensureTables,
  createClient,
  getClientByPhoneNumberId,
  getClientById,
  markClientVerified,
  updateClientAccessToken,
  addBot,
  getBots,
  getBotById,
  getBotByClientId,
  updateBotAccessToken,
  updateBotState,
  insertMessage,
  getRecentMessages
};
