import React, { useEffect } from 'react';
import { View, TouchableOpacity, Animated, Easing, StyleSheet } from 'react-native';
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
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // Import GestureHandlerRootView

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [layout, setLayout] = React.useState('list'); // State for layout

  // Fetch settings from AsyncStorage
  const fetchSettings = async () => {
    try {
      // Fetch dark mode setting
      const darkModeValue = await AsyncStorage.getItem('darkMode');
      if (darkModeValue !== null) {
        const shouldBeDarkMode = JSON.parse(darkModeValue);
        if (shouldBeDarkMode !== isDarkMode) {
          toggleTheme(); // Toggle theme if the stored value differs
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const toggleLayout = () => {
    setLayout((prevLayout) => {
      if (prevLayout === 'list') return 'card';
      if (prevLayout === 'card') return 'grid2x2';
      return 'list'; // If it's grid2x2, go back to list
    });
  };

  // Spinning icon component
  const SpinningIcon = () => {
    const spinValue = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
      // Define the spin animation
      const spinAnimation = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 4000, // 2 seconds for a full rotation
          easing: Easing.linear, // Ensures smooth, continuous rotation
          useNativeDriver: true, // Use native driver for better performance
        })
      );

      // Start the animation
      spinAnimation.start();
    }, [spinValue]);

    // Interpolate spinValue to create the rotation
    const spin = spinValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'], // Full rotation from 0 to 360 degrees
    });

    return (
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <Ionicons 
          name="settings-outline" 
          size={24} 
          color={isDarkMode ? 'white' : 'black'} // Change color based on dark mode
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

        <Stack.Screen
          name="Ecosystem Website"
          component={Page1Screen}
          options={{
            cardStyle: { backgroundColor: '#f5f5f5' }, // Light gray for Ecosystem Website
          }}
        />

        <Stack.Screen
          name="Grades"
          component={Page2Screen}
          options={{
            cardStyle: { backgroundColor: '#d3e8ff' }, // Light blue for Grades
          }}
        />

        <Stack.Screen
          name="Games"
          component={Games}
          options={{
            cardStyle: { backgroundColor: '#ffe4b2' }, // Light orange for Games
          }}
        />

        <Stack.Screen
          name="DailyDiscussion"
          component={DailyDiscussion}
          options={{
            cardStyle: { backgroundColor: '#f0e4ff' }, // Light purple for Daily Discussion
          }}
        />

        <Stack.Screen
          name="Tools"
          component={Tools}
          options={{
            cardStyle: { backgroundColor: '#e4ffcc' }, // Light green for Tools
          }}
        />

        <Stack.Screen
          name="Links"
          component={Links}
          options={{
            cardStyle: { backgroundColor: '#ccffec' }, // Light teal for Links
          }}
        />

        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            cardStyle: { backgroundColor: '#ffefcc' }, // Light yellow for Settings
          }}
        />

        <Stack.Screen
          name="About"
          component={AboutScreen}
          options={{
            cardStyle: { backgroundColor: '#ffcccc' }, // Light pink for About
          }}
        />
      </Stack.Navigator>
    </GestureHandlerRootView>
  );
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
