import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js"
import { dbUtils } from "../utils/database.js"
import config from "../config.js"

export default {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a user from the server")
    .addUserOption((option) => option.setName("user").setDescription("The user to kick").setRequired(true))
    .addStringOption((option) => option.setName("reason").setDescription("Reason for kick").setRequired(true))
    .addStringOption((option) => option.setName("proof").setDescription("Proof/evidence").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    const user = interaction.options.getUser("user")
    const reason = interaction.options.getString("reason")
    const proof = interaction.options.getString("proof")

    try {
      const member = await interaction.guild.members.fetch(user.id)
      await member.kick(reason)

      // Log to database
      dbUtils.createModLog(user.id, interaction.user.id, "kick", reason, proof)

      // Send to mod log channel
      const modLogChannel = await interaction.client.channels.fetch(config.modLogChannelId)
      const logEmbed = new EmbedBuilder()
        .setTitle("👢 User Kicked")
        .setColor(config.errorColor)
        .addFields(
          { name: "User", value: `${user.tag} (${user.id})`, inline: true },
          { name: "Moderator", value: `${interaction.user.tag}`, inline: true },
          { name: "Reason", value: reason },
          { name: "Proof", value: proof },
        )
        .setTimestamp()

      await modLogChannel.send({ embeds: [logEmbed] })

      await interaction.reply({ content: `Successfully kicked ${user.tag}.`, ephemeral: true })
    } catch (error) {
      console.error(error)
      await interaction.reply({ content: "Failed to kick user. Check permissions.", ephemeral: true })
    }
  },
}
