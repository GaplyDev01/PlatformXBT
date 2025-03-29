import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  getCoinsMarketData,
  searchCrypto,
  getGlobalData,
  getTrendingCoins,
  getCoinDetails,
  getHistoricalMarketData,
  getCoinOHLC,
  getCoinMarketChartRange,
  getTopGainersLosers,
  getGlobalMarketChart,
  getExchangeVolumeChart,
  getTokenDeveloperData,
  getTokenRepoStats,
  getTokenStatusUpdates,
  CryptoMarketData,
  TopCoin,
  DeveloperData,
  RepoData,
  StatusUpdate
} from '../services/cryptoApi';

interface GlobalData {
  total_market_cap: Record<string, number>;
  total_volume: Record<string, number>;
  market_cap_percentage: Record<string, number>;
  market_cap_change_percentage_24h_usd: number;
}

interface CryptoContextType {
  marketData: CryptoMarketData[];
  topCoins: CryptoMarketData[];
  topGainers: TopCoin[];
  topLosers: TopCoin[];
  globalData: GlobalData | null;
  selectedToken: string;
  selectedTimeframe: '1h' | '24h' | '7d';
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  searchTokens: (query: string) => Promise<any[]>;
  setSelectedToken: (token: string) => void;
  setSelectedTimeframe: (timeframe: '1h' | '24h' | '7d') => void;
  getTokenDetails: (id: string) => Promise<any>;
  getTokenHistory: (id: string, days: number | 'max', interval?: string) => Promise<any>;
  getTokenOHLC: (id: string, days: 1 | 7 | 14 | 30 | 90 | 180 | 365) => Promise<any>;
  getTokenMarketChartRange: (id: string, from: number, to: number) => Promise<any>;
  getGlobalChartData: (days: string) => Promise<any>;
  getExchangeVolume: (exchangeId: string, days?: number) => Promise<any>;
  getTrending: () => Promise<any>;
  getTokenDeveloperData: (id: string) => Promise<DeveloperData>;
  getTokenRepoStats: (id: string) => Promise<RepoData[]>;
  getTokenStatusUpdates: (id: string, page?: number, per_page?: number) => Promise<StatusUpdate[]>;
}

const CryptoContext = createContext<CryptoContextType | undefined>(undefined);

export const useCrypto = () => {
  const context = useContext(CryptoContext);
  if (context === undefined) {
    throw new Error('useCrypto must be used within a CryptoProvider');
  }
  return context;
};

interface CryptoProviderProps {
  children: ReactNode;
}

export const CryptoProvider: React.FC<CryptoProviderProps> = ({ children }) => {
  const [marketData, setMarketData] = useState<CryptoMarketData[]>([]);
  const [topCoins, setTopCoins] = useState<CryptoMarketData[]>([]);
  const [topGainers, setTopGainers] = useState<TopCoin[]>([]);
  const [topLosers, setTopLosers] = useState<TopCoin[]>([]);
  const [globalData, setGlobalData] = useState<GlobalData | null>(null);
  const [selectedToken, setSelectedToken] = useState<string>('bitcoin');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '24h' | '7d'>('24h');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    let retryCount = 0;
    const maxRetries = 3;
    
    try {
      while (retryCount < maxRetries) {
        try {
          // Fetch all data in parallel
          const [coinsData, topCoinsData, globalMarketData, topMoversData] = await Promise.all([
            getCoinsMarketData('usd', [selectedToken], 'market_cap_desc', 1),
            getCoinsMarketData('usd', undefined, 'market_cap_desc', 100),
            getGlobalData(),
            getTopGainersLosers('usd', selectedTimeframe, 10)
          ]);
          
          setMarketData(coinsData);
          setTopCoins(topCoinsData);
          setGlobalData(globalMarketData);
          setTopGainers(topMoversData.gainers);
          setTopLosers(topMoversData.losers);
          break;
        } catch (err) {
          retryCount++;
          if (retryCount === maxRetries) {
            throw err;
          }
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
        }
      }
      
    } catch (err) {
      console.error('Error fetching crypto data:', err);
      setError('Failed to fetch crypto market data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Search for tokens
  const searchTokens = async (query: string) => {
    if (!query || query.length < 2) return [];
    
    try {
      const results = await searchCrypto(query);
      return results.coins || [];
    } catch (error) {
      console.error('Error searching tokens:', error);
      return [];
    }
  };

  // Get token details
  const getTokenDetails = async (id: string) => {
    try {
      return await getCoinDetails(id);
    } catch (error) {
      console.error('Error fetching token details:', error);
      throw error;
    }
  };

  // Get token history
  const getTokenHistory = async (id: string, days: number | 'max', interval?: string) => {
    try {
      return await getHistoricalMarketData(id, days, interval);
    } catch (error) {
      console.error('Error fetching token history:', error);
      throw error;
    }
  };

  // Get token OHLC data
  const getTokenOHLC = async (id: string, days: 1 | 7 | 14 | 30 | 90 | 180 | 365 = 14) => {
    try {
      return await getCoinOHLC(id, days);
    } catch (error) {
      console.error('Error fetching token OHLC data:', error);
      throw error;
    }
  };

  // Get token market chart with date range
  const getTokenMarketChartRange = async (id: string, from: number, to: number) => {
    try {
      return await getCoinMarketChartRange(id, 'usd', from, to);
    } catch (error) {
      console.error('Error fetching token market chart range:', error);
      throw error;
    }
  };

  // Get global chart data
  const getGlobalChartData = async (days: string = '30') => {
    try {
      return await getGlobalMarketChart(days);
    } catch (error) {
      console.error('Error fetching global market chart data:', error);
      throw error;
    }
  };

  // Get exchange volume data
  const getExchangeVolume = async (exchangeId: string, days: number = 30) => {
    try {
      return await getExchangeVolumeChart(exchangeId, days);
    } catch (error) {
      console.error('Error fetching exchange volume chart data:', error);
      throw error;
    }
  };

  // Get trending coins
  const getTrending = async () => {
    try {
      return await getTrendingCoins();
    } catch (error) {
      console.error('Error fetching trending coins:', error);
      throw error;
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [selectedToken, selectedTimeframe]);

  // Refresh data periodically
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchData();
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [selectedToken, selectedTimeframe]);

  const refreshData = async () => {
    await fetchData();
  };

  return (
    <CryptoContext.Provider value={{
      marketData,
      topCoins,
      topGainers,
      topLosers,
      globalData,
      selectedToken,
      selectedTimeframe,
      isLoading,
      error,
      refreshData,
      searchTokens,
      setSelectedToken,
      setSelectedTimeframe,
      getTokenDetails,
      getTokenHistory,
      getTokenOHLC,
      getTokenMarketChartRange,
      getGlobalChartData,
      getExchangeVolume,
      getTrending,
      getTokenDeveloperData,
      getTokenRepoStats,
      getTokenStatusUpdates
    }}>
      {children}
    </CryptoContext.Provider>
  );
};