import { SlashCommandBuilder, EmbedBuilder } from "discord.js"
import { dbUtils } from "../utils/database.js"
import config from "../config.js"

export default {
  data: new SlashCommandBuilder()
    .setName("suggest")
    .setDescription("Submit a suggestion")
    .addStringOption((option) =>
      option.setName("suggestion").setDescription("Your suggestion").setRequired(true).setMaxLength(1000),
    ),

  async execute(interaction) {
    const suggestion = interaction.options.getString("suggestion")

    try {
      const embed = new EmbedBuilder()
        .setTitle("💡 New Suggestion")
        .setDescription(suggestion)
        .setColor(config.primaryColor)
        .addFields(
          { name: "Submitted by", value: `${interaction.user.tag}`, inline: true },
          { name: "Status", value: "Pending", inline: true },
        )
        .setTimestamp()

      const suggestionMessage = await interaction.channel.send({ embeds: [embed] })

      // Add reaction buttons
      await suggestionMessage.react("👍")
      await suggestionMessage.react("👎")

      // Save to database
      dbUtils.createSuggestion(interaction.user.id, suggestion, suggestionMessage.id)

      await interaction.reply({ content: "Your suggestion has been submitted!", ephemeral: true })
    } catch (error) {
      console.error(error)
      await interaction.reply({ content: "Failed to submit suggestion.", ephemeral: true })
    }
  },
}
