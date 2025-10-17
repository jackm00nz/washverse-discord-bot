import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ChannelType,
  EmbedBuilder,
} from "discord.js"
import { dbUtils } from "../utils/database.js"
import config from "../config.js"

export default {
  data: new SlashCommandBuilder()
    .setName("createalliance")
    .setDescription("Create a new alliance with step-by-step prompts")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    // Create modal for alliance information
    const modal = new ModalBuilder().setCustomId("alliance-modal").setTitle("Create New Alliance")

    const groupNameInput = new TextInputBuilder()
      .setCustomId("group-name")
      .setLabel("Group Name")
      .setStyle(TextInputStyle.Short)
      .setRequired(true)

    const groupLinkInput = new TextInputBuilder()
      .setCustomId("group-link")
      .setLabel("Group Link")
      .setStyle(TextInputStyle.Short)
      .setRequired(true)

    const serverLinkInput = new TextInputBuilder()
      .setCustomId("server-link")
      .setLabel("Representative Server Link")
      .setStyle(TextInputStyle.Short)
      .setRequired(true)

    const representativesInput = new TextInputBuilder()
      .setCustomId("representatives")
      .setLabel("Group Representatives (comma separated)")
      .setStyle(TextInputStyle.Short)
      .setRequired(true)

    modal.addComponents(
      new ActionRowBuilder().addComponents(groupNameInput),
      new ActionRowBuilder().addComponents(groupLinkInput),
      new ActionRowBuilder().addComponents(serverLinkInput),
      new ActionRowBuilder().addComponents(representativesInput),
    )

    await interaction.showModal(modal)

    // Wait for modal submission
    try {
      const submitted = await interaction.awaitModalSubmit({
        time: 300000, // 5 minutes
        filter: (i) => i.user.id === interaction.user.id,
      })

      await submitted.deferReply({ ephemeral: true })

      const groupName = submitted.fields.getTextInputValue("group-name")
      const groupLink = submitted.fields.getTextInputValue("group-link")
      const serverLink = submitted.fields.getTextInputValue("server-link")
      const representatives = submitted.fields.getTextInputValue("representatives")

      // Create channel in alliance category
      const category = await interaction.guild.channels.fetch(config.allianceCategoryId)

      if (!category || category.type !== ChannelType.GuildCategory) {
        return submitted.editReply("Alliance category not found. Please configure ALLIANCE_CATEGORY_ID in .env")
      }

      const channel = await interaction.guild.channels.create({
        name: groupName.toLowerCase().replace(/\s+/g, "-"),
        type: ChannelType.GuildText,
        parent: category.id,
        topic: `Alliance channel for ${groupName}`,
      })

      // Save to database
      dbUtils.createAlliance(groupName, groupLink, serverLink, channel.id, representatives)

      // Send welcome message to channel
      const welcomeEmbed = new EmbedBuilder()
        .setTitle(`🤝 Welcome ${groupName}!`)
        .setDescription(`This is the official alliance channel for ${groupName}.`)
        .addFields(
          { name: "Group Link", value: groupLink },
          { name: "Server Link", value: serverLink },
          { name: "Representatives", value: representatives },
        )
        .setColor(config.successColor)
        .setTimestamp()

      await channel.send({ embeds: [welcomeEmbed] })

      await submitted.editReply(
        `Successfully created alliance for ${groupName}! Channel: ${channel}\n\nRepresentatives have been notified.`,
      )

      // Notify representatives (if they are Discord users)
      const repNames = representatives.split(",").map((r) => r.trim())
      for (const repName of repNames) {
        try {
          const members = await interaction.guild.members.search({ query: repName, limit: 1 })
          if (members.size > 0) {
            const member = members.first()
            await member.send(
              `You have been assigned as a representative for **${groupName}**!\n\n**Group Link:** ${groupLink}\n**Server Link:** ${serverLink}\n**Alliance Channel:** ${channel}`,
            )
          }
        } catch (error) {
          console.log(`Could not notify representative: ${repName}`)
        }
      }
    } catch (error) {
      console.error(error)
      // Modal timeout or error
    }
  },
}
