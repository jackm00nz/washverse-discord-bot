import { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } from "discord.js"
import config from "../config.js"
import db from "../utils/database.js"

export default {
  data: new SlashCommandBuilder().setName("transcript").setDescription("Generate a transcript of the current ticket"),

  async execute(interaction) {
    // Check if user has staff permission
    if (!config.hasPermission(interaction.member, "staff")) {
      return interaction.reply({
        content: "You don't have permission to use this command.",
        ephemeral: true,
      })
    }

    // Check if this is a ticket channel
    const ticket = db.prepare("SELECT * FROM tickets WHERE channel_id = ?").get(interaction.channel.id)

    if (!ticket) {
      return interaction.reply({
        content: "This is not a ticket channel.",
        ephemeral: true,
      })
    }

    await interaction.deferReply({ ephemeral: true })

    try {
      // Fetch all messages from the channel
      const messages = await interaction.channel.messages.fetch({ limit: 100 })
      const sortedMessages = Array.from(messages.values()).sort((a, b) => a.createdTimestamp - b.createdTimestamp)

      // Generate transcript
      let transcript = `Ticket Transcript - ${interaction.channel.name}\n`
      transcript += `Created: ${new Date(ticket.created_at).toLocaleString()}\n`
      transcript += `Creator: ${ticket.user_id}\n`
      transcript += `Status: ${ticket.status}\n`
      transcript += `\n${"=".repeat(50)}\n\n`

      for (const message of sortedMessages) {
        const timestamp = message.createdAt.toLocaleString()
        const author = message.author.tag
        const content = message.content || "[No content]"

        transcript += `[${timestamp}] ${author}:\n${content}\n\n`

        if (message.attachments.size > 0) {
          transcript += `Attachments: ${message.attachments.map((a) => a.url).join(", ")}\n\n`
        }
      }

      // Create attachment
      const buffer = Buffer.from(transcript, "utf-8")
      const attachment = new AttachmentBuilder(buffer, {
        name: `transcript-${interaction.channel.name}.txt`,
      })

      // Send to transcripts channel
      const transcriptsChannel = interaction.guild.channels.cache.get(config.channels.transcriptsChannel)

      if (transcriptsChannel) {
        const embed = new EmbedBuilder()
          .setTitle("Ticket Transcript")
          .setDescription(`Transcript for ticket: ${interaction.channel.name}`)
          .addFields(
            { name: "Creator", value: `<@${ticket.user_id}>`, inline: true },
            { name: "Status", value: ticket.status, inline: true },
            { name: "Created", value: new Date(ticket.created_at).toLocaleString(), inline: true },
          )
          .setColor(config.primaryColor)
          .setTimestamp()

        await transcriptsChannel.send({
          embeds: [embed],
          files: [attachment],
        })
      }

      await interaction.editReply({
        content: "Transcript generated and saved to transcripts channel.",
        files: [attachment],
      })
    } catch (error) {
      console.error("Error generating transcript:", error)
      await interaction.editReply({
        content: "Failed to generate transcript.",
      })
    }
  },
}
