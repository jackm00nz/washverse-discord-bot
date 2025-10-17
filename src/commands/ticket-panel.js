import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js"
import config from "../config.js"

export default {
  data: new SlashCommandBuilder()
    .setName("ticket-panel")
    .setDescription("Create a support ticket panel")
    .addChannelOption((option) =>
      option.setName("channel").setDescription("Channel to send the panel to").setRequired(true),
    ),

  async execute(interaction) {
    // Check if user has management permission
    if (!config.hasPermission(interaction.member, "management")) {
      return interaction.reply({
        content: "You don't have permission to use this command.",
        ephemeral: true,
      })
    }

    const channel = interaction.options.getChannel("channel")

    const embed = new EmbedBuilder()
      .setTitle("WashVerse Support")
      .setDescription(
        "Need help? Click the button below to create a support ticket.\n\n" +
          "Our staff team will assist you as soon as possible.\n\n" +
          "**Please note:** Misuse of the ticket system may result in disciplinary action.",
      )
      .setColor(config.primaryColor)
      .setTimestamp()

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("create_ticket").setLabel("Create Ticket").setStyle(ButtonStyle.Primary),
    )

    try {
      await channel.send({
        embeds: [embed],
        components: [row],
      })

      await interaction.reply({
        content: `Ticket panel created in ${channel}`,
        ephemeral: true,
      })
    } catch (error) {
      console.error("Error creating ticket panel:", error)
      await interaction.reply({
        content: "Failed to create ticket panel. Please check bot permissions.",
        ephemeral: true,
      })
    }
  },
}
