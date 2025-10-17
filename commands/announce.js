import { EmbedBuilder, PermissionFlagsBits } from "discord.js"
import { config } from "../config.js"

export const announceCommand = {
  name: "announce",
  description: "Make an announcement (Manager only)",
  execute: async (message, args) => {
    // Check if user has manager role or admin permissions
    const hasManagerRole = message.member.roles.cache.has(config.roles.manager)
    const hasAdminPerms = message.member.permissions.has(PermissionFlagsBits.Administrator)

    if (!hasManagerRole && !hasAdminPerms) {
      return message.reply("❌ You need to be a Manager to use this command!")
    }

    if (args.length === 0) {
      return message.reply("❌ Please provide an announcement message!")
    }

    const announcement = args.join(" ")

    const announceEmbed = new EmbedBuilder()
      .setColor(config.colors.warning)
      .setTitle("📢 WashVerse Announcement")
      .setDescription(announcement)
      .setFooter({ text: `Announced by ${message.author.tag}` })
      .setTimestamp()

    const channel = message.guild.channels.cache.get(config.channels.announcements) || message.channel

    await channel.send({ content: "@everyone", embeds: [announceEmbed] })

    if (channel.id !== message.channel.id) {
      message.reply("✅ Announcement posted successfully!")
    }
  },
}
