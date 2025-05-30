// context/ThemeContext.js
import React, { createContext, useState, useContext } from 'react';
import { StyleSheet } from 'react-native';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDarkMode, theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

const lightTheme = {
  colors: {
    primary: '#007AFF',
    background: '#FFFFFF',
    card: '#F8F8F8',
    text: '#000000',
    border: '#CCCCCC',
    notification: '#FF3B30',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#000',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  itemText: {
    fontSize: 18,
    color: '#000',
  },
  headerStyle: {
    backgroundColor: '#f8f8f8',
  },
  headerTitleStyle: {
    color: '#000',
  },
  bottomNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabText: {
    color: 'black',
    fontSize: 12,
    marginTop: 5,
  },
  sectionTitle: {
    color: '#000',
  },
  developerName: {
    color: '#007bff',
  },
  contactEmail: {
    color: '#d9534f',
  },
  linkText: {
    color: '#007bff',
  },
};

const darkTheme = {
  colors: {
    primary: '#0A84FF',
    background: '#000000',
    card: '#1C1C1E',
    text: '#FFFFFF',
    border: '#38383A',
    notification: '#FF453A',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#333',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#fff',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#666',
  },
  itemText: {
    fontSize: 18,
    color: '#fff',
  },
  headerStyle: {
    backgroundColor: '#333',
  },
  headerTitleStyle: {
    color: '#fff',
  },
  bottomNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingVertical: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabText: {
    color: 'white',
    fontSize: 12,
    marginTop: 5,
  },
  developerName: {
    color: '#1DA1F2',
  },
  contactEmail: {
    color: '#d9534f',
  },
  linkText: {
    color: '#007bff',
  },
};
