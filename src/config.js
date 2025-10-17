import { config } from "dotenv"
config()

export default {
  // Discord Configuration
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID,

  // Bot Settings
  prefix: "!",
  botName: "William from WashVerse",
  primaryColor: 0x3498db, // Blue color for embeds

  // ROBLOX Configuration
  roblox: {
    groupId: process.env.ROBLOX_GROUP_ID,
    cookie: process.env.ROBLOX_COOKIE,
  },

  // API Configuration
  hyra: {
    apiKey: process.env.HYRA_API_KEY,
    apiUrl: process.env.HYRA_API_URL || "https://api.hyra.io/v1",
  },

  bloxlink: {
    apiKey: process.env.BLOXLINK_API_KEY,
  },

  // Database Configuration
  database: {
    path: process.env.DATABASE_PATH || "./data/washverse.db",
  },

  // Role Configuration (Discord Role IDs)
  roles: {
    staff: "STAFF_ROLE_ID_HERE",
    management: "MANAGEMENT_ROLE_ID_HERE",
    hr: "HR_ROLE_ID_HERE",
    developer: "DEVELOPER_ROLE_ID_HERE",
    roleCommander: "ROLE_COMMANDER_ID_HERE",
    sessionHost: "SESSION_HOST_ID_HERE",
    allianceManager: "ALLIANCE_MANAGER_ID_HERE",
    representative: "REPRESENTATIVE_ID_HERE",
  },

  // Channel Configuration (Discord Channel IDs)
  channels: {
    welcome: "WELCOME_CHANNEL_ID_HERE",
    modLogs: "MOD_LOGS_CHANNEL_ID_HERE",
    actionLogs: "ACTION_LOGS_CHANNEL_ID_HERE",
    sessionLogs: "SESSION_LOGS_CHANNEL_ID_HERE",
    suggestions: "SUGGESTIONS_CHANNEL_ID_HERE",
    announcements: "ANNOUNCEMENTS_CHANNEL_ID_HERE",
    managementAnnouncements: "MANAGEMENT_ANNOUNCEMENTS_CHANNEL_ID_HERE",
    ticketLogs: "TICKET_LOGS_CHANNEL_ID_HERE",
    ticketCategory: "TICKET_CATEGORY_ID_HERE",
    allianceCategory: "ALLIANCE_CATEGORY_ID_HERE",
  },

  // ROBLOX Rank Mappings (Group Rank ID -> Discord Role ID)
  rankRoles: {
    255: "OWNER_ROLE_ID_HERE", // Example: Owner rank
    254: "CO_OWNER_ROLE_ID_HERE", // Example: Co-Owner rank
    // Add more rank mappings as needed
  },

  // Permission Helper Functions
  hasStaffPermission: (member) => {
    return (
      member.roles.cache.has(this.roles.staff) ||
      member.roles.cache.has(this.roles.management) ||
      member.roles.cache.has(this.roles.hr) ||
      member.roles.cache.has(this.roles.developer)
    )
  },

  hasManagementPermission: (member) => {
    return (
      member.roles.cache.has(this.roles.management) ||
      member.roles.cache.has(this.roles.hr) ||
      member.roles.cache.has(this.roles.developer)
    )
  },

  hasHRPermission: (member) => {
    return member.roles.cache.has(this.roles.hr) || member.roles.cache.has(this.roles.developer)
  },

  hasDeveloperPermission: (member) => {
    return member.roles.cache.has(this.roles.developer)
  },
}
