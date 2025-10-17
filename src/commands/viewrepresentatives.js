import { SlashCommandBuilder, EmbedBuilder } from "discord.js"
import { dbUtils } from "../utils/database.js"
import config from "../config.js"

export default {
  data: new SlashCommandBuilder()
    .setName("viewrepresentatives")
    .setDescription("View all assigned representatives for each group"),

  async execute(interaction) {
    try {
      const alliances = dbUtils.getAlliances()

      if (alliances.length === 0) {
        return interaction.reply({ content: "No alliances registered yet.", ephemeral: true })
      }

      const embed = new EmbedBuilder()
        .setTitle("👥 Alliance Representatives")
        .setColor(config.primaryColor)
        .setTimestamp()

      for (const alliance of alliances) {
        const reps = alliance.representatives || "None assigned"
        embed.addFields({
          name: alliance.group_name,
          value: reps,
          inline: true,
        })
      }

      await interaction.reply({ embeds: [embed], ephemeral: true })
    } catch (error) {
      console.error(error)
      await interaction.reply({ content: "Failed to retrieve representatives.", ephemeral: true })
    }
  },
}
