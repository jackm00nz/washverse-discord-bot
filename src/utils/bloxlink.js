import axios from "axios"
import config from "../config.js"

export const bloxlinkAPI = {
  getUser: async (discordId) => {
    try {
      const response = await axios.get(
        `https://api.blox.link/v4/public/guilds/${config.guildId}/discord-to-roblox/${discordId}`,
        {
          headers: {
            Authorization: config.bloxlinkApiKey,
          },
        },
      )
      return response.data
    } catch (error) {
      console.error("Bloxlink API Error:", error.response?.data || error.message)
      return null
    }
  },
}
