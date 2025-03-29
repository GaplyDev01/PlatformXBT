import React from 'react';
import { PieChart, TrendingUp, ArrowRight } from 'lucide-react';

export interface Asset {
  symbol: string;
  name: string;
  allocation: number;
  value: string;
  change: string;
}

export interface PortfolioSummaryProps {
  className?: string;
  portfolioValue?: string;
  portfolioChange?: string;
  portfolioChangePercent?: string;
  assets?: Asset[];
  onViewDetails?: () => void;
  onManagePortfolio?: () => void;
}

/**
 * A reusable portfolio summary component displaying asset allocation and performance
 */
const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({
  className = '',
  portfolioValue = '$157,893.45',
  portfolioChange = '+$12,456.78',
  portfolioChangePercent = '+8.56%',
  assets = [
    { symbol: 'BTC', name: 'Bitcoin', allocation: 45, value: '$71,052.05', change: '+3.2%' },
    { symbol: 'ETH', name: 'Ethereum', allocation: 30, value: '$47,368.04', change: '+1.8%' },
    { symbol: 'SOL', name: 'Solana', allocation: 15, value: '$23,684.02', change: '+5.2%' },
    { symbol: 'Others', name: '7 assets', allocation: 10, value: '$15,789.34', change: '-0.4%' }
  ],
  onViewDetails = () => {},
  onManagePortfolio = () => {}
}) => {
  return (
    <div className={`h-full flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-theme-text-primary text-[10px] font-medium flex items-center">
          <PieChart size={14} className="text-theme-accent mr-1" />
          Portfolio Summary
        </div>
        <button 
          onClick={onViewDetails}
          className="text-[9px] text-theme-accent hover:text-theme-accent-dark flex items-center"
        >
          View Details
          <ArrowRight size={10} className="ml-0.5" />
        </button>
      </div>
      
      <div className="bg-theme-accent/10 p-2 rounded-md mb-3">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-[9px] text-theme-accent">Total Value</div>
            <div className="text-sm font-bold text-theme-text-primary">{portfolioValue}</div>
          </div>
          <div className="text-right">
            <div className="text-[9px] text-theme-accent">24h Change</div>
            <div className="flex items-center text-theme-accent">
              <TrendingUp size={10} className="mr-0.5" />
              <span className="text-[10px] font-medium">{portfolioChange} ({portfolioChangePercent})</span>
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <div className="text-[10px] font-medium text-theme-text-primary mb-1">Asset Allocation</div>
        
        <div className="flex mb-2">
          <div className="w-24 h-24 relative">
            {/* Simplified Pie Chart Representation */}
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="45" fill="transparent" stroke="rgb(var(--theme-accent) / 0.1)" strokeWidth="10" />
              {assets.map((asset, index) => {
                // Calculate stroke dashoffset based on allocation
                const circumference = 2 * Math.PI * 45;
                const dashArray = circumference;
                const dashOffset = circumference * (1 - asset.allocation / 100);
                
                // Calculate starting position based on previous asset allocations
                let startOffset = 0;
                for (let i = 0; i < index; i++) {
                  startOffset += assets[i].allocation;
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
                {assets.map((asset, index) => (
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
          <button 
            onClick={onManagePortfolio}
            className="text-[10px] bg-theme-accent hover:bg-theme-accent-dark text-theme-bg px-3 py-1 rounded-full"
          >
            Manage Portfolio
          </button>
        </div>
      </div>
    </div>
  );
};

export default PortfolioSummary; 