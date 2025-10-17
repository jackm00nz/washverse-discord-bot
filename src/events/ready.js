import { REST, Routes } from "discord.js"
import { readdirSync } from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import config from "../config.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default {
  name: "ready",
  once: true,
  async execute(client) {
    console.log(`✅ ${config.botName} is online!`)
    console.log(`📊 Serving ${client.guilds.cache.size} server(s)`)
    console.log(`👥 Watching ${client.users.cache.size} user(s)`)

    try {
      console.log("🔄 Registering slash commands...")

      const commands = []
      const commandFiles = readdirSync(join(__dirname, "../commands")).filter((file) => file.endsWith(".js"))

      for (const file of commandFiles) {
        const command = await import(`../commands/${file}`)
        if (command.default?.data) {
          commands.push(command.default.data.toJSON())
        }
      }

      const rest = new REST({ version: "10" }).setToken(config.token)

      // Register commands to the guild (faster for testing)
      const data = await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), { body: commands })

      console.log(`✅ Successfully registered ${data.length} slash commands!`)
    } catch (error) {
      console.error("❌ Error registering slash commands:", error)
    }

    client.user.setActivity("WashVerse Community", { type: 3 }) // 3 = WATCHING
  },
}
