import React, { useState, useEffect, useMemo } from 'react';
import { ExternalLink, Clock, RefreshCw, AlertTriangle, Tag, ThumbsUp, ThumbsDown, Zap } from 'lucide-react';
import { getTokenNews, NewsArticle } from '../../services/newsApi';
import { useToken } from '../../context/TokenContext';

const NewsFeed: React.FC = () => {
  const { selectedToken } = useToken();
  const [newsItems, setNewsItems] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = async () => {
    setIsLoading(true);
    setError(null);
    let retryCount = 0;
    const maxRetries = 3;

    try {
      while (retryCount < maxRetries) {
        try {
          // Use the tokenId from selectedToken, or a default like 'bitcoin'
          const tokenId = selectedToken?.id || 'bitcoin';
          const articles = await getTokenNews(tokenId, 10);
          setNewsItems(articles);
          break;
        } catch (err) {
          retryCount++;
          if (retryCount === maxRetries) {
            throw err;
          }
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
    } catch (err) {
      setError('Failed to fetch news. Please try again later.');
      console.error('Error fetching news:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [selectedToken?.id]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };
  
  // Create a title based on the selected token
  const feedTitle = useMemo(() => {
    if (selectedToken) {
      return `${selectedToken.name} News`;
    }
    return 'Crypto News';
  }, [selectedToken]);

  // Get sentiment icon based on the sentiment value
  const getSentimentIcon = (sentiment?: 'positive' | 'negative' | 'neutral') => {
    switch (sentiment) {
      case 'positive':
        return <ThumbsUp size={12} className="text-green-500" />;
      case 'negative':
        return <ThumbsDown size={12} className="text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center">
          <Zap size={16} className="text-blue-500 mr-2" />
          <span className="text-sm font-semibold text-gray-900 dark:text-white">{feedTitle}</span>
        </div>
        <button
          className="p-1.5 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 dark:bg-gray-700 dark:text-blue-400 dark:hover:bg-gray-600 transition-colors"
          onClick={fetchNews}
          disabled={isLoading}
          aria-label="Refresh news"
        >
          <RefreshCw size={14} className={`${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse flex space-x-2">
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <AlertTriangle size={24} className="text-amber-500 mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{error}</p>
            <button
              onClick={fetchNews}
              className="px-4 py-2 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {newsItems.length > 0 ? (
              newsItems.map((item, index) => (
                <div key={index} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white leading-snug">
                      {item.title}
                    </h4>
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="ml-2 p-1 text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400"
                      aria-label="Open article in new tab"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                  
                  <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {item.thumbnail && (
                        <img 
                          src={item.thumbnail} 
                          alt={item.source} 
                          className="w-6 h-6 rounded-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                      )}
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {item.source}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getSentimentIcon(item.sentiment)}
                      <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <Clock size={10} className="mr-1" />
                        {formatTimeAgo(item.published_at)}
                      </span>
                    </div>
                  </div>
                  
                  {item.categories && item.categories.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {item.categories.slice(0, 3).map((category, i) => (
                        <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-500 dark:bg-gray-700 dark:text-blue-400">
                          {category}
                        </span>
                      ))}
                      {item.categories.length > 3 && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                          +{item.categories.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-40 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">No news articles found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsFeed;