import React, { useState, useEffect, useMemo } from 'react';
import { ExternalLink, Clock, RefreshCw, AlertTriangle, Tag } from 'lucide-react';
import { getLatestNews, NewsArticle } from '../../services/newsApi';
import { useToken } from '../../context/TokenContext';

const NewsFeed: React.FC = () => {
  const { selectedToken } = useToken();
  const [newsItems, setNewsItems] = useState<NewsArticle[]>([]);
  const [allNewsItems, setAllNewsItems] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeFrame, setTimeFrame] = useState<'24h' | '7d' | '30d'>('24h');

  const fetchNews = async () => {
    setIsLoading(true);
    setError(null);
    let retryCount = 0;
    const maxRetries = 3;

    try {
      while (retryCount < maxRetries) {
        try {
          const articles = await getLatestNews(1, 20, timeFrame);
          setAllNewsItems(articles);
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

  // Filter news based on selected token
  useEffect(() => {
    if (selectedToken && allNewsItems.length > 0) {
      const tokenSymbol = selectedToken.symbol.toLowerCase();
      const tokenName = selectedToken.name.toLowerCase();
      
      const filteredNews = allNewsItems.filter(article => {
        const title = article.title.toLowerCase();
        const summary = article.summary.toLowerCase();
        return title.includes(tokenSymbol) || title.includes(tokenName) || 
               summary.includes(tokenSymbol) || summary.includes(tokenName);
      });
      
      setNewsItems(filteredNews.length > 0 ? filteredNews : allNewsItems.slice(0, 10));
    } else {
      setNewsItems(allNewsItems.slice(0, 10));
    }
  }, [selectedToken, allNewsItems]);

  useEffect(() => {
    fetchNews();
  }, [timeFrame]);

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
  
  // Create a title that indicates if we're showing filtered results
  const feedTitle = useMemo(() => {
    if (selectedToken) {
      return `News${newsItems.length < allNewsItems.length ? ` • ${selectedToken.symbol.toUpperCase()}` : ''}`;
    }
    return 'Latest News';
  }, [selectedToken, newsItems.length, allNewsItems.length]);

  return (
    <div className="h-full">
      <div className="flex items-center mb-2">
        <div className="flex items-center">
          {selectedToken && newsItems.length < allNewsItems.length && (
            <Tag size={12} className="mr-1 text-theme-accent" />
          )}
          <span className="text-[10px] font-medium text-theme-text-primary mr-2">{feedTitle}</span>
        </div>
        <div className="flex space-x-1 ml-auto">
          <button 
            className={`text-[9px] px-2 py-0.5 rounded-full ${
              timeFrame === '24h' ? 'bg-theme-accent text-theme-bg' : 'bg-theme-accent/10 text-theme-accent hover:bg-theme-accent/20'
            }`}
            onClick={() => setTimeFrame('24h')}
          >
            24h
          </button>
          <button 
            className={`text-[9px] px-2 py-0.5 rounded-full ${
              timeFrame === '7d' ? 'bg-theme-accent text-theme-bg' : 'bg-theme-accent/10 text-theme-accent hover:bg-theme-accent/20'
            }`}
            onClick={() => setTimeFrame('7d')}
          >
            7d
          </button>
          <button 
            className={`text-[9px] px-2 py-0.5 rounded-full ${
              timeFrame === '30d' ? 'bg-theme-accent text-theme-bg' : 'bg-theme-accent/10 text-theme-accent hover:bg-theme-accent/20'
            }`}
            onClick={() => setTimeFrame('30d')}
          >
            30d
          </button>
          <button
            className="text-[9px] px-2 py-0.5 rounded-full bg-theme-accent/10 text-theme-accent hover:bg-theme-accent/20"
            onClick={fetchNews}
            disabled={isLoading}
          >
            <RefreshCw size={12} className={`${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw size={24} className="text-theme-accent animate-spin" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-64 text-theme-accent">
          <AlertTriangle size={24} className="mb-2" />
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchNews}
            className="mt-4 text-xs bg-theme-accent/10 hover:bg-theme-accent/20 text-theme-accent px-3 py-1.5 rounded-lg"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="space-y-3 overflow-auto max-h-[calc(100%-30px)]">
          {newsItems.map((item, index) => (
            <div key={index} className="p-2 border-b border-theme-border last:border-b-0">
              <div className="flex justify-between items-start">
                <h4 className="text-[11px] font-medium text-theme-text-primary leading-tight mb-1">
                  {item.title}
                </h4>
                <a 
                  href={item.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-theme-accent hover:text-theme-accent-dark ml-2"
                >
                  <ExternalLink size={12} />
                </a>
              </div>
              <div className="text-[10px] text-theme-text-secondary mb-2">
                {item.summary}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-medium text-theme-accent">
                  {item.authors?.[0]?.name || 'Unknown Author'}
                </span>
                <span className="flex items-center text-[9px] text-theme-text-secondary">
                  <Clock size={9} className="mr-0.5" />
                  {formatTimeAgo(item.published)}
                </span>
              </div>
              <div className="mt-1">
                <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-theme-accent/20 text-theme-accent">
                  {item.category}
                </span>
                {item.subCategory && (
                  <span className="ml-1 text-[8px] px-1.5 py-0.5 rounded-full bg-theme-accent/10 text-theme-accent">
                    {item.subCategory}
                  </span>
                )}
              </div>
            </div>
          ))}
          
          {newsItems.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-theme-text-secondary">No news articles found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NewsFeed;