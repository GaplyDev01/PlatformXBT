import { z } from 'zod';
import axios from 'axios';
import axiosRetry from 'axios-retry';

export interface NewsArticle {
  title: string;
  url: string;
  description: string;
  source: string;
  published_at: string;
  thumbnail?: string;
  categories?: string[];
  sentiment?: 'positive' | 'negative' | 'neutral';
}

// Zod schema for validating news response
const NewsArticleSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  description: z.string(),
  source: z.string(),
  published_at: z.string(),
  thumbnail: z.string().url().optional(),
  categories: z.array(z.string()).optional(),
  sentiment: z.enum(['positive', 'negative', 'neutral']).optional()
});

// Configure axios with retry logic
const api = axios.create({
  baseURL: 'https://min-api.cryptocompare.com/data',
  timeout: 10000
});

// Apply retry logic
axiosRetry(api, { 
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
           error.response?.status === 429 || // Rate limit
           error.response?.status === 500;  // Server error
  }
});

// Detect sentiment based on title (very simple approach)
const detectSentiment = (title: string): 'positive' | 'negative' | 'neutral' => {
  const lowerTitle = title.toLowerCase();
  const positiveWords = ['surge', 'gain', 'rally', 'rise', 'soar', 'bull', 'positive', 'growth', 'up', 'high', 'boost'];
  const negativeWords = ['crash', 'drop', 'fall', 'plunge', 'bearish', 'negative', 'decline', 'down', 'low', 'tumble'];
  
  for (const word of positiveWords) {
    if (lowerTitle.includes(word)) return 'positive';
  }
  
  for (const word of negativeWords) {
    if (lowerTitle.includes(word)) return 'negative';
  }
  
  return 'neutral';
};

/**
 * Get recent news related to a specific cryptocurrency
 * @param tokenId The coin ID to fetch news for (e.g., 'bitcoin', 'ethereum')
 * @param limit The number of news articles to return
 * @returns A collection of relevant news articles
 */
export const getTokenNews = async (tokenId: string, limit: number = 5): Promise<NewsArticle[]> => {
  try {
    console.log(`Fetching news for ${tokenId}`);
    
    // Convert tokenId to symbol format for CryptoCompare
    let symbol = tokenId.toUpperCase();
    if (tokenId === 'bitcoin') symbol = 'BTC';
    if (tokenId === 'ethereum') symbol = 'ETH';
    if (tokenId === 'solana') symbol = 'SOL';
    if (tokenId === 'binancecoin') symbol = 'BNB';
    if (tokenId === 'ripple') symbol = 'XRP';
    
    // Get news from CryptoCompare
    const response = await api.get('/v2/news/', {
      params: {
        categories: symbol, // Can use categories like BTC, ETH, XRP etc.
        sortOrder: 'popular',
        lang: 'EN',
        excludeCategories: 'Sponsored'
      }
    });
    
    if (response.data.Data && Array.isArray(response.data.Data)) {
      const articles = response.data.Data
        .slice(0, limit)
        .map((article: any) => ({
          title: article.title,
          url: article.url,
          description: article.body.length > 200 ? 
                      article.body.substring(0, 197) + '...' : 
                      article.body,
          source: article.source,
          published_at: new Date(article.published_on * 1000).toISOString(),
          thumbnail: article.imageurl,
          categories: article.categories.split('|'),
          sentiment: detectSentiment(article.title)
        }));
      
      return z.array(NewsArticleSchema).parse(articles);
    }
    
    throw new Error('Invalid response from CryptoCompare API');
    
  } catch (error) {
    console.error('Error fetching news:', error);
    
    // Return empty array on error
    return [];
  }
};

// Alias for backward compatibility
export const getLatestNews = getTokenNews;

export const getNewsForToken = async (
  symbol: string,
  page: number = 1,
  limit: number = 10
): Promise<NewsArticle[]> => {
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-host': 'crypto-news51.p.rapidapi.com',
      'x-rapidapi-key': '56da9e331emshb1150f72dcd5029p12a375jsnb16e7026a17a'
    }
  };

  const response = await fetch(`/api/crypto-news/news/token/${symbol}?page=${page}&limit=${limit}`, options);

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`);
  }

  const data = await response.json();
  return data.articles;
};