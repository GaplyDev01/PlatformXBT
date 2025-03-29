import { z } from 'zod';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import PQueue from 'p-queue';
import pRetry from 'p-retry';

export interface CoinSearchResult {
  id: string;
  name: string;
  symbol: string;
  api_symbol: string;
  market_cap_rank?: number;
  thumb?: string;
  large?: string;
  platforms: Record<string, string>;
}

export interface CryptoMarketData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_24h: number;
  market_cap_change_percentage_24h: number;
}

export interface TopCoin extends CryptoMarketData {
  image: string;
  price_change_percentage: number;
}

export interface DeveloperData {
  forks: number;
  stars: number;
  subscribers: number;
  total_issues: number;
  closed_issues: number;
  pull_requests_merged: number;
  pull_request_contributors: number;
  code_additions_deletions_4_weeks: {
    additions: number;
    deletions: number;
  };
  commit_count_4_weeks: number;
  last_4_weeks_commit_activity_series: number[];
}

export interface RepoData {
  name: string;
  url: string;
  stars: number;
  forks: number;
  organization?: string;
}

export interface StatusUpdate {
  description: string;
  category: string;
  created_at: string;
  user: string;
  user_title?: string;
  pin: boolean;
  project: {
    type: string;
    id: string;
    name: string;
  };
}

export class CryptoAPIError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'CryptoAPIError';
  }
}

// Configure axios with retry logic
const api = axios.create({
  baseURL: '/api/coingecko',
  timeout: 10000,
  headers: {
    'x-cg-pro-api-key': import.meta.env.VITE_COINGECKO_API_KEY || 'CG-gTgiBRydF4PqMfgYZ4Wr6fxB'
  }
});

axiosRetry(api, { 
  retries: 5,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
           error.response?.status === 429 || // Rate limit
           error.response?.status === 500 ||  // Server error
           error.response?.status === 401 ||  // Unauthorized
           error.response?.status === 500 || // Server error
           error.response?.status === 502 || // Bad gateway
           error.response?.status === 503 || // Service unavailable
           error.response?.status === 504;   // Gateway timeout
  }
});

// Rate limiting queue
const queue = new PQueue({
  concurrency: 1,
  interval: 2000,
  intervalCap: 5
});

// Base API call function with error handling and retries
const fetchCoinGecko = async (endpoint: string, params: Record<string, string> = {}) => {
  return queue.add(() => 
    pRetry(
      async () => {
        try {
          const response = await api.get(endpoint, { params });
          return response.data;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            if (error.response?.status === 429) {
              throw new Error('Rate limit exceeded. Please try again later.');
            }
            throw new Error(`API Error: ${error.response?.status} - ${error.response?.statusText}`);
          }
          throw error;
        }
      },
      {
        retries: 3,
        onFailedAttempt: error => {
          console.warn(
            `CoinGecko API attempt ${error.attemptNumber} failed. ${error.retriesLeft} retries left.`
          );
        }
      }
    )
  );
};

// Mock data for fallback
const mockMarketData: CryptoMarketData[] = [
  {
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    current_price: 45000,
    market_cap: 850000000000,
    market_cap_rank: 1,
    total_volume: 28000000000,
    price_change_percentage_24h: 2.5,
    market_cap_change_percentage_24h: 2.3
  },
];

const mockGlobalData = {
  total_market_cap: { usd: 2100000000000 },
  total_volume: { usd: 98000000000 },
  market_cap_percentage: { btc: 45, eth: 18 },
  market_cap_change_percentage_24h_usd: 1.8
};

export const getCoinsMarketData = async (
  currency: string = 'usd',
  ids?: string[],
  order: string = 'market_cap_desc',
  limit: number = 100,
  category?: string
): Promise<CryptoMarketData[]> => {
  try {
    const params: Record<string, string> = {
      vs_currency: currency,
      order,
      per_page: limit.toString(),
      sparkline: 'false'
    };
    
    if (ids?.length) {
      params.ids = ids.join(',');
    }

    if (category) {
      params.category = category;
    }
    
    const data = await fetchCoinGecko('/coins/markets', params);
    return data || [];
  } catch (error) {
    console.error('Error fetching market data:', error);
    return [];
  }
};

export const searchCrypto = async (query: string): Promise<{ coins: CoinSearchResult[] }> => {
  try {
    return await fetchCoinGecko('/search', { query });
  } catch (error) {
    console.error('Error searching crypto:', error);
    return {
      coins: [{
        id: 'bitcoin',
        name: 'Bitcoin',
        symbol: 'btc',
        api_symbol: 'btc',
        market_cap_rank: 1,
        thumb: 'https://example.com/btc.png',
        large: 'https://example.com/btc-large.png',
        platforms: {}
      }]
    };
  }
};

export const getGlobalData = async () => {
  try {
    return await fetchCoinGecko('/global');
  } catch (error) {
    console.error('Error fetching global data:', error);
    return mockGlobalData;
  }
};

export const getTrendingCoins = async () => {
  try {
    return await fetchCoinGecko('/search/trending');
  } catch (error) {
    console.error('Error fetching trending coins:', error);
    return { coins: mockMarketData.slice(0, 3) };
  }
};

