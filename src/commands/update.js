import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js"
import { robloxAPI } from "../utils/roblox.js"
import { dbUtils } from "../utils/database.js"

export default {
  data: new SlashCommandBuilder()
    .setName("update")
    .setDescription("Update roles for a user (Role Commander only)")
    .addUserOption((option) => option.setName("user").setDescription("The user to update").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    // Check if user has Role Commander role
    if (!interaction.member.roles.cache.has(process.env.ROLE_COMMANDER_ROLE_ID)) {
      return interaction.reply({ content: "You need the Role Commander role to use this command.", ephemeral: true })
    }

    await interaction.deferReply({ ephemeral: true })

    const user = interaction.options.getUser("user")

    try {
      // Get user's ROBLOX info from database
      const dbUser = dbUtils.getUser(user.id)

      if (!dbUser || !dbUser.roblox_id) {
        return interaction.editReply("User is not verified.")
      }

      // Get current rank
      const rank = await robloxAPI.getRankInGroup(dbUser.roblox_id)

      if (rank === 0) {
        return interaction.editReply("User is no longer in the WashVerse group.")
      }

      // Update roles
      const member = await interaction.guild.members.fetch(user.id)
      await updateUserRoles(member, rank)

      await interaction.editReply(`Successfully updated roles for ${user.username} based on their rank (Rank ${rank}).`)
    } catch (error) {
      console.error(error)
      await interaction.editReply(`Failed to update roles: ${error.message}`)
    }
  },
}

async function updateUserRoles(member, rank) {
  // Remove all rank-based roles first
  const rolesToRemove = [process.env.STAFF_ROLE_ID, process.env.MANAGEMENT_ROLE_ID, process.env.HR_ROLE_ID]

  for (const roleId of rolesToRemove) {
    if (roleId && member.roles.cache.has(roleId)) {
      await member.roles.remove(roleId)
    }
  }

  // Add roles based on rank
  try {
    if (rank >= 5) {
      await member.roles.add(process.env.STAFF_ROLE_ID)
    }
    if (rank >= 10) {
      await member.roles.add(process.env.MANAGEMENT_ROLE_ID)
    }
    if (rank >= 15) {
      await member.roles.add(process.env.HR_ROLE_ID)
    }
  } catch (error) {
    console.error("Error updating roles:", error.message)
  }
}
