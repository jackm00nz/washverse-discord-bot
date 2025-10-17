import Database from "better-sqlite3"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import { mkdirSync, existsSync } from "fs"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const dataDir = join(__dirname, "../../data")
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true })
}

const dbPath = process.env.DATABASE_PATH || join(dataDir, "bot.db")

// Initialize database
const db = new Database(dbPath)
db.pragma("journal_mode = WAL")

// Initialize database schema
const initSchema = () => {
  // Moderation logs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS mod_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      moderator_id TEXT NOT NULL,
      action TEXT NOT NULL,
      reason TEXT,
      timestamp INTEGER NOT NULL
    )
  `)

  // Warnings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS warnings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      moderator_id TEXT NOT NULL,
      reason TEXT NOT NULL,
      timestamp INTEGER NOT NULL
    )
  `)

  // Suggestions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS suggestions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      suggestion TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      message_id TEXT,
      timestamp INTEGER NOT NULL
    )
  `)

  // Activity tracking table
  db.exec(`
    CREATE TABLE IF NOT EXISTS activity (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      roblox_username TEXT,
      sessions_attended INTEGER DEFAULT 0,
      sessions_hosted INTEGER DEFAULT 0,
      minutes INTEGER DEFAULT 0,
      messages INTEGER DEFAULT 0,
      last_updated INTEGER NOT NULL
    )
  `)

  // Activity requirements table
  db.exec(`
    CREATE TABLE IF NOT EXISTS activity_requirements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rank_name TEXT NOT NULL UNIQUE,
      sessions_required INTEGER DEFAULT 0,
      minutes_required INTEGER DEFAULT 0,
      messages_required INTEGER DEFAULT 0
    )
  `)

  // Leave of Absence table
  db.exec(`
    CREATE TABLE IF NOT EXISTS loa (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      roblox_username TEXT NOT NULL,
      reason TEXT NOT NULL,
      start_date INTEGER NOT NULL,
      end_date INTEGER NOT NULL,
      status TEXT DEFAULT 'active'
    )
  `)

  // Alliances table
  db.exec(`
    CREATE TABLE IF NOT EXISTS alliances (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_name TEXT NOT NULL,
      group_id TEXT NOT NULL,
      representative_id TEXT,
      channel_id TEXT,
      last_checkin INTEGER,
      created_at INTEGER NOT NULL
    )
  `)

  // Session logs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS session_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      host_id TEXT NOT NULL,
      session_type TEXT NOT NULL,
      attendees TEXT,
      timestamp INTEGER NOT NULL
    )
  `)

  // Tickets table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      channel_id TEXT NOT NULL,
      claimed_by TEXT,
      status TEXT DEFAULT 'open',
      created_at INTEGER NOT NULL,
      closed_at INTEGER
    )
  `)

  // Game bans table
  db.exec(`
    CREATE TABLE IF NOT EXISTS game_bans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      roblox_user_id TEXT NOT NULL,
      roblox_username TEXT NOT NULL,
      moderator_id TEXT NOT NULL,
      reason TEXT NOT NULL,
      ban_type TEXT NOT NULL,
      expires_at INTEGER,
      created_at INTEGER NOT NULL
    )
  `)
}

// Initialize schema on startup
initSchema()

// Database utility functions
export const dbUtils = {
  // Moderation logs
  addModLog: (userId, moderatorId, action, reason) => {
    const stmt = db.prepare(
      "INSERT INTO mod_logs (user_id, moderator_id, action, reason, timestamp) VALUES (?, ?, ?, ?, ?)",
    )
    return stmt.run(userId, moderatorId, action, reason, Date.now())
  },

  getModLogs: (userId, limit = 10) => {
    const stmt = db.prepare("SELECT * FROM mod_logs WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?")
    return stmt.all(userId, limit)
  },

  // Warnings
  addWarning: (userId, moderatorId, reason) => {
    const stmt = db.prepare("INSERT INTO warnings (user_id, moderator_id, reason, timestamp) VALUES (?, ?, ?, ?)")
    return stmt.run(userId, moderatorId, reason, Date.now())
  },

  getWarnings: (userId) => {
    const stmt = db.prepare("SELECT * FROM warnings WHERE user_id = ? ORDER BY timestamp DESC")
    return stmt.all(userId)
  },

  // Suggestions
  addSuggestion: (userId, suggestion, messageId) => {
    const stmt = db.prepare("INSERT INTO suggestions (user_id, suggestion, message_id, timestamp) VALUES (?, ?, ?, ?)")
    return stmt.run(userId, suggestion, messageId, Date.now())
  },

  updateSuggestionStatus: (messageId, status) => {
    const stmt = db.prepare("UPDATE suggestions SET status = ? WHERE message_id = ?")
    return stmt.run(status, messageId)
  },

  // Activity tracking
  getActivity: (userId) => {
    const stmt = db.prepare("SELECT * FROM activity WHERE user_id = ?")
    return stmt.get(userId)
  },

  updateActivity: (userId, robloxUsername, data) => {
    const existing = dbUtils.getActivity(userId)
    if (existing) {
      const stmt = db.prepare(`
        UPDATE activity 
        SET sessions_attended = ?, sessions_hosted = ?, minutes = ?, messages = ?, last_updated = ?
        WHERE user_id = ?
      `)
      return stmt.run(
        data.sessions_attended || existing.sessions_attended,
        data.sessions_hosted || existing.sessions_hosted,
        data.minutes || existing.minutes,
        data.messages || existing.messages,
        Date.now(),
        userId,
      )
    } else {
      const stmt = db.prepare(`
        INSERT INTO activity (user_id, roblox_username, sessions_attended, sessions_hosted, minutes, messages, last_updated)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      return stmt.run(
        userId,
        robloxUsername,
        data.sessions_attended || 0,
        data.sessions_hosted || 0,
        data.minutes || 0,
        data.messages || 0,
        Date.now(),
      )
    }
  },

  // Activity requirements
  setRequirement: (rankName, requirements) => {
    const stmt = db.prepare(`
      INSERT INTO activity_requirements (rank_name, sessions_required, minutes_required, messages_required)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(rank_name) DO UPDATE SET
        sessions_required = excluded.sessions_required,
        minutes_required = excluded.minutes_required,
        messages_required = excluded.messages_required
    `)
    return stmt.run(rankName, requirements.sessions || 0, requirements.minutes || 0, requirements.messages || 0)
  },

  getRequirement: (rankName) => {
    const stmt = db.prepare("SELECT * FROM activity_requirements WHERE rank_name = ?")
    return stmt.get(rankName)
  },

  // Leave of Absence
  addLoa: (userId, robloxUsername, reason, startDate, endDate) => {
    const stmt = db.prepare(
      "INSERT INTO loa (user_id, roblox_username, reason, start_date, end_date) VALUES (?, ?, ?, ?, ?)",
    )
    return stmt.run(userId, robloxUsername, reason, startDate, endDate)
  },

  getActiveLoas: () => {
    const stmt = db.prepare("SELECT * FROM loa WHERE status = ? AND end_date > ?")
    return stmt.all("active", Date.now())
  },

  expireLoa: (id) => {
    const stmt = db.prepare("UPDATE loa SET status = ? WHERE id = ?")
    return stmt.run("expired", id)
  },

  // Alliances
  addAlliance: (groupName, groupId, channelId) => {
    const stmt = db.prepare("INSERT INTO alliances (group_name, group_id, channel_id, created_at) VALUES (?, ?, ?, ?)")
    return stmt.run(groupName, groupId, channelId, Date.now())
  },

  getAlliances: () => {
    const stmt = db.prepare("SELECT * FROM alliances ORDER BY group_name")
    return stmt.all()
  },

  updateAllianceRep: (groupId, representativeId) => {
    const stmt = db.prepare("UPDATE alliances SET representative_id = ? WHERE group_id = ?")
    return stmt.run(representativeId, groupId)
  },

  updateAllianceCheckin: (groupId) => {
    const stmt = db.prepare("UPDATE alliances SET last_checkin = ? WHERE group_id = ?")
    return stmt.run(Date.now(), groupId)
  },

  // Session logs
  addSessionLog: (hostId, sessionType, attendees) => {
    const stmt = db.prepare(
      "INSERT INTO session_logs (host_id, session_type, attendees, timestamp) VALUES (?, ?, ?, ?)",
    )
    return stmt.run(hostId, sessionType, JSON.stringify(attendees), Date.now())
  },

  // Tickets
  createTicket: (userId, channelId) => {
    const stmt = db.prepare("INSERT INTO tickets (user_id, channel_id, created_at) VALUES (?, ?, ?)")
    return stmt.run(userId, channelId, Date.now())
  },

  claimTicket: (channelId, claimedBy) => {
    const stmt = db.prepare("UPDATE tickets SET claimed_by = ? WHERE channel_id = ?")
    return stmt.run(claimedBy, channelId)
  },

  closeTicket: (channelId) => {
    const stmt = db.prepare("UPDATE tickets SET status = ?, closed_at = ? WHERE channel_id = ?")
    return stmt.run("closed", Date.now(), channelId)
  },

  getTicket: (channelId) => {
    const stmt = db.prepare("SELECT * FROM tickets WHERE channel_id = ?")
    return stmt.get(channelId)
  },

  // Game bans
  addGameBan: (robloxUserId, robloxUsername, moderatorId, reason, banType, expiresAt = null) => {
    const stmt = db.prepare(`
      INSERT INTO game_bans (roblox_user_id, roblox_username, moderator_id, reason, ban_type, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    return stmt.run(robloxUserId, robloxUsername, moderatorId, reason, banType, expiresAt, Date.now())
  },

  removeGameBan: (robloxUserId) => {
    const stmt = db.prepare("DELETE FROM game_bans WHERE roblox_user_id = ?")
    return stmt.run(robloxUserId)
  },

  getGameBan: (robloxUserId) => {
    const stmt = db.prepare("SELECT * FROM game_bans WHERE roblox_user_id = ?")
    return stmt.get(robloxUserId)
  },

  getActiveGameBans: () => {
    const stmt = db.prepare("SELECT * FROM game_bans WHERE expires_at IS NULL OR expires_at > ?")
    return stmt.all(Date.now())
  },
}

export default db
