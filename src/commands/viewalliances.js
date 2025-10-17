import { SlashCommandBuilder, EmbedBuilder } from "discord.js"
import { dbUtils } from "../utils/database.js"
import config from "../config.js"

export default {
  data: new SlashCommandBuilder().setName("viewalliances").setDescription("View all registered alliances"),

  async execute(interaction) {
    try {
      const alliances = dbUtils.getAlliances()

      if (alliances.length === 0) {
        return interaction.reply({ content: "No alliances registered yet.", ephemeral: true })
      }

      const embed = new EmbedBuilder()
        .setTitle("🤝 Registered Alliances")
        .setColor(config.primaryColor)
        .setDescription(`Total Alliances: ${alliances.length}`)
        .setTimestamp()

      for (const alliance of alliances) {
        const channel = alliance.channel_id ? `<#${alliance.channel_id}>` : "No channel"
        const reps = alliance.representatives || "None assigned"

        embed.addFields({
          name: alliance.group_name,
          value: `**Group Link:** ${alliance.group_link || "N/A"}\n**Server Link:** ${alliance.server_link || "N/A"}\n**Channel:** ${channel}\n**Representatives:** ${reps}`,
        })
      }

      await interaction.reply({ embeds: [embed], ephemeral: true })
    } catch (error) {
      console.error(error)
      await interaction.reply({ content: "Failed to retrieve alliances.", ephemeral: true })
    }
  },
}
