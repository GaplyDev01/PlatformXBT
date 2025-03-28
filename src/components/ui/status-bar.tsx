import React, { useState, useEffect } from 'react';
import { Clock, Bitcoin, Twitter } from 'lucide-react';
import { useTwitter } from '../../context/TwitterContext';
import TrendingTweets from '../TrendingTweets';

interface StatusBarProps {
  className?: string;
  isSidebarExpanded?: boolean;
}

const StatusBar: React.FC<StatusBarProps> = ({ className, isSidebarExpanded = false }) => {
  const btcPrice = '$37.5K';
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const { searchResults } = useTwitter();
  
  const [currentTime, setCurrentTime] = useState(time);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const sidebarWidth = isSidebarExpanded ? 'left-64' : 'left-16';
  
  return (
    <div className={`fixed bottom-0 ${sidebarWidth} right-0 h-7 bg-theme-bg border-t border-theme-border text-xs flex items-center justify-between z-30 font-mono px-2 overflow-hidden ${className}`}>
      <div className="flex items-center space-x-3 overflow-hidden">
        <div className="flex items-center">
          <Twitter size={12} className="mr-1 text-theme-accent" />
          <TrendingTweets />
        </div>
        <div className="h-4 border-r border-theme-border/30"></div>
        <div className="flex items-center">
          <Bitcoin size={12} className="mr-1 text-yellow-500" />
          <span className="text-theme-text-primary truncate">{btcPrice}</span>
        </div>
      </div>
      
      <div className="flex items-center">
        <Clock size={12} className="mr-1 text-theme-text-secondary" />
        <span>{currentTime}</span>
      </div>
    </div>
  );
};

export default StatusBar;