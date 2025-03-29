import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import OnboardingManager from './OnboardingManager';
import { useAuth } from '../context/AuthContext';
import { useToken } from '../context/TokenContext';
import CryptoExplorer from './CryptoExplorer';
import ThePath from './ThePath';
import Portfolio from './Portfolio';
import TokenSearch from './common/TokenSearch/TokenSearch';
import { signOut } from '../services/authService';
import Dashboard from './Dashboard';
import Settings from './Settings';
import HelpCommunity from './HelpCommunity';
import TradesXBT from './TradesXBT';
import ThemeToggle from './ThemeToggle';
import Authentication from './Authentication';
import ConnectSupabase from './ConnectSupabase';
import UserMenu from './UserMenu';
import HeaderNotifications from './HeaderNotifications';
import TokenSelectedNotification from './TokenSelectedNotification';
import GooeyMenu from './GooeyMenu';
import StatusBar from './ui/status-bar';
import { 
  LayoutDashboard, 
  Settings as SettingsIcon, 
  MessageSquare, 
  HelpCircle, 
  LogIn,
  Search,
  Briefcase,
  Trophy,
  Bot
} from 'lucide-react';
import { Thread } from '../types/chat';
import { createThread, createMessage } from '../utils/chatUtils';
import { generateEnhancedAIResponse } from '../utils/aiUtils';

const navigationItems = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    path: '/dashboard',
    icon: <LayoutDashboard size={18} />, 
    collapsedIcon: <LayoutDashboard size={20} /> 
  },
  {
    id: 'crypto-explorer',
    label: 'Crypto Explorer',
    path: '/crypto-explorer',
    icon: <Search size={18} />,
    collapsedIcon: <Search size={20} />
  },
  { 
    id: 'xbt-hud', 
    label: 'TradesXBT', 
    path: '/xbt-hud',
    icon: <MessageSquare size={18} />, 
    collapsedIcon: <MessageSquare size={20} /> 
  },
  {
    id: 'path',
    label: 'The Path',
    path: '/path',
    icon: <Trophy size={18} />,
    collapsedIcon: <Trophy size={20} />
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    path: '/portfolio',
    icon: <Briefcase size={18} />,
    collapsedIcon: <Briefcase size={20} />
  },
  { 
    id: 'settings', 
    label: 'Settings', 
    path: '/settings',
    icon: <SettingsIcon size={18} />, 
    collapsedIcon: <SettingsIcon size={20} /> 
  },
  { 
    id: 'help', 
    label: 'Help & Community', 
    path: '/help',
    icon: <HelpCircle size={18} />, 
    collapsedIcon: <HelpCircle size={20} /> 
  }
];
import { useLocation, useNavigate } from 'react-router-dom';

