import React, { useEffect, useRef } from 'react'; // Added useRef
import { View, TouchableOpacity, Animated, Easing, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons'; // Assuming Expo, or 'react-native-vector-icons'
import Toast from 'react-native-toast-message';
import { toastConfig } from './components/ToastConfig';

// Screen Imports - Ensure these paths are correct
import HomeScreen from './screens/HomeScreen';
import Page1Screen from './screens/Page1Screen'; // Ecosystem Website
import Page2Screen from './screens/Page2Screen'; // Grades
import DailyDiscussion from './screens/DailyDiscussion';
import SettingsScreen from './screens/SettingsScreen';
import Games from './screens/Games';
import Tools from './screens/Tools';
import Links from './screens/CompanionsScreen'; // Note: Component is CompanionsScreen for Links route
import AboutScreen from './screens/AboutScreen';

// Context and Storage
import { ThemeProvider, useTheme } from './context/ThemeContext'; // Ensure path is correct
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SettingsProvider } from './context/SettingsContext';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [layout, setLayout] = React.useState('card'); // Default to card

  // Fetch settings from AsyncStorage
  const fetchSettings = async () => {
    try {
      const savedLayout = await AsyncStorage.getItem('layout');
      if (savedLayout) {
        setLayout(savedLayout);
      }
      const darkModeValue = await AsyncStorage.getItem('darkMode');
      if (darkModeValue !== null) {
        const shouldBeDarkMode = JSON.parse(darkModeValue);
        if (shouldBeDarkMode !== isDarkMode) {
          toggleTheme();
        }
      }
    } catch (error) {
      console.error('Error loading settings from storage:', error);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const toggleLayout = async () => {
    setLayout((prevLayout) => {
      let nextLayout;
      if (prevLayout === 'card') nextLayout = 'grid2x2';
      else if (prevLayout === 'grid2x2') nextLayout = 'list';
      else nextLayout = 'card';
      AsyncStorage.setItem('layout', nextLayout);
      return nextLayout;
    });
  };

  // Spinning icon component for Settings
  const SpinningIcon = () => {
    const spinValue = useRef(new Animated.Value(0)).current; // Use useRef

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
      // No explicit cleanup needed for Animated.loop with Animated.timing as it runs indefinitely
      // If you had a condition to stop it, then you'd return spinAnimation.stop();
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
          color={isDarkMode ? theme.colors.text : theme.colors.text} // Use theme colors
        />
      </Animated.View>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.card },
          headerTintColor: theme.colors.text,
          headerTitleStyle: { color: theme.colors.text },
          cardStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen
          name="Home"
          options={({ navigation }) => ({
            title: 'Home',
            headerLeft: () => (
              <TouchableOpacity onPress={toggleLayout} style={styles.headerButton}>
                <Ionicons
                  name={layout === 'list' ? 'list' : layout === 'card' ? 'albums-outline' : 'grid-outline'}
                  size={24}
                  color={isDarkMode ? theme.colors.text : theme.colors.text}
                />
              </TouchableOpacity>
            ),
            headerRight: () => (
              <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.headerButton}>
                <SpinningIcon />
              </TouchableOpacity>
            ),
          })}
        >
          {(props) => <HomeScreen {...props} layout={layout} />}
        </Stack.Screen>

        <Stack.Screen
          name="Ecosystem Website"
          component={Page1Screen}
          // options={{ cardStyle: { backgroundColor: '#f5f5f5' } }} // Themed by default now
        />
        <Stack.Screen
          name="Grades"
          component={Page2Screen}
          // options={{ cardStyle: { backgroundColor: '#d3e8ff' } }}
        />
        <Stack.Screen
          name="Games"
          component={Games}
          // options={{ cardStyle: { backgroundColor: '#ffe4b2' } }}
        />
        <Stack.Screen
          name="DailyDiscussion"
          component={DailyDiscussion}
          // options={{ cardStyle: { backgroundColor: '#f0e4ff' } }}
        />
        <Stack.Screen
          name="Tools"
          component={Tools}
          // options={{ cardStyle: { backgroundColor: '#e4ffcc' } }}
        />
        <Stack.Screen
          name="Links"
          component={Links} // Component is CompanionsScreen
          // options={{ cardStyle: { backgroundColor: '#ccffec' } }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          // options={{ cardStyle: { backgroundColor: '#ffefcc' } }}
        />
        <Stack.Screen
          name="About"
          component={AboutScreen}
          // options={{ cardStyle: { backgroundColor: '#ffcccc' } }}
        />
      </Stack.Navigator>
    </GestureHandlerRootView>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <NavigationContainer
          theme={{
            dark: false,
            colors: {
              background: '#FFFFFF', // This will be overridden by the style
            },
          }}
        >
          <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}> 
            <AppNavigator />
            <Toast />
          </View>
        </NavigationContainer>
      </SettingsProvider>
    </ThemeProvider>
  );
};

const styles = StyleSheet.create({
  headerButton: {
    paddingHorizontal: 15, // Add some padding for easier touch
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%', // Make the touchable area fill header height
  },
});

export default App;