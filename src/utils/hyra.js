import axios from "axios"
import config from "../config.js"

export const hyraAPI = {
  createLog: async (userId, action, reason, proof) => {
    try {
      const response = await axios.post(
        "https://api.hyra.io/v1/logs",
        {
          userId,
          action,
          reason,
          proof,
          groupId: config.robloxGroupId,
        },
        {
          headers: {
            Authorization: `Bearer ${config.hyraApiKey}`,
            "Content-Type": "application/json",
          },
        },
      )
      return response.data
    } catch (error) {
      console.error("Hyra API Error:", error.response?.data || error.message)
      throw error
    }
  },

  generateLetter: (action, username, reason, proof) => {
    const templates = {
      suspend: `Dear ${username},\n\nThis letter is to inform you that you have been suspended from WashVerse.\n\n**Reason:** ${reason}\n**Proof:** ${proof}\n\nYou may appeal this decision by contacting Human Resources.\n\nSincerely,\nWashVerse Management`,
      demote: `Dear ${username},\n\nThis letter is to inform you that you have been demoted in WashVerse.\n\n**Reason:** ${reason}\n**Proof:** ${proof}\n\nYou may appeal this decision by contacting Human Resources.\n\nSincerely,\nWashVerse Management`,
      terminate: `Dear ${username},\n\nThis letter is to inform you that your employment with WashVerse has been terminated.\n\n**Reason:** ${reason}\n**Proof:** ${proof}\n\nYou may appeal this decision by contacting Human Resources.\n\nSincerely,\nWashVerse Management`,
      loa: `Dear ${username},\n\nYour Leave of Absence request has been approved.\n\nPlease ensure you return by the specified date. If you need an extension, contact Human Resources before your LoA expires.\n\nSincerely,\nWashVerse Human Resources`,
    }

    return templates[action] || "Letter template not found."
  },
}
