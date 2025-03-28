import React, { useState } from 'react';
import CanonicalLink from './CanonicalLink';
import { Badge } from './ui/badge';
import { DisplayCards } from './ui/display-cards';
import { TextShimmer } from './ui/text-shimmer';
import { LinkPreview } from './ui/link-preview';
import { 
  Eye, 
  Twitter, 
  TrendingUp, 
  AlertTriangle, 
  Shield, 
  Award,
  Clock,
  ChevronRight,
  Users,
  Star
} from 'lucide-react';

interface VisionTest {
  tweetUrl: string;
  timestamp: number;
  initialMarketCap: number;
  currentMarketCap: number;
  pnlPercentage: number;
  status: 'pending' | 'passed' | 'failed';
  daysRemaining: number;
}

const ThePath: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'vision-tests' | 'redemption'>('leaderboard');
  
  // Mock data for vision tests
  const [visionTests] = useState<VisionTest[]>([
    {
      tweetUrl: 'https://twitter.com/user/status/123',
      timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
      initialMarketCap: 1000000,
      currentMarketCap: 1250000,
      pnlPercentage: 25,
      status: 'pending',
      daysRemaining: 5
    },
    {
      tweetUrl: 'https://twitter.com/user/status/456',
      timestamp: Date.now() - 8 * 24 * 60 * 60 * 1000, // 8 days ago
      initialMarketCap: 5000000,
      currentMarketCap: 4000000,
      pnlPercentage: -20,
      status: 'failed',
      daysRemaining: 0
    }
  ]);

  return (
    <>
      <CanonicalLink path="/the-path" />
      <div className="space-y-4">
        <div className="bg-theme-bg bg-opacity-70 backdrop-blur-sm rounded-lg shadow-sm p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
            <div className="mb-4 sm:mb-0">
              <h2 className="text-xl font-bold text-theme-text-primary flex items-center">
                <Eye size={24} className="mr-2 text-theme-accent" />
                The Path
              </h2>
              <TextShimmer className="text-sm">
                Prove your worth. Earn your vision. Lead the way.
              </TextShimmer>
            </div>
            
            <div className="flex space-x-2">
              <button
                className={`flex items-center text-xs px-4 py-2 rounded-lg ${
                  activeTab === 'leaderboard' 
                    ? 'bg-theme-accent text-theme-bg' 
                    : 'bg-theme-bg border border-theme-border text-theme-accent hover:bg-theme-accent/10'
                }`}
                onClick={() => setActiveTab('leaderboard')}
              >
                <Award size={14} className="mr-1" />
                Leaderboard
              </button>
              <button
                className={`flex items-center text-xs px-4 py-2 rounded-lg ${
                  activeTab === 'vision-tests' 
                    ? 'bg-theme-accent text-theme-bg' 
                    : 'bg-theme-bg border border-theme-border text-theme-accent hover:bg-theme-accent/10'
                }`}
                onClick={() => setActiveTab('vision-tests')}
              >
                <Eye size={14} className="mr-1" />
                Vision Tests
              </button>
              <button
                className={`flex items-center text-xs px-4 py-2 rounded-lg ${
                  activeTab === 'redemption' 
                    ? 'bg-theme-accent text-theme-bg' 
                    : 'bg-theme-bg border border-theme-border text-theme-accent hover:bg-theme-accent/10'
                }`}
                onClick={() => setActiveTab('redemption')}
              >
                <Shield size={14} className="mr-1" />
                Redemption
              </button>
            </div>
          </div>

          {/* Vision Test Requirements Card */}
          <div className="bg-theme-accent/10 rounded-lg p-4 mb-6 border border-theme-border">
            <h3 className="text-lg font-medium text-theme-text-primary mb-2 flex items-center">
              <Star size={18} className="mr-2 text-theme-accent" />
              Vision Test Requirements
            </h3>
            <ul className="space-y-2 text-sm text-theme-text-secondary">
              <li className="flex items-center">
                <ChevronRight size={14} className="mr-1 text-theme-accent" />
                Achieve 20% PnL within 7 days from initial call
              </li>
              <li className="flex items-center">
                <ChevronRight size={14} className="mr-1 text-theme-accent" />
                Share insights via Twitter with embedded market analysis
              </li>
              <li className="flex items-center">
                <ChevronRight size={14} className="mr-1 text-theme-accent" />
                Maintain transparency with entry and target prices
              </li>
            </ul>
          </div>

          {/* Active Vision Tests */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-theme-text-primary flex items-center">
              <Clock size={18} className="mr-2 text-theme-accent" />
              Active Vision Tests
            </h3>
            
            {visionTests.map((test, index) => (
              <div key={index} className="bg-theme-bg border border-theme-border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center mb-2">
                      <Twitter size={16} className="text-theme-accent mr-2" />
                      <LinkPreview 
                        url={test.tweetUrl}
                        className="text-sm hover:underline"
                      >
                        View Original Call
                      </LinkPreview>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        label={`${test.pnlPercentage >= 0 ? '+' : ''}${test.pnlPercentage}% PnL`}
                        variant={test.pnlPercentage >= 0 ? 'success' : 'error'}
                        icon={<TrendingUp size={12} />}
                        size="small"
                      />
                      {test.status === 'pending' && (
                        <Badge 
                          label={`${test.daysRemaining}d remaining`}
                          variant="warning"
                          icon={<Clock size={12} />}
                          size="small"
                        />
                      )}
                      {test.status === 'failed' && (
                        <Badge 
                          label="Failed"
                          variant="error"
                          icon={<AlertTriangle size={12} />}
                          size="small"
                        />
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xs text-theme-text-secondary mb-1">
                      Initial MCap: ${(test.initialMarketCap / 1000000).toFixed(2)}M
                    </div>
                    <div className="text-xs text-theme-text-secondary">
                      Current MCap: ${(test.currentMarketCap / 1000000).toFixed(2)}M
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Display Cards for Featured Content */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-theme-text-primary mb-4 flex items-center">
              <Users size={18} className="mr-2 text-theme-accent" />
              Featured Visionaries
            </h3>
            <DisplayCards cards={[
              {
                icon: <Award className="size-4 text-theme-accent" />,
                title: "Top Visionary",
                description: "8/10 Successful Calls",
                date: "This Month",
                className: "[grid-area:stack] hover:-translate-y-10"
              },
              {
                icon: <TrendingUp className="size-4 text-theme-accent" />,
                title: "Rising Star",
                description: "5/5 Successful Calls",
                date: "This Week",
                className: "[grid-area:stack] translate-x-16 translate-y-10 hover:-translate-y-1"
              },
              {
                icon: <Shield className="size-4 text-theme-accent" />,
                title: "Most Consistent",
                description: "90% Success Rate",
                date: "All Time",
                className: "[grid-area:stack] translate-x-32 translate-y-20 hover:translate-y-10"
              }
            ]} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ThePath;