export const getCoinDetails = async (id: string) => {
  try {
    const params = {
      localization: 'false',
      tickers: 'true',
      market_data: 'true',
      community_data: 'true',
      developer_data: 'true',
      sparkline: 'true'
    };
    
    return await fetchCoinGecko(`/coins/${id}`, params);
  } catch (error) {
    console.error('Error fetching coin details:', error);
    throw error;
  }
};

export const getHistoricalMarketData = async (id: string, days: number | 'max', interval?: string) => {
  try {
    const params: Record<string, string> = {
      vs_currency: 'usd',
      days: days.toString()
    };
    if (interval) {
      params.interval = interval;
    }
    return await fetchCoinGecko(`/coins/${id}/market_chart`, params);
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return {
      prices: Array.from({ length: 100 }, (_, i) => [
        Date.now() - i * 86400000,
        40000 + Math.random() * 10000
      ])
    };
  }
};

export const getCoinOHLC = async (id: string, days: number) => {
  try {
    return await fetchCoinGecko(`/coins/${id}/ohlc`, {
      vs_currency: 'usd',
      days: days.toString()
    });
  } catch (error) {
    console.error('Error fetching OHLC data:', error);
    return Array.from({ length: days }, (_, i) => [
      Date.now() - i * 86400000,
      45000 + Math.random() * 1000,
      46000 + Math.random() * 1000,
      44000 + Math.random() * 1000,
      45500 + Math.random() * 1000
    ]);
  }
};

export const getCoinMarketChartRange = async (
  id: string,
  currency: string,
  from: number,
  to: number
) => {
  try {
    return await fetchCoinGecko(`/coins/${id}/market_chart/range`, {
      vs_currency: currency,
      from: from.toString(),
      to: to.toString()
    });
  } catch (error) {
    console.error('Error fetching market chart range:', error);
    return {
      prices: Array.from({ length: 100 }, (_, i) => [
        from + (i * ((to - from) / 100)),
        40000 + Math.random() * 10000
      ])
    };
  }
};

export const getTopGainersLosers = async (
  currency: string = 'usd',
  timeframe: string = '24h',
  limit: number = 10
) => {
  try {
    return await fetchCoinGecko('/coins/top_gainers_losers', {
      vs_currency: currency,
      duration: timeframe,
      top: limit.toString()
    });
  } catch (error) {
    console.error('Error fetching top gainers/losers:', error);
    const mockData = {
      gainers: Array.from({ length: limit }, (_, i) => ({
        ...mockMarketData[0],
        price_change_percentage: 5 + Math.random() * 20
      })),
      losers: Array.from({ length: limit }, (_, i) => ({
        ...mockMarketData[0],
        price_change_percentage: -5 - Math.random() * 20
      }))
    };
    return mockData;
  }
};

export const getGlobalMarketChart = async (days: string = '30') => {
  try {
    return await fetchCoinGecko('/global/market_cap_chart', { days });
  } catch (error) {
    console.error('Error fetching global market chart:', error);
    return {
      market_caps: Array.from({ length: parseInt(days) }, (_, i) => [
        Date.now() - i * 86400000,
        2000000000000 + Math.random() * 200000000000
      ])
    };
  }
};

export const getExchangeVolumeChart = async (exchangeId: string, days: number = 30) => {
  try {
    return await fetchCoinGecko(`/exchanges/${exchangeId}/volume_chart`, {
      days: days.toString()
    });
  } catch (error) {
    console.error('Error fetching exchange volume chart:', error);
    return Array.from({ length: days }, (_, i) => [
      Date.now() - i * 86400000,
      10000000000 + Math.random() * 5000000000
    ]);
  }
};

export const getTokenDeveloperData = async (id: string): Promise<DeveloperData> => {
  try {
    const response = await fetchCoinGecko(`/coins/${id}/developer_data`);
    return response;
  } catch (error) {
    console.error('Error fetching developer data:', error);
    return {
      forks: 0,
      stars: 0,
      subscribers: 0,
      total_issues: 0,
      closed_issues: 0,
      pull_requests_merged: 0,
      pull_request_contributors: 0,
      code_additions_deletions_4_weeks: {
        additions: 0,
        deletions: 0
      },
      commit_count_4_weeks: 0,
      last_4_weeks_commit_activity_series: []
    };
  }
};

export const getTokenRepoStats = async (id: string): Promise<RepoData[]> => {
  try {
    return await fetchCoinGecko(`/coins/${id}/repositories`);
  } catch (error) {
    console.error('Error fetching repository stats:', error);
    throw error;
  }
};

export const getTokenStatusUpdates = async (
  id: string,
  page: number = 1,
  per_page: number = 10
): Promise<StatusUpdate[]> => {
  try {
    const response = await fetchCoinGecko(`/coins/${id}/status_updates`, {
      page: page.toString(),
      per_page: per_page.toString()
    });
    return response.status_updates;
  } catch (error) {
    console.error('Error fetching status updates:', error);
    throw error;
  }
};