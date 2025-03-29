import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';
type ColorScheme = 'default' | 'blue' | 'green' | 'purple' | 'amber' | 'red';

interface ThemeContextType {
  theme: Theme;
  colorScheme: ColorScheme;
  setTheme: (theme: Theme) => void;
  setColorScheme: (colorScheme: ColorScheme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('system');
  const [colorScheme, setColorScheme] = useState<ColorScheme>('default');
  const [isDark, setIsDark] = useState(false);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  const applyTheme = (selectedTheme: Theme) => {
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDarkMode = selectedTheme === 'dark' || (selectedTheme === 'system' && systemDark);
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    setIsDark(isDarkMode);
  };

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const savedColorScheme = localStorage.getItem('colorScheme') as ColorScheme | null;
    
    if (savedTheme) {
      setThemeState(savedTheme);
    }
    
    if (savedColorScheme) {
      setColorScheme(savedColorScheme);
    }
    
    applyTheme(savedTheme || 'system');

    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, colorScheme, setTheme, setColorScheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};