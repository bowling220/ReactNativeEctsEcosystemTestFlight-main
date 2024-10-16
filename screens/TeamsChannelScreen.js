import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Linking, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useNavigation } from '@react-navigation/native';

WebBrowser.maybeCompleteAuthSession(); // Call this to handle redirect properly

const TeamsLogin = () => {
  const [accessToken, setAccessToken] = useState(null);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  const kClientID = "1d8c6008-5546-4d89-8557-d8c134ee79cc";
  
  // Set redirect URI based on platform
  const kRedirectUri = Platform.select({
    ios: "msauth.com.ectscmp.EctsEcosystem://auth", // iOS redirect URI
    android: "msauth.com.ectscmp.EctsEcosystem://auth", // Android redirect URI
    web: "http://localhost:19006", // Use your web app URL here (Expo's local URL for web)
  });

  const kAuthority = "https://login.microsoftonline.com/e34fd78b-f48d-4235-9787-fef76723be14";

  const handleLogin = async () => {
    const oauthUrl = `${kAuthority}/oauth2/v2.0/authorize?client_id=${kClientID}&response_type=token&redirect_uri=${encodeURIComponent(kRedirectUri)}&scope=User.Read`;

    try {
      await WebBrowser.openBrowserAsync(oauthUrl);
    } catch (error) {
      console.error("Error opening Teams app: ", error);
      setError("Error opening Teams app: " + error.message);
    }
  };

  useEffect(() => {
    WebBrowser.maybeCompleteAuthSession();
  }, []);
  

  useEffect(() => {
    const handleRedirect = (url) => {
      console.log("Redirect URL: ", url);
      const token = extractTokenFromUrl(url);
      if (token) {
        setAccessToken(token);
        // Navigate to TeamsChannel with the token
        navigation.navigate('TeamsChannel', { token });
      } else {
        setError("No access token found");
      }
    };

    // Check for incoming URL from a deep link
    const linkingListener = Linking.addEventListener('url', ({ url }) => {
      handleRedirect(url);
    });

    // Check for initial URL when the app is opened
    const checkInitialUrl = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        handleRedirect(initialUrl);
      }
    };

    checkInitialUrl();

    return () => {
      linkingListener.remove();
    };
  }, [navigation]);

  const extractTokenFromUrl = (url) => {
    const regex = /access_token=([^&]*)/;
    const matches = regex.exec(url);
    return matches ? matches[1] : null;
  };

  return (
    <View style={styles.container}>
      <Text>Access Token: {accessToken}</Text>
      {error ? <Text style={styles.error}>Error: {error}</Text> : null}
      <Button title="Login with Teams" onPress={handleLogin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  error: {
    fontSize: 16,
    color: 'red',
    marginBottom: 20,
  },
});

export default TeamsLogin;
