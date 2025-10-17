# WashVerse Discord Bot Deployment Guide

This guide will walk you through deploying "William from WashVerse" to Railway or Heroku.

## Prerequisites

Before deploying, you'll need to gather the following:

### 1. Discord Bot Token & IDs
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application or select your existing one
3. Go to the "Bot" section and click "Reset Token" to get your `DISCORD_TOKEN`
4. Copy your Application ID as `CLIENT_ID`
5. Enable these Privileged Gateway Intents:
   - Server Members Intent
   - Message Content Intent
6. Go to your Discord server, right-click the server icon → Copy Server ID for `GUILD_ID`

### 2. ROBLOX Credentials
1. Get your ROBLOX Group ID from your group page URL: `https://www.roblox.com/groups/{GROUP_ID}/`
2. Get your ROBLOX cookie:
   - Log into ROBLOX in your browser
   - Open Developer Tools (F12)
   - Go to Application → Cookies → https://www.roblox.com
   - Copy the `.ROBLOSECURITY` cookie value (starts with `_|WARNING:-DO-NOT-SHARE-THIS`)
   - **IMPORTANT**: Never share this cookie - it gives full access to your account

### 3. API Keys
- **Hyra API Key**: Get from [Hyra Dashboard](https://hyra.io/) (for group management logs)
- **Bloxlink API Key**: Get from [Bloxlink API](https://blox.link/developers) (for Discord-ROBLOX verification)

### 4. Discord Role & Channel IDs
Right-click on roles/channels in Discord (with Developer Mode enabled) and copy their IDs:
- Staff, Management, HR, Developer role IDs
- Log channel IDs (mod logs, action logs, session logs, etc.)

---

## Option 1: Deploy to Railway (Recommended)

Railway is easier to set up and has a generous free tier.

### Step 1: Prepare Your Repository
1. Push your code to GitHub:
   \`\`\`bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/washverse-bot.git
   git push -u origin main
   \`\`\`

### Step 2: Deploy to Railway
1. Go to [Railway](https://railway.app/) and sign up/login
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `washverse-bot` repository
4. Railway will automatically detect it as a Node.js project

### Step 3: Configure Environment Variables
1. In your Railway project, go to the "Variables" tab
2. Add all environment variables from your `.env` file:
   \`\`\`
   DISCORD_TOKEN=your_discord_bot_token
   CLIENT_ID=your_client_id
   GUILD_ID=your_guild_id
   ROBLOX_GROUP_ID=your_group_id
   ROBLOX_COOKIE=your_roblox_cookie
   HYRA_API_KEY=your_hyra_key
   HYRA_API_URL=https://api.hyra.io
   BLOXLINK_API_KEY=your_bloxlink_key
   DATABASE_PATH=./data/washverse.db
   
   # Discord Role IDs
   STAFF_ROLE_ID=your_staff_role_id
   MANAGEMENT_ROLE_ID=your_management_role_id
   HR_ROLE_ID=your_hr_role_id
   DEVELOPER_ROLE_ID=your_developer_role_id
   
   # Discord Channel IDs
   MOD_LOG_CHANNEL_ID=your_mod_log_channel_id
   ACTION_LOG_CHANNEL_ID=your_action_log_channel_id
   SESSION_LOG_CHANNEL_ID=your_session_log_channel_id
   SUGGESTION_CHANNEL_ID=your_suggestion_channel_id
   WELCOME_CHANNEL_ID=your_welcome_channel_id
   TICKET_CATEGORY_ID=your_ticket_category_id
   TICKET_LOG_CHANNEL_ID=your_ticket_log_channel_id
   ALLIANCE_CATEGORY_ID=your_alliance_category_id
   \`\`\`

### Step 4: Configure Start Command
1. In Railway, go to "Settings" → "Start Command"
2. Set it to: `node src/bot.js`
3. Click "Deploy"

### Step 5: Register Slash Commands
After the bot is running, you need to register the slash commands:
1. In Railway, go to "Deployments" and check the logs
2. The bot should automatically register commands on startup
3. Check your Discord server - slash commands should appear when you type `/`

### Step 6: Monitor Your Bot
- View logs in Railway's "Deployments" tab
- The bot will automatically restart if it crashes
- Railway provides persistent storage for your SQLite database

---

## Option 2: Deploy to Heroku

### Step 1: Install Heroku CLI
\`\`\`bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows
# Download from https://devcenter.heroku.com/articles/heroku-cli

# Linux
curl https://cli-assets.heroku.com/install.sh | sh
\`\`\`

### Step 2: Login and Create App
\`\`\`bash
heroku login
heroku create washverse-bot
\`\`\`

### Step 3: Add Buildpack
\`\`\`bash
heroku buildpacks:set heroku/nodejs
\`\`\`

### Step 4: Set Environment Variables
\`\`\`bash
heroku config:set DISCORD_TOKEN=your_discord_bot_token
heroku config:set CLIENT_ID=your_client_id
heroku config:set GUILD_ID=your_guild_id
heroku config:set ROBLOX_GROUP_ID=your_group_id
heroku config:set ROBLOX_COOKIE=your_roblox_cookie
heroku config:set HYRA_API_KEY=your_hyra_key
heroku config:set HYRA_API_URL=https://api.hyra.io
heroku config:set BLOXLINK_API_KEY=your_bloxlink_key
heroku config:set DATABASE_PATH=./data/washverse.db

# Add all role and channel IDs
heroku config:set STAFF_ROLE_ID=your_staff_role_id
heroku config:set MANAGEMENT_ROLE_ID=your_management_role_id
# ... (add all other role and channel IDs)
\`\`\`

### Step 5: Deploy
\`\`\`bash
git add .
git commit -m "Prepare for Heroku deployment"
git push heroku main
\`\`\`

### Step 6: Scale the Worker
\`\`\`bash
heroku ps:scale worker=1
\`\`\`

### Step 7: View Logs
\`\`\`bash
heroku logs --tail
\`\`\`

---

## Post-Deployment Setup

### 1. Invite Bot to Server
1. Go to Discord Developer Portal → Your Application → OAuth2 → URL Generator
2. Select scopes: `bot`, `applications.commands`
3. Select bot permissions:
   - Administrator (or specific permissions: Manage Roles, Manage Channels, Kick Members, Ban Members, Manage Messages, etc.)
4. Copy the generated URL and open it in your browser
5. Select your server and authorize

### 2. Configure Discord Server
1. Create all required channels (mod-logs, action-logs, session-logs, suggestions, tickets, etc.)
2. Create all required roles (Staff, Management, HR, Developer)
3. Copy all IDs and update your environment variables
4. Restart your bot on Railway/Heroku

### 3. Test Commands
Try these commands to verify everything works:
- `/ping` - Check if bot responds
- `/help` - View all available commands
- `/myactivity` - Test database functionality
- `/verify` - Test Bloxlink integration

---

## Troubleshooting

### Bot is offline
- Check Railway/Heroku logs for errors
- Verify `DISCORD_TOKEN` is correct
- Ensure bot has proper intents enabled

### Commands not appearing
- Wait a few minutes for Discord to register commands
- Try kicking and re-inviting the bot
- Check logs for command registration errors

### Database errors
- Ensure `DATABASE_PATH` is set correctly
- Check if the bot has write permissions
- Railway/Heroku should automatically create the data directory

### ROBLOX integration not working
- Verify `ROBLOX_COOKIE` is valid (cookies expire after ~1 year)
- Check `ROBLOX_GROUP_ID` is correct
- Ensure the ROBLOX account has permissions in the group

### Hyra/Bloxlink not working
- Verify API keys are correct
- Check API rate limits
- Review logs for specific error messages

---

## Maintenance

### Updating the Bot
**Railway:**
1. Push changes to GitHub
2. Railway automatically deploys new commits

**Heroku:**
\`\`\`bash
git add .
git commit -m "Update bot"
git push heroku main
\`\`\`

### Viewing Logs
**Railway:** Go to Deployments tab in Railway dashboard

**Heroku:**
\`\`\`bash
heroku logs --tail
\`\`\`

### Restarting the Bot
**Railway:** Click "Restart" in the Railway dashboard

**Heroku:**
\`\`\`bash
heroku restart
\`\`\`

---

## Security Notes

⚠️ **NEVER commit your `.env` file to GitHub!**

- The `.env` file is already in `.gitignore`
- Never share your `DISCORD_TOKEN` or `ROBLOX_COOKIE`
- Rotate your ROBLOX cookie periodically
- Use environment variables for all sensitive data

---

## Support

If you encounter issues:
1. Check the logs first
2. Verify all environment variables are set correctly
3. Ensure Discord bot has proper permissions
4. Review the error messages in the deployment logs

For Railway-specific issues: [Railway Docs](https://docs.railway.app/)
For Heroku-specific issues: [Heroku Dev Center](https://devcenter.heroku.com/)
