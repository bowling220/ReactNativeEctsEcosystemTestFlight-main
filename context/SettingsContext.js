import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from './ThemeContext';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const { isDarkMode } = useTheme();
  const [settings, setSettings] = useState({
    fontSize: 'medium',
    dataSaverEnabled: false,
  });

  // Load settings when the app starts
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.multiGet([
        'fontSize',
        'dataSaverEnabled',
      ]);
      
      const newSettings = {};
      savedSettings.forEach(([key, value]) => {
        if (value !== null) {
          newSettings[key] = JSON.parse(value);
        }
      });
      
      setSettings(prev => ({ ...prev, ...newSettings }));
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  // Update a specific setting
  const updateSetting = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      setSettings(prev => ({ ...prev, [key]: value }));
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  };

  // Get font size multiplier based on setting
  const getFontSizeMultiplier = () => {
    switch (settings.fontSize) {
      case 'small':
        return 0.9;
      case 'large':
        return 1.2;
      default:
        return 1;
    }
  };

  // Get image quality based on data saver setting
  const getImageQuality = () => {
    return settings.dataSaverEnabled ? 'low' : 'high';
  };

  const value = {
    settings,
    updateSetting,
    getFontSizeMultiplier,
    getImageQuality,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}; 