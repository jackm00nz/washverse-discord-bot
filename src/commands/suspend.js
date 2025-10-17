import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js"
import { dbUtils } from "../utils/database.js"
import { robloxAPI } from "../utils/roblox.js"
import { hyraAPI } from "../utils/hyra.js"
import config from "../config.js"

export default {
  data: new SlashCommandBuilder()
    .setName("suspend")
    .setDescription("Suspend a user by ranking them to customer")
    .addUserOption((option) => option.setName("user").setDescription("The user to suspend").setRequired(true))
    .addStringOption((option) =>
      option.setName("time").setDescription("Suspension duration (minimum 3d)").setRequired(true),
    )
    .addStringOption((option) => option.setName("reason").setDescription("Reason for suspension").setRequired(true))
    .addStringOption((option) => option.setName("proof").setDescription("Proof/evidence").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true })

    const user = interaction.options.getUser("user")
    const time = interaction.options.getString("time")
    const reason = interaction.options.getString("reason")
    const proof = interaction.options.getString("proof")

    // Parse time to ensure minimum 3 days
    const timeRegex = /^(\d+)([dw])$/
    const match = time.match(timeRegex)

    if (!match) {
      return interaction.editReply("Invalid time format. Use: 3d, 7d, 1w, etc.")
    }

    const amount = Number.parseInt(match[1])
    const unit = match[2]
    const days = unit === "d" ? amount : amount * 7

    if (days < 3) {
      return interaction.editReply("Suspension duration must be at least 3 days.")
    }

    try {
      // Get user's ROBLOX info
      const dbUser = dbUtils.getUser(user.id)
      if (!dbUser || !dbUser.roblox_id) {
        return interaction.editReply("User is not verified. Please verify them first.")
      }

      const robloxUsername = dbUser.roblox_username
      const robloxId = dbUser.roblox_id

      // Get current rank to restore later
      const currentRank = await robloxAPI.getRankInGroup(robloxId)

      // Rank to customer (rank 1)
      await robloxAPI.setRank(robloxId, 1)

      // Create Hyra log
      await hyraAPI.createLog(robloxId, "suspend", reason, proof)

      // Generate HR letter
      const letter = hyraAPI.generateLetter("suspend", robloxUsername, reason, proof)

      // Send letter to HR channel
      const hrChannel = await interaction.client.channels.fetch(config.hrChannelId)
      const letterEmbed = new EmbedBuilder()
        .setTitle("📨 HR Action Required - Suspension")
        .setDescription(`Please send the following message to ${robloxUsername}:`)
        .addFields({ name: "Letter", value: letter })
        .setColor(config.warningColor)
        .setTimestamp()

      await hrChannel.send({ embeds: [letterEmbed] })

      // Schedule re-rank (store in database for scheduler to handle)
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + days)

      // Store suspension info (we'll use LoA table for this)
      dbUtils.createLoA(user.id, new Date().toISOString(), endDate.toISOString(), `Suspended: ${reason}`)

      // Log to mod logs
      dbUtils.createModLog(user.id, interaction.user.id, "suspend", reason, proof, time)

      await interaction.editReply(
        `Successfully suspended ${robloxUsername}. They will be re-ranked to rank ${currentRank} after ${time}. HR letter sent to HR channel.`,
      )
    } catch (error) {
      console.error(error)
      await interaction.editReply(`Failed to suspend user: ${error.message}`)
    }
  },
}
