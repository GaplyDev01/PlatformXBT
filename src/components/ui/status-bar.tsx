import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp, Briefcase, Wallet } from 'lucide-react';
import { useTwitter } from '../../context/TwitterContext';
import { usePortfolio } from '../../context/PortfolioContext';

interface StatusBarProps {
  className?: string;
  isSidebarExpanded?: boolean;
}

interface TokenBoost {
  symbol: string;
  change: string;
  chain: string;
}

const StatusBar: React.FC<StatusBarProps> = ({ className, isSidebarExpanded = false }) => {
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const { searchResults } = useTwitter();
  const { assets, isRealData, connectedAddress } = usePortfolio();
  
  const [currentTime, setCurrentTime] = useState(time);
  const [topTokenBoosts, setTopTokenBoosts] = useState<TokenBoost[]>([]);
  const [latestTokenBoosts, setLatestTokenBoosts] = useState<TokenBoost[]>([]);
  const [currentBoostIndex, setCurrentBoostIndex] = useState(0);
  const [currentBoostType, setCurrentBoostType] = useState<'top' | 'latest'>('top');
  const [currentBoost, setCurrentBoost] = useState<TokenBoost | null>(null);
  
  // Portfolio state
  const [currentAssetIndex, setCurrentAssetIndex] = useState(0);
  const [currentAsset, setCurrentAsset] = useState<any>(null);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Initialize and cycle through portfolio assets
  useEffect(() => {
    if (assets.length > 0) {
      setCurrentAsset(assets[currentAssetIndex % assets.length]);
    } else {
      setCurrentAsset(null);
    }
    
    // Cycle through portfolio assets every 4 seconds
    const assetCycleTimer = setInterval(() => {
      if (assets.length > 0) {
        const nextIndex = (currentAssetIndex + 1) % assets.length;
        setCurrentAssetIndex(nextIndex);
        setCurrentAsset(assets[nextIndex]);
      }
    }, 4000);
    
    return () => clearInterval(assetCycleTimer);
  }, [assets, currentAssetIndex]);

  // Fetch top token boosts
  useEffect(() => {
    const fetchTopTokenBoosts = async () => {
      try {
        const response = await fetch('https://api.dexscreener.com/token-boosts/top/v1', {
          headers: {
            'Cookie': '__cf_bm=0lsq0gQgt4DHWbWnmM_n5gCJU887.rdAGO7lrbx0RXE-1743259488-1.0.1.1-EL.y7vIuQ9RmBvaH3NCPf6heVnEQVzjQlN_cP4sl5udShNJti8zLFoINy3v2zQNJzexi4LGldvGSObF0Zw0vOpbQVuJDW3YnwYdO3MxJIZGNwaL1q6qxfPebhaxdnlWf'
          }
        });
        const data = await response.json();
        if (data.results) {
          setTopTokenBoosts(data.results.map((boost: any) => ({
            symbol: boost.symbol,
            change: boost.change,
            chain: boost.chain
          })));
        }
      } catch (error) {
        console.error('Error fetching top token boosts:', error);
      }
    };

    fetchTopTokenBoosts();
    const interval = setInterval(fetchTopTokenBoosts, 5 * 60 * 1000); // Refresh every 5 minutes
    
    return () => clearInterval(interval);
  }, []);

  // Fetch latest token boosts
  useEffect(() => {
    const fetchLatestTokenBoosts = async () => {
      try {
        const response = await fetch('https://api.dexscreener.com/token-boosts/latest/v1', {
          headers: {
            'Cookie': '__cf_bm=0lsq0gQgt4DHWbWnmM_n5gCJU887.rdAGO7lrbx0RXE-1743259488-1.0.1.1-EL.y7vIuQ9RmBvaH3NCPf6heVnEQVzjQlN_cP4sl5udShNJti8zLFoINy3v2zQNJzexi4LGldvGSObF0Zw0vOpbQVuJDW3YnwYdO3MxJIZGNwaL1q6qxfPebhaxdnlWf'
          }
        });
        const data = await response.json();
        if (data.results) {
          setLatestTokenBoosts(data.results.map((boost: any) => ({
            symbol: boost.symbol,
            change: boost.change,
            chain: boost.chain
          })));
        }
      } catch (error) {
        console.error('Error fetching latest token boosts:', error);
      }
    };

    fetchLatestTokenBoosts();
    const interval = setInterval(fetchLatestTokenBoosts, 5 * 60 * 1000); // Refresh every 5 minutes
    
    return () => clearInterval(interval);
  }, []);

  // Cycle through token boosts every 5 seconds
  useEffect(() => {
    const allBoosts = [...topTokenBoosts, ...latestTokenBoosts];
    if (allBoosts.length === 0) return;

    const cycleTimer = setInterval(() => {
      // Toggle between top and latest boosts
      if (currentBoostType === 'top') {
        if (latestTokenBoosts.length > 0) {
          setCurrentBoostType('latest');
          setCurrentBoostIndex(0);
          setCurrentBoost(latestTokenBoosts[0]);
        } else if (topTokenBoosts.length > 0) {
          setCurrentBoostIndex((prevIndex) => (prevIndex + 1) % topTokenBoosts.length);
          setCurrentBoost(topTokenBoosts[(currentBoostIndex + 1) % topTokenBoosts.length]);
        }
      } else {
        if (topTokenBoosts.length > 0) {
          setCurrentBoostType('top');
          setCurrentBoostIndex(0);
          setCurrentBoost(topTokenBoosts[0]);
        } else if (latestTokenBoosts.length > 0) {
          setCurrentBoostIndex((prevIndex) => (prevIndex + 1) % latestTokenBoosts.length);
          setCurrentBoost(latestTokenBoosts[(currentBoostIndex + 1) % latestTokenBoosts.length]);
        }
      }
    }, 5000);
    
    return () => clearInterval(cycleTimer);
  }, [topTokenBoosts, latestTokenBoosts, currentBoostIndex, currentBoostType]);

  // Initialize current boost when data is first loaded
  useEffect(() => {
    if (topTokenBoosts.length > 0 && !currentBoost) {
      setCurrentBoost(topTokenBoosts[0]);
    } else if (latestTokenBoosts.length > 0 && !currentBoost) {
      setCurrentBoost(latestTokenBoosts[0]);
    }
  }, [topTokenBoosts, latestTokenBoosts, currentBoost]);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Format a blockchain address for display
  const formatAddress = (address: string): string => {
    if (!address) return '';
    if (address.length < 10) return address;
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
  };

  const sidebarWidth = isSidebarExpanded ? 'left-64' : 'left-16';
  
  return (
    <div className={`fixed bottom-0 ${sidebarWidth} right-0 h-7 bg-theme-bg border-t border-theme-border text-xs flex items-center justify-between z-30 font-mono px-2 overflow-hidden ${className}`}>
      <div className="flex items-center space-x-3 overflow-hidden">
        {/* Portfolio holdings ticker */}
        {currentAsset ? (
          <div className="flex items-center">
            <Briefcase size={12} className="mr-1 text-theme-accent" />
            <span className="text-theme-text-primary truncate">
              {isRealData && (
                <span className="text-green-500 mr-1">•</span>
              )}
              {currentAsset.symbol} ({formatCurrency(currentAsset.currentPrice)}) × {currentAsset.quantity.toFixed(4)} = {formatCurrency(currentAsset.quantity * currentAsset.currentPrice)}
            </span>
          </div>
        ) : (
          <div className="flex items-center">
            <Wallet size={12} className="mr-1 text-theme-accent" />
            <span className="text-theme-text-secondary text-xs">
              No portfolio data - Import your assets
            </span>
          </div>
        )}
        
        {isRealData && connectedAddress && (
          <div className="flex items-center">
            <Wallet size={12} className="mr-1 text-theme-accent" />
            <span className="text-theme-text-secondary truncate">
              {formatAddress(connectedAddress)}
            </span>
          </div>
        )}
        
        {currentBoost && (
          <div className="flex items-center">
            <TrendingUp size={12} className="mr-1 text-green-500" />
            <span className="text-theme-text-primary truncate">
              {currentBoost.symbol} ({currentBoost.change}) - {currentBoostType === 'top' ? 'Top' : 'Latest'} [{currentBoost.chain}]
            </span>
          </div>
        )}
      </div>
      
      <div className="flex items-center">
        <Clock size={12} className="mr-1 text-theme-text-secondary" />
        <span>{currentTime}</span>
      </div>
    </div>
  );
};

export default StatusBar;