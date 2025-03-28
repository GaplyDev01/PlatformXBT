import React, { useState, useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import Card from './Card';
import PriceChart from './charts/PriceChart';
import { NewsFeed, SocialSentiment, DeveloperActivity, VolumeVolatility, TokenViewer } from './ui';
import { Watchlist, PortfolioSnapshot } from './ui';
import { TokenSearchCard } from './ui';
import { Alerts } from './ui';
import TwitterFeed from './dashboard/cards/social/TwitterFeed';
import { TrendingUp, Briefcase, Brain, Plus, ChevronRight } from 'lucide-react';
import DashboardSelectionModal from './DashboardSelectionModal';
import { useToken } from '../context/TokenContext';
import { useCrypto } from '../context/CryptoContext';
import { generateEnhancedAIResponse } from '../utils/aiUtils';

const Dashboard: React.FC = () => {
  const { cards, selectedToken, dashboardType, setDashboardType } = useDashboard();
  const { tokenDetails } = useToken();
  const { isLoading: isCryptoLoading } = useCrypto();
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Handle AI analysis generation
  const handleGetInsights = async () => {
    if (!tokenDetails || !tokenDetails.market_data) return;
    
    setIsAnalyzing(true);
    setAnalysisError(null);
    
    try {
      const prompt = `Please analyze this cryptocurrency and provide a clear trading signal:

Token: ${tokenDetails.name} (${tokenDetails.symbol?.toUpperCase()})
Current Price: $${tokenDetails.market_data.current_price?.usd}
Market Cap: $${tokenDetails.market_data.market_cap?.usd}
24h Volume: $${tokenDetails.market_data.total_volume?.usd}
24h Change: ${tokenDetails.market_data.price_change_percentage_24h}%
7d Change: ${tokenDetails.market_data.price_change_percentage_7d}%
Market Cap Rank: #${tokenDetails.market_data.market_cap_rank || 'N/A'}

Please provide a comprehensive analysis including:
1. Current market sentiment
2. Key support and resistance levels
3. Trading signal (Strong Buy, Buy, Neutral, Sell, Strong Sell)
4. Risk level and suggested position size
5. Stop loss and take profit levels
6. Key factors to watch`;

      const analysis = await generateEnhancedAIResponse(prompt);
      setAiAnalysis(analysis);
    } catch (err) {
      console.error('Error generating analysis:', err);
      setAnalysisError('Failed to generate analysis. Please try again later.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Render card content based on component type
  const renderCardContent = (component: string) => {
    switch (component) {
      case 'PriceChart':
        return (
          <PriceChart
            tokenId={selectedToken || 'bitcoin'}
            showControls={true}
            height={300}
          />
        );
      case 'MarketOverview':
        return <TokenViewer />;
      case 'NewsFeed':
        return <NewsFeed />;
      case 'SocialSentiment':
        return <SocialSentiment />;
      case 'DeveloperActivity':
        return <DeveloperActivity />;
      case 'VolumeVolatility':
        return <VolumeVolatility />;
      case 'Watchlist':
        return <Watchlist />;
      case 'PortfolioOverview':
        return <PortfolioSnapshot />;
      case 'Alerts':
        return <Alerts />;
      case 'TwitterFeed':
        return <TwitterFeed />;
      default:
        return <div>Component not implemented</div>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Dashboard Controls */}
      <div className="flex items-center justify-between bg-theme-bg border border-theme-border rounded-lg p-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setDashboardType('trading')}
            className={`flex items-center px-4 py-2 rounded-lg text-sm transition-colors ${
              dashboardType === 'trading'
                ? 'bg-theme-accent text-theme-bg'
                : 'bg-theme-accent/10 text-theme-accent hover:bg-theme-accent/20'
            }`}
          >
            <TrendingUp size={16} className="mr-2" />
            Trading View
          </button>
          <button
            onClick={() => setDashboardType('investing')}
            className={`flex items-center px-4 py-2 rounded-lg text-sm transition-colors ${
              dashboardType === 'investing'
                ? 'bg-theme-accent text-theme-bg'
                : 'bg-theme-accent/10 text-theme-accent hover:bg-theme-accent/20'
            }`}
          >
            <Briefcase size={16} className="mr-2" />
            Investment View
          </button>
          <button
            onClick={() => setDashboardType('research')}
            className={`flex items-center px-4 py-2 rounded-lg text-sm transition-colors ${
              dashboardType === 'research'
                ? 'bg-theme-accent text-theme-bg'
                : 'bg-theme-accent/10 text-theme-accent hover:bg-theme-accent/20'
            }`}
          >
            <Brain size={16} className="mr-2" />
            Research View
          </button>
        </div>

        <button
          onClick={() => setShowSelectionModal(true)}
          className="flex items-center px-4 py-2 text-sm bg-theme-accent text-theme-bg rounded-lg hover:bg-theme-accent-dark transition-colors"
        >
          <Plus size={16} className="mr-2" />
          Add Card
        </button>
      </div>

      {/* Loading State */}
      {isCryptoLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-theme-accent border-t-transparent"></div>
        </div>
      )}

      {/* Dashboard Grid */}
      {!isCryptoLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Token Search & Analysis Card - Always First */}
          <div className="lg:col-span-2 bg-theme-bg rounded-lg border border-theme-border overflow-hidden">
            <TokenSearchCard onAnalyze={handleGetInsights} />
          </div>

          {/* Other Dashboard Cards */}
          {cards.filter(card => card.component !== 'MarketOverview').map(card => (
            <div
              key={card.id}
              className={`bg-theme-bg rounded-lg border border-theme-border overflow-hidden ${
                card.gridArea ? `grid-area-${card.gridArea}` : ''
              }`}
            >
              <Card title={card.title}>
                {renderCardContent(card.component)}
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* AI Analysis Section */}
      {aiAnalysis && (
        <div className="mt-4 p-4 bg-theme-accent/5 rounded-lg border border-theme-accent/20">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium text-theme-text-primary">AI Analysis</h3>
            <div className="flex items-center text-sm text-theme-text-secondary">
              <ChevronRight size={16} className="mr-1" />
              Analysis Complete
            </div>
          </div>
          <div className="text-sm text-theme-text-primary whitespace-pre-wrap">
            {aiAnalysis}
          </div>
        </div>
      )}

      {/* Error State */}
      {analysisError && (
        <div className="mt-4 p-4 bg-red-500/10 rounded-lg border border-red-500/20">
          <p className="text-sm text-red-500">{analysisError}</p>
        </div>
      )}

      {/* Dashboard Selection Modal */}
      <DashboardSelectionModal
        isOpen={showSelectionModal}
        onClose={() => setShowSelectionModal(false)}
        onSelectPreset={(presetId) => {
          setShowSelectionModal(false);
        }}
        onCustomSelection={(componentIds) => {
          setShowSelectionModal(false);
        }}
        presets={[]}
        availableComponents={[]}
        selectedComponents={[]}
      />
    </div>
  );
};

export default Dashboard;