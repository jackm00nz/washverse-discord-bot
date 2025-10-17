import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js"
import config from "../config.js"

export default {
  data: new SlashCommandBuilder()
    .setName("lock")
    .setDescription("Announce a session lock")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents),

  async execute(interaction) {
    try {
      const embed = new EmbedBuilder()
        .setTitle("🔒 Session Locked")
        .setDescription(
          "The session is now locked. No new participants will be admitted.\n\nThank you to everyone who attended!",
        )
        .setColor(config.warningColor)
        .setTimestamp()

      await interaction.channel.send({ embeds: [embed] })

      await interaction.reply({ content: "Session lock announced!", ephemeral: true })
    } catch (error) {
      console.error(error)
      await interaction.reply({ content: "Failed to announce session lock.", ephemeral: true })
    }
  },
}
