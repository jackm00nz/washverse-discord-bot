import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js"
import { robloxAPI } from "../utils/roblox.js"
import { dbUtils } from "../utils/database.js"
import config from "../config.js"

export default {
  data: new SlashCommandBuilder()
    .setName("forceverify")
    .setDescription("Manually verify a user with their ROBLOX username")
    .addUserOption((option) => option.setName("user").setDescription("The user to verify").setRequired(true))
    .addStringOption((option) => option.setName("username").setDescription("ROBLOX username").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true })

    const user = interaction.options.getUser("user")
    const robloxUsername = interaction.options.getString("username")

    try {
      // Get ROBLOX ID from username
      const robloxId = await robloxAPI.getIdFromUsername(robloxUsername)

      if (!robloxId) {
        return interaction.editReply(`ROBLOX user "${robloxUsername}" not found.`)
      }

      // Check if user is in the group
      const rank = await robloxAPI.getRankInGroup(robloxId)

      if (rank === 0) {
        return interaction.editReply(
          `${robloxUsername} is not a member of the WashVerse group. Please have them join first.`,
        )
      }

      // Save to database
      const existingUser = dbUtils.getUser(user.id)
      if (existingUser) {
        dbUtils.updateUserVerification(user.id, robloxUsername, robloxId.toString())
      } else {
        dbUtils.createUser(user.id, robloxUsername, robloxId.toString())
      }

      // Create activity record if it doesn't exist
      if (!dbUtils.getActivity(user.id)) {
        dbUtils.createActivity(user.id)
      }

      // Update roles based on rank
      const member = await interaction.guild.members.fetch(user.id)
      await updateUserRoles(member, rank)

      const embed = new EmbedBuilder()
        .setTitle("✅ Force Verification Successful")
        .setDescription(`${user.username} has been verified as **${robloxUsername}**`)
        .addFields(
          { name: "Discord User", value: user.tag, inline: true },
          { name: "ROBLOX ID", value: robloxId.toString(), inline: true },
          { name: "Group Rank", value: `Rank ${rank}`, inline: true },
        )
        .setColor(config.successColor)
        .setTimestamp()

      await interaction.editReply({ embeds: [embed] })

      // Notify the user
      try {
        await user.send(
          `You have been manually verified in WashVerse as **${robloxUsername}**.\n\nYour roles have been updated based on your group rank.`,
        )
      } catch (error) {
        console.log("Could not DM user")
      }
    } catch (error) {
      console.error(error)
      await interaction.editReply(`Force verification failed: ${error.message}`)
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
