## Project File Structure

### Core Application Files
```
project/
├── src/
│   ├── App.tsx                # Main application component
│   ├── main.tsx               # Entry point
│   └── index.css              # Global styles
```

### Component Structure
```
src/components/
├── MainApp.tsx                # Main application container
├── GridLayout.tsx             # Enhanced grid layout with auto-arrange, snap-fit features
├── DashboardExample.tsx       # Demo component for grid layout features
├── Card.tsx                   # Card component for dashboard items
├── ResponsiveCardLayout.tsx   # Higher-level card layout abstraction
├── ResponsiveCardLayoutDemo.tsx # Demo implementation of ResponsiveCardLayout
├── Dashboard.tsx              # Dashboard view
├── CryptoExplorer.tsx         # Cryptocurrency exploration component
├── Portfolio.tsx              # Portfolio management
├── Alerts.tsx                 # Alert system
├── Settings.tsx               # User settings
└── Additional components...    
```

### API Services Structure
```
src/services/
├── cryptoApi.ts              # Cryptocurrency market data (CoinGecko integration)
├── sentimentApi.ts           # Social sentiment analysis 
├── volumeApi.ts              # Trading volume and volatility data
├── newsApi.ts                # Crypto news aggregation
├── twitterApi.ts             # Social media data integration
├── financialApi.ts           # Financial metrics and data
├── groq.ts                   # Groq AI integration
├── openai.ts                 # OpenAI integration
└── perplexity.ts             # Perplexity AI integration
```

### Utility Functions
```
src/utils/
├── performanceUtils.ts        # Performance optimization utilities
├── gridUtils.ts               # Grid layout enhancement utilities
├── chartUtils.ts              # Chart visualization helpers
└── Additional utilities...
```

### Context Providers
```
src/context/
├── AuthContext.tsx            # Authentication state
├── ThemeContext.tsx           # Theme management
├── CryptoContext.tsx          # Cryptocurrency data
├── PortfolioContext.tsx       # Portfolio state
├── AlertContext.tsx           # Alerts state
└── TokenContext.tsx           # Token management
```

### Utilities and Services
```
src/utils/                     # Utility functions
src/services/                  # API services
src/types/                     # TypeScript type definitions
src/tools/                     # Helper tools
```

### Component Dependencies

#### Layout Component Hierarchy
```
┌───────────────┐     ┌───────────────────┐
│    App.tsx    │────►│    MainApp.tsx    │
└───────────────┘     └───────────────────┘
                                │
                       ┌────────┴────────┐
                       │                 │
                       ▼                 ▼
         ┌───────────────────┐   ┌────────────────────┐
         │   Dashboard.tsx   │   │  DashboardExample  │
         └───────────────────┘   └────────────────────┘
                   │                       │
                   │                       │
                   ▼                       ▼
         ┌─────────────────────┐   ┌────────────────┐
         │   GridLayout.tsx    │◄──┤    Card.tsx    │
         └─────────────────────┘   └────────────────┘
                   │
                   ▼
        ┌─────────────────────┐
        │  react-grid-layout  │
        └─────────────────────┘

┌───────────────┐     ┌───────────────────┐     ┌──────────────────────────┐
│    App.tsx    │────►│    MainApp.tsx    │────►│ ResponsiveCardLayoutDemo │
└───────────────┘     └───────────────────┘     └──────────────────────────┘
                                                             │
                                                             ▼
                                                  ┌───────────────────────────┐
                                                  │   ResponsiveCardLayout    │
                                                  └───────────────────────────┘
```

#### Grid Layout Component Dependencies
- **Direct Dependencies**: 
  - react-grid-layout (npm package)
  - localStorage (browser API for persistence)
  - performanceUtils.ts (performance optimizations)
  - gridUtils.ts (layout enhancement utilities)
  
- **Component Relationships**:
  - Used by: Dashboard.tsx, DashboardExample.tsx
  - Configures: Layout, sizing, positioning of UI components
  - Features: Auto-arrange, snap-to-grid, auto-fill, gap detection
  - Affected by: Viewport size, user customization

