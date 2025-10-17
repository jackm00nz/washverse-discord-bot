import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js"
import { dbUtils } from "../utils/database.js"
import config from "../config.js"

export default {
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Timeout a user")
    .addUserOption((option) => option.setName("user").setDescription("The user to timeout").setRequired(true))
    .addStringOption((option) => option.setName("time").setDescription("Duration (e.g., 5m, 1h, 1d)").setRequired(true))
    .addStringOption((option) => option.setName("reason").setDescription("Reason for timeout").setRequired(true))
    .addStringOption((option) => option.setName("proof").setDescription("Proof/evidence").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const user = interaction.options.getUser("user")
    const time = interaction.options.getString("time")
    const reason = interaction.options.getString("reason")
    const proof = interaction.options.getString("proof")

    // Parse time to milliseconds
    const timeRegex = /^(\d+)([smhd])$/
    const match = time.match(timeRegex)

    if (!match) {
      return interaction.reply({ content: "Invalid time format. Use: 5m, 1h, 1d, etc.", ephemeral: true })
    }

    const amount = Number.parseInt(match[1])
    const unit = match[2]
    const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 }
    const duration = amount * multipliers[unit]

    if (duration > 2419200000) {
      // 28 days max
      return interaction.reply({ content: "Timeout duration cannot exceed 28 days.", ephemeral: true })
    }

    try {
      const member = await interaction.guild.members.fetch(user.id)
      await member.timeout(duration, reason)

      // Log to database
      dbUtils.createModLog(user.id, interaction.user.id, "timeout", reason, proof, time)

      // Send to mod log channel
      const modLogChannel = await interaction.client.channels.fetch(config.modLogChannelId)
      const logEmbed = new EmbedBuilder()
        .setTitle("⏱️ User Timed Out")
        .setColor(config.warningColor)
        .addFields(
          { name: "User", value: `${user.tag} (${user.id})`, inline: true },
          { name: "Moderator", value: `${interaction.user.tag}`, inline: true },
          { name: "Duration", value: time, inline: true },
          { name: "Reason", value: reason },
          { name: "Proof", value: proof },
        )
        .setTimestamp()

      await modLogChannel.send({ embeds: [logEmbed] })

      await interaction.reply({ content: `Successfully timed out ${user.tag} for ${time}.`, ephemeral: true })
    } catch (error) {
      console.error(error)
      await interaction.reply({ content: "Failed to timeout user. Check permissions.", ephemeral: true })
    }
  },
}
