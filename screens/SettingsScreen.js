import React, { useState, useEffect } from 'react';
import { View, Button, Text, Switch, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as Notifications from 'expo-notifications';
import * as AuthSession from 'expo-auth-session';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext'; // Assuming you have a theme context

// Microsoft Authentication configuration
const CLIENT_ID = "1d8c6008-5546-4d89-8557-d8c134ee79cc"; // Replace with your Azure app's Client ID
const REDIRECT_URI = AuthSession.makeRedirectUri({
  useProxy: true,
});
const AUTHORITY = "https://login.microsoftonline.com/e34fd78b-f48d-4235-9787-fef76723be14";
const GRAPH_ENDPOINT = "https://graph.microsoft.com/";

const discovery = {
  authorizationEndpoint: `${AUTHORITY}/oauth2/v2.0/authorize`,
  tokenEndpoint: `${AUTHORITY}/oauth2/v2.0/token`,
  revocationEndpoint: `${AUTHORITY}/oauth2/v2.0/logout`,
};

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { isDarkMode, toggleTheme } = useTheme(); // Assuming you have a theme context
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [timeSelection, setTimeSelection] = useState('PM');
  const [userInfo, setUserInfo] = useState(null);
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: CLIENT_ID,
      redirectUri: REDIRECT_URI,
      scopes: ['openid', 'profile', 'email', 'User.Read'],
      responseType: 'code',
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;
      exchangeCodeForToken(code);
    }
  }, [response]);

  const exchangeCodeForToken = async (code) => {
    const tokenResponse = await fetch(discovery.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        scope: 'openid profile email User.Read',
        code: code,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }).toString(),
    });
    
    const json = await tokenResponse.json();
    setToken(json.access_token);
    fetchUserInfo(json.access_token);
  };

  const fetchUserInfo = async (accessToken) => {
    try {
      const res = await fetch(`${GRAPH_ENDPOINT}v1.0/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      setUserInfo(data);
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

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

  const resetNotifications = async () => {
    await clearAllNotifications();
    const notificationDates = generateNotificationDates();
    await scheduleNotifications(notificationDates);
  };

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
    const hour = timeSelection === 'AM' ? 8 : 5;
    const minute = timeSelection === 'AM' ? 0 : 0;

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
            data: { someKey: 'someValue' },
          },
          trigger: notificationDate,
        });
      }
    }
  };

  const clearAllNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  // Apply dynamic styles based on dark mode
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
        onPress={() => userInfo ? Alert.alert('Logged in', `Welcome, ${userInfo.displayName}`) : promptAsync()}
      >
        <View style={dynamicStyles.settingTextContainer}>
          <Ionicons name="people-outline" size={24} color={isDarkMode ? '#81b0ff' : '#007AFF'} />
          <Text style={dynamicStyles.settingText}>
            {userInfo ? `Sign out (${userInfo.displayName})` : 'Sign in with Microsoft'}
          </Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
};

// Dynamic styles based on dark mode
const styles = (isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: isDarkMode ? '#121212' : '#f5f5f5',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 20,
    color: isDarkMode ? '#ffffff' : '#333',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: isDarkMode ? '#444' : '#ddd',
  },
  settingTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 18,
    marginLeft: 10,
    color: isDarkMode ? '#ffffff' : '#000',
  },
  timeSelectionContainer: {
    marginVertical: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});

export default SettingsScreen;
