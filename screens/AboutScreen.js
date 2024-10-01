import React from 'react';
import { View, Text, StyleSheet, Image, Linking, TouchableOpacity, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const AboutScreen = () => {
  const developerName = "Blaine Oler";
  const contactEmail = "ectscmp@gmail.com";
  const appDescription = "This app is designed to provide a central place to access key resources in the ECTS CMP program. Developed and managed by EctsCMP.";
  const appVersion = "7.0.0";
  const licenseUrl = "https://opensource.org/licenses/MIT"; // License link

  const handleEmailPress = () => {
    Linking.openURL(`mailto:${contactEmail}?subject=Questions%20or%20Concerns&body=Dear%20EctsCMP,`);
  };

  const handleOpenLink = (url) => {
    Linking.openURL(url);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require('../assets/icon.png')} style={styles.logo} />
      <Text style={styles.header}>About</Text>

      <View style={styles.contentContainer}>
        <Text style={styles.contentText}>{appDescription}</Text>

                {/* Developer Section with Verified Icon */}
                <Text style={styles.sectionTitle}>Contributors</Text>
        <View style={styles.developerContainer}>
          <Text style={styles.developerName}>{developerName}</Text>
          <Ionicons name="checkmark-circle" size={20} color="#1DA1F2" style={styles.verifiedIcon} />
        </View>


        <Text style={styles.sectionTitle}>Version</Text>
        <Text style={styles.contentText}>
          App Version: <Text style={styles.version}>{appVersion}</Text>
        </Text>

        <TouchableOpacity onPress={handleEmailPress}>
          <Text style={styles.contactEmail}>Contact: {contactEmail}</Text>
        </TouchableOpacity>

        {/* Features Section */}
        <Text style={styles.sectionTitle}>Key Features</Text>
        <Text style={styles.contentText}>✓ Easy access to key resources.</Text>
        <Text style={styles.contentText}>✓ User-friendly navigation.</Text>
        <Text style={styles.contentText}>✓ Dark mode support.</Text>

        {/* License Section */}
        <Text style={styles.sectionTitle}>License</Text>
        <TouchableOpacity onPress={() => handleOpenLink(licenseUrl)}>
          <Text style={styles.linkText}>MIT License</Text>
        </TouchableOpacity>

        {/* Social Media Links */}
        <Text style={styles.sectionTitle2}>Check the Source Code for This App Here</Text>
        <View style={styles.socialIcons}>
          <TouchableOpacity onPress={() => handleOpenLink('https://github.com/bowling220')}>
            <Ionicons name="logo-github" size={30} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Changelog Section */}
        <Text style={styles.sectionTitle}>Changelog</Text>
        <Text style={styles.contentText}>v1.0.0 - Initial release</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  contentContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center',
    width: '100%',
  },
  contentText: {
    fontSize: 18,
    color: '#555',
    marginBottom: 10,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#333',
  },
  sectionTitle2: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#333',
    textAlign: 'center', // Center the text
  },
  
  developerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  developerName: {
    fontWeight: 'bold',
    color: '#007bff',
    fontSize: 18,
  },
  verifiedIcon: {
    marginLeft: 5,
  },
  version: {
    fontWeight: 'bold',
    color: '#28a745',
  },
  contactEmail: {
    fontWeight: 'bold',
    color: '#d9534f',
    textDecorationLine: 'underline',
  },
  linkText: {
    color: '#007bff',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    fontSize: 18,
    textAlign: 'center',
  },
  socialIcons: {
    flexDirection: 'row',
    marginTop: 15,
  },
  socialIcon: {
    marginLeft: 15,
  },
});


export default AboutScreen;
