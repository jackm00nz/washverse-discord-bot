import { Client, GatewayIntentBits, Collection, Events, EmbedBuilder } from "discord.js"
import { config } from "./config.js"
import { commands } from "./commands/index.js"
import dotenv from "dotenv"

dotenv.config()

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
for (const command of commands) {
  client.commands.set(command.name, command)
}

client.once(Events.ClientReady, (c) => {
  console.log(`✅ WashVerse Bot is online as ${c.user.tag}`)
  client.user.setActivity("WashVerse Car Wash", { type: 0 })
})

// Welcome new members
client.on(Events.GuildMemberAdd, (member) => {
  const welcomeEmbed = new EmbedBuilder()
    .setColor(config.colors.primary)
    .setTitle("🚗 Welcome to WashVerse!")
    .setDescription(
      `Welcome ${member.user}, to the official WashVerse Discord server!\n\n` +
        `We're a premier ROBLOX car wash group dedicated to providing excellent service.\n\n` +
        `Use \`${config.prefix}help\` to see available commands.`,
    )
    .setThumbnail(member.user.displayAvatarURL())
    .setTimestamp()

  const channel = member.guild.channels.cache.get(config.channels.welcome)
  if (channel) {
    channel.send({ embeds: [welcomeEmbed] })
  }
})

// Handle messages
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot || !message.content.startsWith(config.prefix)) return

  const args = message.content.slice(config.prefix.length).trim().split(/ +/)
  const commandName = args.shift().toLowerCase()

  const command = client.commands.get(commandName)

  if (!command) return

  try {
    await command.execute(message, args)
  } catch (error) {
    console.error(`Error executing command ${commandName}:`, error)
    message.reply("There was an error executing that command!")
  }
})

client.login(process.env.DISCORD_BOT_TOKEN)
