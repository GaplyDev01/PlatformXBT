import { z } from 'zod';
import axios from 'axios';
import axiosRetry from 'axios-retry';

export interface Tweet {
  id: string;
  text: string;
  created_at: string;
  username: string;
  name: string;
  profile_image_url: string;
  verified: boolean;
  metrics: {
    likes: number;
    retweets: number;
    replies: number;
  };
  entities?: {
    hashtags?: string[];
    urls?: {
      display_url: string;
      expanded_url: string;
      url: string;
    }[];
    mentions?: string[];
  };
}

export interface TwitterResponse {
  tweets: Tweet[];
  error?: string;
}

// Zod schema for validating Twitter response
const TweetMetricsSchema = z.object({
  likes: z.number().default(0),
  retweets: z.number().default(0),
  replies: z.number().default(0)
});

const TweetEntityUrlSchema = z.object({
  display_url: z.string().optional(),
  expanded_url: z.string().optional(),
  url: z.string().optional()
});

const TweetEntitiesSchema = z.object({
  hashtags: z.array(z.string()).optional(),
  urls: z.array(TweetEntityUrlSchema).optional(),
  mentions: z.array(z.string()).optional()
});

const TweetSchema = z.object({
  id: z.string(),
  text: z.string(),
  created_at: z.string(),
  username: z.string(),
  name: z.string(),
  profile_image_url: z.string().default('https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png'),
  verified: z.boolean().default(false),
  metrics: TweetMetricsSchema,
  entities: TweetEntitiesSchema.optional()
});

const TwitterResponseSchema = z.object({
  tweets: z.array(TweetSchema),
  error: z.string().optional()
});

// Configure axios for RapidAPI
const api = axios.create({
  baseURL: 'https://twitter-api45.p.rapidapi.com',
  timeout: 10000,
  headers: {
    'X-RapidAPI-Key': '56da9e331emshb1150f72dcd5029p12a375jsnb16e7026a17a',
    'X-RapidAPI-Host': 'twitter-api45.p.rapidapi.com'
  }
});

// Apply retry logic
axiosRetry(api, { 
  retries: 2,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
           error.response?.status === 429 || // Rate limit
           error.response?.status === 500;  // Server error
  }
});

/**
 * Get recent tweets related to a specific cryptocurrency
 * @param tokenId The coin ID to fetch tweets for (e.g., 'bitcoin', 'ethereum')
 * @returns A collection of relevant tweets
 */
export const getTokenTweets = async (tokenId: string): Promise<TwitterResponse> => {
  try {
    console.log(`Fetching tweets for ${tokenId}`);
    
    const response = await api.get('/search.php', {
      params: {
        query: tokenId,
        search_type: 'Top'
      }
    });
    
    if (response.data.status === 'Success' && response.data.results) {
      // Transform the RapidAPI response to match our expected format
      const tweets: Tweet[] = response.data.results.map((result: any) => ({
        id: result.tweet_id,
        text: result.tweet_text,
        created_at: result.created_at,
        username: result.username,
        name: result.name,
        profile_image_url: result.profile_image_url,
        verified: result.verified,
        metrics: {
          likes: parseInt(result.like_count || '0'),
          retweets: parseInt(result.retweet_count || '0'),
          replies: parseInt(result.reply_count || '0')
        },
        entities: {
          // Extract hashtags from tweet text if available
          hashtags: result.tweet_text.match(/#(\w+)/g) || [],
          // Extract URLs if available
          urls: result.tweet_text.includes('https://') ? 
            result.tweet_text.match(/https:\/\/t\.co\/\w+/g)?.map((url: string) => ({
              url,
              display_url: url,
              expanded_url: url
            })) : []
        }
      }));
      
      return TwitterResponseSchema.parse({ tweets });
    }
    
    throw new Error('Invalid response format from Twitter API');
    
  } catch (error) {
    console.error('Error fetching Twitter data:', error);
    
    // Return an empty response with error
    return { 
      tweets: [], 
      error: error instanceof Error ? error.message : 'Failed to fetch Twitter data' 
    };
  }
};

export interface SentimentResponse {
  sentiment: {
    score: number;
    label: 'positive' | 'negative' | 'neutral';
    magnitude: number;
  };
  tweets: Tweet[];
  volume24h: number;
}

// Updated interface to match the actual API response from twitter-api45
export interface TwitterSearchResponse {
  status: string;
  timeline: Tweet[];
  next_cursor?: string;
  prev_cursor?: string;
}

export interface TwitterSearchParams {
  query: string;
  search_type?: 'Top' | 'Latest' | 'Images' | 'Videos';
}

export const getMarketSentiment = async (symbol: string): Promise<SentimentResponse> => {
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-host': 'twitter-x-api.p.rapidapi.com',
      'x-rapidapi-key': '56da9e331emshb1150f72dcd5029p12a375jsnb16e7026a17a'
    }
  };

  const response = await fetch(`/api/twitter/sentiment/${symbol}`, options);

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`);
  }

  return await response.json();
};

/**
 * Searches Twitter using the RapidAPI endpoint
 */
export const searchTwitter = async (query: string): Promise<TwitterSearchResponse> => {
  try {
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'twitter-api45.p.rapidapi.com',
        'x-rapidapi-key': '56da9e331emshb1150f72dcd5029p12a375jsnb16e7026a17a'
      }
    };

    const response = await fetch(
      `https://twitter-api45.p.rapidapi.com/search.php?query=${encodeURIComponent(query)}&search_type=Top`,
      options
    );

    if (!response.ok) {
      throw new Error(`Twitter API returned ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching Twitter:', error);
    throw error;
  }
};

/**
 * Searches Twitter for tweets related to a specific token
 */
export const searchTokenOnTwitter = async (
  symbol: string,
  name: string,
  contractAddress?: string
): Promise<TwitterSearchResponse> => {
  try {
    // Construct search query based on token information
    const searchQuery = `${symbol} ${name} crypto`;
    
    // Call the Twitter search API
    return await searchTwitter(searchQuery);
  } catch (error) {
    console.error('Error searching Twitter for token:', error);
    throw error;
  }
};