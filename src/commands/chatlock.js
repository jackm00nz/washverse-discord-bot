import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js"
import config from "../config.js"

export default {
  data: new SlashCommandBuilder()
    .setName("chatlock")
    .setDescription("Lock the current channel for 5 minutes")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const channel = interaction.channel

    try {
      // Lock the channel
      await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        SendMessages: false,
      })

      const lockEmbed = new EmbedBuilder()
        .setTitle("🔒 Channel Locked")
        .setDescription("This channel has been temporarily locked for 5 minutes.")
        .setColor(config.warningColor)
        .setTimestamp()

      await interaction.reply({ embeds: [lockEmbed] })

      // Unlock after 5 minutes
      setTimeout(
        async () => {
          await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
            SendMessages: null,
          })

          const unlockEmbed = new EmbedBuilder()
            .setTitle("🔓 Channel Unlocked")
            .setDescription("This channel has been unlocked.")
            .setColor(config.successColor)
            .setTimestamp()

          await channel.send({ embeds: [unlockEmbed] })
        },
        5 * 60 * 1000,
      ) // 5 minutes
    } catch (error) {
      console.error(error)
      await interaction.reply({ content: "Failed to lock channel. Check permissions.", ephemeral: true })
    }
  },
}
