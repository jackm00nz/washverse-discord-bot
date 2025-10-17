import { EmbedBuilder } from "discord.js"
import { config } from "../config.js"

export const helpCommand = {
  name: "help",
  description: "Shows all available commands",
  execute: async (message, args) => {
    const helpEmbed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle("🚗 WashVerse Bot Commands")
      .setDescription("Here are all the available commands:")
      .addFields(
        { name: `${config.prefix}help`, value: "Shows this help message", inline: false },
        { name: `${config.prefix}info`, value: "Shows information about WashVerse", inline: false },
        { name: `${config.prefix}announce <message>`, value: "Make an announcement (Manager only)", inline: false },
        { name: `${config.prefix}shift <start|end>`, value: "Log your shift times", inline: false },
        { name: `${config.prefix}stats`, value: "View your work statistics", inline: false },
      )
      .setFooter({ text: "WashVerse - Premium Car Wash Service" })
      .setTimestamp()

    message.reply({ embeds: [helpEmbed] })
  },
}
