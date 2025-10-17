import { Client, GatewayIntentBits, Collection } from "discord.js"
import { readdirSync } from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import config from "./config.js"
import { robloxAPI } from "./utils/roblox.js"
import { initScheduler } from "./utils/scheduler.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

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

client.login(config.token)
