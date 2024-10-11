import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, Animated, Easing, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from 'react-native-vector-icons';
import HomeScreen from './screens/HomeScreen';
import Page1Screen from './screens/Page1Screen';
import Page2Screen from './screens/Page2Screen';
import DailyDiscussion from './screens/DailyDiscussion';
import SettingsScreen from './screens/SettingsScreen';
import Games from './screens/Games';
import Tools from './screens/Tools';
import Links from './screens/CompanionsScreen';
import AboutScreen from './screens/AboutScreen';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';

const Stack = createStackNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const AppNavigator = () => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [layout, setLayout] = useState('list');
  const [expoPushToken, setExpoPushToken] = useState('');
  const notificationListener = useRef();
  const responseListener = useRef();

  // Fetch settings from AsyncStorage
  const fetchSettings = async () => {
    try {
      const darkModeValue = await AsyncStorage.getItem('darkMode');
      if (darkModeValue !== null) {
        const shouldBeDarkMode = JSON.parse(darkModeValue);
        if (shouldBeDarkMode !== isDarkMode) {
          toggleTheme();
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  useEffect(() => {
    fetchSettings();
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification Received:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification Response:', response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const toggleLayout = () => {
    setLayout((prevLayout) => {
      if (prevLayout === 'list') return 'card';
      if (prevLayout === 'card') return 'grid2x2';
      return 'list';
    });
  };

  // Spinning icon component
  const SpinningIcon = () => {
    const spinValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const spinAnimation = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 4000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );

      spinAnimation.start();
    }, [spinValue]);

    const spin = spinValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <Ionicons 
          name="settings-outline" 
          size={24} 
          color={isDarkMode ? 'white' : 'black'} 
        />
      </Animated.View>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: theme.headerStyle,
          headerTitleStyle: theme.headerTitleStyle,
        }}
      >
        <Stack.Screen
          name="Home"
          options={({ navigation }) => ({
            headerLeft: () => (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
                <TouchableOpacity onPress={toggleLayout} style={{ flexDirection: 'row', alignItems: 'center' }}>
                </TouchableOpacity>
              </View>
            ),
            headerRight: () => (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>
                <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                  <SpinningIcon />
                </TouchableOpacity>
              </View>
            ),
          })}
        >
          {(props) => <HomeScreen {...props} layout={layout} toggleLayout={toggleLayout} />}
        </Stack.Screen>

        <Stack.Screen name="Ecosystem Website" component={Page1Screen} />
        <Stack.Screen name="Grades" component={Page2Screen} />
        <Stack.Screen name="Games" component={Games} />
        <Stack.Screen name="DailyDiscussion" component={DailyDiscussion} />
        <Stack.Screen name="Tools" component={Tools} />
        <Stack.Screen name="Links" component={Links} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
      </Stack.Navigator>
    </GestureHandlerRootView>
  );
};

const registerForPushNotificationsAsync = async () => {
  let token;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    alert('Failed to get push token for push notification!');
    return;
  }
  token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log(token);
  return token;
};

const App = () => {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </ThemeProvider>
  );
};

export default App;
