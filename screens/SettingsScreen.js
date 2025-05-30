import React, { useEffect, useState } from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView, StyleSheet, Alert, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { isDarkMode, toggleTheme, theme } = useTheme();
  const { 
    settings,
    updateSetting,
    getFontSizeMultiplier
  } = useSettings();
  
  const fontSizeMultiplier = getFontSizeMultiplier();
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [cacheSize, setCacheSize] = useState('0 MB');

  const handleClearCache = async () => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear the app cache? This will remove all downloaded content.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear AsyncStorage cache
              const keys = await AsyncStorage.getAllKeys();
              const cacheKeys = keys.filter(key => key.startsWith('cache_'));
              await AsyncStorage.multiRemove(cacheKeys);
              Alert.alert('Success', 'Cache cleared successfully');
            } catch (error) {
              console.error('Error clearing cache:', error);
              Alert.alert('Error', 'Failed to clear cache');
            }
          },
        },
      ]
    );
  };

  const dynamicStyles = styles(isDarkMode, fontSizeMultiplier);

  return (
    <SafeAreaView style={[dynamicStyles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={dynamicStyles.scrollView}>
        <Text style={[dynamicStyles.header, { color: theme.colors.text, fontSize: 28 * fontSizeMultiplier }]}>Settings</Text>
        
        <View style={[dynamicStyles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[dynamicStyles.sectionTitle, { color: theme.colors.text, fontSize: 18 * fontSizeMultiplier }]}>Appearance</Text>
          
          <TouchableOpacity 
            style={[dynamicStyles.setting, { borderBottomColor: theme.colors.border }]}
            onPress={toggleTheme}
          >
            <View style={dynamicStyles.settingLeft}>
              <View style={[dynamicStyles.iconContainer, { backgroundColor: theme.colors.primary }]}>
                <Ionicons 
                  name={isDarkMode ? "moon" : "sunny"} 
                  size={22} 
                  color="#fff" 
                />
              </View>
              <Text style={[dynamicStyles.settingText, { color: theme.colors.text }]}>
                {isDarkMode ? 'Dark Mode' : 'Light Mode'}
              </Text>
            </View>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={theme.colors.text} 
              style={dynamicStyles.chevron}
            />
          </TouchableOpacity>

          <View style={[dynamicStyles.setting, { borderBottomColor: theme.colors.border }]}>
            <View style={dynamicStyles.settingLeft}>
              <View style={[dynamicStyles.iconContainer, { backgroundColor: '#34C759' }]}>
                <Ionicons 
                  name="text" 
                  size={22} 
                  color="#fff" 
                />
              </View>
              <Text style={[dynamicStyles.settingText, { color: theme.colors.text }]}>
                Text Size
              </Text>
            </View>
            <View style={dynamicStyles.fontSizeButtons}>
              {['small', 'medium', 'large'].map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    dynamicStyles.fontSizeButton,
                    settings.fontSize === size && { backgroundColor: theme.colors.primary }
                  ]}
                  onPress={() => updateSetting('fontSize', size)}
                >
                  <Text style={[
                    dynamicStyles.fontSizeButtonText,
                    settings.fontSize === size && { color: '#fff' }
                  ]}>
                    {size.charAt(0).toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={[dynamicStyles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[dynamicStyles.sectionTitle, { color: theme.colors.text, fontSize: 18 * fontSizeMultiplier }]}>Data & Storage</Text>
          
          <TouchableOpacity 
            style={[dynamicStyles.setting, { borderBottomColor: theme.colors.border }]}
            onPress={() => updateSetting('dataSaverEnabled', !settings.dataSaverEnabled)}
          >
            <View style={dynamicStyles.settingLeft}>
              <View style={[dynamicStyles.iconContainer, { backgroundColor: '#5856D6' }]}>
                <Ionicons 
                  name="cellular" 
                  size={22} 
                  color="#fff" 
                />
              </View>
              <Text style={[dynamicStyles.settingText, { color: theme.colors.text }]}>
                Data Saver
              </Text>
            </View>
            <Switch
              value={settings.dataSaverEnabled}
              onValueChange={(value) => updateSetting('dataSaverEnabled', value)}
              trackColor={{ false: '#e0e0e0', true: '#34C759' }}
              thumbColor="#fff"
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[dynamicStyles.setting, { borderBottomColor: theme.colors.border }]}
            onPress={handleClearCache}
            disabled={isClearingCache}
          >
            <View style={dynamicStyles.settingLeft}>
              <View style={[dynamicStyles.iconContainer, { backgroundColor: '#FF3B30' }]}>
                <Ionicons 
                  name="trash" 
                  size={22} 
                  color="#fff" 
                />
              </View>
              <Text style={[dynamicStyles.settingText, { color: theme.colors.text }]}>
                Clear Cache
              </Text>
            </View>
            <Text style={[dynamicStyles.cacheSize, { color: theme.colors.text }]}>
              {isClearingCache ? 'Clearing...' : cacheSize}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[dynamicStyles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[dynamicStyles.sectionTitle, { color: theme.colors.text, fontSize: 18 * fontSizeMultiplier }]}>About</Text>
          <TouchableOpacity 
            style={[dynamicStyles.setting, { borderBottomColor: theme.colors.border }]}
            onPress={() => navigation.navigate('About')}
          >
            <View style={dynamicStyles.settingLeft}>
              <View style={[dynamicStyles.iconContainer, { backgroundColor: '#007AFF' }]}>
                <Ionicons 
                  name="information-circle" 
                  size={22} 
                  color="#fff" 
                />
              </View>
              <Text style={[dynamicStyles.settingText, { color: theme.colors.text }]}>
                About
              </Text>
            </View>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={theme.colors.text} 
              style={dynamicStyles.chevron}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = (isDarkMode, fontSizeMultiplier) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDarkMode ? '#121212' : '#F8F8F8',
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 28 * fontSizeMultiplier,
    fontWeight: 'bold',
    marginVertical: 20,
    color: isDarkMode ? '#fff' : '#000',
  },
  section: {
    marginBottom: 30,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 18 * fontSizeMultiplier,
    fontWeight: '600',
    color: isDarkMode ? '#81b0ff' : '#007AFF',
    marginBottom: 10,
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  settingItem: {
    backgroundColor: isDarkMode ? '#1E1E1E' : '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  settingTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16 * fontSizeMultiplier,
    fontWeight: '500',
    color: isDarkMode ? '#fff' : '#000',
    marginLeft: 10,
  },
  fontSizeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fontSizeButton: {
    width: 30 * fontSizeMultiplier,
    height: 30 * fontSizeMultiplier,
    borderRadius: 15 * fontSizeMultiplier,
    backgroundColor: isDarkMode ? '#2C2C2C' : '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  fontSizeButtonActive: {
    backgroundColor: isDarkMode ? '#81b0ff' : '#007AFF',
  },
  fontSizeButtonText: {
    color: isDarkMode ? '#fff' : '#000',
    fontSize: 14 * fontSizeMultiplier,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  setting: {
    padding: 15,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fontSizeButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cacheSize: {
    marginLeft: 10,
  },
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chevron: {
    opacity: 0.3,
  },
});

export default SettingsScreen;
