import React, { useEffect, useState } from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView, StyleSheet, Button, Alert } from 'react-native'; // Import Alert here
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as Notifications from 'expo-notifications';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { isDarkMode, toggleTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [timeSelection, setTimeSelection] = useState('PM'); // Default to PM

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedNotificationsEnabled = await AsyncStorage.getItem('notificationsEnabled');
        const savedTimeSelection = await AsyncStorage.getItem('notificationTime');

        if (savedNotificationsEnabled !== null) {
          setNotificationsEnabled(JSON.parse(savedNotificationsEnabled));
        }
        if (savedTimeSelection) {
          setTimeSelection(savedTimeSelection);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, []);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const { data } = response.notification.request.content;
      navigation.navigate('DailyDiscussion', { data });
    });

    return () => subscription.remove(); 
  }, [navigation]);

  const generateNotificationDates = () => {
    const notificationDates = [];
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 30); 

    for (let d = new Date(today); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      if (dayOfWeek >= 1 && dayOfWeek <= 5) { 
        notificationDates.push(new Date(d)); 
      }
    }

    return notificationDates;
  };

  const scheduleNotifications = async (dates) => {
    const hour = timeSelection === 'AM' ? 8 : 13; 
    const minute = timeSelection === 'AM' ? 0 : 38; 

    const now = new Date();

    for (const date of dates) {
      const notificationDate = new Date(date);
      notificationDate.setHours(hour);
      notificationDate.setMinutes(minute);
      notificationDate.setSeconds(0); 

      if (notificationDate > now) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Reminder',
            body: 'Do Your Daily Discussion!',
            data: {
              someKey: 'someValue',
            },
          },
          trigger: notificationDate,
        });
      }
    }
  };

  const clearAllNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  const resetNotifications = async () => {
    try {
      await clearAllNotifications(); 
      const notificationDates = generateNotificationDates(); 
      await scheduleNotifications(notificationDates); 
    } catch (error) {
      console.error("Error during reset:", error);
    }
  };

  useEffect(() => {
    if (notificationsEnabled) {
      resetNotifications(); 
    } else {
      clearAllNotifications(); 
    }
  }, [notificationsEnabled, timeSelection]);

  const toggleNotifications = async () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    await AsyncStorage.setItem('notificationsEnabled', JSON.stringify(newValue));
    
    if (newValue) {
        resetNotifications(); 
    } else {
        clearAllNotifications(); 
    }
  };

  const selectTime = async (time) => {
    setTimeSelection(time);
    await AsyncStorage.setItem('notificationTime', time);
    if (notificationsEnabled) {
        resetNotifications(); 
    }
  };

  const showComingSoonAlert = () => {
    Alert.alert('Coming Soon', 'The Teams Channel feature is in the working. Stay tuned!', [{ text: 'OK' }]);
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
          onValueChange={toggleTheme}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isDarkMode ? '#007AFF' : '#f4f3f4'}
        />
      </View>

      <TouchableOpacity
        style={dynamicStyles.settingItem}
        onPress={() => navigation.navigate('About')}
      >
        <View style={dynamicStyles.settingTextContainer}>
          <Ionicons name="information-circle-outline" size={24} color={isDarkMode ? '#81b0ff' : '#007AFF'} />
          <Text style={dynamicStyles.settingText}>About</Text>
        </View>
        <Ionicons name="chevron-forward-outline" size={20} color={isDarkMode ? '#81b0ff' : '#007AFF'} />
      </TouchableOpacity>

      <TouchableOpacity
  style={dynamicStyles.settingItem}
  onPress={showComingSoonAlert}
>
  <View style={dynamicStyles.underConstructionItem}>
    <View style={dynamicStyles.settingTextContainer}>
    <Ionicons name="people-outline" size={24} color={isDarkMode ? '#FFD700' : '#000'} /> 
    <Text style={dynamicStyles.underConstructionText}>Teams Channel (COMING SOON)</Text>
    </View>
  </View>
  <Ionicons 
    name="chevron-forward-outline" 
    size={20} 
    color={isDarkMode ? '#FFD700' : '#000'} 
  />
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
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 15,
  },
  settingTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 18,
    marginLeft: 10,
    color: isDarkMode ? '#fff' : '#000',
  },
  timeSelectionContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  underConstructionItem: {
    backgroundColor: isDarkMode ? '#1E1E1E' : '#e0e0e0', // Ensure this is set correctly
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 0,
  },
  underConstructionText: {
    fontSize: 18,
    color: isDarkMode ? '#FFD700' : '#000', 
    marginLeft: 10,
  },
  
});

export default SettingsScreen;
