import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js"
import config from "../config.js"
import db from "../utils/database.js"

export default {
  data: new SlashCommandBuilder()
    .setName("close")
    .setDescription("Close the current support ticket")
    .addStringOption((option) => option.setName("reason").setDescription("Reason for closing").setRequired(false)),

  async execute(interaction) {
    // Check if user has staff permission
    if (!config.hasPermission(interaction.member, "staff")) {
      return interaction.reply({
        content: "You don't have permission to use this command.",
        ephemeral: true,
      })
    }

    // Check if this is a ticket channel
    const ticket = db
      .prepare("SELECT * FROM tickets WHERE channel_id = ? AND status = 'open'")
      .get(interaction.channel.id)

    if (!ticket) {
      return interaction.reply({
        content: "This is not an active ticket channel.",
        ephemeral: true,
      })
    }

    const reason = interaction.options.getString("reason") || "No reason provided"

    const embed = new EmbedBuilder()
      .setTitle("Ticket Closing")
      .setDescription(
        `This ticket is being closed by ${interaction.user}\n\n**Reason:** ${reason}\n\nClick the button below to confirm closure.`,
      )
      .setColor(0xff0000)
      .setTimestamp()

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("confirm_close").setLabel("Confirm Close").setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId("cancel_close").setLabel("Cancel").setStyle(ButtonStyle.Secondary),
    )

    await interaction.reply({
      embeds: [embed],
      components: [row],
    })

    // Store the reason in the database temporarily
    db.prepare("UPDATE tickets SET close_reason = ? WHERE id = ?").run(reason, ticket.id)
  },
}
