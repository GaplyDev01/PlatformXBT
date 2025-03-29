import React, { useState, useMemo } from 'react';
import { ArrowLeft, PieChart, BarChart2, Wallet, Download, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePortfolio } from '../../context/PortfolioContext';

interface AdvancedPortfolioProps {
  className?: string;
}

/**
 * Advanced portfolio component that provides cross-blockchain asset overview
 */
const AdvancedPortfolio: React.FC<AdvancedPortfolioProps> = ({
  className = ''
}) => {
  const [view, setView] = useState<'chart' | 'list'>('chart');
  const { assets, totalValue, isRealData, connectedAddress } = usePortfolio();
  
  // Group assets by blockchain
  const portfolioData = useMemo(() => {
    if (assets.length === 0) return [];
    
    // Group assets by blockchain
    const groupedAssets: Record<string, typeof assets> = {};
    
    assets.forEach(asset => {
      if (!groupedAssets[asset.blockchain]) {
        groupedAssets[asset.blockchain] = [];
      }
      groupedAssets[asset.blockchain].push(asset);
    });
    
    // Format the data
    return Object.entries(groupedAssets).map(([chain, chainAssets]) => {
      return {
        chain,
        assets: chainAssets.map(asset => {
          const valueUsd = asset.quantity * asset.currentPrice;
          const percentage = (valueUsd / totalValue) * 100;
          const priceChangePercentage = ((asset.currentPrice - asset.purchasePrice) / asset.purchasePrice) * 100;
          
          return {
            symbol: asset.symbol,
            name: asset.name,
            balance: asset.quantity,
            valueUsd,
            percentage,
            priceChangePercentage
          };
        })
      };
    });
  }, [assets, totalValue]);
  
  // Get all assets flat, sorted by value
  const allAssets = useMemo(() => {
    const result = portfolioData.flatMap(chain => 
      chain.assets.map(asset => ({ ...asset, chain: chain.chain }))
    );
    return [...result].sort((a, b) => b.valueUsd - a.valueUsd);
  }, [portfolioData]);

  if (assets.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-4 bg-theme-bg border border-theme-border rounded-lg p-4">
          <div className="flex items-center">
            <Link to="/portfolio" className="p-2 mr-3 rounded-lg hover:bg-theme-accent/10">
              <ArrowLeft className="w-5 h-5 text-theme-accent" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-theme-text-primary">Advanced Portfolio</h1>
              <p className="text-sm text-theme-text-secondary">
                Cross-blockchain asset management
              </p>
            </div>
          </div>
        </div>
        
        {/* Empty state */}
        <div className="bg-theme-bg border border-theme-border rounded-lg p-8 text-center">
          <Wallet className="w-12 h-12 text-theme-accent/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-theme-text-primary mb-2">No Portfolio Data</h3>
          <p className="text-theme-text-secondary mb-4">
            Import your portfolio data in the Portfolio section to see your assets here.
          </p>
          <Link to="/portfolio" className="inline-flex items-center bg-theme-accent hover:bg-theme-accent-dark text-theme-bg px-4 py-2 rounded-lg transition-colors">
            Go to Portfolio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4 bg-theme-bg border border-theme-border rounded-lg p-4">
        <div className="flex items-center">
          <Link to="/portfolio" className="p-2 mr-3 rounded-lg hover:bg-theme-accent/10">
            <ArrowLeft className="w-5 h-5 text-theme-accent" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-theme-text-primary">Advanced Portfolio</h1>
            <p className="text-sm text-theme-text-secondary">
              Cross-blockchain asset management
              {isRealData && (
                <span className="ml-2 text-xs bg-green-500 text-white px-1 py-0.5 rounded">LIVE</span>
              )}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button 
            className={`p-2 rounded-lg ${view === 'chart' ? 'bg-theme-accent/20' : 'hover:bg-theme-accent/10'}`} 
            title="Chart View"
            onClick={() => setView('chart')}
          >
            <PieChart className="w-5 h-5 text-theme-accent" />
          </button>
          <button 
            className={`p-2 rounded-lg ${view === 'list' ? 'bg-theme-accent/20' : 'hover:bg-theme-accent/10'}`} 
            title="List View"
            onClick={() => setView('list')}
          >
            <BarChart2 className="w-5 h-5 text-theme-accent" />
          </button>
          <button className="p-2 rounded-lg hover:bg-theme-accent/10" title="Refresh">
            <RefreshCw className="w-5 h-5 text-theme-accent" />
          </button>
          <button className="p-2 rounded-lg hover:bg-theme-accent/10" title="Export Data">
            <Download className="w-5 h-5 text-theme-accent" />
          </button>
        </div>
      </div>
      
      {/* Portfolio Summary */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="bg-theme-bg border border-theme-border rounded-lg p-4 flex-grow">
          <div className="flex items-center mb-3">
            <Wallet className="w-4 h-4 text-theme-accent mr-2" />
            <h3 className="text-theme-text-primary font-medium">Portfolio Value</h3>
          </div>
          <div className="text-2xl font-bold text-theme-text-primary">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div className="text-sm text-theme-text-secondary mt-1">
            Across {portfolioData.length} blockchains
            {isRealData && connectedAddress && (
              <div className="text-xs text-theme-text-secondary mt-1 truncate" title={connectedAddress}>
                {connectedAddress.substring(0, 6)}...{connectedAddress.substring(connectedAddress.length - 4)}
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 flex-grow">
          {portfolioData.map((chain, index) => (
            <div key={index} className="bg-theme-bg border border-theme-border rounded-lg p-4">
              <h3 className="text-theme-text-primary font-medium mb-2">{chain.chain}</h3>
              <div className="text-lg font-medium text-theme-text-primary">
                ${chain.assets.reduce((sum, asset) => sum + asset.valueUsd, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-theme-text-secondary mt-1">{chain.assets.length} assets</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Portfolio Content */}
      <div className="bg-theme-bg border border-theme-border rounded-lg p-4">
        {view === 'chart' ? (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Pie Chart */}
            <div className="md:w-1/2 relative">
              <div className="aspect-square relative flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-8 border-theme-bg"></div>
                
                {/* Chart segments - simple representation */}
                {allAssets.map((asset, index) => {
                  const startAngle = allAssets.slice(0, index).reduce((sum, a) => sum + a.percentage, 0) * 3.6;
                  const endAngle = startAngle + asset.percentage * 3.6;
                  
                  // Color based on index, with a fallback pattern
                  const getColor = (idx: number) => {
                    const colors = ['bg-blue-500/80', 'bg-green-500/80', 'bg-yellow-500/80', 'bg-purple-500/80', 
                                   'bg-pink-500/80', 'bg-indigo-500/80', 'bg-red-500/80', 'bg-orange-500/80'];
                    return colors[idx % colors.length];
                  };
                  
                  // Mock pie chart segments with colored divs
                  return (
                    <div 
                      key={index}
                      className={`absolute inset-0 rounded-full border-[30px] ${getColor(index)}`}
                      style={{
                        clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos(endAngle * Math.PI / 180)}% ${50 - 50 * Math.sin(endAngle * Math.PI / 180)}%)`
                      }}
                    ></div>
                  );
                })}
                
                {/* Inner circle */}
                <div className="w-3/5 h-3/5 rounded-full bg-theme-bg flex flex-col items-center justify-center z-10">
                  <div className="text-xl font-bold text-theme-text-primary">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                  <div className="text-xs text-theme-text-secondary">Total Value</div>
                </div>
              </div>
            </div>
            
            {/* Legend */}
            <div className="md:w-1/2">
              <h3 className="text-theme-text-primary font-medium mb-3">Asset Allocation</h3>
              <div className="space-y-3">
                {allAssets.map((asset, index) => {
                  // Color helper function
                  const getColorClass = (idx: number) => {
                    const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500',
                                   'bg-pink-500', 'bg-indigo-500', 'bg-red-500', 'bg-orange-500'];
                    return colors[idx % colors.length];
                  };
                  
                  return (
                    <div key={index} className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${getColorClass(index)} mr-2`}></div>
                      <div className="flex-grow">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-theme-text-primary">
                            {asset.symbol} <span className="text-theme-text-secondary font-normal">({asset.chain})</span>
                          </span>
                          <span className="text-sm text-theme-text-primary">${asset.valueUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-theme-text-secondary">{asset.balance.toLocaleString('en-US', { minimumFractionDigits: asset.balance < 1 ? 4 : 2 })} {asset.symbol}</span>
                          <span className="text-xs text-theme-text-secondary">{asset.percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-theme-text-secondary border-b border-theme-border">
                  <th className="pb-2 font-medium">Asset</th>
                  <th className="pb-2 font-medium">Chain</th>
                  <th className="pb-2 font-medium">Balance</th>
                  <th className="pb-2 font-medium">Value</th>
                  <th className="pb-2 font-medium">% of Portfolio</th>
                  <th className="pb-2 font-medium">24h Change</th>
                </tr>
              </thead>
              <tbody>
                {allAssets.map((asset, index) => (
                  <tr key={index} className="border-b border-theme-border/50 hover:bg-theme-accent/5">
                    <td className="py-3 font-medium">{asset.name} ({asset.symbol})</td>
                    <td className="py-3">{asset.chain}</td>
                    <td className="py-3">{asset.balance.toLocaleString('en-US', { minimumFractionDigits: asset.balance < 1 ? 6 : 2 })}</td>
                    <td className="py-3">${asset.valueUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="py-3">{asset.percentage.toFixed(1)}%</td>
                    <td className="py-3">
                      <span className={`${asset.priceChangePercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {asset.priceChangePercentage >= 0 ? '+' : ''}{asset.priceChangePercentage.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedPortfolio; 