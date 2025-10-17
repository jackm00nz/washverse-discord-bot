import type React from "react"
import { Bot, Shield, Users, Activity, Ticket, Settings } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-primary text-primary-foreground p-4 rounded-2xl">
              <Bot className="w-16 h-16" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4 text-balance">William from WashVerse</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            A comprehensive Discord bot for managing your ROBLOX car wash group with advanced moderation, activity
            tracking, and group management features.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <FeatureCard
            icon={<Shield className="w-8 h-8" />}
            title="Server Administration"
            description="Comprehensive moderation tools including timeout, warn, kick, ban, and chat locking capabilities."
          />
          <FeatureCard
            icon={<Users className="w-8 h-8" />}
            title="Group Management"
            description="Manage your ROBLOX group with suspend, demote, terminate, and leave of absence tracking integrated with Hyra."
          />
          <FeatureCard
            icon={<Activity className="w-8 h-8" />}
            title="Activity Tracking"
            description="Track staff activity, set custom requirements per rank, and generate detailed distribution reports."
          />
          <FeatureCard
            icon={<Settings className="w-8 h-8" />}
            title="Verification System"
            description="Automatic Discord role assignment based on ROBLOX group ranks using Bloxlink integration."
          />
          <FeatureCard
            icon={<Ticket className="w-8 h-8" />}
            title="Support Tickets"
            description="Full-featured ticket system with panels, claims, transcripts, and transfer capabilities."
          />
          <FeatureCard
            icon={<Bot className="w-8 h-8" />}
            title="Session Management"
            description="Announce and log training sessions, manage session locks, and track attendance."
          />
        </div>

        {/* Deployment Notice */}
        <div className="bg-card border border-border rounded-lg p-8 text-center max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Deployment Information</h2>
          <p className="text-muted-foreground mb-6">
            This is the landing page for the WashVerse Discord bot. The bot itself runs as a persistent Node.js
            application and must be deployed to a service that supports long-running processes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://github.com/jackm00nz/washverse-discord-bot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              View on GitHub
            </a>
            <a
              href="https://github.com/jackm00nz/washverse-discord-bot/blob/main/DEPLOYMENT.md"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Deployment Guide
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-sm text-muted-foreground">
          <p>Built for WashVerse • Powered by Discord.js</p>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="text-primary mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
