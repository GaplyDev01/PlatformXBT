import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type AlertCondition = 'above' | 'below' | 'percent-change' | 'volume-spike' | 'technical' | 'on-chain';

export interface TechnicalIndicatorParams {
  type: string;
  parameters: Record<string, any>;
  timeframe: string;
  message: string;
}

export interface OnChainMetricParams {
  type: string;
  parameters: Record<string, any>;
  network: string;
  message: string;
}

export interface Alert {
  id: string;
  asset: string;
  condition: AlertCondition;
  value: number;
  active: boolean;
  triggered: boolean;
  createdAt: number;
  triggeredAt?: number;
  repeat?: boolean;
  notificationType: 'app' | 'email' | 'both';
  notes?: string;
  technicalIndicator?: TechnicalIndicatorParams;
  onChainMetric?: OnChainMetricParams;
}

export interface Notification {
  id: string;
  alertId?: string;
  type: 'alert' | 'system' | 'price';
  title: string;
  message: string;
  read: boolean;
  timestamp: number;
  importance: 'low' | 'medium' | 'high';
}

interface AlertContextType {
  alerts: Alert[];
  notifications: Notification[];
  unreadCount: number;
  addAlert: (alert: Omit<Alert, 'id' | 'createdAt' | 'triggered'>) => void;
  updateAlert: (id: string, updates: Partial<Alert>) => void;
  deleteAlert: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;
  deleteAllNotifications: () => void;
  triggerAlert: (alertId: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
};

interface AlertProviderProps {
  children: ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Load alerts and notifications from localStorage on initial render
  useEffect(() => {
    const savedAlerts = localStorage.getItem('userAlerts');
    const savedNotifications = localStorage.getItem('userNotifications');
    
    if (savedAlerts) {
      try {
        setAlerts(JSON.parse(savedAlerts));
      } catch (e) {
        console.error('Error loading alerts from localStorage:', e);
      }
    } else {
      // Set sample data for demonstration
      setAlerts(sampleAlerts);
    }
    
    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications));
      } catch (e) {
        console.error('Error loading notifications from localStorage:', e);
      }
    } else {
      // Set sample data for demonstration
      setNotifications(sampleNotifications);
    }
  }, []);

  // Save alerts and notifications to localStorage when they change
  useEffect(() => {
    if (alerts.length > 0) {
      localStorage.setItem('userAlerts', JSON.stringify(alerts));
    }
  }, [alerts]);

  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('userNotifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  // Calculate unread notifications count
  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  const addAlert = (alert: Omit<Alert, 'id' | 'createdAt' | 'triggered'>) => {
    const newAlert: Alert = {
      ...alert,
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      createdAt: Date.now(),
      triggered: false,
    };
    
    setAlerts(prev => [...prev, newAlert]);
    
    // Add a notification for the new alert
    addNotification({
      type: 'system',
      title: 'New Alert Created',
      message: `Alert for ${alert.asset} ${alert.condition} ${alert.value} has been created.`,
      importance: 'low',
    });
  };

  const updateAlert = (id: string, updates: Partial<Alert>) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === id ? { ...alert, ...updates } : alert
      )
    );
  };

  const deleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'read' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      read: false,
      timestamp: Date.now(),
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const deleteAllNotifications = () => {
    setNotifications([]);
  };

  const triggerAlert = (alertId: string) => {
    // Find the alert
    const alert = alerts.find(a => a.id === alertId);
    
    if (!alert) return;
    
    // Update the alert
    updateAlert(alertId, {
      triggered: true,
      triggeredAt: Date.now(),
      active: alert.repeat ? true : false,
    });
    
    // Add a notification
    addNotification({
      type: 'alert',
      alertId,
      title: 'Alert Triggered',
      message: `Your alert for ${alert.asset} ${alert.condition} ${alert.value} has been triggered.`,
      importance: 'high',
    });
  };

  return (
    <AlertContext.Provider
      value={{
        alerts,
        notifications,
        unreadCount,
        addAlert,
        updateAlert,
        deleteAlert,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        deleteAllNotifications,
        triggerAlert,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};

// Sample data for demonstration
const sampleAlerts: Alert[] = [
  {
    id: 'alert1',
    asset: 'BTC',
    condition: 'above',
    value: 48000,
    active: true,
    triggered: false,
    createdAt: Date.now() - 86400000, // 1 day ago
    notificationType: 'app',
  },
  {
    id: 'alert2',
    asset: 'ETH',
    condition: 'below',
    value: 3000,
    active: true,
    triggered: true,
    createdAt: Date.now() - 172800000, // 2 days ago
    triggeredAt: Date.now() - 7200000, // 2 hours ago
    notificationType: 'both',
  },
  {
    id: 'alert3',
    asset: 'SOL',
    condition: 'percent-change',
    value: 10, // 10% change
    active: true,
    triggered: false,
    createdAt: Date.now() - 259200000, // 3 days ago
    notificationType: 'app',
    notes: 'Watch for breakout',
  },
  {
    id: 'alert4',
    asset: 'Market',
    condition: 'volume-spike',
    value: 200, // 200% increase in volume
    active: true,
    triggered: true,
    createdAt: Date.now() - 345600000, // 4 days ago
    triggeredAt: Date.now() - 18000000, // 5 hours ago
    notificationType: 'app',
  },
];

const sampleNotifications: Notification[] = [
  {
    id: 'notif1',
    alertId: 'alert2',
    type: 'alert',
    title: 'ETH Price Alert',
    message: 'Ethereum price dropped below $3,000',
    read: false,
    timestamp: Date.now() - 7200000, // 2 hours ago
    importance: 'high',
  },
  {
    id: 'notif2',
    alertId: 'alert4',
    type: 'alert',
    title: 'Market Volume Alert',
    message: 'Market trading volume increased by more than 200%',
    read: false,
    timestamp: Date.now() - 18000000, // 5 hours ago
    importance: 'medium',
  },
  {
    id: 'notif3',
    type: 'price',
    title: 'BTC Weekly Analysis',
    message: 'Bitcoin has gained 15% in the past week, breaking key resistance levels.',
    read: true,
    timestamp: Date.now() - 259200000, // 3 days ago
    importance: 'low',
  },
  {
    id: 'notif4',
    type: 'system',
    title: 'New Feature Available',
    message: 'Check out the new portfolio analytics tools in your dashboard.',
    read: true,
    timestamp: Date.now() - 345600000, // 4 days ago
    importance: 'low',
  },
];