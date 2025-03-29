import React, { useState } from 'react';
import CanonicalLink from './CanonicalLink';
import { PortfolioSnapshot } from './ui';
import { Briefcase, ArrowRight, TrendingUp, TrendingDown, Wallet, XCircle, CheckCircle, Loader, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';
import { isValidBlockchainAddress } from '../utils/blockchainUtils';

const Portfolio: React.FC = () => {
  const { importFromPublicKey, isImporting, isRealData, connectedAddress, dailyChangePercent } = usePortfolio();
  const [publicKey, setPublicKey] = useState('');
  const [detectedBlockchain, setDetectedBlockchain] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleImport = async () => {
    if (!publicKey.trim() || !isValidBlockchainAddress(publicKey.trim())) {
      setNotification({
        type: 'error',
        message: 'Please enter a valid wallet address'
      });
      return;
    }

    const result = await importFromPublicKey(publicKey.trim());
    
    if (result.success && result.blockchain) {
      setDetectedBlockchain(result.blockchain);
    }
    
    setNotification({
      type: result.success ? 'success' : 'error',
      message: result.message
    });
    
    // Clear notification after 5 seconds
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  return (
    <>
      <CanonicalLink path="/portfolio" />
      <div className="space-y-4">
        <div className="bg-theme-bg bg-opacity-70 backdrop-blur-sm rounded-lg shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
            <div className="mb-4 sm:mb-0">
              <h2 className="text-xl font-bold text-theme-text-primary flex items-center">
                <Briefcase size={24} className="mr-2 text-theme-accent" />
                Portfolio Management
              </h2>
              <p className="text-sm text-theme-accent">Track and analyze your investments</p>
            </div>
            <button className="flex items-center px-4 py-2 bg-theme-accent text-theme-bg rounded-lg hover:bg-theme-accent-dark transition-colors">
              <TrendingUp size={16} className="mr-2" />
              Add Transaction
            </button>
          </div>

          {/* Import Portfolio Section */}
          <div className="mb-6 bg-theme-accent/5 p-4 rounded-lg border border-theme-border">
            <h3 className="text-md font-medium text-theme-text-primary mb-3 flex items-center">
              <Wallet size={18} className="mr-2 text-theme-accent" />
              Import Portfolio from Blockchain
            </h3>
            
            {notification && (
              <div className={`mb-3 p-3 rounded-lg flex items-center ${
                notification.type === 'success' 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {notification.type === 'success' ? (
                  <CheckCircle size={16} className="mr-2" />
                ) : (
                  <XCircle size={16} className="mr-2" />
                )}
                <span className="text-sm">{notification.message}</span>
              </div>
            )}
            
            {isRealData && connectedAddress && (
              <div className="mb-3 p-3 rounded-lg flex items-center bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                <CheckCircle size={16} className="mr-2" />
                <span className="text-sm">
                  Connected to address: {connectedAddress.substring(0, 6)}...{connectedAddress.substring(connectedAddress.length - 4)}
                  {detectedBlockchain && ` (${detectedBlockchain.charAt(0).toUpperCase() + detectedBlockchain.slice(1)})`}
                </span>
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-xs text-theme-text-secondary mb-1">
                  Public Key / Wallet Address
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={publicKey}
                    onChange={(e) => setPublicKey(e.target.value)}
                    placeholder="Enter your wallet address (blockchain will be auto-detected)"
                    className="w-full p-2 bg-theme-bg border border-theme-border rounded-md text-sm text-theme-text-primary focus:outline-none focus:ring-1 focus:ring-theme-accent focus:border-theme-accent"
                    disabled={isImporting}
                  />
                  {publicKey.trim() && !isValidBlockchainAddress(publicKey.trim()) && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                      <AlertCircle size={16} />
                    </div>
                  )}
                </div>
                <p className="text-xs text-theme-text-secondary mt-1">
                  Supported chains: Ethereum, Bitcoin, Solana, Polkadot (auto-detected from address format)
                </p>
              </div>
              
              <div>
                <button
                  onClick={handleImport}
                  disabled={isImporting || !publicKey.trim() || !isValidBlockchainAddress(publicKey.trim())}
                  className={`w-full flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${
                    isImporting || !publicKey.trim() || !isValidBlockchainAddress(publicKey.trim())
                      ? 'bg-theme-accent/50 text-theme-bg/50 cursor-not-allowed'
                      : 'bg-theme-accent text-theme-bg hover:bg-theme-accent-dark'
                  }`}
                >
                  {isImporting ? (
                    <>
                      <Loader size={16} className="mr-2 animate-spin" />
                      Importing Portfolio...
                    </>
                  ) : (
                    <>
                      <Wallet size={16} className="mr-2" />
                      Import Portfolio
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Portfolio Overview */}
            <div className="lg:col-span-2">
              <PortfolioSnapshot />
            </div>
            
            {/* Quick Actions */}
            <div className="space-y-4">
              <div className="bg-theme-accent/10 rounded-lg p-4 border border-theme-border">
                <h3 className="text-sm font-medium text-theme-text-primary mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full flex items-center justify-between p-3 bg-theme-bg rounded-lg hover:bg-theme-accent/5 transition-colors">
                    <span className="text-sm text-theme-text-primary">Add New Asset</span>
                    <ArrowRight size={16} className="text-theme-accent" />
                  </button>
                  <button className="w-full flex items-center justify-between p-3 bg-theme-bg rounded-lg hover:bg-theme-accent/5 transition-colors">
                    <span className="text-sm text-theme-text-primary">Import Portfolio</span>
                    <ArrowRight size={16} className="text-theme-accent" />
                  </button>
                  <button className="w-full flex items-center justify-between p-3 bg-theme-bg rounded-lg hover:bg-theme-accent/5 transition-colors">
                    <span className="text-sm text-theme-text-primary">Connect Exchange</span>
                    <ArrowRight size={16} className="text-theme-accent" />
                  </button>
                </div>
              </div>
              
              <div className="bg-theme-accent/10 rounded-lg p-4 border border-theme-border">
                <h3 className="text-sm font-medium text-theme-text-primary mb-3">Performance</h3>
                <div className="space-y-3">
                  {isRealData ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-theme-text-secondary">24h Change</span>
                        <span className={`text-sm ${dailyChangePercent >= 0 ? 'text-green-500' : 'text-red-500'} flex items-center`}>
                          {dailyChangePercent >= 0 ? (
                            <TrendingUp size={14} className="mr-1" />
                          ) : (
                            <TrendingDown size={14} className="mr-1" />
                          )}
                          {dailyChangePercent >= 0 ? '+' : ''}{dailyChangePercent.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-theme-text-secondary">Weekly Performance</span>
                        <span className="text-sm text-theme-text-primary">
                          See Advanced View
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-theme-text-secondary">Monthly Performance</span>
                        <span className="text-sm text-theme-text-primary">
                          See Advanced View
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-theme-text-secondary">24h Change</span>
                        <span className="text-sm text-green-500 flex items-center">
                          <TrendingUp size={14} className="mr-1" />
                          +2.45%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-theme-text-secondary">7d Change</span>
                        <span className="text-sm text-red-500 flex items-center">
                          <TrendingDown size={14} className="mr-1" />
                          -1.23%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-theme-text-secondary">30d Change</span>
                        <span className="text-sm text-green-500 flex items-center">
                          <TrendingUp size={14} className="mr-1" />
                          +8.67%
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-theme-text-primary">Portfolio</h1>
          <div className="flex justify-between items-center">
            <p className="text-theme-text-secondary">Manage and track your crypto assets</p>
            
            {/* Add link to Advanced Portfolio */}
            <Link 
              to="/advanced-portfolio" 
              className="flex items-center text-theme-accent hover:text-theme-accent-hover"
            >
              <span className="mr-1">Advanced Multi-Chain View</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Portfolio;