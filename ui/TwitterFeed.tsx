import React from 'react';
import { useTwitter } from '../../context/TwitterContext';
import { Loader2, ExternalLink, AlertTriangle, Twitter } from 'lucide-react';

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

  if (!searchResults?.users?.length) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <Twitter size={24} className="text-theme-accent mb-2" />
        <p className="text-sm text-theme-text-secondary">No tweets found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {searchResults.users.map((user) => (
        <div 
          key={user.result.legacy.screen_name} 
          className="p-3 bg-theme-accent/5 rounded-lg border border-theme-border"
        >
          <div className="flex items-center mb-2">
            <img 
              src={user.result.legacy.profile_image_url_https}
              alt={user.result.legacy.name}
              className="w-8 h-8 rounded-full mr-2"
            />
            <div className="flex-1">
              <div className="flex items-center">
                <span className="font-medium text-sm text-theme-text-primary">
                  {user.result.legacy.name}
                </span>
                {user.result.is_blue_verified && (
                  <span className="ml-1 text-[10px] bg-theme-accent/20 text-theme-accent px-1.5 py-0.5 rounded-full">
                    Verified
                  </span>
                )}
              </div>
              <div className="text-xs text-theme-text-secondary">
                @{user.result.legacy.screen_name}
              </div>
            </div>
            <a
              href={`https://twitter.com/${user.result.legacy.screen_name}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-theme-accent hover:text-theme-accent-dark"
            >
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TwitterFeed;