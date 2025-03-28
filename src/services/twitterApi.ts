export interface Tweet {
  id: string;
  text: string;
  created_at: string;
  public_metrics?: {
    like_count: number;
    retweet_count: number;
    quote_count: number;
  };
}

export interface SentimentResponse {
  sentiment: {
    score: number;
    label: 'positive' | 'negative' | 'neutral';
    magnitude: number;
  };
  tweets: Tweet[];
  volume24h: number;
}

export interface TwitterSearchResponse {
  cursor: string;
  users: Array<{
    result: {
      legacy: {
        screen_name: string;
        name: string;
        profile_image_url_https: string;
      };
      is_blue_verified: boolean;
    };
  }>;
}

export interface TwitterSearchParams {
  keyword: string;
  count?: number;
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

export const searchTwitter = async (params: TwitterSearchParams): Promise<TwitterSearchResponse> => {
  const queryParams = new URLSearchParams({
    keyword: params.keyword,
    count: (params.count || 20).toString()
  });

  const response = await fetch(
    `https://twitter-x-api.p.rapidapi.com/api/search/latest?${queryParams}`,
    {
      headers: {
        'x-rapidapi-host': 'twitter-x-api.p.rapidapi.com',
        'x-rapidapi-key': '56da9e331emshb1150f72dcd5029p12a375jsnb16e7026a17a'
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Twitter API returned ${response.status}`);
  }

  return await response.json();
};

export const searchTokenOnTwitter = async (
  symbol: string,
  name: string,
  contractAddress?: string
): Promise<TwitterSearchResponse> => {
  const searchTerms = [
    `$${symbol}`,
    name,
    contractAddress ? `contract:${contractAddress}` : ''
  ].filter(Boolean);

  const searchQuery = searchTerms.join(' OR ');

  return searchTwitter({
    keyword: searchQuery,
    count: 20
  });
};