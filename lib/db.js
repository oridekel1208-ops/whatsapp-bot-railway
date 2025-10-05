// lib/db.js
// SQLite version of your PostgreSQL db.js
// Install: npm install better-sqlite3

const Database = require('better-sqlite3');
const db = new Database('database.sqlite');

// Create tables if not exists
db.prepare(`
  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone_number_id TEXT NOT NULL UNIQUE,
    whatsapp_business_account_id TEXT,
    access_token TEXT NOT NULL,
    verify_token TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER,
    whatsapp_id TEXT,
    from_number TEXT,
    to_number TEXT,
    direction TEXT,
    body TEXT,
    provider_payload TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(client_id) REFERENCES clients(id) ON DELETE CASCADE
  );
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS bot_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER,
    settings TEXT DEFAULT '{}',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(client_id) REFERENCES clients(id) ON DELETE CASCADE
  );
`).run();

// ----------------------- MESSAGES -----------------------
function insertMessage({ client_id = null, whatsapp_id = null, from_number, to_number, direction, body = null, provider_payload = null }) {
  const stmt = db.prepare(`
    INSERT INTO messages (client_id, whatsapp_id, from_number, to_number, direction, body, provider_payload)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  return stmt.run(client_id, whatsapp_id, from_number, to_number, direction, body, JSON.stringify(provider_payload));
}

function getRecentMessages(limit = 100) {
  const stmt = db.prepare(`
    SELECT * FROM messages ORDER BY created_at DESC LIMIT ?
  `);
  return stmt.all(limit);
}

// ----------------------- CLIENTS -----------------------
function createClient({ name, phone_number_id, whatsapp_business_account_id = null, access_token, verify_token }) {
  const stmt = db.prepare(`
    INSERT INTO clients (name, phone_number_id, whatsapp_business_account_id, access_token, verify_token)
    VALUES (?, ?, ?, ?, ?)
  `);
  return stmt.run(name, phone_number_id, whatsapp_business_account_id, access_token, verify_token);
}

function getClientByPhoneNumberId(phone_number_id) {
  const stmt = db.prepare(`SELECT * FROM clients WHERE phone_number_id = ? LIMIT 1`);
  return stmt.get(phone_number_id) || null;
}

function getClientById(id) {
  const stmt = db.prepare(`SELECT * FROM clients WHERE id = ? LIMIT 1`);
  return stmt.get(id) || null;
}

function markClientVerified(id, verified = true) {
  const stmt = db.prepare(`
    UPDATE clients SET is_verified = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `);
  return stmt.run(verified ? 1 : 0, id);
}

// ----------------------- EXPORTS -----------------------
module.exports = {
  db,
  insertMessage,
  getRecentMessages,
  createClient,
  getClientByPhoneNumberId,
  getClientById,
  markClientVerified
};
