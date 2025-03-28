export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  link: string;
  published: string;
  category: string;
  subCategory?: string;
  authors?: Array<{ name: string }>;
  source?: string;
}

export const getLatestNews = async (
  page: number = 1,
  limit: number = 10,
  timeframe: '24h' | '7d' | '30d' = '24h'
): Promise<NewsArticle[]> => {
  // Mock data for development
  const mockNews: NewsArticle[] = [
    {
      id: '1',
      title: 'Bitcoin Surges Past $50,000',
      summary: 'Bitcoin has reached a new milestone...',
      link: 'https://example.com/news/1',
      published: new Date().toISOString(),
      category: 'Market',
      authors: [{ name: 'John Doe' }]
    },
    {
      id: '2',
      title: 'Ethereum 2.0 Update Progress',
      summary: 'The Ethereum network upgrade continues...',
      link: 'https://example.com/news/2',
      published: new Date().toISOString(),
      category: 'Technology',
      authors: [{ name: 'Jane Smith' }]
    }
  ];

  // Return mock data for now
  return mockNews;

  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-host': 'crypto-news51.p.rapidapi.com',
      'x-rapidapi-key': '56da9e331emshb1150f72dcd5029p12a375jsnb16e7026a17a'
    }
  };

  try {
    const response = await fetch(`/api/crypto-news/news?page=${page}&limit=${limit}&timeframe=${timeframe}`, options);

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const text = await response.text();
    try {
      const data = JSON.parse(text);
      return data.articles || [];
    } catch (e) {
      console.error('Failed to parse news response:', text);
      return [];
    }
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
};

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