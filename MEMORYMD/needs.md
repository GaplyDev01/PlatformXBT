# API Integration Requirements

This document outlines the data needs and API integrations required to replace mock/hardcoded data across the dashboard components.

## API Integration Priority

### Immediate API Needs
1. **Price Chart API** - Real-time and historical price data with OHLC support
   - Replace mock chart in PriceChart.tsx with live data
   - Required for core functionality displaying current token prices
   - Functions needed: getHistoricalMarketData with configurable timeframes

2. **Economic Calendar API** - Events calendar with financial and crypto events
   - Replace mockEvents in EconomicCalendar.tsx
   - Functions needed: fetchEconomicEvents with filtering capabilities

3. **Volume & Exchange Data API** - Real exchange data for trading volumes
   - Enhance volumeApi.ts which currently uses partial CoinGecko data
   - Complete replacement for mock data in VolumeVolatility.tsx
   - Functions needed: getVolumeVolatilityData with full exchange support

4. **Social Sentiment API** - Robust sentiment analysis across platforms
   - Implement proper fallback for sentimentApi.ts
   - Functions needed: getSocialSentiment with better error handling

### Future API Needs
1. **AI Insights API** - Trading signals and pattern recognition
   - For AIInsights.tsx, which currently uses mock predictions
   - Include sentiment correlation with price movements

2. **Stock & Token Financials API** - Comprehensive financial metrics
   - For StockFinancials.tsx
   - Include both traditional and crypto financial metrics

3. **Discussion Trends API** - Topic analysis across social platforms
   - For DiscussionTrends.tsx
   - Include trending keywords and sentiment by platform

4. **Advanced Token Data** - On-chain analytics and metrics
   - For enhanced token context integration
   - Include developer activity and on-chain volume metrics

## Currently Used APIs

### 1. CoinGecko API
- **Base URL:** `/api/coingecko`
- **API Key:** Using `VITE_COINGECKO_API_KEY` from .env
- **Functions Using This API:**
  - `getCoinsMarketData()` in cryptoApi.ts
  - `getGlobalData()` in cryptoApi.ts
  - `searchCrypto()` in cryptoApi.ts
  - `getHistoricalMarketData()` in cryptoApi.ts
  - `getVolumeVolatilityData()` in volumeApi.ts
  - `getComparisonVolatilityData()` in volumeApi.ts

### 2. Sentiment Analysis API
- **Implementation Status:** Partially implemented with mock fallbacks
- **Functions Using This API:**
  - `getSocialSentiment()` in sentimentApi.ts
  - `getSocialMetrics()` in sentimentApi.ts
- **Components Using This API:**
  - SocialSentiment.tsx - Uses mock data when API fails

### 3. News API
- **Implementation Status:** Partially implemented, needs better token filtering
- **Functions Using This API:**
  - Functions in newsApi.ts
- **Components Using This API:**
  - NewsFeed.tsx

### 4. Twitter/Social Media API
- **Implementation Status:** Partially implemented
- **Functions Using This API:**
  - Functions in twitterApi.ts
- **Components Using This API:**
  - DiscussionTrends.tsx
  - SocialSentiment.tsx

## API Integration Considerations

### Security
- API keys should be stored securely using environment variables
- Rate limiting handling
- Proper error handling with fallback mechanisms
- Data caching to reduce API calls

### Performance
- Implement request batching where possible
- Use WebSockets for real-time data when available
- Consider using server-side API proxies for sensitive credentials

### User Experience
- Show loading states during API calls
- Provide meaningful error messages
- Implement graceful degradation when APIs fail
- Cache results for faster re-renders and offline capabilities