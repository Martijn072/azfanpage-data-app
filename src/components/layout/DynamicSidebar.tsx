import { NextMatchWidget } from '@/components/NextMatchWidget';
import { SmartEredivisieStand } from './sidebar/SmartEredivisieStand';
import { ForumActivityWidget } from './sidebar/ForumActivityWidget';
import { SocialMediaPromo } from '@/components/SocialMediaPromo';

export const DynamicSidebar = () => {
  // TODO: Add logic to detect live AZ match and transform to Live Dashboard
  const isLiveMatch = false; // This will be implemented based on fixture data

  if (isLiveMatch) {
    // TODO: Implement LiveMatchDashboard component
    return (
      <div className="space-y-6 sticky top-32">
        <div className="bg-card rounded-lg p-4 border">
          <h3 className="text-lg font-bold text-az-red mb-4">🔴 Live Match Dashboard</h3>
          <p className="text-sm text-muted-foreground">Live dashboard coming soon...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sticky top-32">
      {/* Next Match Widget - Compact Version */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <NextMatchWidget />
      </div>

      {/* Smart Eredivisie Stand */}
      <SmartEredivisieStand />

      {/* Forum Activity */}
      <ForumActivityWidget />

      {/* Social Media Promo */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <SocialMediaPromo />
      </div>
    </div>
  );
};