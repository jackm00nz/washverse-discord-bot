import { SlashCommandBuilder, EmbedBuilder } from "discord.js"
import { bloxlinkAPI } from "../utils/bloxlink.js"
import { robloxAPI } from "../utils/roblox.js"
import { dbUtils } from "../utils/database.js"
import config from "../config.js"

export default {
  data: new SlashCommandBuilder().setName("verify").setDescription("Verify your ROBLOX account with Discord"),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true })

    try {
      // Get user's ROBLOX info from Bloxlink
      const bloxlinkData = await bloxlinkAPI.getUser(interaction.user.id)

      if (!bloxlinkData || !bloxlinkData.robloxID) {
        return interaction.editReply(
          "Could not find your ROBLOX account. Please verify with Bloxlink first:\n1. Use `/verify` in a server with Bloxlink\n2. Or visit https://blox.link to link your account",
        )
      }

      const robloxId = bloxlinkData.robloxID
      const robloxUsername = await robloxAPI.getUsernameFromId(robloxId)

      if (!robloxUsername) {
        return interaction.editReply("Failed to fetch ROBLOX username. Please try again later.")
      }

      // Check if user is in the group
      const rank = await robloxAPI.getRankInGroup(robloxId)

      if (rank === 0) {
        return interaction.editReply(
          `You are not a member of the WashVerse group. Please join the group first:\nhttps://www.roblox.com/groups/${config.robloxGroupId}`,
        )
      }

      // Save to database
      const existingUser = dbUtils.getUser(interaction.user.id)
      if (existingUser) {
        dbUtils.updateUserVerification(interaction.user.id, robloxUsername, robloxId)
      } else {
        dbUtils.createUser(interaction.user.id, robloxUsername, robloxId)
      }

      // Create activity record if it doesn't exist
      if (!dbUtils.getActivity(interaction.user.id)) {
        dbUtils.createActivity(interaction.user.id)
      }

      // Update roles based on rank
      await updateUserRoles(interaction.member, rank)

      const embed = new EmbedBuilder()
        .setTitle("✅ Verification Successful")
        .setDescription(`You have been verified as **${robloxUsername}**`)
        .addFields(
          { name: "ROBLOX ID", value: robloxId.toString(), inline: true },
          { name: "Group Rank", value: `Rank ${rank}`, inline: true },
        )
        .setColor(config.successColor)
        .setTimestamp()

      await interaction.editReply({ embeds: [embed] })
    } catch (error) {
      console.error(error)
      await interaction.editReply(`Verification failed: ${error.message}`)
    }
  },
}

async function updateUserRoles(member, rank) {
  // This function would map ROBLOX ranks to Discord roles
  // You would need to configure role mappings based on your group structure
  // Example: Rank 5+ gets Staff role, Rank 10+ gets Management role, etc.

  try {
    if (rank >= 5) {
      await member.roles.add(process.env.STAFF_ROLE_ID)
    }
    if (rank >= 10) {
      await member.roles.add(process.env.MANAGEMENT_ROLE_ID)
    }
  } catch (error) {
    console.error("Error updating roles:", error.message)
  }
}
