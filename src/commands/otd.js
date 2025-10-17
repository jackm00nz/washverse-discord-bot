import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js"
import config from "../config.js"

export default {
  data: new SlashCommandBuilder()
    .setName("otd")
    .setDescription("Send an Of the Day post (from Trello queue)")
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("Type of OTD")
        .setRequired(true)
        .addChoices(
          { name: "Question of the Day", value: "qotd" },
          { name: "Fact of the Day", value: "fotd" },
          { name: "Poll of the Day", value: "potd" },
          { name: "Topic of the Day", value: "totd" },
        ),
    )
    .addStringOption((option) => option.setName("content").setDescription("OTD content").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const type = interaction.options.getString("type")
    const content = interaction.options.getString("content")

    const titles = {
      qotd: "❓ Question of the Day",
      fotd: "💡 Fact of the Day",
      potd: "📊 Poll of the Day",
      totd: "💬 Topic of the Day",
    }

    try {
      const communicationsChannel = await interaction.client.channels.fetch(config.communicationsChannelId)

      const otdEmbed = new EmbedBuilder()
        .setTitle(titles[type])
        .setDescription(content)
        .setColor(config.primaryColor)
        .setTimestamp()
        .setFooter({ text: "WashVerse Communications" })

      await communicationsChannel.send({ embeds: [otdEmbed] })

      await interaction.reply({ content: `${titles[type]} posted successfully!`, ephemeral: true })
    } catch (error) {
      console.error(error)

      // If no content in queue, notify Communications Leads
      if (error.message.includes("not found")) {
        try {
          const communicationsChannel = await interaction.client.channels.fetch(config.communicationsChannelId)
          await communicationsChannel.send(
            `<@&${config.hrRoleId}> No OTD content available in Trello queue. Please add more content.`,
          )
        } catch (err) {
          console.error("Could not notify Communications Leads")
        }
      }

      await interaction.reply({ content: "Failed to post OTD. Check configuration.", ephemeral: true })
    }
  },
}
