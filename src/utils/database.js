import Database from "better-sqlite3"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Initialize database
const dbPath = process.env.DATABASE_PATH || join(__dirname, "../../data/washverse.db")
const db = new Database(dbPath)

// Enable foreign keys
db.pragma("foreign_keys = ON")

// Database utility functions
export const dbUtils = {
  // Initialize all tables
  initializeTables() {
    // Moderation logs table
    db.exec(`
      CREATE TABLE IF NOT EXISTS mod_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        moderator_id TEXT NOT NULL,
        action TEXT NOT NULL,
        reason TEXT,
        duration INTEGER,
        created_at INTEGER NOT NULL
      )
    `)

    // Warnings table
    db.exec(`
      CREATE TABLE IF NOT EXISTS warnings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        moderator_id TEXT NOT NULL,
        reason TEXT NOT NULL,
        created_at INTEGER NOT NULL
      )
    `)

    // Suggestions table
    db.exec(`
      CREATE TABLE IF NOT EXISTS suggestions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        suggestion TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        reviewed_by TEXT,
        response TEXT,
        created_at INTEGER NOT NULL
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
        status TEXT DEFAULT 'active',
        created_at INTEGER NOT NULL
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
        duration INTEGER,
        created_at INTEGER NOT NULL
      )
    `)

    // Tickets table
    db.exec(`
      CREATE TABLE IF NOT EXISTS tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_number INTEGER NOT NULL,
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
        user_id TEXT NOT NULL,
        roblox_username TEXT NOT NULL,
        roblox_id TEXT NOT NULL,
        moderator_id TEXT NOT NULL,
        reason TEXT NOT NULL,
        ban_type TEXT NOT NULL,
        duration INTEGER,
        expires_at INTEGER,
        created_at INTEGER NOT NULL
      )
    `)

    console.log("[v0] Database tables initialized successfully")
  },

  // Generic query functions
  run(sql, params = []) {
    return db.prepare(sql).run(params)
  },

  get(sql, params = []) {
    return db.prepare(sql).get(params)
  },

  all(sql, params = []) {
    return db.prepare(sql).all(params)
  },

  // Moderation functions
  logModAction(userId, moderatorId, action, reason, duration = null) {
    return this.run(
      "INSERT INTO mod_logs (user_id, moderator_id, action, reason, duration, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, moderatorId, action, reason, duration, Date.now()],
    )
  },

  addWarning(userId, moderatorId, reason) {
    return this.run("INSERT INTO warnings (user_id, moderator_id, reason, created_at) VALUES (?, ?, ?, ?)", [
      userId,
      moderatorId,
      reason,
      Date.now(),
    ])
  },

  getWarnings(userId) {
    return this.all("SELECT * FROM warnings WHERE user_id = ? ORDER BY created_at DESC", [userId])
  },

  // Suggestion functions
  createSuggestion(userId, suggestion) {
    return this.run("INSERT INTO suggestions (user_id, suggestion, created_at) VALUES (?, ?, ?)", [
      userId,
      suggestion,
      Date.now(),
    ])
  },

  updateSuggestion(id, status, reviewedBy, response) {
    return this.run("UPDATE suggestions SET status = ?, reviewed_by = ?, response = ? WHERE id = ?", [
      status,
      reviewedBy,
      response,
      id,
    ])
  },

  // Activity functions
  getActivity(userId) {
    return this.get("SELECT * FROM activity WHERE user_id = ?", [userId])
  },

  updateActivity(userId, robloxUsername, data) {
    const existing = this.getActivity(userId)
    if (existing) {
      return this.run(
        "UPDATE activity SET sessions_attended = ?, sessions_hosted = ?, minutes = ?, messages = ?, last_updated = ? WHERE user_id = ?",
        [data.sessions_attended, data.sessions_hosted, data.minutes, data.messages, Date.now(), userId],
      )
    } else {
      return this.run(
        "INSERT INTO activity (user_id, roblox_username, sessions_attended, sessions_hosted, minutes, messages, last_updated) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [userId, robloxUsername, data.sessions_attended, data.sessions_hosted, data.minutes, data.messages, Date.now()],
      )
    }
  },

  getAllActivity() {
    return this.all("SELECT * FROM activity")
  },

  // Activity requirements functions
  getRequirement(rankName) {
    return this.get("SELECT * FROM activity_requirements WHERE rank_name = ?", [rankName])
  },

  setRequirement(rankName, sessions, minutes, messages) {
    const existing = this.getRequirement(rankName)
    if (existing) {
      return this.run(
        "UPDATE activity_requirements SET sessions_required = ?, minutes_required = ?, messages_required = ? WHERE rank_name = ?",
        [sessions, minutes, messages, rankName],
      )
    } else {
      return this.run(
        "INSERT INTO activity_requirements (rank_name, sessions_required, minutes_required, messages_required) VALUES (?, ?, ?, ?)",
        [rankName, sessions, minutes, messages],
      )
    }
  },

  // LoA functions
  createLoA(userId, robloxUsername, reason, startDate, endDate) {
    return this.run(
      "INSERT INTO loa (user_id, roblox_username, reason, start_date, end_date, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, robloxUsername, reason, startDate, endDate, Date.now()],
    )
  },

  getActiveLoAs() {
    return this.all("SELECT * FROM loa WHERE status = ? AND end_date > ?", ["active", Date.now()])
  },

  expireLoA(id) {
    return this.run("UPDATE loa SET status = ? WHERE id = ?", ["expired", id])
  },

  // Alliance functions
  createAlliance(groupName, groupId, representativeId, channelId) {
    return this.run(
      "INSERT INTO alliances (group_name, group_id, representative_id, channel_id, created_at) VALUES (?, ?, ?, ?, ?)",
      [groupName, groupId, representativeId, channelId, Date.now()],
    )
  },

  getAllAlliances() {
    return this.all("SELECT * FROM alliances")
  },

  updateAllianceRep(id, representativeId) {
    return this.run("UPDATE alliances SET representative_id = ? WHERE id = ?", [representativeId, id])
  },

  updateAllianceCheckin(id) {
    return this.run("UPDATE alliances SET last_checkin = ? WHERE id = ?", [Date.now(), id])
  },

  // Ticket functions
  createTicket(ticketNumber, userId, channelId) {
    return this.run("INSERT INTO tickets (ticket_number, user_id, channel_id, created_at) VALUES (?, ?, ?, ?)", [
      ticketNumber,
      userId,
      channelId,
      Date.now(),
    ])
  },

  getTicket(channelId) {
    return this.get("SELECT * FROM tickets WHERE channel_id = ? AND status = ?", [channelId, "open"])
  },

  claimTicket(channelId, claimedBy) {
    return this.run("UPDATE tickets SET claimed_by = ? WHERE channel_id = ?", [claimedBy, channelId])
  },

  closeTicket(channelId) {
    return this.run("UPDATE tickets SET status = ?, closed_at = ? WHERE channel_id = ?", [
      "closed",
      Date.now(),
      channelId,
    ])
  },

  // Game ban functions
  createGameBan(userId, robloxUsername, robloxId, moderatorId, reason, banType, duration = null) {
    const expiresAt = duration ? Date.now() + duration : null
    return this.run(
      "INSERT INTO game_bans (user_id, roblox_username, roblox_id, moderator_id, reason, ban_type, duration, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [userId, robloxUsername, robloxId, moderatorId, reason, banType, duration, expiresAt, Date.now()],
    )
  },

  getGameBan(robloxId) {
    return this.get("SELECT * FROM game_bans WHERE roblox_id = ? AND (expires_at IS NULL OR expires_at > ?)", [
      robloxId,
      Date.now(),
    ])
  },

  removeGameBan(robloxId) {
    return this.run("DELETE FROM game_bans WHERE roblox_id = ?", [robloxId])
  },

  close() {
    db.close()
  },
}

// Initialize tables on import
dbUtils.initializeTables()

export default db
