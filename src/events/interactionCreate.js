import { EmbedBuilder, ChannelType, PermissionFlagsBits } from "discord.js"
import config from "../config.js"
import db from "../utils/database.js"

export default {
  name: "interactionCreate",
  async execute(interaction) {
    // Handle slash commands
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName)

      if (!command) return

      try {
        await command.execute(interaction)
      } catch (error) {
        console.error(`Error executing ${interaction.commandName}:`, error)
        const errorMessage = { content: "There was an error executing this command!", ephemeral: true }

        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(errorMessage)
        } else {
          await interaction.reply(errorMessage)
        }
      }
    }

    if (interaction.isButton()) {
      // Create ticket button
      if (interaction.customId === "create_ticket") {
        await handleCreateTicket(interaction)
      }

      // Confirm close ticket button
      if (interaction.customId === "confirm_close") {
        await handleConfirmClose(interaction)
      }

      // Cancel close ticket button
      if (interaction.customId === "cancel_close") {
        await handleCancelClose(interaction)
      }
    }
  },
}

async function handleCreateTicket(interaction) {
  await interaction.deferReply({ ephemeral: true })

  try {
    // Check if user already has an open ticket
    const existingTicket = db
      .prepare("SELECT * FROM tickets WHERE user_id = ? AND status = 'open'")
      .get(interaction.user.id)

    if (existingTicket) {
      return interaction.editReply({
        content: `You already have an open ticket: <#${existingTicket.channel_id}>`,
      })
    }

    // Get support category
    const category = interaction.guild.channels.cache.get(config.channels.supportCategory)

    if (!category) {
      return interaction.editReply({
        content: "Support category not found. Please contact an administrator.",
      })
    }

    // Create ticket channel
    const ticketChannel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.GuildText,
      parent: category.id,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: interaction.user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
          ],
        },
        {
          id: config.roles.staff.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
          ],
        },
      ],
    })

    // Save ticket to database
    db.prepare("INSERT INTO tickets (user_id, channel_id, created_at) VALUES (?, ?, ?)").run(
      interaction.user.id,
      ticketChannel.id,
      Date.now(),
    )

    // Send welcome message in ticket
    const embed = new EmbedBuilder()
      .setTitle("Support Ticket Created")
      .setDescription(
        `Welcome ${interaction.user}!\n\n` +
          "Thank you for creating a support ticket. A staff member will be with you shortly.\n\n" +
          "Please describe your issue in detail.",
      )
      .setColor(config.primaryColor)
      .setTimestamp()

    await ticketChannel.send({ embeds: [embed] })

    await interaction.editReply({
      content: `Your ticket has been created: ${ticketChannel}`,
    })
  } catch (error) {
    console.error("Error creating ticket:", error)
    await interaction.editReply({
      content: "Failed to create ticket. Please contact an administrator.",
    })
  }
}

async function handleConfirmClose(interaction) {
  const ticket = db
    .prepare("SELECT * FROM tickets WHERE channel_id = ? AND status = 'open'")
    .get(interaction.channel.id)

  if (!ticket) {
    return interaction.reply({
      content: "This ticket is no longer active.",
      ephemeral: true,
    })
  }

  await interaction.deferReply()

  try {
    // Update ticket status
    db.prepare("UPDATE tickets SET status = 'closed', closed_at = ? WHERE id = ?").run(Date.now(), ticket.id)

    const embed = new EmbedBuilder()
      .setTitle("Ticket Closed")
      .setDescription(
        `This ticket has been closed by ${interaction.user}\n\n` +
          `**Reason:** ${ticket.close_reason || "No reason provided"}\n\n` +
          "This channel will be deleted in 10 seconds.",
      )
      .setColor(0xff0000)
      .setTimestamp()

    await interaction.editReply({ embeds: [embed], components: [] })

    // Delete channel after 10 seconds
    setTimeout(async () => {
      try {
        await interaction.channel.delete()
      } catch (error) {
        console.error("Error deleting ticket channel:", error)
      }
    }, 10000)
  } catch (error) {
    console.error("Error closing ticket:", error)
    await interaction.editReply({
      content: "Failed to close ticket.",
    })
  }
}

async function handleCancelClose(interaction) {
  await interaction.update({
    content: "Ticket closure cancelled.",
    embeds: [],
    components: [],
  })
}
