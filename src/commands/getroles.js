import { SlashCommandBuilder } from "discord.js"
import { robloxAPI } from "../utils/roblox.js"
import { dbUtils } from "../utils/database.js"

export default {
  data: new SlashCommandBuilder().setName("getroles").setDescription("Update your Discord roles based on group rank"),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true })

    try {
      // Get user's ROBLOX info from database
      const dbUser = dbUtils.getUser(interaction.user.id)

      if (!dbUser || !dbUser.roblox_id) {
        return interaction.editReply("You are not verified. Please use `/verify` first.")
      }

      // Get current rank
      const rank = await robloxAPI.getRankInGroup(dbUser.roblox_id)

      if (rank === 0) {
        return interaction.editReply("You are no longer in the WashVerse group.")
      }

      // Update roles
      await updateUserRoles(interaction.member, rank)

      await interaction.editReply(`Successfully updated your roles based on your current rank (Rank ${rank}).`)
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
