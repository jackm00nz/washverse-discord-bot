import { SlashCommandBuilder, EmbedBuilder } from "discord.js"
import config from "../config.js"
import db from "../utils/database.js"

export default {
  data: new SlashCommandBuilder().setName("claim").setDescription("Claim the current support ticket"),

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

    // Check if ticket is already claimed
    if (ticket.claimed_by) {
      const claimer = await interaction.guild.members.fetch(ticket.claimed_by)
      return interaction.reply({
        content: `This ticket is already claimed by ${claimer.user.tag}`,
        ephemeral: true,
      })
    }

    // Claim the ticket
    db.prepare("UPDATE tickets SET claimed_by = ?, claimed_at = ? WHERE id = ?").run(
      interaction.user.id,
      Date.now(),
      ticket.id,
    )

    const embed = new EmbedBuilder()
      .setTitle("Ticket Claimed")
      .setDescription(`This ticket has been claimed by ${interaction.user}`)
      .setColor(0x00ff00)
      .setTimestamp()

    await interaction.channel.send({ embeds: [embed] })
    await interaction.reply({
      content: "You have claimed this ticket.",
      ephemeral: true,
    })
  },
}
