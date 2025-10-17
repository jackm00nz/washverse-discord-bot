import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js"
import { dbUtils } from "../utils/database.js"
import config from "../config.js"

export default {
  data: new SlashCommandBuilder()
    .setName("tempban")
    .setDescription("Temporarily ban a user from the server")
    .addUserOption((option) => option.setName("user").setDescription("The user to ban").setRequired(true))
    .addStringOption((option) =>
      option.setName("time").setDescription("Duration (e.g., 1d, 7d, 14d)").setRequired(true),
    )
    .addStringOption((option) => option.setName("reason").setDescription("Reason for ban").setRequired(true))
    .addStringOption((option) => option.setName("proof").setDescription("Proof/evidence").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const user = interaction.options.getUser("user")
    const time = interaction.options.getString("time")
    const reason = interaction.options.getString("reason")
    const proof = interaction.options.getString("proof")

    try {
      await interaction.guild.members.ban(user.id, { reason })

      // Log to database
      dbUtils.createModLog(user.id, interaction.user.id, "tempban", reason, proof, time)

      // Send to mod log channel
      const modLogChannel = await interaction.client.channels.fetch(config.modLogChannelId)
      const logEmbed = new EmbedBuilder()
        .setTitle("🔨 User Temporarily Banned")
        .setColor(config.errorColor)
        .addFields(
          { name: "User", value: `${user.tag} (${user.id})`, inline: true },
          { name: "Moderator", value: `${interaction.user.tag}`, inline: true },
          { name: "Duration", value: time, inline: true },
          { name: "Reason", value: reason },
          { name: "Proof", value: proof },
        )
        .setTimestamp()
        .setFooter({ text: `Remember to unban after ${time}` })

      await modLogChannel.send({ embeds: [logEmbed] })

      await interaction.reply({
        content: `Successfully temporarily banned ${user.tag} for ${time}. Remember to unban them after the duration.`,
        ephemeral: true,
      })
    } catch (error) {
      console.error(error)
      await interaction.reply({ content: "Failed to ban user. Check permissions.", ephemeral: true })
    }
  },
}
