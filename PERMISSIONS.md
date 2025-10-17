# WashVerse Discord Bot - Permission Structure

This document outlines the permission hierarchy for "William from WashVerse" Discord bot.

## Role Hierarchy

### 🔹 Staff Tier
**Description:** Entry-level staff with limited permissions for basic operations.

**Permissions:**
- `/myactivity` - View their own activity statistics
- `/suggest` - Submit suggestions to the server

**Cannot:**
- Moderate users (timeout, warn, kick, ban)
- Manage group ranks
- Access administrative features

---

### 🔸 Management Tier
**Description:** Moderators with server administration capabilities.

**Permissions:**
- All Staff permissions
- `/timeout` - Timeout users for a specified duration
- `/warn` - Issue warnings to users
- `/kick` - Kick users from the server
- `/chatlock` - Lock/unlock channels
- `/modlogs` - View moderation logs
- `/suggestion-approve` - Approve suggestions
- `/suggestion-deny` - Deny suggestions

**Cannot:**
- Ban users (permanent or temporary)
- Manage ROBLOX group ranks
- Access HR or developer features

---

### 🔶 HR Tier
**Description:** Human Resources with full group administration capabilities.

**Permissions:**
- All Management permissions
- `/ban` - Permanently ban users
- `/tempban` - Temporarily ban users
- `/suspend` - Suspend users in ROBLOX group
- `/demote` - Demote users in ROBLOX group
- `/terminate` - Terminate users from ROBLOX group
- `/loa` - Manage leave of absence requests
- `/setrequirement` - Set activity requirements per rank
- `/distribute` - Generate activity distribution reports
- `/viewactivity` - View any user's activity

**Cannot:**
- Access developer-only features
- Manage game bans/blacklists

---

### 🔴 Developer Tier
**Description:** Full administrative access to all bot features.

**Permissions:**
- All HR permissions
- `/gameban` - Ban users from in-game
- `/gameunban` - Unban users from in-game
- `/blacklist` - Add users to blacklist
- `/unblacklist` - Remove users from blacklist
- `/forceverify` - Manually verify users
- Access to all administrative commands

---

## Permission Configuration

To configure these roles in your Discord server:

1. Open `src/config.js`
2. Replace the role ID placeholders with your actual Discord role IDs:
   \`\`\`js
   roles: {
     staff: "YOUR_STAFF_ROLE_ID",
     management: "YOUR_MANAGEMENT_ROLE_ID",
     hr: "YOUR_HR_ROLE_ID",
     developer: "YOUR_DEVELOPER_ROLE_ID",
   }
   \`\`\`

3. You can find role IDs by:
   - Enabling Developer Mode in Discord (User Settings > Advanced > Developer Mode)
   - Right-clicking a role and selecting "Copy ID"

## Command Reference by Role

### Staff Commands
- `/myactivity` - View personal activity stats
- `/suggest <suggestion>` - Submit a suggestion

### Management Commands (+ Staff)
- `/timeout <user> <duration> [reason]` - Timeout a user
- `/warn <user> <reason>` - Warn a user
- `/kick <user> [reason]` - Kick a user
- `/chatlock [channel]` - Lock/unlock a channel
- `/modlogs [user]` - View moderation logs
- `/suggestion-approve <message_id>` - Approve a suggestion
- `/suggestion-deny <message_id> [reason]` - Deny a suggestion

### HR Commands (+ Management + Staff)
- `/ban <user> <reason>` - Permanently ban a user
- `/tempban <user> <duration> <reason>` - Temporarily ban a user
- `/suspend <user> <reason>` - Suspend in ROBLOX group
- `/demote <user> <reason>` - Demote in ROBLOX group
- `/terminate <user> <reason>` - Terminate from ROBLOX group
- `/loa <duration> <reason>` - Request leave of absence
- `/setrequirement <rank> <sessions> <minutes> <messages>` - Set requirements
- `/distribute` - Generate distribution report
- `/viewactivity <user>` - View user's activity

### Developer Commands (+ All Above)
- `/gameban <username> [duration] <reason>` - Ban from game
- `/gameunban <username>` - Unban from game
- `/blacklist <username> <reason>` - Add to blacklist
- `/unblacklist <username>` - Remove from blacklist
- `/forceverify <user> <roblox_username>` - Force verify user

---

## Notes

- Higher tier roles automatically inherit permissions from lower tiers
- Permission checks are performed at command execution
- Attempting to use a command without proper permissions will result in an error message
- All moderation actions are logged to appropriate log channels
