import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js"
import { dbUtils } from "../utils/database.js"
import config from "../config.js"

export default {
  data: new SlashCommandBuilder()
    .setName("checkin")
    .setDescription("Send weekly alliance check-in to all alliance channels")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true })

    try {
      const alliances = dbUtils.getAlliances()

      if (alliances.length === 0) {
        return interaction.editReply("No alliances registered yet.")
      }

      let successCount = 0
      let failCount = 0

      for (const alliance of alliances) {
        try {
          const channel = await interaction.client.channels.fetch(alliance.channel_id)

          const checkinEmbed = new EmbedBuilder()
            .setTitle("📋 Weekly Alliance Check-In")
            .setDescription(
              `Hello ${alliance.group_name}! This is your weekly check-in.\n\nPlease respond with any updates, concerns, or news from your group.`,
            )
            .setColor(config.primaryColor)
            .setTimestamp()

          await channel.send({ embeds: [checkinEmbed] })
          successCount++
        } catch (error) {
          console.error(`Failed to send check-in to ${alliance.group_name}:`, error.message)
          failCount++
        }
      }

      await interaction.editReply(
        `Check-in sent to ${successCount} alliance(s).${failCount > 0 ? ` Failed: ${failCount}` : ""}`,
      )
    } catch (error) {
      console.error(error)
      await interaction.editReply(`Failed to send check-ins: ${error.message}`)
    }
  },
}
