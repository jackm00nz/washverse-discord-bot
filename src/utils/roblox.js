import noblox from "noblox.js"
import config from "../config.js"

let authenticated = false

export const robloxAPI = {
  authenticate: async () => {
    if (authenticated) return true

    try {
      await noblox.setCookie(config.robloxCookie)
      const currentUser = await noblox.getCurrentUser()
      console.log(`Authenticated as ${currentUser.UserName}`)
      authenticated = true
      return true
    } catch (error) {
      console.error("ROBLOX Authentication Error:", error.message)
      return false
    }
  },

  getRankInGroup: async (userId) => {
    try {
      return await noblox.getRankInGroup(config.robloxGroupId, userId)
    } catch (error) {
      console.error("Error getting rank:", error.message)
      return 0
    }
  },

  setRank: async (userId, rank) => {
    try {
      await robloxAPI.authenticate()
      return await noblox.setRank(config.robloxGroupId, userId, rank)
    } catch (error) {
      console.error("Error setting rank:", error.message)
      throw error
    }
  },

  demote: async (userId) => {
    try {
      await robloxAPI.authenticate()
      return await noblox.demote(config.robloxGroupId, userId)
    } catch (error) {
      console.error("Error demoting user:", error.message)
      throw error
    }
  },

  getUsernameFromId: async (userId) => {
    try {
      return await noblox.getUsernameFromId(userId)
    } catch (error) {
      console.error("Error getting username:", error.message)
      return null
    }
  },

  getIdFromUsername: async (username) => {
    try {
      return await noblox.getIdFromUsername(username)
    } catch (error) {
      console.error("Error getting user ID:", error.message)
      return null
    }
  },
}
