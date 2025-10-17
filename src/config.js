import { config as dotenvConfig } from "dotenv"
dotenvConfig()

const requiredEnvVars = {
  DISCORD_TOKEN: process.env.DISCORD_TOKEN,
  CLIENT_ID: process.env.CLIENT_ID,
  GUILD_ID: process.env.GUILD_ID,
}

// Check for missing required environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key)

if (missingVars.length > 0) {
  console.error("❌ Missing required environment variables:")
  missingVars.forEach((varName) => {
    console.error(`   - ${varName}`)
  })
  console.error("\n💡 Set these in Railway's Variables dashboard:")
  console.error("   https://railway.app/dashboard → Your Project → Variables")
  process.exit(1)
}

export default {
  // Discord Bot Configuration
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID,
  botName: "William from WashVerse",

  // ROBLOX Configuration (optional for now)
  robloxGroupId: process.env.ROBLOX_GROUP_ID || "",
  robloxCookie: process.env.ROBLOX_COOKIE || "",

  // API Keys (optional for now)
  hyraApiKey: process.env.HYRA_API_KEY || "",
  bloxlinkApiKey: process.env.BLOXLINK_API_KEY || "",

  // Database
  databasePath: process.env.DATABASE_PATH || "./data/bot.db",

  // Bot Settings
  prefix: "!",
  primaryColor: 0x5865f2,
  welcomeChannelName: "welcome",
  rulesChannelName: "rules",
}
