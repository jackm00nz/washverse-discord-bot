import { EmbedBuilder } from "discord.js"
import { config } from "../config.js"

export const statsCommand = {
  name: "stats",
  description: "View your work statistics",
  execute: async (message, args) => {
    // This is a placeholder - in production, fetch from database
    const statsEmbed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle("📊 Your WashVerse Statistics")
      .setDescription(`Statistics for ${message.author}`)
      .addFields(
        { name: "⏰ Total Hours", value: "0h 0m", inline: true },
        { name: "🚗 Cars Washed", value: "0", inline: true },
        { name: "⭐ Rating", value: "5.0/5.0", inline: true },
        { name: "📅 Member Since", value: message.member.joinedAt.toLocaleDateString(), inline: true },
      )
      .setThumbnail(message.author.displayAvatarURL())
      .setFooter({ text: "Keep up the great work!" })
      .setTimestamp()

    message.reply({ embeds: [statsEmbed] })
  },
}
