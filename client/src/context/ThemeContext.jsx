import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  const [isDarkMode, setIsDarkMode] = useState(theme === 'dark');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    // Apply theme colors to meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        theme === 'dark' ? '#1f1f2a' : '#f9a155'
      );
    }
    
    setIsDarkMode(theme === 'dark');
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, [setTheme]);

  const setLightTheme = useCallback(() => {
    setTheme('light');
  }, [setTheme]);

  const setDarkTheme = useCallback(() => {
    setTheme('dark');
  }, [setTheme]);

  const value = useMemo(() => ({
    theme,
    isDarkMode,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
  }), [theme, isDarkMode, toggleTheme, setLightTheme, setDarkTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
