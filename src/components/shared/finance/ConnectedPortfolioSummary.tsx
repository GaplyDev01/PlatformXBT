import React from 'react';
import { useNavigate } from 'react-router-dom';
import PortfolioSummary, { Asset } from './PortfolioSummary';
import { usePortfolio } from '../../../context/PortfolioContext';

/**
 * Connected version of the PortfolioSummary component that uses data from PortfolioContext
 */
const ConnectedPortfolioSummary: React.FC<{ className?: string }> = ({ className = '' }) => {
  const navigate = useNavigate();
  const { assets, totalValue, dailyChange, dailyChangePercent } = usePortfolio();
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };
  
  const calculateAllocations = (): Asset[] => {
    if (assets.length === 0) return [];
    
    // Calculate total portfolio value
    const totalPortfolioValue = assets.reduce((sum, asset) => sum + asset.quantity * asset.currentPrice, 0);
    
    // Calculate allocations for each asset
    const assetsWithAllocations = assets.slice(0, 3).map(asset => {
      const value = asset.quantity * asset.currentPrice;
      const allocation = (value / totalPortfolioValue) * 100;
      
      // Calculate 24h change percentage
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
        change: '+0.0%' // Placeholder
      });
    }
    
    return assetsWithAllocations;
  };
  
  const formattedPortfolioValue = formatCurrency(totalValue);
  const formattedPortfolioChange = `${dailyChange >= 0 ? '+' : ''}${formatCurrency(dailyChange)}`;
  const formattedPortfolioChangePercent = `${dailyChangePercent >= 0 ? '+' : ''}${dailyChangePercent.toFixed(2)}%`;
  
  const handleViewDetails = () => {
    navigate('/portfolio/advanced');
  };
  
  const handleManagePortfolio = () => {
    navigate('/portfolio');
  };
  
  return (
    <PortfolioSummary
      className={className}
      portfolioValue={formattedPortfolioValue}
      portfolioChange={formattedPortfolioChange}
      portfolioChangePercent={formattedPortfolioChangePercent}
      assets={calculateAllocations()}
      onViewDetails={handleViewDetails}
      onManagePortfolio={handleManagePortfolio}
    />
  );
};

export default ConnectedPortfolioSummary; 