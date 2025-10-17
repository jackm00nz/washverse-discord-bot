import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js"
import { dbUtils } from "../utils/database.js"
import config from "../config.js"

export default {
  data: new SlashCommandBuilder()
    .setName("suggestion-approve")
    .setDescription("Approve a suggestion")
    .addStringOption((option) =>
      option.setName("message_id").setDescription("The message ID of the suggestion").setRequired(true),
    )
    .addStringOption((option) => option.setName("response").setDescription("Optional response message"))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    // Check if user has DEV or OWNER role
    const member = interaction.member
    const hasPermission = member.roles.cache.has(config.devRoleId) || member.roles.cache.has(config.ownerRoleId)

    if (!hasPermission) {
      return interaction.reply({ content: "Only Developers and Owners can approve suggestions.", ephemeral: true })
    }

    const messageId = interaction.options.getString("message_id")
    const response = interaction.options.getString("response")

    try {
      const message = await interaction.channel.messages.fetch(messageId)
      const embed = message.embeds[0]

      if (!embed) {
        return interaction.reply({ content: "Could not find suggestion embed.", ephemeral: true })
      }

      const approvedEmbed = EmbedBuilder.from(embed)
        .setColor(config.successColor)
        .setFields(
          embed.fields[0],
          { name: "Status", value: "✅ Approved", inline: true },
          { name: "Reviewed by", value: interaction.user.tag, inline: true },
        )

      if (response) {
        approvedEmbed.addFields({ name: "Response", value: response })
      }

      await message.edit({ embeds: [approvedEmbed] })

      // Update database
      dbUtils.updateSuggestionStatus(messageId, "approved")

      await interaction.reply({ content: "Suggestion approved!", ephemeral: true })
    } catch (error) {
      console.error(error)
      await interaction.reply({ content: "Failed to approve suggestion. Check the message ID.", ephemeral: true })
    }
  },
}
