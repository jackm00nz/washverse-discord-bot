import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js"
import { dbUtils } from "../utils/database.js"
import config from "../config.js"

export default {
  data: new SlashCommandBuilder()
    .setName("training")
    .setDescription("Announce a training session")
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("Announcement type")
        .setRequired(true)
        .addChoices(
          { name: "Public Announcement", value: "announce" },
          { name: "Management Announcement", value: "management" },
        ),
    )
    .addStringOption((option) =>
      option.setName("start_time").setDescription("Start time (e.g., 3:00 PM EST)").setRequired(true),
    )
    .addUserOption((option) => option.setName("host").setDescription("Training host").setRequired(true))
    .addUserOption((option) => option.setName("cohost").setDescription("Training co-host"))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true })

    const type = interaction.options.getString("type")
    const startTime = interaction.options.getString("start_time")
    const host = interaction.options.getUser("host")
    const cohost = interaction.options.getUser("cohost")

    try {
      const embed = new EmbedBuilder()
        .setTitle("📚 Training Session Announcement")
        .setDescription(`A training session has been scheduled!`)
        .addFields(
          { name: "Start Time", value: startTime, inline: true },
          { name: "Host", value: host.toString(), inline: true },
        )
        .setColor(config.primaryColor)
        .setTimestamp()

      if (cohost) {
        embed.addFields({ name: "Co-Host", value: cohost.toString(), inline: true })
      }

      if (type === "announce") {
        // Public announcement
        embed.setDescription(
          `A training session has been scheduled! All members are encouraged to attend.\n\n**Please join the game at the scheduled time.**`,
        )

        await interaction.channel.send({ content: "@everyone", embeds: [embed] })

        // Create session log
        dbUtils.createSessionLog(host.id, "training", "Host")
      } else if (type === "management") {
        // Management announcement
        embed.setDescription(`Management members, please join the server to assist with the upcoming training session.`)

        await interaction.channel.send({ content: `<@&${config.managementRoleId}>`, embeds: [embed] })
      }

      await interaction.editReply("Training announcement posted successfully!")
    } catch (error) {
      console.error(error)
      await interaction.editReply(`Failed to post training announcement: ${error.message}`)
    }
  },
}
