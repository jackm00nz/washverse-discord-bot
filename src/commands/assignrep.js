import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js"
import { dbUtils } from "../utils/database.js"
import config from "../config.js"

export default {
  data: new SlashCommandBuilder()
    .setName("assignrep")
    .setDescription("Assign a representative to an alliance group")
    .addUserOption((option) => option.setName("user").setDescription("The representative to assign").setRequired(true))
    .addStringOption((option) => option.setName("group").setDescription("Group name").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true })

    const user = interaction.options.getUser("user")
    const groupName = interaction.options.getString("group")

    try {
      const alliances = dbUtils.getAlliances()
      const alliance = alliances.find((a) => a.group_name.toLowerCase() === groupName.toLowerCase())

      if (!alliance) {
        return interaction.editReply(`Alliance "${groupName}" not found. Use /viewalliances to see all alliances.`)
      }

      // Update representatives
      const currentReps = alliance.representatives || ""
      const newReps = currentReps ? `${currentReps}, ${user.username}` : user.username

      dbUtils.updateAllianceRep(alliance.group_name, newReps)

      // Send notification to alliance channel
      if (alliance.channel_id) {
        try {
          const channel = await interaction.client.channels.fetch(alliance.channel_id)
          const notificationEmbed = new EmbedBuilder()
            .setTitle("👥 Representative Assignment")
            .setDescription(`${user.username} has been assigned as a representative for ${alliance.group_name}.`)
            .setColor(config.successColor)
            .setTimestamp()

          await channel.send({ embeds: [notificationEmbed] })
        } catch (error) {
          console.log("Could not send notification to alliance channel")
        }
      }

      // Send server links to the representative
      try {
        await user.send(
          `You have been assigned as a representative for **${alliance.group_name}**!\n\n**Group Link:** ${alliance.group_link || "N/A"}\n**Server Link:** ${alliance.server_link || "N/A"}\n**Alliance Channel:** ${alliance.channel_id ? `<#${alliance.channel_id}>` : "N/A"}`,
        )
      } catch (error) {
        console.log("Could not DM representative")
      }

      await interaction.editReply(
        `Successfully assigned ${user.username} as representative for ${alliance.group_name}.`,
      )
    } catch (error) {
      console.error(error)
      await interaction.editReply(`Failed to assign representative: ${error.message}`)
    }
  },
}
