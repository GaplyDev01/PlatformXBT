import React, { createContext, useContext, useState } from 'react';
import { TwitterSearchResponse } from '../services/twitterApi';

interface TwitterContextType {
  searchResults: TwitterSearchResponse | null;
  setSearchResults: (results: TwitterSearchResponse | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

const TwitterContext = createContext<TwitterContextType | undefined>(undefined);

export const useTwitter = () => {
  const context = useContext(TwitterContext);
  if (!context) {
    throw new Error('useTwitter must be used within a TwitterProvider');
  }
  return context;
};

export const TwitterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchResults, setSearchResults] = useState<TwitterSearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <TwitterContext.Provider value={{
      searchResults,
      setSearchResults,
      isLoading,
      setIsLoading,
      error,
      setError
    }}>
      {children}
    </TwitterContext.Provider>
  );
};