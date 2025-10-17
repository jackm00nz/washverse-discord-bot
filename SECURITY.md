# Security Guide for WashVerse Discord Bot

## ⚠️ IMPORTANT: If Your Token Was Exposed

If you accidentally committed your Discord bot token or other credentials to a public repository, follow these steps immediately:

### 1. Regenerate Your Discord Bot Token

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application (WashVerse bot)
3. Go to the "Bot" section
4. Click "Reset Token" and confirm
5. Copy the new token and save it securely
6. Update the token in Railway's environment variables (see below)

### 2. Regenerate Other Exposed Credentials

If any of these were exposed, regenerate them:
- **ROBLOX Cookie**: Log out and log back in to get a new session cookie
- **Hyra API Key**: Contact Hyra support or regenerate in their dashboard
- **Bloxlink API Key**: Regenerate in Bloxlink's developer portal

### 3. Remove Sensitive Data from Git History

If you committed a `.env` file with real credentials, you need to remove it from git history:

\`\`\`bash
# Remove .env from git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Force push to update remote repository
git push origin --force --all
\`\`\`

**Alternative (easier)**: Use BFG Repo-Cleaner:
\`\`\`bash
# Install BFG
brew install bfg  # macOS
# or download from https://rtyley.github.io/bfg-repo-cleaner/

# Remove .env from history
bfg --delete-files .env

# Clean up and force push
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push origin --force --all
\`\`\`

---

## Best Practices for Managing Secrets

### ✅ DO:

1. **Use Environment Variables**
   - Store all secrets in Railway's environment variables dashboard
   - Never hardcode credentials in your code

2. **Keep .env Files Local**
   - The `.env` file should ONLY exist on your local machine
   - It's already in `.gitignore` - never remove it from there

3. **Use .env.example**
   - Keep `.env.example` with placeholder values
   - This shows what variables are needed without exposing real values

4. **Rotate Credentials Regularly**
   - Change your Discord bot token every few months
   - Update API keys periodically

5. **Use Different Credentials for Development and Production**
   - Create a separate Discord bot for testing
   - Use different API keys for dev/prod environments

### ❌ DON'T:

1. **Never commit .env files**
   - Even if the repository is private
   - Git history is permanent

2. **Never share credentials in chat or email**
   - Use secure password managers
   - Share through encrypted channels only

3. **Never log sensitive data**
   - Don't use `console.log()` with tokens or API keys
   - Remove debug logs before committing

4. **Never hardcode credentials**
   \`\`\`javascript
   // ❌ BAD
   const token = "MTIzNDU2Nzg5MDEyMzQ1Njc4.GhIjKl.MnOpQrStUvWxYzAbCdEfGhIjKlMnOpQrStUvWx";
   
   // ✅ GOOD
   const token = process.env.DISCORD_TOKEN;
   \`\`\`

---

## Setting Up Environment Variables in Railway

Railway provides a secure way to manage environment variables without committing them to your repository.

### Step 1: Access Environment Variables

1. Go to your Railway project dashboard
2. Click on your service (washverse-discord-bot)
3. Go to the "Variables" tab

### Step 2: Add Variables

Click "New Variable" and add each of the following:

#### Required Variables:
\`\`\`
DISCORD_TOKEN=your_discord_bot_token_here
CLIENT_ID=your_discord_application_id_here
GUILD_ID=your_discord_server_id_here
ROBLOX_GROUP_ID=your_roblox_group_id_here
ROBLOX_COOKIE=your_roblox_cookie_here
\`\`\`

#### Optional Variables (if using these features):
\`\`\`
HYRA_API_KEY=your_hyra_api_key_here
HYRA_API_URL=https://api.hyra.io
BLOXLINK_API_KEY=your_bloxlink_api_key_here
DATABASE_PATH=./data/washverse.db
\`\`\`

### Step 3: Deploy

After adding all variables, Railway will automatically redeploy your bot with the new environment variables.

---

## Getting Credentials Safely

### Discord Bot Token

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Go to "Bot" section
4. Click "Reset Token" (if regenerating) or copy existing token
5. **Important**: You can only see the token once - save it immediately

### ROBLOX Cookie

1. Log in to [ROBLOX](https://www.roblox.com)
2. Open browser DevTools (F12)
3. Go to Application/Storage → Cookies → https://www.roblox.com
4. Find the `.ROBLOSECURITY` cookie
5. Copy its value (starts with `_|WARNING:-DO-NOT-SHARE-THIS.--Sharing-this-will-allow-someone-to-log-in-as-you-and-to-steal-your-ROBUX-and-items.|_`)
6. **Warning**: This cookie gives full access to your ROBLOX account - never share it

### Discord IDs (CLIENT_ID, GUILD_ID)

1. Enable Developer Mode in Discord:
   - User Settings → Advanced → Developer Mode (toggle on)
2. **CLIENT_ID**: Right-click your bot → Copy User ID
3. **GUILD_ID**: Right-click your server icon → Copy Server ID

### ROBLOX Group ID

1. Go to your group page on ROBLOX
2. Look at the URL: `https://www.roblox.com/groups/[GROUP_ID]/...`
3. The number is your group ID

---

## Verifying Your Setup is Secure

Run this checklist:

- [ ] `.env` is in `.gitignore`
- [ ] No `.env` file exists in your repository (only `.env.example`)
- [ ] All credentials are set in Railway's Variables tab
- [ ] No hardcoded tokens in any `.js` or `.ts` files
- [ ] Git history doesn't contain exposed credentials (if it did, you cleaned it)
- [ ] Discord bot token has been regenerated if it was exposed
- [ ] Repository can be public without exposing any secrets

---

## Questions?

If you're unsure whether your setup is secure, it's better to regenerate all credentials and start fresh. Security is not worth the risk.

For more help:
- [Discord Developer Documentation](https://discord.com/developers/docs)
- [Railway Documentation](https://docs.railway.app)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
