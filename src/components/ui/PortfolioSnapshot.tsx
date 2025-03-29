import React from 'react';
import { PieChart, TrendingUp, ArrowRight } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';

const PortfolioSnapshot: React.FC = () => {
  const { assets, totalValue, dailyChange, dailyChangePercent, isRealData } = usePortfolio();
  
  // Format the portfolio values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };
  
  // Calculate allocations based on actual portfolio data
  const calculateAllocations = () => {
    if (assets.length === 0) return [];
    
    // Calculate total portfolio value
    const totalPortfolioValue = assets.reduce((sum, asset) => sum + asset.quantity * asset.currentPrice, 0);
    
    // Calculate allocations for each asset
    const assetsWithAllocations = assets.slice(0, 3).map(asset => {
      const value = asset.quantity * asset.currentPrice;
      const allocation = (value / totalPortfolioValue) * 100;
      
      // Calculate 24h change percentage (using a simulated value for demo)
      const changePercentage = ((asset.currentPrice - asset.purchasePrice) / asset.purchasePrice) * 100;
      
      return {
        symbol: asset.symbol,
        name: asset.name,
        allocation: Math.round(allocation),
        value: formatCurrency(value),
        change: `${changePercentage >= 0 ? '+' : ''}${changePercentage.toFixed(1)}%`
      };
    });
    
    // If there are more than 3 assets, create an "Others" category
    if (assets.length > 3) {
      const othersValue = assets.slice(3).reduce((sum, asset) => sum + asset.quantity * asset.currentPrice, 0);
      const othersAllocation = (othersValue / totalPortfolioValue) * 100;
      
      assetsWithAllocations.push({
        symbol: 'Others',
        name: `${assets.length - 3} assets`,
        allocation: Math.round(othersAllocation),
        value: formatCurrency(othersValue),
        change: '+0.0%' // Placeholder, could be calculated for real data
      });
    }
    
    return assetsWithAllocations;
  };
  
  const portfolioAssets = calculateAllocations();
  
  // Format portfolio change values
  const formattedPortfolioValue = formatCurrency(totalValue);
  const formattedPortfolioChange = `${dailyChange >= 0 ? '+' : ''}${formatCurrency(dailyChange)}`;
  const formattedPortfolioChangePercent = `${dailyChangePercent >= 0 ? '+' : ''}${dailyChangePercent.toFixed(2)}%`;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="text-theme-text-primary text-[10px] font-medium flex items-center">
          <PieChart size={14} className="text-theme-accent mr-1" />
          Portfolio Summary
          {isRealData && (
            <span className="ml-1 text-[8px] bg-green-500 text-white px-1 py-0.5 rounded">LIVE</span>
          )}
        </div>
        <button className="text-[9px] text-theme-accent hover:text-theme-accent-dark flex items-center">
          View Details
          <ArrowRight size={10} className="ml-0.5" />
        </button>
      </div>
      
      <div className="bg-theme-accent/10 p-2 rounded-md mb-3">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-[9px] text-theme-accent">Total Value</div>
            <div className="text-sm font-bold text-theme-text-primary">{formattedPortfolioValue}</div>
          </div>
          <div className="text-right">
            <div className="text-[9px] text-theme-accent">24h Change</div>
            <div className="flex items-center text-theme-accent">
              <TrendingUp size={10} className="mr-0.5" />
              <span className="text-[10px] font-medium">{formattedPortfolioChange} ({formattedPortfolioChangePercent})</span>
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <div className="text-[10px] font-medium text-theme-text-primary mb-1">Asset Allocation</div>
        
        <div className="flex mb-2">
          <div className="w-24 h-24 relative">
            {/* Pie Chart Visualization */}
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="45" fill="transparent" stroke="rgb(var(--theme-accent) / 0.1)" strokeWidth="10" />
              
              {portfolioAssets.map((asset, index) => {
                // Calculate stroke dashoffset based on allocation
                const circumference = 2 * Math.PI * 45;
                const dashArray = circumference;
                const dashOffset = circumference * (1 - asset.allocation / 100);
                
                // Calculate starting position based on previous asset allocations
                let startOffset = 0;
                for (let i = 0; i < index; i++) {
                  startOffset += portfolioAssets[i].allocation;
                }
                const rotationDegrees = (startOffset / 100) * 360;
                
                return (
                  <circle 
                    key={asset.symbol}
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="transparent" 
                    stroke={`rgb(var(--theme-accent) / ${1 - (index * 0.2)})`}
                    strokeWidth="10" 
                    strokeDasharray={dashArray} 
                    strokeDashoffset={dashOffset}
                    style={{ transform: `rotate(${rotationDegrees}deg)`, transformOrigin: 'center' }}
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-[9px] text-theme-accent">Assets</div>
                <div className="text-[10px] font-bold text-theme-text-primary">{assets.length}+</div>
              </div>
            </div>
          </div>
          
          <div className="flex-grow ml-2">
            <table className="w-full text-[9px]">
              <tbody>
                {portfolioAssets.map((asset, index) => (
                  <tr key={index}>
                    <td className="py-0.5">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-1 ${
                          index === 0 ? 'bg-theme-accent' :
                          index === 1 ? 'bg-theme-accent/80' :
                          index === 2 ? 'bg-theme-accent/60' :
                          'bg-theme-accent/40'
                        }`}></div>
                        <span className="font-medium text-theme-text-primary">{asset.symbol}</span>
                      </div>
                    </td>
                    <td className="py-0.5 text-theme-text-secondary">{asset.allocation}%</td>
                    <td className="py-0.5 text-right text-theme-text-secondary">{asset.value}</td>
                    <td className={`py-0.5 text-right ${
                      asset.change.startsWith('+') ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {asset.change}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="text-center mt-auto">
          <button className="text-[10px] bg-theme-accent hover:bg-theme-accent-dark text-theme-bg px-3 py-1 rounded-full">
            Manage Portfolio
          </button>
        </div>
      </div>
    </div>
  );
};

export default PortfolioSnapshot;