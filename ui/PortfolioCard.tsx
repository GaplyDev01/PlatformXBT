import React, { useState, useEffect } from 'react';
import {
  ArrowUp,
  ArrowDown,
  Plus,
  Wallet,
  TrendingUp,
  TrendingDown,
  PieChart,
  Download,
  History,
  BarChart3,
  DollarSign,
  RefreshCw,
  Settings,
  X,
  Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { usePortfolio } from '../../context/PortfolioContext';

// Types
interface Asset {
  id: string;
  name: string;
  symbol: string;
  amount: number;
  value: number;
  price: number;
  change24h: number;
  color: string;
  logo?: string;
}

interface PortfolioSummary {
  totalValue: number;
  change24h: number;
  changePercent24h: number;
  allocation: {
    category: string;
    percentage: number;
    color: string;
  }[];
  history: {
    date: string;
    value: number;
  }[];
}

interface PortfolioCardProps {
  className?: string;
  maxAssets?: number;
  showHeader?: boolean;
  showCharts?: boolean;
}

// Chart component
const PortfolioChart: React.FC<{ data: { date: string; value: number }[] }> = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue;

  return (
    <div className="h-32 w-full">
      <div className="flex h-full items-end space-x-1">
        {data.map((item, index) => {
          const height = ((item.value - minValue) / range) * 100;
          return (
            <div
              key={index}
              className="group relative flex h-full flex-1 items-end"
            >
              <div
                className="w-full rounded-t bg-theme-accent/20 transition-all duration-200 group-hover:bg-theme-accent/40"
                style={{ height: `${Math.max(height, 5)}%` }}
              />
              <div className="absolute -top-8 left-1/2 hidden -translate-x-1/2 rounded bg-theme-bg p-1 text-xs shadow-md group-hover:block">
                <div className="font-medium text-theme-text-primary">${item.value.toLocaleString()}</div>
                <div className="text-theme-text-secondary">{item.date}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Pie chart component
const AllocationPieChart: React.FC<{ data: PortfolioSummary["allocation"] }> = ({ data }) => {
  let cumulativePercentage = 0;

  return (
    <div className="relative h-32 w-32 mx-auto">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        {data.map((item, index) => {
          const startPercentage = cumulativePercentage;
          cumulativePercentage += item.percentage;
          
          const startAngle = startPercentage * 3.6; // 3.6 = 360 / 100
          const endAngle = cumulativePercentage * 3.6;
          
          const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
          const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
          const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
          const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);
          
          const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
          
          const pathData = [
            `M 50 50`,
            `L ${x1} ${y1}`,
            `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            `Z`,
          ].join(" ");
          
          return (
            <path
              key={index}
              d={pathData}
              fill={item.color}
              className="hover:opacity-80 transition-opacity cursor-pointer"
            />
          );
        })}
        <circle cx="50" cy="50" r="25" fill="var(--theme-bg, white)" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs text-theme-text-secondary">Allocation</span>
        <span className="text-sm font-medium text-theme-text-primary">{data.length} Assets</span>
      </div>
    </div>
  );
};

// Asset row component
const AssetRow: React.FC<{ asset: Asset }> = ({ asset }) => {
  return (
    <div className="flex items-center justify-between py-2 border-b border-theme-border last:border-b-0">
      <div className="flex items-center gap-3">
        <div 
          className="h-8 w-8 rounded-full flex items-center justify-center text-theme-bg"
          style={{ backgroundColor: asset.color }}
        >
          {asset.logo ? (
            <img src={asset.logo} alt={asset.symbol} className="h-5 w-5" />
          ) : (
            asset.symbol.substring(0, 1)
          )}
        </div>
        <div>
          <div className="font-medium text-sm text-theme-text-primary">{asset.name}</div>
          <div className="text-xs text-theme-text-secondary">{asset.symbol} • {asset.amount.toFixed(4)}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-medium text-sm text-theme-text-primary">${asset.value.toLocaleString()}</div>
        <div className="flex items-center text-xs justify-end">
          {asset.change24h > 0 ? (
            <>
              <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-500">+{asset.change24h.toFixed(2)}%</span>
            </>
          ) : (
            <>
              <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
              <span className="text-red-500">{asset.change24h.toFixed(2)}%</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Add Asset Modal
const AddAssetModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ 
  isOpen, 
  onClose 
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-theme-bg rounded-lg shadow-xl p-6 max-w-md w-full border border-theme-border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-theme-text-primary">Add New Asset</h3>
          <button onClick={onClose} className="text-theme-text-secondary hover:text-theme-text-primary">
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-theme-text-primary mb-1">
              Asset
            </label>
            <select className="w-full p-2 bg-theme-bg border border-theme-border rounded-md text-sm text-theme-text-primary">
              <option value="">Select asset</option>
              <option value="btc">Bitcoin (BTC)</option>
              <option value="eth">Ethereum (ETH)</option>
              <option value="sol">Solana (SOL)</option>
              <option value="ada">Cardano (ADA)</option>
              <option value="dot">Polkadot (DOT)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-theme-text-primary mb-1">
              Amount
            </label>
            <input 
              type="number" 
              placeholder="0.00" 
              className="w-full p-2 bg-theme-bg border border-theme-border rounded-md text-sm text-theme-text-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-theme-text-primary mb-1">
              Purchase Price (USD)
            </label>
            <input 
              type="number" 
              placeholder="0.00" 
              className="w-full p-2 bg-theme-bg border border-theme-border rounded-md text-sm text-theme-text-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-theme-text-primary mb-1">
              Purchase Date
            </label>
            <input 
              type="date" 
              className="w-full p-2 bg-theme-bg border border-theme-border rounded-md text-sm text-theme-text-primary"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-theme-border rounded-md text-theme-text-primary hover:bg-theme-accent/10"
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 text-sm bg-theme-accent rounded-md text-theme-bg hover:bg-theme-accent-dark"
          >
            Add Asset
          </button>
        </div>
      </div>
    </div>
  );
};

// Main component
const PortfolioCard: React.FC<PortfolioCardProps> = ({ 
  className = '',
  maxAssets = 5,
  showHeader = true,
  showCharts = true
}) => {
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const [timeframe, setTimeframe] = useState("1W");
  const navigate = useNavigate();
  
  // Use real data from PortfolioContext
  const { assets: portfolioAssets, totalValue, dailyChange, dailyChangePercent, isRealData } = usePortfolio();
  
  // Transform portfolio assets to match the Asset interface
  const transformedAssets: Asset[] = portfolioAssets.map(asset => ({
    id: asset.symbol.toLowerCase(),
    name: asset.name,
    symbol: asset.symbol,
    amount: asset.quantity,
    value: asset.quantity * asset.currentPrice,
    price: asset.currentPrice,
    change24h: ((asset.currentPrice - asset.purchasePrice) / asset.purchasePrice) * 100,
    color: getAssetColor(asset.symbol), // Helper function to assign colors
  }));
  
  // Helper function to assign consistent colors
  function getAssetColor(symbol: string): string {
    const colorMap: Record<string, string> = {
      'BTC': '#F7931A',
      'ETH': '#627EEA',
      'SOL': '#00FFA3',
      'DOT': '#E6007A',
      'ADA': '#0033AD',
      'USDT': '#26A17B',
      'USDC': '#2775CA',
      'BNB': '#F3BA2F',
      'XRP': '#23292F',
      'DOGE': '#C2A633',
    };
    
    return colorMap[symbol] || `#${Math.floor(Math.random()*16777215).toString(16)}`;
  }
  
  // Create allocation data for the pie chart
  const allocation = transformedAssets.map(asset => ({
    category: asset.symbol,
    percentage: (asset.value / totalValue) * 100,
    color: asset.color
  }));
  
  // Generate mock history data (would be replaced with real data in production)
  const generateHistoryData = () => {
    const history = [];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date().getDay();
    
    // Generate data for the past week with a trend similar to daily change
    let previousValue = totalValue - dailyChange * 7;
    
    for (let i = 0; i < 7; i++) {
      // Create a slightly randomized progression toward current total
      const progress = i / 6; // 0 to 1
      const randomFactor = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
      const value = previousValue + (totalValue - previousValue) * progress * randomFactor;
      
      // Ensure the last value is exactly the total value
      const dayValue = i === 6 ? totalValue : Math.round(value * 100) / 100;
      
      history.push({
        date: days[(today - 6 + i) % 7],
        value: dayValue
      });
      
      previousValue = dayValue;
    }
    
    return history;
  };
  
  // Create the summary object
  const summary: PortfolioSummary = {
    totalValue: totalValue,
    change24h: dailyChange,
    changePercent24h: dailyChangePercent,
    allocation: allocation,
    history: generateHistoryData()
  };
  
  const assets = transformedAssets.slice(0, maxAssets);
  
  const handleAddAsset = () => {
    setIsAddAssetOpen(true);
  };
  
  const handleViewAll = () => {
    navigate('/portfolio');
  };

  return (
    <div className={`bg-theme-bg border border-theme-border rounded-lg shadow-sm overflow-hidden h-full flex flex-col ${className}`}>
      {showHeader && (
        <div className="px-4 py-3 border-b border-theme-border flex justify-between items-center">
          <div className="flex items-center">
            <Wallet className="h-4 w-4 text-theme-accent mr-2" />
            <h3 className="font-medium text-sm text-theme-text-primary">Portfolio</h3>
            {isRealData && (
              <span className="ml-1 text-[8px] bg-green-500 text-white px-1 py-0.5 rounded">LIVE</span>
            )}
          </div>
          <button 
            onClick={handleAddAsset}
            className="text-xs bg-theme-accent hover:bg-theme-accent-dark text-theme-bg px-2 py-1 rounded flex items-center transition-colors"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Asset
          </button>
        </div>
      )}
      
      <div className="flex-grow p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="text-xs text-theme-text-secondary">Total Value</div>
            <div className="text-xl font-bold text-theme-text-primary">${summary.totalValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            <div className="flex items-center mt-1 text-xs">
              {summary.change24h > 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-500">
                    +${summary.change24h.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} (+{summary.changePercent24h.toFixed(2)}%)
                  </span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                  <span className="text-red-500">
                    ${summary.change24h.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} ({summary.changePercent24h.toFixed(2)}%)
                  </span>
                </>
              )}
              <span className="text-theme-text-secondary ml-1">24h</span>
            </div>
          </div>
          
          {showCharts && (
            <div>
              <AllocationPieChart data={summary.allocation} />
            </div>
          )}
        </div>
        
        {showCharts && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-xs font-medium text-theme-text-primary">Performance</div>
              <div className="flex gap-1">
                {["1D", "1W", "1M", "3M", "1Y", "ALL"].map((period) => (
                  <button
                    key={period}
                    onClick={() => setTimeframe(period)}
                    className={`text-[9px] px-1.5 py-0.5 rounded ${
                      timeframe === period
                        ? 'bg-theme-accent text-theme-bg'
                        : 'bg-theme-accent/10 text-theme-accent'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
            <PortfolioChart data={summary.history} />
          </div>
        )}
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="text-xs font-medium text-theme-text-primary">Your Assets</div>
            {assets.length < transformedAssets.length && (
              <button 
                onClick={handleViewAll}
                className="text-[9px] text-theme-accent hover:text-theme-accent-dark"
              >
                View All
              </button>
            )}
          </div>
          
          <div className="space-y-1">
            {assets.length > 0 ? (
              assets.map((asset) => (
                <AssetRow key={asset.id} asset={asset} />
              ))
            ) : (
              <div className="text-xs text-theme-text-secondary text-center py-4">
                No assets found. Import your portfolio data in the Portfolio section.
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="px-4 py-2 border-t border-theme-border flex justify-between items-center">
        <button 
          onClick={() => {}}
          className="text-xs text-theme-accent hover:text-theme-accent-dark flex items-center"
        >
          <History className="h-3 w-3 mr-1" />
          History
        </button>
        <button 
          onClick={() => {}}
          className="text-xs text-theme-accent hover:text-theme-accent-dark flex items-center"
        >
          <BarChart3 className="h-3 w-3 mr-1" />
          Analytics
        </button>
        <button 
          onClick={() => {}}
          className="text-xs text-theme-accent hover:text-theme-accent-dark flex items-center"
        >
          <Download className="h-3 w-3 mr-1" />
          Export
        </button>
      </div>
      
      <AddAssetModal 
        isOpen={isAddAssetOpen} 
        onClose={() => setIsAddAssetOpen(false)} 
      />
    </div>
  );
};

export default PortfolioCard; 