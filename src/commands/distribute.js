import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js"
import { dbUtils } from "../utils/database.js"
import { robloxAPI } from "../utils/roblox.js"
import config from "../config.js"

export default {
  data: new SlashCommandBuilder()
    .setName("distribute")
    .setDescription("Generate activity distribution report for HR leads")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true })

    try {
      // Get all staff members (those with staff role)
      const guild = interaction.guild
      const staffRole = await guild.roles.fetch(config.staffRoleId)

      if (!staffRole) {
        return interaction.editReply("Staff role not found. Please configure STAFF_ROLE_ID in .env")
      }

      const staffMembers = staffRole.members

      // Analyze activity for each staff member
      const failedStaff = []
      const topStaff = []
      const failedByRank = {}

      for (const [userId, member] of staffMembers) {
        const activity = dbUtils.getActivity(userId)

        if (!activity) {
          dbUtils.createActivity(userId)
          continue
        }

        // Get user's rank
        const dbUser = dbUtils.getUser(userId)
        let rankName = "Unknown"
        let requirements = config.activityRequirements.default

        if (dbUser && dbUser.roblox_id) {
          const rank = await robloxAPI.getRankInGroup(dbUser.roblox_id)
          rankName = `Rank ${rank}`

          const customReq = dbUtils.getRequirement(rankName)
          if (customReq) {
            requirements = customReq
          }
        }

        // Calculate overall completion
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

        const staffData = {
          user: member.user,
          rank: rankName,
          completion: overallCompletion,
          activity,
        }

        // Track failed staff
        if (overallCompletion < 100) {
          failedStaff.push(staffData)

          if (!failedByRank[rankName]) {
            failedByRank[rankName] = 0
          }
          failedByRank[rankName]++
        }

        // Track top staff
        topStaff.push(staffData)
      }

      // Sort top staff by completion
      topStaff.sort((a, b) => b.completion - a.completion)
      const top3 = topStaff.slice(0, 3)

      // Create distribution report
      const embed = new EmbedBuilder()
        .setTitle("📈 Activity Distribution Report")
        .setColor(config.primaryColor)
        .setDescription(`Total Staff: ${staffMembers.size}\nFailed Staff: ${failedStaff.length}`)
        .setTimestamp()

      // Failed staff per rank
      let failedByRankText = ""
      for (const [rank, count] of Object.entries(failedByRank)) {
        failedByRankText += `${rank}: ${count}\n`
      }

      if (failedByRankText) {
        embed.addFields({ name: "Failed Staff by Rank", value: failedByRankText || "None" })
      }

      // Top 3 staff
      let top3Text = ""
      for (let i = 0; i < Math.min(3, top3.length); i++) {
        const staff = top3[i]
        top3Text += `${i + 1}. ${staff.user.username} - ${staff.completion.toFixed(1)}% (${staff.rank})\n`
      }

      embed.addFields({ name: "Top 3 Staff", value: top3Text || "No data" })

      // Failed staff list (limited to first 20)
      if (failedStaff.length > 0) {
        let failedListText = ""
        for (let i = 0; i < Math.min(20, failedStaff.length); i++) {
          const staff = failedStaff[i]
          failedListText += `${staff.user.username} - ${staff.completion.toFixed(1)}% (${staff.rank})\n`
        }

        if (failedStaff.length > 20) {
          failedListText += `\n...and ${failedStaff.length - 20} more`
        }

        embed.addFields({ name: "Failed Staff List", value: failedListText })
      }

      // Send to HR channel
      const hrChannel = await interaction.client.channels.fetch(config.hrChannelId)
      await hrChannel.send({ embeds: [embed] })

      await interaction.editReply("Distribution report generated and sent to HR channel.")
    } catch (error) {
      console.error(error)
      await interaction.editReply(`Failed to generate distribution: ${error.message}`)
    }
  },
}
