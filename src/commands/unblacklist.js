import { SlashCommandBuilder, EmbedBuilder } from "discord.js"
import config from "../config.js"
import db from "../utils/database.js"

export default {
  data: new SlashCommandBuilder()
    .setName("unblacklist")
    .setDescription("Remove a user from the blacklist")
    .addStringOption((option) =>
      option.setName("roblox_username").setDescription("ROBLOX username to unblacklist").setRequired(true),
    ),

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

      // Check if user is blacklisted
      const blacklist = db
        .prepare("SELECT * FROM game_bans WHERE roblox_id = ? AND ban_type = 'blacklist'")
        .get(robloxId)

      if (!blacklist) {
        return interaction.editReply({
          content: `${actualUsername} is not currently blacklisted.`,
        })
      }

      // Remove blacklist from database
      db.prepare("DELETE FROM game_bans WHERE id = ?").run(blacklist.id)

      const embed = new EmbedBuilder()
        .setTitle("User Removed from Blacklist")
        .setDescription(`**User:** ${actualUsername} (${robloxId})\n**Original Reason:** ${blacklist.reason}`)
        .setColor(0x00ff00)
        .setTimestamp()
        .setFooter({ text: `Removed by ${interaction.user.tag}` })

      await interaction.editReply({ embeds: [embed] })

      // Log to HR logs channel
      const hrLogsChannel = interaction.guild.channels.cache.get(config.channels.hrLogs)
      if (hrLogsChannel) {
        await hrLogsChannel.send({ embeds: [embed] })
      }
    } catch (error) {
      console.error("Error removing blacklist:", error)
      await interaction.editReply({
        content: "Failed to remove blacklist. Please try again later.",
      })
    }
  },
}
