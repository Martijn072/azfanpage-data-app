import { NextMatchWidget } from "@/components/NextMatchWidget"
import { SmartEredivisieStand } from "@/components/SmartEredivisieStand"
import { ForumFeedWidget } from "@/components/ForumFeedWidget"
import { SocialMediaSidebar } from "@/components/SocialMediaSidebar"

export function DesktopSidebar() {
  return (
    <aside className="w-full lg:w-80 space-y-6 sticky top-4">
      {/* Next Match Widget - exact copy of mobile widget */}
      <div className="animate-fade-in">
        <NextMatchWidget />
      </div>
      
      {/* Smart Eredivisie Stand */}
      <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <SmartEredivisieStand />
      </div>
      
      {/* Forum Feed */}
      <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <ForumFeedWidget />
      </div>
      
      {/* Social Media Follow */}
      <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <SocialMediaSidebar />
      </div>
    </aside>
  )
}