#### Grid Utilities Structure
- **Key Functions**:
  - autoArrangeLayout: Eliminates gaps in layouts
  - snapToGrid: Ensures items align to grid
  - autoFillLayout: Maximizes space utilization
  - hasGaps: Detects suboptimal layouts
  - findOptimalPosition: Smart item placement
  - isPositionOccupied: Prevents overlapping

#### Performance Utilities
- **Key Functions**:
  - debounce: General-purpose debouncing utility
  - debounceLocalStorage: Specialized for storage operations
  - memoize: Function result caching
  - createTimer: Performance measurement utility
  - useRenderCount: Component render tracking hook

#### ResponsiveCardLayout Dependencies
- **Direct Dependencies**:
  - React's built-in layout capabilities
  - useState and useEffect for responsive behavior
  
- **Component Relationships**:
  - Used by: ResponsiveCardLayoutDemo.tsx
  - Provides: Automatic grid calculation based on container width
  - Affected by: Container size, item priorities, specified dimensions

#### Main App Dependencies
- **Context Dependencies**:
  - AuthContext: User authentication state
  - ThemeContext: Visual theme configuration
  - Various feature contexts
  
- **Component Flow**:
  - App.tsx → Context Providers → MainApp.tsx → Feature Components
  - Authentication flow controls access to protected components 

#### 📂 Utils
- `src/utils/gridUtils.ts` - Enhanced grid layout utility functions for auto-arranging, snap-fit, and gap detection
  * integrated with application theme
  * memoized implementations for performance
- `src/utils/performanceUtils.ts` - Performance optimization utilities including debounce and memoization
  * supports the grid layout system and other performance-critical operations

#### 🖥️ Components
- `src/components/DashboardExample.tsx` - Enhanced grid layout demonstration component
  * integrates with application's theme system
  * provides auto-arrange, snap-fit, auto-fill functionality
  * theme-aware styling and responsive design
  * accessible through the "Enhanced Grid" navigation option 

### Updated Component Relationships

#### Dashboard Components
- `Dashboard.tsx` → Enhanced with responsive grid layout, auto-arrange, and snap-to-grid features
  - Utilizes: `react-grid-layout` library
  - Depends on: `Card.tsx`, dashboard cards, `../utils/gridUtils.ts`
  - Features:
    - Responsive breakpoints (lg, md, sm, xs)
    - Toggle controls for auto-arrange and snap-to-grid
    - Layout persistence
    - Gap detection

- `Card.tsx` → Updated to work with grid layout
  - Features:
    - Draggable header
    - Content overflow handling
    - Custom scrollbars
    - Theme-consistent styling

#### Grid System Relationships
- `utils/gridUtils.ts` → Provides optimization utilities
  - Used by `Dashboard.tsx`
  - Functions:
    - autoArrangeLayout: Eliminates gaps 
    - snapToGrid: Ensures alignment
    - hasGaps: Detects layout inefficiencies
  * integrated with application theme
  * memoized implementations for performance

### API Dependencies

#### API Service Relationships
```
┌─────────────────┐     ┌───────────────────┐     ┌─────────────────┐
│   cryptoApi.ts  │     │   sentimentApi.ts │     │   newsApi.ts    │
└─────────────────┘     └───────────────────┘     └─────────────────┘
        ▲                        ▲                        ▲
        │                        │                        │
        │                        │                        │
        │                        │                        │
┌───────┴───────────────────────┴────────────────────────┴───────────┐
│                        Dashboard Components                         │
└─────────────────────────────────────────────────────────────────────┘
        │                        │                        │
        │                        │                        │
        ▼                        ▼                        ▼
┌─────────────────┐     ┌───────────────────┐     ┌─────────────────┐
│  volumeApi.ts   │     │   twitterApi.ts   │     │ financialApi.ts │
└─────────────────┘     └───────────────────┘     └─────────────────┘
```

