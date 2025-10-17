import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js"
import { dbUtils } from "../utils/database.js"

export default {
  data: new SlashCommandBuilder()
    .setName("setrequirement")
    .setDescription("Set activity requirements for a rank")
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("Requirement type")
        .setRequired(true)
        .addChoices(
          { name: "Sessions Attended", value: "sessions_attended" },
          { name: "Sessions Hosted", value: "sessions_hosted" },
          { name: "Minutes", value: "minutes" },
          { name: "Messages", value: "messages" },
        ),
    )
    .addStringOption((option) => option.setName("rank").setDescription("Rank name (e.g., Rank 5)").setRequired(true))
    .addIntegerOption((option) =>
      option.setName("value").setDescription("Required value").setRequired(true).setMinValue(0),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const type = interaction.options.getString("type")
    const rank = interaction.options.getString("rank")
    const value = interaction.options.getInteger("value")

    try {
      dbUtils.setRequirement(rank, type, value)

      await interaction.reply({
        content: `Successfully set ${type.replace("_", " ")} requirement for ${rank} to ${value}.`,
        ephemeral: true,
      })
    } catch (error) {
      console.error(error)
      await interaction.reply({ content: "Failed to set requirement.", ephemeral: true })
    }
  },
}