const MainApp: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [threads, setThreads] = useState<Thread[]>([]);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newMessageCount, setNewMessageCount] = useState<number>(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSupabaseConnect] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isHistorySidebarExpanded, setIsHistorySidebarExpanded] = useState(false);
  const { tokenHistory } = useToken();

  useEffect(() => {
    const savedThreads = localStorage.getItem('chatThreads');
    if (savedThreads) {
      try {
        setThreads(JSON.parse(savedThreads));
      } catch (e) {
        console.error('Error loading chat threads from localStorage:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (threads.length > 0) {
      localStorage.setItem('chatThreads', JSON.stringify(threads));
    }
  }, [threads]);

  useEffect(() => {
    if (activeTab === 'xbt-hud' && newMessageCount > 0) {
      setNewMessageCount(0);
    }
  }, [activeTab, newMessageCount]);

  const handleSendMessage = async (message: string, isNewThread: boolean) => {
    if (!message && !isNewThread) return;
    
    setIsProcessing(true);
    console.log('Processing message:', { message, isNewThread });
    
    try {
      if (isNewThread || !currentThreadId) {
        const newThread = createThread(message);
        console.log('Created new thread:', newThread);
        
        setThreads(prevThreads => [...prevThreads, newThread]);
        setCurrentThreadId(newThread.id);
        
        if (message) {
          console.log('Generating AI response for new thread');
          const aiResponse = await generateEnhancedAIResponse(message);
          console.log('Received AI response:', aiResponse);
          
          setThreads(prevThreads => {
            const updatedThreads = prevThreads.map(thread => {
              if (thread.id === newThread.id) {
                return {
                  ...thread,
                  messages: [
                    ...thread.messages,
                    createMessage(aiResponse, 'ai')
                  ],
                  updatedAt: Date.now(),
                  isRead: activeTab === 'xbt-hud'
                };
              }
              return thread;
            });
            return updatedThreads;
          });
          
          if (activeTab !== 'xbt-hud') {
            setNewMessageCount(prev => prev + 1);
          }
        }
      } else {
        console.log('Adding message to existing thread:', currentThreadId);
        
        setThreads(prevThreads => {
          const updatedThreads = prevThreads.map(thread => {
            if (thread.id === currentThreadId) {
              return {
                ...thread,
                messages: [
                  ...thread.messages,
                  createMessage(message, 'user')
                ],
                updatedAt: Date.now()
              };
            }
            return thread;
          });
          return updatedThreads;
        });
        
        console.log('Generating AI response for existing thread');
        const aiResponse = await generateEnhancedAIResponse(message);
        console.log('Received AI response:', aiResponse);
        
        setThreads(prevThreads => {
          const updatedThreads = prevThreads.map(thread => {
            if (thread.id === currentThreadId) {
              return {
                ...thread,
                messages: [
                  ...thread.messages,
                  createMessage(aiResponse, 'ai')
                ],
                updatedAt: Date.now(),
                isRead: activeTab === 'xbt-hud'
              };
            }
            return thread;
          });
          return updatedThreads;
        });
        
        if (activeTab !== 'xbt-hud') {
          setNewMessageCount(prev => prev + 1);
        }
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error processing message:', error);
      return Promise.reject(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectThread = (threadId: string) => {
    setCurrentThreadId(threadId);
    
    setThreads(prevThreads => 
      prevThreads.map(thread => 
        thread.id === threadId ? { ...thread, isRead: true } : thread
      )
    );
  };

  const handleDeleteThread = (threadId: string) => {
    setThreads(prevThreads => prevThreads.filter(thread => thread.id !== threadId));
    if (currentThreadId === threadId) {
      setCurrentThreadId(null);
    }
  };

  const handleUserAuthenticated = () => {
    setShowAuthModal(false);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setThreads([]);
      setCurrentThreadId(null);
      setNewMessageCount(0);
      setActiveTab('dashboard');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'xbt-hud':
        return (
          <TradesXBT 
            threads={threads}
            currentThreadId={currentThreadId}
            onSendMessage={handleSendMessage}
            onSelectThread={handleSelectThread}
            onDeleteThread={handleDeleteThread}
            isProcessing={isProcessing}
          />
        );
      case 'settings':
        return <Settings />;
      case 'help':
        return <HelpCommunity />;
      default:
        return <Dashboard />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-theme-accent"></div>
      </div>
    );
  }

  if (showSupabaseConnect) {
    return (
      <div className="min-h-screen bg-theme-bg p-4">
        <ConnectSupabase />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-bg flex">
      <div 
        className={`fixed left-0 top-0 h-full bg-theme-bg/95 backdrop-blur-sm border-r border-theme-border/50 transition-all duration-500 ease-in-out z-40 flex flex-col ${
          isSidebarExpanded ? 'w-64' : 'w-16'
        }`}
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
      >
        <div className="p-4 border-b border-theme-border/50 flex-shrink-0">
          <div className="flex items-center">
            <div className={`flex items-center justify-center transition-all duration-500 ease-in-out ${isSidebarExpanded ? 'w-8' : 'w-full'}`}>
              <LayoutDashboard size={24} className="text-theme-accent" />
            </div>
            {isSidebarExpanded && (
              <span className="ml-3 font-bold text-theme-text-primary transition-opacity duration-300 ease-in-out">
                TradesXBT
              </span>
            )}
          </div>
        </div>

        <nav className="py-2 flex-grow overflow-y-auto scrollbar-thin select-none">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              className={`w-full flex items-center ${isSidebarExpanded ? 'justify-start px-5' : 'justify-center px-0'} py-3.5 my-0.5 transition-all duration-300 ease-in-out relative group ${
                location.pathname === item.path
                  ? 'bg-theme-accent/20 text-theme-accent after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:w-1 after:h-8 after:bg-theme-accent after:rounded-l-full' 
                  : 'text-theme-text-secondary hover:bg-theme-accent/10 hover:text-theme-accent'
              }`}
              onClick={() => navigate(item.path)}
              title={!isSidebarExpanded ? item.label : undefined}
            >
              <div className={`flex items-center justify-center transition-all duration-300 ease-in-out transform ${isSidebarExpanded ? 'w-6' : 'w-full group-hover:scale-110'}`}>
                {isSidebarExpanded ? item.icon : item.collapsedIcon}
              </div>
              {isSidebarExpanded && (
                <span className="ml-3 font-medium transition-opacity duration-300 ease-in-out">
                  {item.label}
                </span>
              )}
              {item.id === 'xbt-hud' && newMessageCount > 0 && (
                <span className={`${isSidebarExpanded ? 'ml-auto mr-2' : 'absolute top-1.5 right-1.5'} bg-theme-accent text-theme-bg text-xs min-w-5 h-5 flex items-center justify-center px-1.5 rounded-full`}>
                  {newMessageCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-theme-border/50 flex-shrink-0">
          {user ? (
            <div className={`flex items-center ${isSidebarExpanded ? 'justify-start' : 'justify-center'}`}>
              <div className="w-8 h-8 rounded-full bg-theme-accent flex items-center justify-center text-theme-bg flex-shrink-0">
                {user.email?.[0].toUpperCase()}
              </div>
              {isSidebarExpanded && (
                <div className="ml-3 overflow-hidden transition-opacity duration-300 ease-in-out">
                  <div className="text-sm font-medium text-theme-text-primary truncate max-w-[180px]">
                    {user.email}
                  </div>
                  <button 
                    className="text-xs text-red-500 hover:text-red-600"
                    onClick={handleLogout}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              className={`w-full flex items-center justify-center ${isSidebarExpanded ? 'px-4 py-2' : 'p-2'} bg-theme-accent text-theme-bg rounded-lg hover:bg-theme-accent-dark transition-all duration-300 ease-in-out transform hover:scale-105`}
              onClick={() => setShowAuthModal(true)}
              title="Sign In"
            >
              {isSidebarExpanded ? (
                <span>Sign In</span>
              ) : (
                <LogIn size={18} />
              )}
            </button>
          )}
        </div>
      </div>

      <div className={`flex-1 transition-all duration-300 ${isSidebarExpanded ? 'ml-64' : 'ml-16'}`}>
        <div className="p-6 transition-all duration-300 ease-in-out">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-theme-text-primary">
              {navigationItems.find(item => item.path === location.pathname)?.label}
            </h1>

            <div className="flex items-center space-x-4 absolute right-6 top-6">
              <ThemeToggle />
              <HeaderNotifications />
              {user && (
                <UserMenu 
                  user={user}
                  onLogout={handleLogout}
                  onSettings={() => setActiveTab('settings')}
                />
              )}
            </div>
          </div>

          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/crypto-explorer" element={<CryptoExplorer />} />
            <Route path="/xbt-hud" element={<TradesXBT 
              threads={threads}
              currentThreadId={currentThreadId}
              onSendMessage={handleSendMessage}
              onSelectThread={handleSelectThread}
              onDeleteThread={handleDeleteThread}
              isProcessing={isProcessing}
            />} />
            <Route path="/path" element={<ThePath />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/help" element={<HelpCommunity />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
      
      {/* Token History Sidebar */}
      <div 
        className={`fixed right-0 top-1/2 -translate-y-1/2 bg-theme-bg transition-all duration-300 z-30 flex flex-col items-center ${
          isHistorySidebarExpanded ? 'w-16 h-full border-l border-theme-border' : 'w-2 h-32 rounded-l-lg'
        }`}
        onMouseEnter={() => setIsHistorySidebarExpanded(true)}
        onMouseLeave={() => setIsHistorySidebarExpanded(false)}
      >
        {/* Tab indicator when collapsed */}
        {!isHistorySidebarExpanded && (
          <div className="absolute left-0 top-0 w-full h-full bg-theme-accent/20 rounded-l-lg cursor-pointer">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-12 bg-theme-accent/40"></div>
          </div>
        )}

        {isHistorySidebarExpanded && tokenHistory.length > 0 && (
          <>
            <div className="p-2 border-b border-theme-border w-full flex justify-center">
              <div className="w-10 h-10 rounded-full bg-theme-accent/20 flex items-center justify-center">
                <span className="text-xs font-bold text-theme-accent">
                  {tokenHistory.length}
                </span>
              </div>
            </div>
        
            <div className="flex-grow py-2 flex flex-col items-center space-y-2 overflow-y-auto scrollbar-thin pb-4 w-full">
              {tokenHistory.map((item) => (
                <div
                  key={item.token.id}
                  className="relative group w-full"
                  title={`${item.token.name} (${item.token.symbol.toUpperCase()})`}
                >
                  <div className="flex items-center justify-center p-2 hover:bg-theme-accent/10 cursor-pointer">
                    {item.token.thumb ? (
                      <img
                        src={item.token.thumb}
                        alt={item.token.name}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-theme-accent/10 text-theme-accent">
                        {item.token.symbol.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <StatusBar isSidebarExpanded={isSidebarExpanded} />
      
      <TokenSelectedNotification autoHide={true} />

      <Authentication 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        onAuthenticated={handleUserAuthenticated}
      />
    </div>
  );
};

export default MainApp;