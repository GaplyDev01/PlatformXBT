import React, { useState, useEffect } from 'react';
import Card from './Card';
import TokenSearch from './common/TokenSearch/TokenSearch';
import ApiTest from './ApiTest';
import SocialShareButtons from './SocialShareButtons';
import { useNavigate } from 'react-router-dom';
import { CoinSearchResult } from '../services/cryptoApi';
import PriceChart from './charts/PriceChart';
import { NewsFeed, SocialSentiment, DeveloperActivity, VolumeVolatility, TokenViewer } from './ui';
import TwitterFeed from './dashboard/cards/social/TwitterFeed';
import { 
  Coins, 
  RefreshCw, 
  ExternalLink, 
  TrendingUp, 
  TrendingDown,
  Clock,
  Link,
  Zap,
  Copy,
  Globe,
  AlertTriangle,
  Check,
  Flame,
  History,
  Layers,
  BarChart2,
  Database,
  Info
} from 'lucide-react';
import { formatCurrency, formatLargeNumber, formatPercentage } from '../utils/chartUtils';

const CryptoExplorer: React.FC = () => {
  const [selectedToken, setSelectedToken] = useState<CoinSearchResult | null>(null);
  const navigate = useNavigate();
  const [tokenDetails, setTokenDetails] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [trendingTokens, setTrendingTokens] = useState<any[]>([]);
  const [, setLoadingTrending] = useState(false);
  const [searchHistory, setSearchHistory] = useState<CoinSearchResult[]>([]);
  const [showApiTest] = useState(false);
  const [marketDataExpanded, setMarketDataExpanded] = useState(true);

  // Load search history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('solana-search-history');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse search history:', e);
      }
    }
  }, []);

  // Fetch trending tokens on component mount
  useEffect(() => {
    const fetchTrendingTokens = async () => {
      setLoadingTrending(true);
      try {
        const options = {
          method: 'GET',
          headers: { 
            'accept': 'application/json', 
            'x-cg-pro-api-key': 'CG-qsva2ctaarLBpZ3KDqYmzu6p'
          }
        };
        
        const response = await fetch('https://pro-api.coingecko.com/api/v3/search/trending', options);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        setTrendingTokens(data.coins.slice(0, 6));
      } catch (err) {
        console.error('Failed to fetch trending tokens:', err);
      } finally {
        setLoadingTrending(false);
      }
    };
    
    fetchTrendingTokens();
  }, []);

  const handleTokenSelect = async (token: CoinSearchResult) => {
    setSelectedToken(token);
    navigate(`/crypto-explorer/${token.id}`);
    setIsLoading(true);
    setError(null);
    
    try {
      const options = {
        method: 'GET',
        headers: { 
          'accept': 'application/json', 
          'x-cg-pro-api-key': 'CG-qsva2ctaarLBpZ3KDqYmzu6p'
        }
      };
      
      const response = await fetch(`https://pro-api.coingecko.com/api/v3/coins/${token.id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`, options);
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      
      const details = await response.json();
      setTokenDetails(details);
      
      // Add to search history
      addToSearchHistory(token);
    } catch (err) {
      console.error('Error fetching token details:', err);
      setError('Failed to load token details. Please try again later.');
      setTokenDetails(null);
    } finally {
      setIsLoading(false);
    }
  };

  const addToSearchHistory = (token: CoinSearchResult) => {
    const tokenIndex = searchHistory.findIndex(item => item.id === token.id);
    
    let newHistory: CoinSearchResult[];
    
    if (tokenIndex >= 0) {
      newHistory = [
        token,
        ...searchHistory.slice(0, tokenIndex),
        ...searchHistory.slice(tokenIndex + 1)
      ];
    } else {
      newHistory = [token, ...searchHistory].slice(0, 5);
    }
    
    setSearchHistory(newHistory);
    localStorage.setItem('solana-search-history', JSON.stringify(newHistory));
  };

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
      .then(() => {
        setCopySuccess(address);
        setTimeout(() => setCopySuccess(null), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy address:', err);
      });
  };

  return (
    <div className="space-y-4">
      {showApiTest && <ApiTest />}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Token Explorer */}
        <div className="lg:col-span-2 space-y-4">
          <Card title="Token Explorer" icon={<Coins size={14} />}>
            <div className="mb-4">
              <TokenSearch 
                onSelectToken={handleTokenSelect} 
                placeholder="Search for any token..."
                size="md"
                variant="default"
                maxResults={7}
              />
            </div>

            {isLoading && (
              <div className="py-12 flex flex-col items-center justify-center">
                <RefreshCw size={32} className="text-theme-accent animate-spin mb-3" />
                <p className="text-sm text-theme-text-secondary">Loading token details...</p>
              </div>
            )}
            
            {error && (
              <div className="py-8 flex flex-col items-center justify-center bg-theme-accent/5 rounded-lg border border-theme-accent/20">
                <AlertTriangle size={32} className="text-theme-accent mb-3" />
                <p className="text-sm text-theme-text-primary mb-1">{error}</p>
                <p className="text-xs text-theme-text-secondary">Please try searching for another token</p>
              </div>
            )}
            
            {!isLoading && !error && tokenDetails && (
              <div className="space-y-4">
                {/* Token Header */}
                <div className="bg-theme-bg rounded-lg border border-theme-border p-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center">
                      {tokenDetails.image?.small ? (
                        <img 
                          src={tokenDetails.image.small} 
                          alt={tokenDetails.name} 
                          className="w-10 h-10 rounded-full mr-3"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-theme-accent/20 rounded-full flex items-center justify-center mr-3">
                          <span className="text-theme-accent font-bold">
                            {tokenDetails.symbol?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      
                      <div>
                        <h2 className="text-lg font-bold text-theme-text-primary flex items-center flex-wrap">
                          {tokenDetails.name}
                          {tokenDetails.market_data?.market_cap_rank && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-theme-accent/10 text-theme-accent rounded-full">
                              Rank #{tokenDetails.market_data.market_cap_rank}
                            </span>
                          )}
                        </h2>
                        <div className="flex items-center flex-wrap">
                          <span className="text-sm text-theme-text-secondary mr-3">
                            {tokenDetails.symbol?.toUpperCase()}
                          </span>
                          <div className="flex items-center space-x-2 flex-wrap">
                            {tokenDetails.links?.homepage?.[0] && (
                              <a 
                                href={tokenDetails.links.homepage[0]} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-theme-accent hover:text-theme-accent-dark"
                                title="Visit Website"
                              >
                                <Globe size={14} />
                              </a>
                            )}
                            <a 
                              href={`https://www.coingecko.com/en/coins/${tokenDetails.id}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-theme-accent hover:text-theme-accent-dark"
                              title="View on CoinGecko"
                            >
                              <ExternalLink size={14} />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {tokenDetails.market_data?.current_price?.usd && (
                      <div className="text-right">
                        <div className="text-xl font-bold text-theme-text-primary">
                          {formatCurrency(tokenDetails.market_data.current_price.usd)}
                        </div>
                        {tokenDetails.market_data.price_change_percentage_24h && (
                          <div className={`flex items-center justify-end text-sm ${
                            tokenDetails.market_data.price_change_percentage_24h >= 0 
                              ? 'text-green-500' 
                              : 'text-red-500'
                          }`}>
                            {tokenDetails.market_data.price_change_percentage_24h >= 0 ? (
                              <TrendingUp size={16} className="mr-1" />
                            ) : (
                              <TrendingDown size={16} className="mr-1" />
                            )}
                            {formatPercentage(tokenDetails.market_data.price_change_percentage_24h)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Price Chart */}
                <div className="bg-theme-bg rounded-lg border border-theme-border p-4">
                  <PriceChart
                    tokenId={tokenDetails.id}
                    symbol={tokenDetails.symbol}
                    currentPrice={tokenDetails.market_data?.current_price?.usd}
                    priceChange24h={tokenDetails.market_data?.price_change_percentage_24h}
                    height={300}
                    showControls={true}
                  />
                </div>

                {/* Market Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-theme-bg rounded-lg border border-theme-border p-4">
                    <div className="flex items-center text-sm text-theme-text-secondary mb-2">
                      <BarChart2 size={16} className="mr-2 text-theme-accent" />
                      Market Cap
                    </div>
                    <div className="text-lg font-medium text-theme-text-primary">
                      {tokenDetails.market_data?.market_cap?.usd 
                        ? formatCurrency(tokenDetails.market_data.market_cap.usd, 'USD', true)
                        : 'N/A'
                      }
                    </div>
                  </div>

                  <div className="bg-theme-bg rounded-lg border border-theme-border p-4">
                    <div className="flex items-center text-sm text-theme-text-secondary mb-2">
                      <Zap size={16} className="mr-2 text-theme-accent" />
                      24h Volume
                    </div>
                    <div className="text-lg font-medium text-theme-text-primary">
                      {tokenDetails.market_data?.total_volume?.usd 
                        ? formatCurrency(tokenDetails.market_data.total_volume.usd, 'USD', true)
                        : 'N/A'
                      }
                    </div>
                  </div>

                  <div className="bg-theme-bg rounded-lg border border-theme-border p-4">
                    <div className="flex items-center text-sm text-theme-text-secondary mb-2">
                      <Layers size={16} className="mr-2 text-theme-accent" />
                      Circulating Supply
                    </div>
                    <div className="text-lg font-medium text-theme-text-primary">
                      {tokenDetails.market_data?.circulating_supply 
                        ? formatLargeNumber(tokenDetails.market_data.circulating_supply)
                        : 'N/A'
                      }
                    </div>
                  </div>

                  <div className="bg-theme-bg rounded-lg border border-theme-border p-4">
                    <div className="flex items-center text-sm text-theme-text-secondary mb-2">
                      <Clock size={16} className="mr-2 text-theme-accent" />
                      Last Updated
                    </div>
                    <div className="text-lg font-medium text-theme-text-primary">
                      {new Date(tokenDetails.last_updated).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Additional Analysis Components */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card title="Volume & Volatility">
                    <VolumeVolatility />
                  </Card>
                  
                  <Card title="Social Sentiment">
                    <SocialSentiment />
                  </Card>
                  
                  <Card title="Developer Activity">
                    <DeveloperActivity />
                  </Card>
                  
                  <Card title="News Feed">
                    <NewsFeed />
                  </Card>
                </div>
              </div>
            )}
            
            {!isLoading && !error && !tokenDetails && !selectedToken && (
              <div>
                {/* Recent searches section */}
                {searchHistory.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-theme-text-primary mb-3 flex items-center">
                      <History size={16} className="mr-2 text-theme-accent" />
                      Recent Searches
                    </h3>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                      {searchHistory.map((token) => (
                        <div 
                          key={token.id}
                          className="bg-theme-bg border border-theme-border rounded-lg p-3 hover:bg-theme-accent/5 transition-colors cursor-pointer flex flex-col items-center text-center"
                          onClick={() => handleTokenSelect(token)}
                        >
                          {token.thumb ? (
                            <img src={token.thumb} alt={token.name} className="w-10 h-10 rounded-full mb-2" />
                          ) : (
                            <div className="w-10 h-10 bg-theme-accent/20 rounded-full flex items-center justify-center mb-2">
                              <span className="text-sm font-bold text-theme-accent">
                                {token.symbol.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <h4 className="text-xs font-medium text-theme-text-primary">{token.name}</h4>
                          <span className="text-[10px] text-theme-text-secondary">{token.symbol.toUpperCase()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Empty state with instructions */}
                <div className="py-12 flex flex-col items-center justify-center bg-theme-accent/5 rounded-lg">
                  <Coins size={48} className="text-theme-accent mb-4" />
                  <h3 className="text-lg font-medium text-theme-text-primary mb-2">Explore Tokens</h3>
                  <p className="text-sm text-theme-text-secondary text-center max-w-md mb-4">
                    Search for any token to view detailed information including price, 
                    market stats, contract address, and more.
                  </p>
                  <div className="text-xs text-theme-accent bg-theme-accent/10 px-3 py-1.5 rounded-full">
                    Start by entering a token name or symbol above
                  </div>
                </div>
                
                {/* Trending tokens section */}
                {trendingTokens.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-theme-text-primary mb-3 flex items-center">
                      <Flame size={16} className="mr-2 text-theme-accent" />
                      Trending Tokens
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {trendingTokens.map((trend: any) => (
                        <div 
                          key={trend.item.id}
                          className="bg-theme-bg border border-theme-border rounded-lg p-3 hover:bg-theme-accent/5 transition-colors cursor-pointer"
                          onClick={() => handleTokenSelect({
                            id: trend.item.id,
                            name: trend.item.name,
                            symbol: trend.item.symbol,
                            api_symbol: trend.item.symbol,
                            market_cap_rank: trend.item.market_cap_rank,
                            thumb: trend.item.thumb,
                            large: trend.item.large,
                            platforms: trend.item.platforms || {}
                          })}
                        >
                          <div className="flex items-center">
                            {trend.item.thumb ? (
                              <img src={trend.item.thumb} alt={trend.item.name} className="w-8 h-8 rounded-full mr-3" />
                            ) : (
                              <div className="w-8 h-8 bg-theme-accent/20 rounded-full flex items-center justify-center mr-3">
                                <span className="text-xs font-bold text-theme-accent">
                                  {trend.item.symbol.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            
                            <div>
                              <h4 className="text-sm font-medium text-theme-text-primary">{trend.item.name}</h4>
                              <div className="flex items-center">
                                <span className="text-xs text-theme-text-secondary mr-2">{trend.item.symbol.toUpperCase()}</span>
                                {trend.item.market_cap_rank && (
                                  <span className="text-[10px] bg-theme-accent/10 text-theme-accent px-1.5 py-0.5 rounded-full">
                                    #{trend.item.market_cap_rank}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {trend.item.data?.price_change_percentage_24h?.usd && (
                            <div className={`mt-2 text-xs ${
                              trend.item.data.price_change_percentage_24h.usd >= 0 
                                ? 'text-green-500' 
                                : 'text-red-500'
                            } flex items-center`}>
                              {trend.item.data.price_change_percentage_24h.usd >= 0 ? (
                                <TrendingUp size={12} className="mr-1" />
                              ) : (
                                <TrendingDown size={12} className="mr-1" />
                              )}
                              {formatPercentage(trend.item.data.price_change_percentage_24h.usd)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column - Additional Info */}
        <div className="space-y-4">
          <Card title="Social Feed">
            <TwitterFeed />
          </Card>
          
          <Card title="Market Activity">
            <VolumeVolatility />
          </Card>
          
          <Card title="Developer Updates">
            <DeveloperActivity />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CryptoExplorer;