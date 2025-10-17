import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js"
import { dbUtils } from "../utils/database.js"
import { robloxAPI } from "../utils/roblox.js"
import { hyraAPI } from "../utils/hyra.js"
import config from "../config.js"

export default {
  data: new SlashCommandBuilder()
    .setName("terminate")
    .setDescription("Terminate a user (rank them to customer)")
    .addUserOption((option) => option.setName("user").setDescription("The user to terminate").setRequired(true))
    .addStringOption((option) => option.setName("reason").setDescription("Reason for termination").setRequired(true))
    .addStringOption((option) => option.setName("proof").setDescription("Proof/evidence").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true })

    const user = interaction.options.getUser("user")
    const reason = interaction.options.getString("reason")
    const proof = interaction.options.getString("proof")

    try {
      // Get user's ROBLOX info
      const dbUser = dbUtils.getUser(user.id)
      if (!dbUser || !dbUser.roblox_id) {
        return interaction.editReply("User is not verified. Please verify them first.")
      }

      const robloxUsername = dbUser.roblox_username
      const robloxId = dbUser.roblox_id

      // Rank to customer (rank 1)
      await robloxAPI.setRank(robloxId, 1)

      // Create Hyra log
      await hyraAPI.createLog(robloxId, "terminate", reason, proof)

      // Generate HR letter
      const letter = hyraAPI.generateLetter("terminate", robloxUsername, reason, proof)

      // Send letter to HR channel
      const hrChannel = await interaction.client.channels.fetch(config.hrChannelId)
      const letterEmbed = new EmbedBuilder()
        .setTitle("📨 HR Action Required - Termination")
        .setDescription(`Please send the following message to ${robloxUsername}:`)
        .addFields({ name: "Letter", value: letter })
        .setColor(config.errorColor)
        .setTimestamp()

      await hrChannel.send({ embeds: [letterEmbed] })

      // Log to mod logs
      dbUtils.createModLog(user.id, interaction.user.id, "terminate", reason, proof)

      await interaction.editReply(`Successfully terminated ${robloxUsername}. HR letter sent to HR channel.`)
    } catch (error) {
      console.error(error)
      await interaction.editReply(`Failed to terminate user: ${error.message}`)
    }
  },
}
