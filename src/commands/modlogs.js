import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js"
import { dbUtils } from "../utils/database.js"
import config from "../config.js"

export default {
  data: new SlashCommandBuilder()
    .setName("modlogs")
    .setDescription("View moderation logs for a user")
    .addUserOption((option) => option.setName("user").setDescription("The user to check").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const user = interaction.options.getUser("user")
    const logs = dbUtils.getModLogs(user.id)

    if (logs.length === 0) {
      return interaction.reply({ content: `${user.tag} has no moderation logs.`, ephemeral: true })
    }

    const embed = new EmbedBuilder()
      .setTitle(`📋 Moderation Logs for ${user.tag}`)
      .setColor(config.primaryColor)
      .setThumbnail(user.displayAvatarURL())
      .setDescription(`Total infractions: ${logs.length}`)

    // Show last 10 logs
    const recentLogs = logs.slice(0, 10)
    for (const log of recentLogs) {
      const moderator = await interaction.client.users.fetch(log.moderator_id)
      const timestamp = new Date(log.timestamp).toLocaleString()

      embed.addFields({
        name: `${log.action.toUpperCase()} - ${timestamp}`,
        value: `**Moderator:** ${moderator.tag}\n**Reason:** ${log.reason}\n**Proof:** ${log.proof}${log.duration ? `\n**Duration:** ${log.duration}` : ""}`,
      })
    }

    if (logs.length > 10) {
      embed.setFooter({ text: `Showing 10 of ${logs.length} total logs` })
    }

    await interaction.reply({ embeds: [embed], ephemeral: true })
  },
}
