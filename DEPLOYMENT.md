# WashVerse Discord Bot - Deployment Guide

This guide will help you deploy the WashVerse Discord bot to Railway (recommended) or Heroku.

## Important Security Notice

**⚠️ NEVER commit your `.env` file or any credentials to your repository!**

All sensitive information (Discord token, API keys, etc.) should be stored as environment variables in your deployment platform. See [SECURITY.md](./SECURITY.md) for detailed security guidelines.

---

## Prerequisites

Before deploying, you need to gather the following credentials:

### 1. Discord Bot Token

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name (e.g., "William from WashVerse")
3. Go to the "Bot" section in the left sidebar
4. Click "Add Bot"
5. Under "Token", click "Reset Token" and copy it (you'll only see it once!)
6. **Save this token securely** - you'll need it for deployment

### 2. Discord Application ID (CLIENT_ID)

1. In the Discord Developer Portal, go to "General Information"
2. Copy the "Application ID"

### 3. Discord Server ID (GUILD_ID)

1. Enable Developer Mode in Discord: User Settings → Advanced → Developer Mode
2. Right-click your WashVerse server icon → Copy Server ID

### 4. ROBLOX Group ID

1. Go to your WashVerse group page on ROBLOX
2. Look at the URL: `https://www.roblox.com/groups/[GROUP_ID]/...`
3. Copy the group ID number

### 5. ROBLOX Cookie

1. Log in to [ROBLOX](https://www.roblox.com) with an account that has admin access to your group
2. Open browser DevTools (F12)
3. Go to Application/Storage → Cookies → https://www.roblox.com
4. Find the `.ROBLOSECURITY` cookie and copy its value
5. **⚠️ Warning**: This gives full access to the account - never share it publicly!

### 6. Optional: Hyra API Key

If you're using Hyra for group management:
1. Get your API key from Hyra's dashboard
2. Note the API URL (usually `https://api.hyra.io`)

### 7. Optional: Bloxlink API Key

If you're using Bloxlink for verification:
1. Get your API key from Bloxlink's developer portal

---

## Option 1: Deploy to Railway (Recommended)

Railway is the easiest and most reliable way to deploy Discord bots.

### Step 1: Create a Railway Account

1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub (recommended for easy deployment)

### Step 2: Create a New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Connect your GitHub account if not already connected
4. Select your `washverse-discord-bot` repository

### Step 3: Configure Environment Variables

**This is the most important step for security!**

1. In your Railway project, click on your service
2. Go to the "Variables" tab
3. Click "New Variable" and add each of these:

\`\`\`
DISCORD_TOKEN=your_discord_bot_token_here
CLIENT_ID=your_discord_application_id_here
GUILD_ID=your_discord_server_id_here
ROBLOX_GROUP_ID=your_roblox_group_id_here
ROBLOX_COOKIE=your_roblox_cookie_here
DATABASE_PATH=./data/washverse.db
\`\`\`

Optional variables (if using these features):
\`\`\`
HYRA_API_KEY=your_hyra_api_key_here
HYRA_API_URL=https://api.hyra.io
BLOXLINK_API_KEY=your_bloxlink_api_key_here
\`\`\`

**Replace all `your_*_here` values with your actual credentials!**

### Step 4: Configure Discord Role and Channel IDs

You also need to add Discord role and channel IDs to the environment variables. To get these:

1. Enable Developer Mode in Discord (User Settings → Advanced → Developer Mode)
2. Right-click on roles/channels and select "Copy ID"

Add these variables in Railway:

\`\`\`
STAFF_ROLE_ID=your_staff_role_id
MANAGEMENT_ROLE_ID=your_management_role_id
HR_ROLE_ID=your_hr_role_id
DEVELOPER_ROLE_ID=your_developer_role_id

MOD_LOG_CHANNEL_ID=your_mod_log_channel_id
SUGGESTION_CHANNEL_ID=your_suggestion_channel_id
WELCOME_CHANNEL_ID=your_welcome_channel_id
HR_LOG_CHANNEL_ID=your_hr_log_channel_id
SESSION_LOG_CHANNEL_ID=your_session_log_channel_id
TICKET_CATEGORY_ID=your_ticket_category_id
TICKET_LOG_CHANNEL_ID=your_ticket_log_channel_id
\`\`\`

### Step 5: Deploy

1. Railway will automatically deploy your bot
2. Check the "Deployments" tab to see the build progress
3. Once deployed, check the "Logs" tab to verify the bot is running
4. You should see: `✅ Logged in as William from WashVerse`

### Step 6: Invite the Bot to Your Server

1. Go to Discord Developer Portal → Your Application → OAuth2 → URL Generator
2. Select scopes: `bot`, `applications.commands`
3. Select bot permissions: `Administrator` (or specific permissions you need)
4. Copy the generated URL and open it in your browser
5. Select your WashVerse server and authorize

### Step 7: Register Slash Commands

The bot will automatically register slash commands when it starts. Check your Discord server - you should see commands like `/help`, `/myactivity`, `/suggest`, etc.

---

## Option 2: Deploy to Heroku

Heroku is another option, though Railway is generally easier for Discord bots.

### Step 1: Create a Heroku Account

1. Go to [Heroku.com](https://www.heroku.com)
2. Sign up for a free account

### Step 2: Install Heroku CLI

\`\`\`bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows
# Download from https://devcenter.heroku.com/articles/heroku-cli

# Linux
curl https://cli-assets.heroku.com/install.sh | sh
\`\`\`

### Step 3: Login and Create App

\`\`\`bash
heroku login
heroku create washverse-bot
\`\`\`

### Step 4: Set Environment Variables

**Important**: Set all environment variables using the Heroku CLI or dashboard:

\`\`\`bash
heroku config:set DISCORD_TOKEN=your_discord_bot_token_here
heroku config:set CLIENT_ID=your_discord_application_id_here
heroku config:set GUILD_ID=your_discord_server_id_here
heroku config:set ROBLOX_GROUP_ID=your_roblox_group_id_here
heroku config:set ROBLOX_COOKIE=your_roblox_cookie_here
heroku config:set DATABASE_PATH=./data/washverse.db

# Optional
heroku config:set HYRA_API_KEY=your_hyra_api_key_here
heroku config:set HYRA_API_URL=https://api.hyra.io
heroku config:set BLOXLINK_API_KEY=your_bloxlink_api_key_here

# Discord IDs
heroku config:set STAFF_ROLE_ID=your_staff_role_id
heroku config:set MANAGEMENT_ROLE_ID=your_management_role_id
heroku config:set HR_ROLE_ID=your_hr_role_id
heroku config:set DEVELOPER_ROLE_ID=your_developer_role_id
heroku config:set MOD_LOG_CHANNEL_ID=your_mod_log_channel_id
# ... add all other channel/role IDs
\`\`\`

### Step 5: Deploy

\`\`\`bash
git push heroku main
\`\`\`

### Step 6: Scale the Worker

\`\`\`bash
heroku ps:scale worker=1
\`\`\`

### Step 7: Check Logs

\`\`\`bash
heroku logs --tail
\`\`\`

---

## Updating Your Bot

### Railway

1. Push changes to your GitHub repository
2. Railway will automatically detect changes and redeploy

### Heroku

\`\`\`bash
git push heroku main
\`\`\`

---

## Troubleshooting

### Bot is not responding to commands

1. Check that the bot is online in your Discord server
2. Verify all environment variables are set correctly in Railway/Heroku
3. Check the logs for errors
4. Make sure slash commands are registered (restart the bot if needed)

### "Invalid Token" error

1. Your Discord token is incorrect or expired
2. Regenerate the token in Discord Developer Portal
3. Update the `DISCORD_TOKEN` environment variable in Railway/Heroku

### ROBLOX commands not working

1. Verify `ROBLOX_COOKIE` is set correctly
2. Make sure the ROBLOX account has admin permissions in your group
3. Check if the cookie has expired (ROBLOX cookies expire after ~1 year)

### Database errors

1. Make sure `DATABASE_PATH` is set to `./data/washverse.db`
2. Check that the bot has write permissions
3. On Railway, the database will be created automatically

### Commands not showing up

1. Wait a few minutes - Discord can take time to register commands
2. Try kicking and re-inviting the bot
3. Check that the bot has `applications.commands` scope

---

## Monitoring Your Bot

### Railway

- **Logs**: Go to your service → "Logs" tab
- **Metrics**: View CPU and memory usage in the "Metrics" tab
- **Restart**: Click "Restart" in the service menu if needed

### Heroku

\`\`\`bash
# View logs
heroku logs --tail

# Restart
heroku restart

# Check status
heroku ps
\`\`\`

---

## Security Checklist

Before making your repository public:

- [ ] No `.env` file in the repository (only `.env.example`)
- [ ] All credentials are set as environment variables in Railway/Heroku
- [ ] `.env` is in `.gitignore`
- [ ] No hardcoded tokens in any code files
- [ ] Git history doesn't contain exposed credentials

See [SECURITY.md](./SECURITY.md) for detailed security guidelines.

---

## Need Help?

- Check the logs first - most issues show clear error messages
- Verify all environment variables are set correctly
- Make sure your Discord bot has the right permissions
- Regenerate credentials if you suspect they're compromised

For more help:
- [Discord.js Guide](https://discordjs.guide/)
- [Railway Documentation](https://docs.railway.app)
- [Heroku Documentation](https://devcenter.heroku.com/)
\`\`\`

```typescriptreact file=".env" isDeleted="true"
...deleted...
