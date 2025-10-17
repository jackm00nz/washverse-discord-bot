import { EmbedBuilder } from "discord.js"
import { config } from "../config.js"

export const infoCommand = {
  name: "info",
  description: "Shows information about WashVerse",
  execute: async (message, args) => {
    const infoEmbed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle("🚗 About WashVerse")
      .setDescription(
        "**WashVerse** is a premier ROBLOX car wash group dedicated to providing " +
          "excellent service and a professional work environment.\n\n" +
          "**What We Offer:**\n" +
          "• Professional car washing services\n" +
          "• Friendly and dedicated staff\n" +
          "• Career advancement opportunities\n" +
          "• Active and supportive community\n\n" +
          "**Join Us:**\n" +
          "Visit our ROBLOX group to apply and become part of the WashVerse family!",
      )
      .addFields(
        { name: "👥 Members", value: `${message.guild.memberCount}`, inline: true },
        { name: "📅 Server Created", value: message.guild.createdAt.toLocaleDateString(), inline: true },
      )
      .setThumbnail(message.guild.iconURL())
      .setFooter({ text: "WashVerse - Premium Car Wash Service" })
      .setTimestamp()

    message.reply({ embeds: [infoEmbed] })
  },
}