#### API Service Dependencies
- **cryptoApi.ts**:
  - External: CoinGecko API
  - Internal: Used by PriceChart.tsx, TopMovers.tsx, and other components
  - Features: Market data, token search, historical prices
  
- **sentimentApi.ts**:
  - External: Custom sentiment analysis API
  - Internal: Used by SocialSentiment.tsx, DiscussionTrends.tsx
  - Features: Social sentiment scores, entity extraction, trend analysis
  
- **volumeApi.ts**:
  - External: CoinGecko API (partial)
  - Internal: Used by VolumeVolatility.tsx
  - Features: Exchange volume, volatility metrics, exchange comparisons
  
- **newsApi.ts**:
  - External: Crypto news aggregation API
  - Internal: Used by NewsFeed.tsx
  - Features: News articles, token filtering, source filtering
  
- **twitterApi.ts**:
  - External: Twitter/X API
  - Internal: Used by SocialSentiment.tsx, DiscussionTrends.tsx
  - Features: Tweet retrieval, engagement metrics, trending topics

#### AI API Services
- **groq.ts, openai.ts, perplexity.ts**:
  - External: Various AI API providers

### Documentation Structure
```
roadmap/
├── index.md                      # Central index of all PRDs with status
├── roadmap.md                    # Main roadmap overview
├── pages_and_components.md       # Detailed breakdown of all pages and components
├── 
├── # Core Pages
├── dashboard_page.md             # Dashboard page PRD
├── token_details_page.md         # Token details page PRD
├── portfolio_management_page.md  # Portfolio management page PRD
├── social_sentiment_page.md      # Social & sentiment page PRD
├── trading_tools_page.md         # Trading tools page PRD
├── help_community_page.md        # Help & community page PRD
├── 
├── # Components
├── market_overview.md            # Market overview component PRD
├── developer_activity.md         # Developer activity component PRD
├── portfolio_snapshot.md         # Portfolio snapshot component PRD
├── news_social_feed.md           # News & social feed PRD
├── social_data.md                # Social data component PRD
├── 
├── # Services and Providers
├── crypto_api_service.md         # Crypto API service PRD
├── crypto_context_provider.md    # Crypto context provider PRD
├── user_auth_profile.md          # User authentication & profile PRD
├── watchlist.md                  # Watchlist feature PRD
├── alerts_system.md              # Alerts system PRD
├── search_component.md           # Search component PRD
├── settings_preferences.md       # Settings & preferences PRD
├── exchange_api_integration.md   # Exchange API integration PRD
├── ai_market_analysis.md         # AI market analysis PRD
├── token_comparison.md           # Token comparison feature PRD
```

#### Documentation Relationships

- **index.md**: Central reference document that tracks implementation status of all components
  - Lists all PRDs with status indicators (Not Started, In Progress, Completed)
  - Categorizes components by type (Pages, Components, Services, etc.)
  - Includes priority matrix and implementation progress

- **roadmap.md**: High-level overview of the platform
  - Describes platform vision and architecture
  - Outlines implementation timeline and priorities
  - Defines success metrics and next steps

- **pages_and_components.md**: Detailed breakdown of all pages and their components
  - Lists all platform pages and their constituent components
  - Tracks implementation status of each component
  - Highlights dependencies between components

- **Component and Page PRDs**: Detailed specifications for implementation
  - Each follows consistent structure with overview, status, features, etc.
  - Contains technical implementation details and UX considerations
  - Outlines future roadmap and enhancement opportunities

#### Documentation Integration with Development Workflow

The documentation structure is designed to be tightly integrated with the development process:

1. **Discovery Phase**: `roadmap.md` and `index.md` provide high-level overview
2. **Planning Phase**: Page and Component PRDs detail specific implementation requirements
3. **Development Phase**: Technical implementation sections guide development
4. **Testing Phase**: PRDs define requirements for validation
5. **Enhancement Phase**: Future roadmap sections outline next steps