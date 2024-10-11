import React, { useEffect, useState } from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView, StyleSheet, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';


const SettingsScreen = () => {
  const navigation = useNavigation();
  const { isDarkMode, toggleTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true); // Default to true
  const [timeSelection, setTimeSelection] = useState('AM'); // Default to AM

  const fetchSettings = async () => {
    try {
      // Fetch notifications setting
      const notificationsValue = await AsyncStorage.getItem('notificationsEnabled');
      if (notificationsValue !== null) {
        setNotificationsEnabled(JSON.parse(notificationsValue));
      } else {
        // If no setting exists, ensure it's set to true
        await AsyncStorage.setItem('notificationsEnabled', JSON.stringify(true));
      }

      // Fetch time selection setting
      const timeValue = await AsyncStorage.getItem('notificationTime');
      if (timeValue !== null) {
        setTimeSelection(timeValue);
      }

      // Fetch dark mode setting
      const darkModeValue = await AsyncStorage.getItem('darkMode');
      if (darkModeValue !== null) {
        const shouldBeDarkMode = JSON.parse(darkModeValue);
        // Set the theme if the loaded value is different
        if (shouldBeDarkMode !== isDarkMode) {
          toggleTheme(); // Toggle only if the stored value differs from current theme
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    // Schedule notifications if enabled
    if (notificationsEnabled) {
      scheduleNotification();
    } else {
      clearAllNotifications();
    }
  }, [notificationsEnabled, timeSelection]);

  const scheduleNotification = async () => {
    const currentHour = new Date().getHours();
    const hour = timeSelection === 'AM' ? (currentHour < 12 ? currentHour : currentHour - 12) : (currentHour === 12 ? 12 : currentHour + 12);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Class Reminder',
        body: 'Check your class schedule!',
        sound: 'notification.mp3', // Ensure you have your custom sound set up
      },
      trigger: {
        hour: hour,
        minute: 0,
        repeats: true,
      },
    });
  };

  const clearAllNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  const toggleDarkMode = async () => {
    try {
      // Toggle the theme
      toggleTheme();
      // Save the new state in AsyncStorage
      await AsyncStorage.setItem('darkMode', JSON.stringify(!isDarkMode));
    } catch (error) {
      console.error('Error saving dark mode setting:', error);
    }
  };

  const toggleNotifications = async () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    try {
      // Save the new notifications setting in AsyncStorage
      await AsyncStorage.setItem('notificationsEnabled', JSON.stringify(newValue));
      if (newValue) {
        // If notifications are enabled, set a default time if not already set
        if (!timeSelection) {
          setTimeSelection('AM');
          await AsyncStorage.setItem('notificationTime', 'AM');
        }
      } else {
        clearAllNotifications(); // Clear notifications if turned off
      }
    } catch (error) {
      console.error('Error saving notifications setting:', error);
    }
  };

  const selectTime = async (time) => {
    setTimeSelection(time);
    try {
      // Save the selected time in AsyncStorage
      await AsyncStorage.setItem('notificationTime', time);
    } catch (error) {
      console.error('Error saving notification time:', error);
    }
  };

  const dynamicStyles = styles(isDarkMode);

  return (
    <ScrollView style={dynamicStyles.container}>
      <Text style={dynamicStyles.header}>Settings</Text>

      <View style={dynamicStyles.settingItem}>
        <View style={dynamicStyles.settingTextContainer}>
          <Ionicons name="notifications-outline" size={24} color={isDarkMode ? '#81b0ff' : '#007AFF'} />
          <Text style={dynamicStyles.settingText}>Notifications</Text>
        </View>
        <Switch
          value={notificationsEnabled}
          onValueChange={toggleNotifications}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={notificationsEnabled ? '#007AFF' : '#f4f3f4'}
        />
      </View>

      {notificationsEnabled && (
        <View style={dynamicStyles.timeSelectionContainer}>
          <Text style={dynamicStyles.settingText}>Select Time</Text>
          <View style={dynamicStyles.buttonContainer}>
            <Button
              title="AM"
              onPress={() => selectTime('AM')}
              color={timeSelection === 'AM' ? '#007AFF' : '#ccc'}
            />
            <Button
              title="PM"
              onPress={() => selectTime('PM')}
              color={timeSelection === 'PM' ? '#007AFF' : '#ccc'}
            />
          </View>
        </View>
      )}

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
    textAlign: "center"
  },
  timeSelectionContainer: {
    marginBottom: 20,
    backgroundColor: isDarkMode ? '#1E1E1E' : '#fff',
    padding: 15,
    borderRadius: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});

export default SettingsScreen;
