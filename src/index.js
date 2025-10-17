import { Client, GatewayIntentBits, Collection } from "discord.js"
import { readdirSync } from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import config from "./config.js"
import { robloxAPI } from "./utils/roblox.js"
import { initScheduler } from "./utils/scheduler.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

console.log("🤖 Starting William from WashVerse Discord Bot...")
console.log("=".repeat(50))

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
})

client.commands = new Collection()

// Load commands
const commandFiles = readdirSync(join(__dirname, "commands")).filter((file) => file.endsWith(".js"))
for (const file of commandFiles) {
  const command = await import(`./commands/${file}`)
  client.commands.set(command.default.data.name, command.default)
}

// Load events
const eventFiles = readdirSync(join(__dirname, "events")).filter((file) => file.endsWith(".js"))
for (const file of eventFiles) {
  const event = await import(`./events/${file}`)
  if (event.default.once) {
    client.once(event.default.name, (...args) => event.default.execute(...args))
  } else {
    client.on(event.default.name, (...args) => event.default.execute(...args))
  }
}

client.once("ready", async () => {
  console.log(`${config.botName} is online!`)

  // Authenticate with ROBLOX
  await robloxAPI.authenticate()

  // Initialize scheduler for LoA checks and alliance check-ins
  initScheduler(client)
})

console.log("🔐 Attempting to login to Discord...")
client.login(config.token).catch((error) => {
  console.error("❌ Failed to login to Discord:")
  console.error(error.message)
  console.error("\n💡 Common issues:")
  console.error("   1. Invalid or missing DISCORD_TOKEN in Railway Variables")
  console.error("   2. Token was regenerated in Discord Developer Portal")
  console.error("   3. Bot token has incorrect permissions")
  console.error("\n📝 To fix:")
  console.error("   1. Go to https://discord.com/developers/applications")
  console.error("   2. Select your application")
  console.error('   3. Go to "Bot" section')
  console.error("   4. Reset token if needed and copy the new token")
  console.error("   5. Add it to Railway Variables as DISCORD_TOKEN")
  process.exit(1)
})
