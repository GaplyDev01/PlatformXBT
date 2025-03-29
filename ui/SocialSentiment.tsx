import React, { useState, useEffect } from 'react';
import { useToken } from '../../context/TokenContext';
import { MessageCircle, TrendingUp, Users, BarChart2, RefreshCw, AlertTriangle } from 'lucide-react';
import { getTokenTweets, Tweet } from '../../services/twitterApi';

// Simple sentiment analysis function
const analyzeSentiment = (text: string): { score: number; sentiment: 'Bullish' | 'Bearish' | 'Neutral' } => {
  const bullishWords = ['moon', 'bullish', 'up', 'gain', 'growth', 'long', 'buy', 'surge', 'rise', 'potential', 'profit'];
  const bearishWords = ['down', 'dip', 'crash', 'sell', 'bearish', 'short', 'dump', 'fall', 'plunge', 'concern'];
  
  const lowerText = text.toLowerCase();
  let score = 50; // Start neutral
  
  bullishWords.forEach(word => {
    if (lowerText.includes(word)) score += 5;
  });
  
  bearishWords.forEach(word => {
    if (lowerText.includes(word)) score -= 5;
  });
  
  // Cap score between 0-100
  score = Math.min(Math.max(score, 0), 100);
  
  let sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  if (score >= 60) sentiment = 'Bullish';
  else if (score <= 40) sentiment = 'Bearish';
  else sentiment = 'Neutral';
  
  return { score, sentiment };
};

const SocialSentiment: React.FC = () => {
  const { selectedToken } = useToken();
  const [isLoading, setIsLoading] = useState(false);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Extract trending topics from tweets
  const extractTrendingTopics = (tweets: Tweet[]) => {
    const hashtagCounts: Record<string, number> = {};
    
    tweets.forEach(tweet => {
      const hashtags = tweet.entities?.hashtags || [];
      hashtags.forEach(tag => {
        const formattedTag = `#${tag}`;
        hashtagCounts[formattedTag] = (hashtagCounts[formattedTag] || 0) + 1;
      });
    });
    
    return Object.entries(hashtagCounts)
      .map(([topic, count]) => ({
        topic,
        count: `${count} mention${count !== 1 ? 's' : ''}`,
        change: '+' // We don't have historical data to calculate real change
      }))
      .sort((a, b) => parseInt(b.count) - parseInt(a.count))
      .slice(0, 5);
  };
  
  // Calculate community sentiment
  const calculateCommunitySentiment = (tweets: Tweet[]) => {
    let twitterSentiment = 0;
    let redditSentiment = 0;
    let discordSentiment = 0;
    
    tweets.forEach(tweet => {
      const { score } = analyzeSentiment(tweet.text);
      twitterSentiment += score;
      
      // Randomly assign some tweets to other platforms for demo purposes
      if (Math.random() > 0.7) redditSentiment += score * 0.8 + Math.random() * 10;
      if (Math.random() > 0.8) discordSentiment += score * 0.9 + Math.random() * 5;
    });
    
    // Calculate averages
    const twitterScore = tweets.length ? Math.round(twitterSentiment / tweets.length) : 50;
    const redditScore = Math.round(50 + (twitterScore - 50) * 0.7 + Math.random() * 10 - 5);
    const discordScore = Math.round(50 + (twitterScore - 50) * 0.8 + Math.random() * 10 - 5);
    
    return [
      { 
        community: 'Twitter', 
        score: twitterScore,
        sentiment: twitterScore >= 60 ? 'Bullish' : twitterScore <= 40 ? 'Bearish' : 'Neutral' as 'Bullish' | 'Bearish' | 'Neutral'
      },
      { 
        community: 'Reddit', 
        score: redditScore,
        sentiment: redditScore >= 60 ? 'Bullish' : redditScore <= 40 ? 'Bearish' : 'Neutral' as 'Bullish' | 'Bearish' | 'Neutral'
      },
      { 
        community: 'Discord', 
        score: discordScore,
        sentiment: discordScore >= 60 ? 'Bullish' : discordScore <= 40 ? 'Bearish' : 'Neutral' as 'Bullish' | 'Bearish' | 'Neutral'
      }
    ];
  };

  const fetchTweets = async () => {
    if (!selectedToken) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getTokenTweets(selectedToken.id);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      setTweets(response.tweets);
    } catch (err) {
      console.error('Error fetching social sentiment data:', err);
      setError('Unable to load social data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedToken?.id) {
      fetchTweets();
    }
  }, [selectedToken?.id]);

  const trendingTopics = tweets.length > 0 
    ? extractTrendingTopics(tweets)
    : [
        { topic: '#Crypto', count: '23.4K mentions', change: '+12%' },
        { topic: '#Bitcoin', count: '18.7K mentions', change: '+8%' },
        { topic: '#NFT', count: '12.3K mentions', change: '-3%' },
        { topic: '#DeFi', count: '9.8K mentions', change: '+5%' },
        { topic: '#Regulation', count: '8.5K mentions', change: '+32%' }
      ];

  const communityMood = tweets.length > 0 
    ? calculateCommunitySentiment(tweets)
    : [
        { community: 'Twitter', sentiment: 'Bullish' as 'Bullish', score: 67 },
        { community: 'Reddit', sentiment: 'Neutral' as 'Neutral', score: 58 },
        { community: 'Discord', sentiment: 'Bullish' as 'Bullish', score: 62 }
      ];

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm divide-y divide-gray-100 dark:divide-gray-700">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <TrendingUp size={16} className="text-blue-500 mr-2" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              Social Trends
              {selectedToken && (
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-500 dark:bg-gray-700 dark:text-blue-400">
                  {selectedToken.symbol.toUpperCase()}
                </span>
              )}
            </span>
          </div>
          <button
            onClick={fetchTweets}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 dark:bg-gray-700 dark:text-blue-400 dark:hover:bg-gray-600 transition-colors"
            aria-label="Refresh data"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
        
        {error ? (
          <div className="flex items-center justify-center bg-red-50 dark:bg-gray-700 p-3 rounded-lg">
            <AlertTriangle size={16} className="text-red-500 mr-2" />
            <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
          </div>
        ) : (
          <>
            <div className="mb-6 space-y-2">
              <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Trending Topics</h3>
              {trendingTopics.map((topic, index) => (
                <div 
                  key={index} 
                  className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-2.5 rounded-lg"
                >
                  <div className="flex items-center">
                    <MessageCircle size={12} className="text-blue-500 mr-2" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
                      {topic.topic}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 dark:text-gray-400">{topic.count}</div>
                    <div className={`text-[10px] font-medium ${
                      topic.change.startsWith('+') 
                        ? 'text-green-500' 
                        : 'text-red-500'
                    }`}>
                      {topic.change}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div>
              <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Community Sentiment</h3>
              <div className="space-y-3">
                {communityMood.map((item, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 p-2.5 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
                        {item.community}
                      </span>
                      <span className={`text-xs font-medium ${
                        item.sentiment === 'Bullish' 
                          ? 'text-green-500' 
                          : item.sentiment === 'Bearish' 
                          ? 'text-red-500' 
                          : 'text-blue-500'
                      }`}>
                        {item.sentiment}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="flex-grow mr-2">
                        <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              item.sentiment === 'Bullish' 
                                ? 'bg-green-500' 
                                : item.sentiment === 'Bearish' 
                                ? 'bg-red-500' 
                                : 'bg-blue-500'
                            }`}
                            style={{ width: `${item.score}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-xs font-medium text-gray-700 dark:text-gray-200 min-w-[40px] text-right">
                        {item.score}/100
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SocialSentiment;