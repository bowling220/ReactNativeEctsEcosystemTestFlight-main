import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EditProfileScreen = () => {
  const [profileName, setProfileName] = useState('John Doe');
  const [profileImage, setProfileImage] = useState('https://ecosystem.ects-cmp.com/wp-content/uploads/2023/02/MicrosoftTeams-image.jpg'); // Default image URI
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const changeProfileImage = async () => {
    if (hasPermission === null) {
      Alert.alert('Permission not determined yet.');
      return;
    }
    
    if (hasPermission === false) {
      Alert.alert('Permission to access gallery is denied!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    // For newer versions, the URI is in result.assets[0].uri
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setProfileImage(result.assets[0].uri);
    } else {
      console.log('Image picking canceled or URI is undefined.');
    }
  };

  const saveProfile = async () => {
    try {
      if (profileName) {
        await AsyncStorage.setItem('profileName', profileName);
      } else {
        console.log('Profile name is undefined or empty.');
      }

      if (profileImage) {
        await AsyncStorage.setItem('profileImage', profileImage);
      } else {
        console.log('Profile image URI is undefined.');
      }

      Alert.alert('Profile updated!');
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={changeProfileImage}>
        <Image source={{ uri: profileImage }} style={styles.profileImage} />
      </TouchableOpacity>

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={profileName}
        onChangeText={(text) => setProfileName(text)}
      />

      <Button title="Save Changes" onPress={saveProfile} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F8F8F8',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 200,
  },
});

export default EditProfileScreen;
