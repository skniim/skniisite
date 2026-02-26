import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = {
  primary: string;
  secondary: string;
  accent: string;
  taskbarPosition: 'top' | 'bottom';
  crtEnabled: boolean;
  showDesktopIcons: boolean;
  starColor: string;
  starDirection: 'up' | 'down' | 'left' | 'right' | 'towards' | 'away';
  starSpeed: number;
};

type ThemeContextType = {
  theme: Theme;
  updateTheme: (updates: Partial<Theme>) => void;
};

const defaultTheme: Theme = {
  primary: '#05d9e8',   // Cyan
  secondary: '#ff2a6d', // Pink
  accent: '#bd00ff',    // Purple
  taskbarPosition: 'top',
  crtEnabled: true,
  showDesktopIcons: false,
  starColor: '#ffffff',
  starDirection: 'down',
  starSpeed: 1,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('sknii-theme');
    if (saved) {
      return { ...defaultTheme, ...JSON.parse(saved) };
    }
    return defaultTheme;
  });

  useEffect(() => {
    localStorage.setItem('sknii-theme', JSON.stringify(theme));
  }, [theme]);

  const updateTheme = (updates: Partial<Theme>) => {
    setTheme(prev => ({ ...prev, ...updates }));
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme }}>
      <div 
        style={{ 
          //@ts-ignore
          '--color-primary': theme.primary,
          '--color-secondary': theme.secondary,
          '--color-accent': theme.accent,
        }}
        className="contents"
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
