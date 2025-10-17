import cron from "node-cron"
import { dbUtils } from "./database.js"

export const initScheduler = (client) => {
  // Check for expired LoAs every hour
  cron.schedule("0 * * * *", async () => {
    console.log("Checking for expired LoAs...")
    const activeLoAs = dbUtils.getActiveLoAs()
    const now = new Date()

    for (const loa of activeLoAs) {
      const endDate = new Date(loa.end_date)
      if (now >= endDate) {
        // Remove LoA role
        try {
          const guild = await client.guilds.fetch(process.env.GUILD_ID)
          const member = await guild.members.fetch(loa.user_id)
          await member.roles.remove(process.env.LOA_ROLE_ID)

          // Send DM to user
          await member.send(`Your Leave of Absence has expired. Welcome back to WashVerse! Please resume your duties.`)

          // Deactivate LoA in database
          dbUtils.deactivateLoA(loa.id)

          console.log(`LoA expired for user ${loa.user_id}`)
        } catch (error) {
          console.error(`Error processing expired LoA for ${loa.user_id}:`, error.message)
        }
      }
    }
  })

  // Weekly alliance check-in (every Monday at 9 AM)
  cron.schedule("0 9 * * 1", async () => {
    console.log("Sending weekly alliance check-ins...")
    const alliances = dbUtils.getAlliances()

    for (const alliance of alliances) {
      try {
        const channel = await client.channels.fetch(alliance.channel_id)
        await channel.send({
          embeds: [
            {
              title: "📋 Weekly Alliance Check-In",
              description: `Hello ${alliance.group_name}! This is your weekly check-in.\n\nPlease respond with any updates, concerns, or news from your group.`,
              color: 0x3498db,
              timestamp: new Date(),
            },
          ],
        })
      } catch (error) {
        console.error(`Error sending check-in to ${alliance.group_name}:`, error.message)
      }
    }
  })

  console.log("Scheduler initialized")
}
