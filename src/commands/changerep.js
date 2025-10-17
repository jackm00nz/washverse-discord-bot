import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js"
import { dbUtils } from "../utils/database.js"
import config from "../config.js"

export default {
  data: new SlashCommandBuilder()
    .setName("changerep")
    .setDescription("Change representatives for an alliance group")
    .addStringOption((option) => option.setName("group").setDescription("Group name").setRequired(true))
    .addUserOption((option) => option.setName("user").setDescription("The new representative").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true })

    const groupName = interaction.options.getString("group")
    const user = interaction.options.getUser("user")

    try {
      const alliances = dbUtils.getAlliances()
      const alliance = alliances.find((a) => a.group_name.toLowerCase() === groupName.toLowerCase())

      if (!alliance) {
        return interaction.editReply(`Alliance "${groupName}" not found. Use /viewalliances to see all alliances.`)
      }

      // Update representatives
      dbUtils.updateAllianceRep(alliance.group_name, user.username)

      // Send notification to alliance channel
      if (alliance.channel_id) {
        try {
          const channel = await interaction.client.channels.fetch(alliance.channel_id)
          const notificationEmbed = new EmbedBuilder()
            .setTitle("👥 Representative Change")
            .setDescription(`The representative for ${alliance.group_name} has been changed to ${user.username}.`)
            .setColor(config.primaryColor)
            .setTimestamp()

          await channel.send({ embeds: [notificationEmbed] })
        } catch (error) {
          console.log("Could not send notification to alliance channel")
        }
      }

      // Send server links to the new representative
      try {
        await user.send(
          `You have been assigned as the new representative for **${alliance.group_name}**!\n\n**Group Link:** ${alliance.group_link || "N/A"}\n**Server Link:** ${alliance.server_link || "N/A"}\n**Alliance Channel:** ${alliance.channel_id ? `<#${alliance.channel_id}>` : "N/A"}`,
        )
      } catch (error) {
        console.log("Could not DM representative")
      }

      await interaction.editReply(`Successfully changed representative for ${alliance.group_name} to ${user.username}.`)
    } catch (error) {
      console.error(error)
      await interaction.editReply(`Failed to change representative: ${error.message}`)
    }
  },
}
