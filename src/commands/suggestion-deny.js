import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js"
import { dbUtils } from "../utils/database.js"
import config from "../config.js"

export default {
  data: new SlashCommandBuilder()
    .setName("suggestion-deny")
    .setDescription("Deny a suggestion")
    .addStringOption((option) =>
      option.setName("message_id").setDescription("The message ID of the suggestion").setRequired(true),
    )
    .addStringOption((option) => option.setName("reason").setDescription("Reason for denial"))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    // Check if user has DEV or OWNER role
    const member = interaction.member
    const hasPermission = member.roles.cache.has(config.devRoleId) || member.roles.cache.has(config.ownerRoleId)

    if (!hasPermission) {
      return interaction.reply({ content: "Only Developers and Owners can deny suggestions.", ephemeral: true })
    }

    const messageId = interaction.options.getString("message_id")
    const reason = interaction.options.getString("reason")

    try {
      const message = await interaction.channel.messages.fetch(messageId)
      const embed = message.embeds[0]

      if (!embed) {
        return interaction.reply({ content: "Could not find suggestion embed.", ephemeral: true })
      }

      const deniedEmbed = EmbedBuilder.from(embed)
        .setColor(config.errorColor)
        .setFields(
          embed.fields[0],
          { name: "Status", value: "❌ Denied", inline: true },
          { name: "Reviewed by", value: interaction.user.tag, inline: true },
        )

      if (reason) {
        deniedEmbed.addFields({ name: "Reason", value: reason })
      }

      await message.edit({ embeds: [deniedEmbed] })

      // Update database
      dbUtils.updateSuggestionStatus(messageId, "denied")

      await interaction.reply({ content: "Suggestion denied.", ephemeral: true })
    } catch (error) {
      console.error(error)
      await interaction.reply({ content: "Failed to deny suggestion. Check the message ID.", ephemeral: true })
    }
  },
}
