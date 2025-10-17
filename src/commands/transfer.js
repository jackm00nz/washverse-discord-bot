import { SlashCommandBuilder, EmbedBuilder } from "discord.js"
import config from "../config.js"
import db from "../utils/database.js"

export default {
  data: new SlashCommandBuilder()
    .setName("transfer")
    .setDescription("Transfer the ticket to another staff member")
    .addUserOption((option) => option.setName("user").setDescription("Staff member to transfer to").setRequired(true)),

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

    const targetUser = interaction.options.getUser("user")
    const targetMember = await interaction.guild.members.fetch(targetUser.id)

    // Check if target user has staff permission
    if (!config.hasPermission(targetMember, "staff")) {
      return interaction.reply({
        content: "You can only transfer tickets to staff members.",
        ephemeral: true,
      })
    }

    // Update ticket
    db.prepare("UPDATE tickets SET claimed_by = ?, claimed_at = ? WHERE id = ?").run(
      targetUser.id,
      Date.now(),
      ticket.id,
    )

    const embed = new EmbedBuilder()
      .setTitle("Ticket Transferred")
      .setDescription(`This ticket has been transferred to ${targetUser} by ${interaction.user}`)
      .setColor(config.primaryColor)
      .setTimestamp()

    await interaction.channel.send({ embeds: [embed] })
    await interaction.reply({
      content: `Ticket transferred to ${targetUser.tag}`,
      ephemeral: true,
    })

    // Notify the new staff member
    try {
      await targetUser.send({
        embeds: [
          new EmbedBuilder()
            .setTitle("Ticket Transferred to You")
            .setDescription(`You have been assigned to ticket: ${interaction.channel}`)
            .setColor(config.primaryColor)
            .setTimestamp(),
        ],
      })
    } catch (error) {
      // User has DMs disabled
      console.log(`Could not DM ${targetUser.tag} about ticket transfer`)
    }
  },
}
