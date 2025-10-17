import { SlashCommandBuilder, EmbedBuilder } from "discord.js"
import config from "../config.js"
import db from "../utils/database.js"

export default {
  data: new SlashCommandBuilder()
    .setName("blacklist")
    .setDescription("Blacklist a user from WashVerse")
    .addStringOption((option) =>
      option.setName("roblox_username").setDescription("ROBLOX username to blacklist").setRequired(true),
    )
    .addStringOption((option) => option.setName("reason").setDescription("Reason for blacklist").setRequired(true)),

  async execute(interaction) {
    // Check if user has developer permission
    if (!config.hasRole(interaction.member, "developer")) {
      return interaction.reply({
        content: "You don't have permission to use this command.",
        ephemeral: true,
      })
    }

    await interaction.deferReply()

    const robloxUsername = interaction.options.getString("roblox_username")
    const reason = interaction.options.getString("reason")

    try {
      // Get ROBLOX user ID from username
      const response = await fetch(`https://users.roblox.com/v1/usernames/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usernames: [robloxUsername],
        }),
      })

      const data = await response.json()

      if (!data.data || data.data.length === 0) {
        return interaction.editReply({
          content: `ROBLOX user "${robloxUsername}" not found.`,
        })
      }

      const robloxId = data.data[0].id.toString()
      const actualUsername = data.data[0].name

      // Check if user is already blacklisted
      const existingBlacklist = db
        .prepare("SELECT * FROM game_bans WHERE roblox_id = ? AND ban_type = 'blacklist'")
        .get(robloxId)

      if (existingBlacklist) {
        return interaction.editReply({
          content: `${actualUsername} is already blacklisted.`,
        })
      }

      // Insert blacklist into database
      db.prepare(
        "INSERT INTO game_bans (roblox_id, roblox_username, banned_by, reason, ban_type, created_at) VALUES (?, ?, ?, ?, 'blacklist', ?)",
      ).run(robloxId, actualUsername, interaction.user.id, reason, Date.now())

      const embed = new EmbedBuilder()
        .setTitle("User Blacklisted")
        .setDescription(
          `**User:** ${actualUsername} (${robloxId})\n**Reason:** ${reason}\n\n` +
            "This user is permanently banned from all WashVerse services.",
        )
        .setColor(0x000000)
        .setTimestamp()
        .setFooter({ text: `Blacklisted by ${interaction.user.tag}` })

      await interaction.editReply({ embeds: [embed] })

      // Log to HR logs channel
      const hrLogsChannel = interaction.guild.channels.cache.get(config.channels.hrLogs)
      if (hrLogsChannel) {
        await hrLogsChannel.send({ embeds: [embed] })
      }
    } catch (error) {
      console.error("Error blacklisting user:", error)
      await interaction.editReply({
        content: "Failed to blacklist user. Please try again later.",
      })
    }
  },
}
