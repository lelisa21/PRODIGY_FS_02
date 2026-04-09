// src/context/ThemeContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Use your localStorage hook for persistence
  const [isDarkMode, setIsDarkMode] = useLocalStorage('theme', false);
  const [accentColor, setAccentColor] = useLocalStorage('accentColor', 'amber');
  const [fontSize, setFontSize] = useLocalStorage('fontSize', 'medium');
  const [reducedMotion, setReducedMotion] = useLocalStorage('reducedMotion', false);

  // Apply theme to DOM
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Apply accent color to CSS variables
  useEffect(() => {
    const colorMap = {
  amber: {
    50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d',
    400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309',
    800: '#92400e', 900: '#78350f'
  },
  emerald: {
    50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7',
    400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857',
    800: '#065f46', 900: '#064e3b'
  },
  rose: {
    50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af',
    400: '#fb7185', 500: '#f43f5e', 600: '#e11d48', 700: '#be123c',
    800: '#9f1239', 900: '#881337'
  },
  violet: {
    50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c4b5fd',
    400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9',
    800: '#5b21b6', 900: '#4c1d95'
  },
  sky: {
    50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd', 300: '#7dd3fc',
    400: '#38bdf8', 500: '#0ea5e9', 600: '#0284c8', 700: '#0369a1',
    800: '#075985', 900: '#0c4a6e'
  },
  teal: {
    50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 300: '#5eead4',
    400: '#2dd4bf', 500: '#14b8a6', 600: '#0f766e', 700: '#115e59',
    800: '#134e4a', 900: '#164e63'
  },
  orange: {
    50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74',
    400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c',
    800: '#9a3412', 900: '#7c2d12'
  },
  lime: {
    50: '#f7fee7', 100: '#ecfccb', 200: '#d9f99e', 300: '#bef575',
    400: '#a3e635', 500: '#84cc16', 600: '#65a30d', 700: '#4d7c0f',
    800: '#3f6212', 900: '#365314'
  },
  cyan: {
    50: '#ecfeff', 100: '#cffafe', 200: '#a5f3fc', 300: '#67e8f9',
    400: '#22d3ee', 500: '#06b6d4', 600: '#0891b2', 700: '#0e7490',
    800: '#155e75', 900: '#164e63'
  },
  purple: {
    50: '#faf5ff', 100: '#f3e8ff', 200: '#e9d5ff', 300: '#d8b4fe',
    400: '#c084fc', 500: '#a855f7', 600: '#9333ea', 700: '#7e22ce',
    800: '#6b21a8', 900: '#581c87'
  },
  pink: {
    50: '#fdf2f8', 100: '#fce7f3', 200: '#fbcfe8', 300: '#f9a8d4',
    400: '#f472b6', 500: '#ec4899', 600: '#db2777', 700: '#be185d',
    800: '#9f1239', 900: '#831843'
  },
  indigo: {
    50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc',
    400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca',
    800: '#3730a3', 900: '#312e81'
  },
  fuchsia: {
    50: '#fdf4ff', 100: '#fae8ff', 200: '#f5d0fe', 300: '#f0abfc',
    400: '#e879f9', 500: '#d946ef', 600: '#c026d3', 700: '#a21caf',
    800: '#86198f', 900: '#701a75'
  }
};
    
    const colors = colorMap[accentColor] || colorMap.amber;
    
    Object.entries(colors).forEach(([shade, value]) => {
      document.documentElement.style.setProperty(`--color-primary-${shade}`, value);
    });
    
    document.documentElement.style.setProperty('--primary-color', colors[500]);
  }, [accentColor]);

  useEffect(() => {
    const sizeMap = { small: '14px', medium: '16px', large: '18px' };
    document.documentElement.style.fontSize = sizeMap[fontSize];
  }, [fontSize]);

  useEffect(() => {
    if (reducedMotion) {
      document.documentElement.style.setProperty('--transition-base', '0ms');
      document.documentElement.style.setProperty('--transition-fast', '0ms');
      document.documentElement.style.setProperty('--transition-slow', '0ms');
    } else {
      document.documentElement.style.removeProperty('--transition-base');
      document.documentElement.style.removeProperty('--transition-fast');
      document.documentElement.style.removeProperty('--transition-slow');
    }
  }, [reducedMotion]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const updateAccentColor = (color) => {
    setAccentColor(color);
  };

  const updateFontSize = (size) => {
    setFontSize(size);
  };

  const updateReducedMotion = (value) => {
    setReducedMotion(value);
  };

  return (
    <ThemeContext.Provider value={{
      isDarkMode,
      toggleTheme,
      accentColor,
      updateAccentColor,
      fontSize,
      updateFontSize,
      reducedMotion,
      updateReducedMotion
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
