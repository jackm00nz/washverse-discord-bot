import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js"
import { dbUtils } from "../utils/database.js"
import { hyraAPI } from "../utils/hyra.js"
import config from "../config.js"

export default {
  data: new SlashCommandBuilder()
    .setName("loa")
    .setDescription("Grant a Leave of Absence to a user")
    .addUserOption((option) => option.setName("user").setDescription("The user to grant LoA").setRequired(true))
    .addStringOption((option) =>
      option.setName("start_date").setDescription("Start date (YYYY-MM-DD)").setRequired(true),
    )
    .addStringOption((option) => option.setName("end_date").setDescription("End date (YYYY-MM-DD)").setRequired(true))
    .addStringOption((option) => option.setName("reason").setDescription("Reason for LoA").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true })

    const user = interaction.options.getUser("user")
    const startDate = interaction.options.getString("start_date")
    const endDate = interaction.options.getString("end_date")
    const reason = interaction.options.getString("reason")

    // Validate dates
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return interaction.editReply("Invalid date format. Use YYYY-MM-DD (e.g., 2025-01-15)")
    }

    if (end <= start) {
      return interaction.editReply("End date must be after start date.")
    }

    try {
      const member = await interaction.guild.members.fetch(user.id)

      // Add LoA role
      await member.roles.add(config.loaRoleId)

      // Store in database
      dbUtils.createLoA(user.id, startDate, endDate, reason)

      // Get user's ROBLOX info for letter
      const dbUser = dbUtils.getUser(user.id)
      const robloxUsername = dbUser?.roblox_username || user.username

      // Generate HR letter
      const letter = hyraAPI.generateLetter("loa", robloxUsername, reason, "")

      // Send letter to HR channel
      const hrChannel = await interaction.client.channels.fetch(config.hrChannelId)
      const letterEmbed = new EmbedBuilder()
        .setTitle("📨 HR Action Required - Leave of Absence")
        .setDescription(`Please send the following message to ${robloxUsername}:`)
        .addFields(
          { name: "Letter", value: letter },
          { name: "Start Date", value: startDate, inline: true },
          { name: "End Date", value: endDate, inline: true },
        )
        .setColor(config.primaryColor)
        .setTimestamp()

      await hrChannel.send({ embeds: [letterEmbed] })

      // Send DM to user
      try {
        await user.send(
          `Your Leave of Absence has been approved!\n\n**Start Date:** ${startDate}\n**End Date:** ${endDate}\n**Reason:** ${reason}\n\nYou will be notified when your LoA expires. Enjoy your time off!`,
        )
      } catch (error) {
        console.log("Could not DM user")
      }

      await interaction.editReply(
        `Successfully granted LoA to ${user.tag} from ${startDate} to ${endDate}. HR letter sent to HR channel.`,
      )
    } catch (error) {
      console.error(error)
      await interaction.editReply(`Failed to grant LoA: ${error.message}`)
    }
  },
}
