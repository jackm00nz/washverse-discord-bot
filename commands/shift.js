import { EmbedBuilder } from "discord.js"
import { config } from "../config.js"

// In-memory storage (in production, use a database)
const activeShifts = new Map()

export const shiftCommand = {
  name: "shift",
  description: "Log your shift times",
  execute: async (message, args) => {
    const action = args[0]?.toLowerCase()
    const userId = message.author.id

    if (!action || !["start", "end"].includes(action)) {
      return message.reply("❌ Usage: `!shift <start|end>`")
    }

    if (action === "start") {
      if (activeShifts.has(userId)) {
        return message.reply("❌ You already have an active shift! Use `!shift end` to end it.")
      }

      activeShifts.set(userId, {
        startTime: Date.now(),
        username: message.author.tag,
      })

      const startEmbed = new EmbedBuilder()
        .setColor(config.colors.success)
        .setTitle("✅ Shift Started")
        .setDescription(`${message.author}, your shift has been logged!`)
        .addFields({ name: "Start Time", value: new Date().toLocaleString(), inline: true })
        .setTimestamp()

      message.reply({ embeds: [startEmbed] })
    } else if (action === "end") {
      const shift = activeShifts.get(userId)

      if (!shift) {
        return message.reply("❌ You don't have an active shift! Use `!shift start` to start one.")
      }

      const duration = Date.now() - shift.startTime
      const hours = Math.floor(duration / 3600000)
      const minutes = Math.floor((duration % 3600000) / 60000)

      activeShifts.delete(userId)

      const endEmbed = new EmbedBuilder()
        .setColor(config.colors.success)
        .setTitle("✅ Shift Ended")
        .setDescription(`${message.author}, your shift has been completed!`)
        .addFields(
          { name: "Duration", value: `${hours}h ${minutes}m`, inline: true },
          { name: "End Time", value: new Date().toLocaleString(), inline: true },
        )
        .setTimestamp()

      message.reply({ embeds: [endEmbed] })
    }
  },
}
