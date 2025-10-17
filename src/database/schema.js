import Database from "better-sqlite3"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const db = new Database(path.join(__dirname, "../../washverse.db"))

// Enable foreign keys
db.pragma("foreign_keys = ON")

// Create tables
db.exec(`
  -- Moderation logs
  CREATE TABLE IF NOT EXISTS mod_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    moderator_id TEXT NOT NULL,
    action TEXT NOT NULL,
    reason TEXT,
    duration INTEGER,
    created_at INTEGER NOT NULL
  );

  -- Warnings
  CREATE TABLE IF NOT EXISTS warnings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    moderator_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  -- Suggestions
  CREATE TABLE IF NOT EXISTS suggestions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    suggestion TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    reviewed_by TEXT,
    response TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER
  );

  -- Tickets
  CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    claimed_by TEXT,
    claimed_at INTEGER,
    status TEXT DEFAULT 'open',
    close_reason TEXT,
    created_at INTEGER NOT NULL,
    closed_at INTEGER
  );

  -- Activity tracking
  CREATE TABLE IF NOT EXISTS activity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    roblox_username TEXT,
    sessions_attended INTEGER DEFAULT 0,
    sessions_hosted INTEGER DEFAULT 0,
    minutes INTEGER DEFAULT 0,
    messages INTEGER DEFAULT 0,
    week_start INTEGER NOT NULL,
    UNIQUE(user_id, week_start)
  );

  -- Activity requirements per rank
  CREATE TABLE IF NOT EXISTS activity_requirements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rank_id INTEGER NOT NULL UNIQUE,
    rank_name TEXT NOT NULL,
    sessions_attended INTEGER DEFAULT 2,
    sessions_hosted INTEGER DEFAULT 0,
    minutes INTEGER DEFAULT 30,
    messages INTEGER DEFAULT 50
  );

  -- Leave of Absence
  CREATE TABLE IF NOT EXISTS loa (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    roblox_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    start_date INTEGER NOT NULL,
    end_date INTEGER NOT NULL,
    approved_by TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    created_at INTEGER NOT NULL
  );

  -- Alliances
  CREATE TABLE IF NOT EXISTS alliances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    representative_id TEXT,
    channel_id TEXT,
    last_checkin INTEGER,
    created_at INTEGER NOT NULL
  );

  -- Session logs
  CREATE TABLE IF NOT EXISTS session_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    host_id TEXT NOT NULL,
    session_type TEXT NOT NULL,
    attendees INTEGER DEFAULT 0,
    duration INTEGER,
    notes TEXT,
    created_at INTEGER NOT NULL
  );

  -- Game bans
  CREATE TABLE IF NOT EXISTS game_bans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    roblox_id TEXT NOT NULL,
    roblox_username TEXT NOT NULL,
    banned_by TEXT NOT NULL,
    reason TEXT NOT NULL,
    ban_type TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    expires_at INTEGER
  );
`)

console.log("Database schema initialized successfully")

export default db
