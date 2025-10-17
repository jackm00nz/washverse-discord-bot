import { config } from "dotenv"

config({ path: ".env" })

const requiredEnvVars = ["DISCORD_TOKEN", "CLIENT_ID", "GUILD_ID"]
const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName])

if (missingEnvVars.length > 0) {
  console.error("❌ Missing required environment variables:")
  missingEnvVars.forEach((varName) => {
    console.error(`   - ${varName}`)
  })
  console.error("\n📝 Please set these environment variables in Railway's Variables dashboard.")
  console.error("   Visit: https://railway.app/project/[your-project]/service/[your-service]/variables")
  console.error("\n💡 See DEPLOYMENT.md for detailed setup instructions.")
  process.exit(1)
}

console.log("✅ Environment variables loaded successfully")
console.log(`   Bot Name: William from WashVerse`)
console.log(`   Guild ID: ${process.env.GUILD_ID}`)

export default {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID,

  // ROBLOX Configuration
  robloxGroupId: process.env.ROBLOX_GROUP_ID,
  robloxCookie: process.env.ROBLOX_COOKIE,

  // API Keys
  hyraApiKey: process.env.HYRA_API_KEY,
  hyraApiUrl: process.env.HYRA_API_URL || "https://api.hyra.io",
  bloxlinkApiKey: process.env.BLOXLINK_API_KEY,

  // Database
  databasePath: process.env.DATABASE_PATH || "./data/bot.db",

  // Bot Settings
  prefix: "!",
  botName: "William from WashVerse",
  primaryColor: 0x5865f2,

  // Channel Names
  welcomeChannelName: "welcome",
  rulesChannelName: "rules",

  // Role IDs (to be configured in Railway Variables)
  roles: {
    staff: process.env.ROLE_STAFF_ID,
    management: process.env.ROLE_MANAGEMENT_ID,
    hr: process.env.ROLE_HR_ID,
    developer: process.env.ROLE_DEVELOPER_ID,
  },

  // Channel IDs (to be configured in Railway Variables)
  channels: {
    modLogs: process.env.CHANNEL_MOD_LOGS_ID,
    hrLogs: process.env.CHANNEL_HR_LOGS_ID,
    sessionLogs: process.env.CHANNEL_SESSION_LOGS_ID,
    suggestions: process.env.CHANNEL_SUGGESTIONS_ID,
    tickets: process.env.CHANNEL_TICKETS_ID,
  },
}
