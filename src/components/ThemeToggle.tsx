import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Laptop } from 'lucide-react';

const ThemeToggle: React.FC = () => {
  const { theme, setTheme, isDark } = useTheme();

  return (
    <div className="flex items-center space-x-1 bg-theme-bg border border-theme-border rounded-full p-1 relative z-50">
      <button
        className={`p-1.5 rounded-full ${theme === 'light' ? 'bg-theme-accent text-theme-bg' : 'text-theme-text-secondary hover:text-theme-text-primary'}`}
        onClick={() => setTheme('light')}
        title="Light mode"
        type="button"
      >
        <Sun size={14} />
      </button>
      <button
        className={`p-1.5 rounded-full ${theme === 'dark' ? 'bg-theme-accent text-theme-bg' : 'text-theme-text-secondary hover:text-theme-text-primary'}`}
        onClick={() => setTheme('dark')}
        title="Dark mode"
        type="button"
      >
        <Moon size={14} />
      </button>
      <button
        className={`p-1.5 rounded-full ${theme === 'system' ? 'bg-theme-accent text-theme-bg' : 'text-theme-text-secondary hover:text-theme-text-primary'}`}
        onClick={() => setTheme('system')}
        title="System preference"
        type="button"
      >
        <Laptop size={14} />
      </button>
    </div>
  );
};

export default ThemeToggle;