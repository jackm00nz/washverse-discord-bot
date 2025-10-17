import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js"
import config from "../config.js"

export default {
  data: new SlashCommandBuilder()
    .setName("conclude")
    .setDescription("Announce session conclusion")
    .addIntegerOption((option) =>
      option.setName("attendees").setDescription("Number of attendees").setRequired(true).setMinValue(0),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents),

  async execute(interaction) {
    const attendees = interaction.options.getInteger("attendees")

    try {
      const embed = new EmbedBuilder()
        .setTitle("✅ Session Concluded")
        .setDescription(
          `The session has officially concluded. Thank you to all ${attendees} attendees for participating!`,
        )
        .addFields(
          { name: "Total Attendees", value: attendees.toString(), inline: true },
          { name: "Host", value: interaction.user.toString(), inline: true },
        )
        .setColor(config.successColor)
        .setTimestamp()
        .setFooter({ text: "Logs will be processed shortly" })

      await interaction.channel.send({ embeds: [embed] })

      await interaction.reply({ content: "Session conclusion announced!", ephemeral: true })
    } catch (error) {
      console.error(error)
      await interaction.reply({ content: "Failed to announce session conclusion.", ephemeral: true })
    }
  },
}
