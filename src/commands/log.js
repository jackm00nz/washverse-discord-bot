import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js"

export default {
  data: new SlashCommandBuilder()
    .setName("log")
    .setDescription("Request a log for a session")
    .addStringOption((option) =>
      option.setName("role").setDescription("Your role in the session (e.g., Security, Trainer)").setRequired(true),
    )
    .addUserOption((option) => option.setName("host").setDescription("Session host").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),

  async execute(interaction) {
    const role = interaction.options.getString("role")
    const host = interaction.options.getUser("host")

    try {
      // Store log request in database (we'll use session_logs table)
      // In a real implementation, you might want a separate log_requests table
      const logRequest = {
        requester: interaction.user.id,
        role: role,
        host: host.id,
        timestamp: new Date().toISOString(),
      }

      // For now, we'll just notify the host
      try {
        await host.send(
          `**Log Request**\n\nUser: ${interaction.user.username}\nRole: ${role}\n\nPlease review and approve this log request for your session.`,
        )
      } catch (error) {
        console.log("Could not DM host")
      }

      await interaction.reply({
        content: `Log request submitted to ${host.username} for your role as ${role}.`,
        ephemeral: true,
      })
    } catch (error) {
      console.error(error)
      await interaction.reply({ content: "Failed to submit log request.", ephemeral: true })
    }
  },
}
