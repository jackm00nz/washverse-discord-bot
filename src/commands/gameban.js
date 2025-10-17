import { SlashCommandBuilder, EmbedBuilder } from "discord.js"
import config from "../config.js"
import db from "../utils/database.js"

export default {
  data: new SlashCommandBuilder()
    .setName("gameban")
    .setDescription("Ban a user from the game")
    .addStringOption((option) =>
      option.setName("roblox_username").setDescription("ROBLOX username to ban").setRequired(true),
    )
    .addStringOption((option) => option.setName("reason").setDescription("Reason for ban").setRequired(true))
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("Ban type")
        .setRequired(true)
        .addChoices({ name: "Permanent", value: "permanent" }, { name: "Temporary", value: "temporary" }),
    )
    .addIntegerOption((option) =>
      option.setName("duration").setDescription("Duration in days (for temporary bans)").setRequired(false),
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
    const reason = interaction.options.getString("reason")
    const banType = interaction.options.getString("type")
    const duration = interaction.options.getInteger("duration")

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

      // Check if user is already banned
      const existingBan = db
        .prepare("SELECT * FROM game_bans WHERE roblox_id = ? AND (ban_type = 'permanent' OR expires_at > ?)")
        .get(robloxId, Date.now())

      if (existingBan) {
        return interaction.editReply({
          content: `${actualUsername} is already banned from the game.`,
        })
      }

      // Calculate expiration for temporary bans
      let expiresAt = null
      if (banType === "temporary") {
        if (!duration || duration <= 0) {
          return interaction.editReply({
            content: "Please provide a valid duration for temporary bans.",
          })
        }
        expiresAt = Date.now() + duration * 24 * 60 * 60 * 1000
      }

      // Insert ban into database
      db.prepare(
        "INSERT INTO game_bans (roblox_id, roblox_username, banned_by, reason, ban_type, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      ).run(robloxId, actualUsername, interaction.user.id, reason, banType, Date.now(), expiresAt)

      const embed = new EmbedBuilder()
        .setTitle("Game Ban Issued")
        .setDescription(`**User:** ${actualUsername} (${robloxId})\n**Type:** ${banType}\n**Reason:** ${reason}`)
        .setColor(0xff0000)
        .setTimestamp()
        .setFooter({ text: `Banned by ${interaction.user.tag}` })

      if (banType === "temporary" && expiresAt) {
        embed.addFields({
          name: "Expires",
          value: `<t:${Math.floor(expiresAt / 1000)}:R>`,
        })
      }

      await interaction.editReply({ embeds: [embed] })

      // Log to mod logs channel
      const modLogsChannel = interaction.guild.channels.cache.get(config.channels.modLogs)
      if (modLogsChannel) {
        await modLogsChannel.send({ embeds: [embed] })
      }
    } catch (error) {
      console.error("Error issuing game ban:", error)
      await interaction.editReply({
        content: "Failed to issue game ban. Please try again later.",
      })
    }
  },
}
