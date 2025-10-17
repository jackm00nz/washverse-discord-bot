# 🌊 William from WashVerse

A comprehensive Discord bot built for the WashVerse ROBLOX car wash group with advanced moderation, group management, activity tracking, and more.

## 🚀 Features

### Server Administration
- Timeout, warn, kick, ban, and tempban commands with mod logging
- Channel locking functionality
- Mod log viewing
- Suggestion system with approval/denial

### Group Administration
- Suspend, demote, and terminate members with automatic Hyra logging
- Leave of Absence (LoA) management with automatic role assignment/removal
- Automatic HR letter generation for all actions

### Activity Management
- Track sessions attended/hosted, minutes, and messages
- Customizable requirements per rank
- Automatic distribution reports for HR leads

### Affiliate & Communications Management
- Alliance management with representative assignment
- Automatic weekly check-ins
- Of the Day (OTD) posting from Trello queue

### Verification & Role Management
- Bloxlink integration for Discord-to-ROBLOX verification
- Automatic role updates based on group rank
- Force verification for staff

### Session Management
- Training announcements (public and management)
- Session logging system
- Lock and conclude announcements

### Support System
- Ticket panel creation
- Ticket claiming, transferring, and closing
- Automatic transcript generation
- 12hr and 24hr response warnings

### Game Administration
- In-game ban system for car wash
- Blacklist system across all facilities

## 📋 Prerequisites

- Node.js 18.x or higher
- A Discord Bot Token
- ROBLOX Group ID and Cookie
- Hyra API Key
- Bloxlink API Key

## 🛠️ Setup Instructions

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in all required values:

\`\`\`bash
cp .env.example .env
\`\`\`

### 3. Deploy Slash Commands

\`\`\`bash
npm run deploy
\`\`\`

### 4. Start the Bot

\`\`\`bash
npm start
\`\`\`

For development with auto-reload:
\`\`\`bash
npm run dev
\`\`\`

## 📝 Command Categories

See the full command list in the documentation or use `/help` in Discord.

## 🗄️ Database

The bot uses SQLite for data storage. The database is automatically initialized on first run.

## 🔧 Configuration

Edit `src/config.js` to customize:
- Bot name and colors
- Default activity requirements
- Channel and role IDs

## 📦 Project Structure

\`\`\`
william-from-washverse/
├── src/
│   ├── commands/          # All slash commands
│   ├── events/            # Discord event handlers
│   ├── database/          # Database schema
│   ├── utils/             # Utility functions (Hyra, Bloxlink, ROBLOX, etc.)
│   ├── config.js          # Bot configuration
│   └── index.js           # Main bot file
├── data/                  # Database files (auto-created)
├── .env.example           # Environment variables template
└── package.json           # Dependencies
\`\`\`

## 📄 License

MIT License
