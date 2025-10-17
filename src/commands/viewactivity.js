import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js"
import { dbUtils } from "../utils/database.js"
import { robloxAPI } from "../utils/roblox.js"
import config from "../config.js"

export default {
  data: new SlashCommandBuilder()
    .setName("viewactivity")
    .setDescription("View activity information for a user")
    .addUserOption((option) => option.setName("user").setDescription("The user to check").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true })

    const user = interaction.options.getUser("user")

    try {
      // Get user's activity data
      let activity = dbUtils.getActivity(user.id)

      if (!activity) {
        // Create activity record if it doesn't exist
        dbUtils.createActivity(user.id)
        activity = { sessions_attended: 0, sessions_hosted: 0, minutes: 0, messages: 0 }
      }

      // Get user's ROBLOX rank to determine requirements
      const dbUser = dbUtils.getUser(user.id)
      let rankName = "Unknown"
      let requirements = config.activityRequirements.default

      if (dbUser && dbUser.roblox_id) {
        const rank = await robloxAPI.getRankInGroup(dbUser.roblox_id)
        rankName = `Rank ${rank}`

        // Check if custom requirements exist for this rank
        const customReq = dbUtils.getRequirement(rankName)
        if (customReq) {
          requirements = customReq
        }
      }

      // Calculate completion percentage
      const completionPercentages = {
        sessionsAttended: Math.min((activity.sessions_attended / requirements.sessionsAttended) * 100, 100),
        sessionsHosted: Math.min((activity.sessions_hosted / requirements.sessionsHosted) * 100, 100),
        minutes: Math.min((activity.minutes / requirements.minutes) * 100, 100),
        messages: Math.min((activity.messages / requirements.messages) * 100, 100),
      }

      const overallCompletion =
        (completionPercentages.sessionsAttended +
          completionPercentages.sessionsHosted +
          completionPercentages.minutes +
          completionPercentages.messages) /
        4

      const embed = new EmbedBuilder()
        .setTitle(`📊 Activity Report for ${user.username}`)
        .setColor(overallCompletion >= 100 ? config.successColor : config.warningColor)
        .setThumbnail(user.displayAvatarURL())
        .addFields(
          { name: "Rank", value: rankName, inline: true },
          { name: "Overall Completion", value: `${overallCompletion.toFixed(1)}%`, inline: true },
          { name: "\u200B", value: "\u200B", inline: true },
          {
            name: "Sessions Attended",
            value: `${activity.sessions_attended}/${requirements.sessionsAttended} (${completionPercentages.sessionsAttended.toFixed(1)}%)`,
            inline: true,
          },
          {
            name: "Sessions Hosted",
            value: `${activity.sessions_hosted}/${requirements.sessionsHosted} (${completionPercentages.sessionsHosted.toFixed(1)}%)`,
            inline: true,
          },
          { name: "\u200B", value: "\u200B", inline: true },
          {
            name: "Minutes",
            value: `${activity.minutes}/${requirements.minutes} (${completionPercentages.minutes.toFixed(1)}%)`,
            inline: true,
          },
          {
            name: "Messages",
            value: `${activity.messages}/${requirements.messages} (${completionPercentages.messages.toFixed(1)}%)`,
            inline: true,
          },
        )
        .setTimestamp()

      if (overallCompletion >= 100) {
        embed.setFooter({ text: "✅ Meeting all activity requirements" })
      } else {
        embed.setFooter({ text: "⚠️ Not meeting all activity requirements" })
      }

      await interaction.editReply({ embeds: [embed] })
    } catch (error) {
      console.error(error)
      await interaction.editReply("Failed to retrieve activity information.")
    }
  },
}
