import React from 'react';
import { View, Text, StyleSheet, Image, Linking, TouchableOpacity, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/Ionicons'; 
import { useTheme } from '../context/ThemeContext'; // Importing the Theme Context

const AboutScreen = () => {
  const { isDarkMode } = useTheme(); // Using the Theme Context
  const developerName = "Blaine Oler";
  const contactEmail = "ectscmp@gmail.com";
  const appDescription = "This app is designed to provide a central place to access key resources in the ECTS CMP program. Developed and managed by EctsCMP.";
  const licenseUrl = "https://opensource.org/licenses/MIT";

  const handleEmailPress = () => {
    Linking.openURL(`mailto:${contactEmail}?subject=Questions%20or%20Concerns&body=Dear%20EctsCMP,`);
  };

  const handleOpenLink = (url) => {
    Linking.openURL(url);
  };

  return (
    <ScrollView contentContainerStyle={styles.container(isDarkMode)}>
      <Image source={require('../assets/icon.png')} style={styles.logo} />
      <Text style={styles.header(isDarkMode)}>About</Text>

      <View style={styles.contentContainer(isDarkMode)}>
        <Text style={styles.contentText(isDarkMode)}>{appDescription}</Text>

        <Text style={styles.sectionTitle(isDarkMode)}>Contributors</Text>
        <View style={styles.developerContainer}>
          <Text style={styles.developerName(isDarkMode)}>{developerName}</Text>
          <Ionicons name="checkmark-circle" size={20} color="#1DA1F2" style={styles.verifiedIcon} />
        </View>

        <Text style={styles.sectionTitle(isDarkMode)}>Contact</Text>
        <TouchableOpacity onPress={handleEmailPress}>
          <Text style={styles.contactEmail(isDarkMode)}>{contactEmail}</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle(isDarkMode)}>Key Features</Text>
        <Text style={styles.contentText(isDarkMode)}>✓ Easy access to key resources.</Text>
        <Text style={styles.contentText(isDarkMode)}>✓ User-friendly navigation.</Text>
        <Text style={styles.contentText(isDarkMode)}>✓ Dark mode support.</Text>

        <Text style={styles.sectionTitle(isDarkMode)}>License</Text>
        <TouchableOpacity onPress={() => handleOpenLink(licenseUrl)}>
          <Text style={styles.linkText(isDarkMode)}>MIT License</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle2(isDarkMode)}>Check the Source Code for This App Here</Text>
        <View style={styles.socialIcons}>
  <TouchableOpacity onPress={() => handleOpenLink('https://github.com/bowling220/ReactNativeEctsEcosystemTestFlight-main')}>
    <Ionicons name="logo-github" size={30} color={isDarkMode ? "white" : "black"} />
  </TouchableOpacity>
</View>


        <Text style={styles.sectionTitle(isDarkMode)}>VERSION</Text>
        <View style={styles.versionContainer}>
        <View style={styles.versionContainer}>
  <Text style={styles.contentText(isDarkMode)}>
    v1.0.1 <Icon name="logo-apple" size={18} color={isDarkMode ? "white" : "black"} /> APPLE Release
  </Text>
</View>
<View style={styles.versionContainer}>
  <Text style={styles.contentText(isDarkMode)}>
    v1.0.1 <Icon name="logo-google-playstore" size={18} color={isDarkMode ? "white" : "black"} /> ANDROID Release
  </Text>
</View>

        </View>
      </View>
    </ScrollView>
  );
};

// Update styles to take isDarkMode as an argument
const styles = StyleSheet.create({
  container: (isDarkMode) => ({
    flexGrow: 1,
    padding: 20,
    backgroundColor: isDarkMode ? '#121212' : '#f0f0f0', // Dark mode background
    justifyContent: 'center',
    alignItems: 'center',
  }),
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  header: (isDarkMode) => ({
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    color: isDarkMode ? '#fff' : '#333', // Text color for dark mode
    textAlign: 'center',
  }),
  contentContainer: (isDarkMode) => ({
    backgroundColor: isDarkMode ? '#1E1E1E' : '#fff', // Dark mode background
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center',
    width: '100%',
  }),
  contentText: (isDarkMode) => ({
    fontSize: 18,
    color: isDarkMode ? '#ccc' : '#555', // Text color for dark mode
    marginBottom: 10,
    textAlign: 'center',
  }),
  sectionTitle: (isDarkMode) => ({
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    color: isDarkMode ? '#fff' : '#333', // Section title color for dark mode
  }),
  sectionTitle2: (isDarkMode) => ({
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    color: isDarkMode ? '#fff' : '#333', // Section title color for dark mode
    textAlign: 'center',
  }),
  developerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  developerName: (isDarkMode) => ({
    fontWeight: 'bold',
    color: isDarkMode ? '#007bff' : '#007bff', // Keep the color the same, adjust as needed
    fontSize: 18,
  }),
  verifiedIcon: {
    marginLeft: 5,
  },
  contactEmail: (isDarkMode) => ({
    fontWeight: 'bold',
    color: isDarkMode ? '#d9534f' : '#d9534f', // Keep the color the same
    textDecorationLine: 'underline',
  }),
  linkText: (isDarkMode) => ({
    color: isDarkMode ? '#007bff' : '#007bff', // Keep the color the same
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    fontSize: 18,
    textAlign: 'center',
  }),
  socialIcons: {
    flexDirection: 'row',
    marginTop: 15,
  },
  versionContainer: {
    marginTop: 10,
  },
});

export default AboutScreen;
