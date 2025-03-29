import React from 'react';
import { useTwitter } from '../../../../context/TwitterContext';
import { Loader2, ExternalLink, AlertTriangle, Twitter, MessageCircle, Heart, RefreshCw } from 'lucide-react';
import { formatTimeAgo } from '../../../../utils/formatters';

const TwitterFeed: React.FC = () => {
  const { searchResults, isLoading, error } = useTwitter();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 size={20} className="text-theme-accent animate-spin mr-2" />
        <span className="text-sm text-theme-text-secondary">Loading tweets...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-4 text-theme-text-secondary">
        <AlertTriangle size={20} className="text-theme-accent mr-2" />
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  if (!searchResults?.tweets?.length) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <Twitter size={24} className="text-theme-accent mb-2" />
        <p className="text-sm text-theme-text-secondary">Search for a token to see related tweets</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {searchResults.tweets.map((tweet) => (
        <div 
          key={tweet.id} 
          className="p-3 bg-theme-accent/5 rounded-lg border border-theme-border hover:bg-theme-accent/10 transition-colors"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center">
              <img 
                src={tweet.author_image_url || `https://unavatar.io/${tweet.id}`}
                alt="Author"
                className="w-8 h-8 rounded-full mr-2"
              />
              <div>
                <div className="flex items-center">
                  <span className="font-medium text-sm text-theme-text-primary">
                    {tweet.author_name || 'Anonymous'}
                  </span>
                  {tweet.is_verified && (
                    <span className="ml-1 text-[10px] bg-theme-accent/20 text-theme-accent px-1.5 py-0.5 rounded-full">
                      Verified
                    </span>
                  )}
                </div>
                <div className="text-xs text-theme-text-secondary">
                  @{tweet.author_username || 'user'}
                </div>
              </div>
            </div>
            <a
              href={`https://twitter.com/i/web/status/${tweet.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-theme-accent hover:text-theme-accent-dark"
            >
              <ExternalLink size={14} />
            </a>
          </div>
          
          <p className="text-sm text-theme-text-primary mb-2">{tweet.text}</p>
          
          <div className="flex items-center justify-between text-xs text-theme-text-secondary">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <MessageCircle size={12} className="mr-1" />
                {tweet.public_metrics?.reply_count || 0}
              </span>
              <span className="flex items-center">
                <RefreshCw size={12} className="mr-1" />
                {tweet.public_metrics?.retweet_count || 0}
              </span>
              <span className="flex items-center">
                <Heart size={12} className="mr-1" />
                {tweet.public_metrics?.like_count || 0}
              </span>
            </div>
            <span>{formatTimeAgo(new Date(tweet.created_at).getTime())}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TwitterFeed;