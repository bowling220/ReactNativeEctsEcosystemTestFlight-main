import React, { useEffect, useState } from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { isDarkMode, toggleTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Sync settings with AsyncStorage
  const fetchSettings = async () => {
    try {
      const notificationsValue = await AsyncStorage.getItem('notificationsEnabled');
      if (notificationsValue !== null) setNotificationsEnabled(JSON.parse(notificationsValue));

      const darkModeValue = await AsyncStorage.getItem('darkMode');
      if (darkModeValue !== null && JSON.parse(darkModeValue) !== isDarkMode) toggleTheme();
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const toggleDarkMode = async () => {
    try {
      toggleTheme();
      await AsyncStorage.setItem('darkMode', JSON.stringify(!isDarkMode));
    } catch (error) {
      console.error('Error saving dark mode setting:', error);
    }
  };

  const dynamicStyles = styles(isDarkMode);

  return (
    <ScrollView style={dynamicStyles.container}>
      <Text style={dynamicStyles.header}>Settings</Text>

      <View style={dynamicStyles.settingItem}>
        <View style={dynamicStyles.settingTextContainer}>
          <Ionicons name="moon-outline" size={24} color={isDarkMode ? '#81b0ff' : '#007AFF'} />
          <Text style={dynamicStyles.settingText}>Dark Mode</Text>
        </View>
        <Switch
          value={isDarkMode}
          onValueChange={toggleDarkMode}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isDarkMode ? '#007AFF' : '#f4f3f4'}
        />
      </View>

      <TouchableOpacity style={dynamicStyles.settingItem} onPress={() => navigation.navigate('About')}>
        <View style={dynamicStyles.settingTextContainer}>
          <Ionicons name="information-circle-outline" size={24} color={isDarkMode ? '#81b0ff' : '#007AFF'} />
          <Text style={dynamicStyles.settingText}>About</Text>
        </View>
        <Ionicons name="chevron-forward-outline" size={20} color={isDarkMode ? '#81b0ff' : '#007AFF'} />
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = (isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDarkMode ? '#121212' : '#F8F8F8',
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 20,
    color: isDarkMode ? '#fff' : '#000',
  },
  settingItem: {
    backgroundColor: isDarkMode ? '#1E1E1E' : '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  settingTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 18,
    fontWeight: '500',
    color: isDarkMode ? '#fff' : '#000',
  },
});

export default SettingsScreen;
