import React, { useState, useEffect } from 'react';
import { Twitter } from 'lucide-react';

interface TrendingTweet {
  name: string;
  description: string | null;
  context: string | null;
}

const TrendingTweets: React.FC = () => {
  const [trends, setTrends] = useState<TrendingTweet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchTrendingTweets = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/twitter/trends');

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }

        const data = await response.json();
        setTrends(data.trends);
      } catch (err) {
        console.error('Error fetching trending tweets:', err);
        setError('Failed to load trending tweets.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingTweets();

    // Refresh trends every 5 minutes
    const refreshInterval = setInterval(fetchTrendingTweets, 300000);
    return () => clearInterval(refreshInterval);
  }, []);

  useEffect(() => {
    if (trends.length === 0) return;

    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % trends.length);
    }, 5000); // Change tweet every 5 seconds

    return () => clearInterval(intervalId);
  }, [trends]);

  if (isLoading) {
    return (
      <div className="flex items-center text-theme-text-secondary">
        <Twitter size={12} className="mr-1 animate-pulse" />
        <span>Loading trends...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center text-theme-text-secondary">
        <Twitter size={12} className="mr-1" />
        <span>Unable to load trends</span>
      </div>
    );
  }

  if (trends.length === 0) {
    return (
      <div className="flex items-center text-theme-text-secondary">
        <Twitter size={12} className="mr-1" />
        <span>No trends available</span>
      </div>
    );
  }

  const currentTrend = trends[currentIndex];

  return (
    <div className="flex items-center text-theme-text-secondary overflow-hidden">
      <Twitter size={12} className="mr-1 flex-shrink-0" />
      <div className="truncate">
        <span className="text-theme-accent">{currentTrend.name}</span>
        {currentTrend.description && (
          <span className="ml-1 text-theme-text-secondary">
            {currentTrend.description}
          </span>
        )}
        {currentTrend.context && (
          <span className="ml-1 text-theme-text-secondary opacity-75">
            • {currentTrend.context}
          </span>
        )}
      </div>
    </div>
  );
};

export default TrendingTweets;