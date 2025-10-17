import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js"
import { dbUtils } from "../utils/database.js"
import config from "../config.js"

export default {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Warn a user")
    .addUserOption((option) => option.setName("user").setDescription("The user to warn").setRequired(true))
    .addStringOption((option) => option.setName("reason").setDescription("Reason for warning").setRequired(true))
    .addStringOption((option) => option.setName("proof").setDescription("Proof/evidence").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const user = interaction.options.getUser("user")
    const reason = interaction.options.getString("reason")
    const proof = interaction.options.getString("proof")

    try {
      // Log to database
      dbUtils.createModLog(user.id, interaction.user.id, "warn", reason, proof)

      // Send to mod log channel
      const modLogChannel = await interaction.client.channels.fetch(config.modLogChannelId)
      const logEmbed = new EmbedBuilder()
        .setTitle("⚠️ User Warned")
        .setColor(config.warningColor)
        .addFields(
          { name: "User", value: `${user.tag} (${user.id})`, inline: true },
          { name: "Moderator", value: `${interaction.user.tag}`, inline: true },
          { name: "Reason", value: reason },
          { name: "Proof", value: proof },
        )
        .setTimestamp()

      await modLogChannel.send({ embeds: [logEmbed] })

      // Try to DM the user
      try {
        await user.send(
          `You have been warned in WashVerse.\n\n**Reason:** ${reason}\n\nPlease review the server rules to avoid further action.`,
        )
      } catch (error) {
        console.log("Could not DM user")
      }

      await interaction.reply({ content: `Successfully warned ${user.tag}.`, ephemeral: true })
    } catch (error) {
      console.error(error)
      await interaction.reply({ content: "Failed to warn user.", ephemeral: true })
    }
  },
}
