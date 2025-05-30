import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Animated, Dimensions, ActivityIndicator, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { AntDesign } from '@expo/vector-icons';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useTheme } from '../context/ThemeContext'; // Assuming you have this context setup
import NetInfo from "@react-native-community/netinfo"; // Import the community NetInfo

const { width } = Dimensions.get('window');

// Helper function to check for private IP ranges
// IMPORTANT NOTE: This function identifies if an IP address is within standard private IPv4 ranges.
// This is NOT a reliable method for detecting VPN usage for the following reasons:
// 1. FALSE POSITIVES: Most users on standard Wi-Fi networks (home, office) will have an IP
//    address in these ranges (e.g., 192.168.1.100). This check will incorrectly flag them
//    as potentially using a VPN.
// 2. FALSE NEGATIVES: Some VPN configurations might not result in a local IP address
//    falling into these ranges.
//
// This helper is provided to correctly implement the IP range check.
// Users should be aware of its limitations as a VPN detector.
const isPrivateIPAddress = (ip) => {
  if (!ip || typeof ip !== 'string') {
    return false;
  }
  if (ip.startsWith('10.')) {
    return true;
  }
  if (ip.startsWith('192.168.')) {
    return true;
  }
  if (ip.startsWith('172.')) {
    const parts = ip.split('.');
    if (parts.length === 4) {
      try {
        const secondOctet = parseInt(parts[1], 10);
        if (!isNaN(secondOctet) && secondOctet >= 16 && secondOctet <= 31) {
          return true;
        }
      } catch (e) {
        return false; // Treat as not private if parsing fails
      }
    }
  }
  return false;
};

const Page2Screen = () => {
  const navigation = useNavigation();
  const { theme, isDarkMode } = useTheme(); // Assuming theme has theme.colors.background, .primary, .text and isDarkMode boolean
  const [showMore, setShowMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isVPNConnected, setIsVPNConnected] = useState(false); // This flag is based on the private IP check
  const animatedValue = useState(new Animated.Value(0))[0];
  const webViewRef = useRef(null);

  useEffect(() => {
    checkVPNStatus();
    const interval = setInterval(checkVPNStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkVPNStatus = async () => {
    try {
      const netState = await NetInfo.fetch();
      const ipv4 = netState.details?.ipAddress; // Access ipAddress safely from details
      // console.debug('Device IP Address (NetInfo):', ipv4, 'NetInfo state:', netState);

      if (ipv4 && typeof ipv4 === 'string') {
        const deviceHasPrivateIP = isPrivateIPAddress(ipv4);
        setIsVPNConnected(deviceHasPrivateIP);

        // You could also log netState.type to see if it reports 'vpn'
        // if (netState.type === 'vpn') {
        //   console.log("NetInfo directly reports VPN type connection.");
        //   // You might choose to set isVPNConnected = true here based on netState.type === 'vpn'
        //   // instead of or in addition to the private IP check, for a potentially more accurate (but still not foolproof) VPN detection.
        // }

      } else {
        // console.warn('NetInfo.fetch() did not return a valid IP address.');
        setIsVPNConnected(false); // Default to false if IP is not valid or available
      }
    } catch (error) {
      console.error('Error in checkVPNStatus while getting IP address with NetInfo:', error);
      setIsVPNConnected(false); // Assume not connected or unable to check on error
    }
  };

  const handlePagePress = (pageName) => {
    navigation.navigate(pageName);
    if (showMore) setShowMore(false); // Close "More" menu if open
  };

  const handleRetry = () => {
    setHasError(false);
    setErrorMessage('');
    setIsLoading(true);
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  const handleOpenInBrowser = () => {
    Linking.openURL('https://ectspa.infinitecampus.org/campus/ects.jsp');
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => null,
    });
  }, [navigation]);

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: animatedValue } }],
    { useNativeDriver: false }
  );

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationX } = event.nativeEvent;
      if (translationX < -30) {
        navigation.navigate('Ecosystem Website');
      } else if (translationX > 30) {
        navigation.navigate('Home');
      }
      Animated.spring(animatedValue, {
        toValue: 0,
        useNativeDriver: false,
        friction: 7,
        tension: 40,
      }).start();
    }
  };

  const handleError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.error("WebView Error:", nativeEvent);
    setHasError(true);
    setErrorMessage(nativeEvent.description || 'Failed to load the page. Please check your internet connection.');
    setIsLoading(false);
  };

  const renderVPNWarning = () => {
    if (!isVPNConnected) return null;
    
    return (
      <View style={styles.warningContainer}>
        <Text style={[styles.warningText, { color: theme.colors.text }]}>
          ⚠️ Your network IP address is in a private range. This can sometimes be due to a VPN. 
          Infinite Campus may block access when using some network configurations, including VPNs. 
          If you encounter issues, please try disabling any VPN.
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        activeOffsetX={[-15, 15]} 
        hitSlop={{ left: 0, right: width - 50, top:0, bottom: 0 }}
      >
        <Animated.View style={styles.leftEdgeSwipe} pointerEvents="box-none" />
      </PanGestureHandler>

      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        activeOffsetX={[-15, 15]}
        hitSlop={{ right: 0, left: width - 50, top:0, bottom: 0 }}
      >
        <Animated.View style={styles.rightEdgeSwipe} pointerEvents="box-none" />
      </PanGestureHandler>

      <View style={styles.webviewWrapper}>
        {isLoading && !hasError && (
          <View style={[styles.loadingContainer, {backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)'}]}>
            {renderVPNWarning()}
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading Grades...</Text>
            <TouchableOpacity style={styles.browserButton} onPress={handleOpenInBrowser}>
              <Text style={styles.browserButtonText}>Open in Browser</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {hasError && (
          <View style={[styles.errorContainer, {backgroundColor: theme.colors.background}]}>
            {renderVPNWarning()}
            <Text style={[styles.errorText, { color: theme.colors.text }]}>{errorMessage}</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.browserButton} onPress={handleOpenInBrowser}>
                <Text style={styles.browserButtonText}>Open in Browser</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        { !hasError && (
          <WebView
            ref={webViewRef}
            source={{ uri: 'https://ectspa.infinitecampus.org/campus/ects.jsp' }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            style={styles.webview}
            onLoadStart={() => {
              // setIsLoading(true); // Handled by initial state or retry
              // setHasError(false); // Reset by retry
            }}
            onLoadEnd={() => setIsLoading(false)}
            onError={handleError}
            startInLoadingState={true}
            renderLoading={() => ( // This is shown while startInLoadingState=true and WebView is loading initially
              <View style={[styles.loadingContainer, {backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)'}]}>
                {/* No VPN warning here, as the main loading overlay already has it */}
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading Grades...</Text>
              </View>
            )}
          />
        )}
      </View>

      <View style={styles.bottomNavigation}>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => handlePagePress('Home')}
          accessibilityLabel="Navigate to Home"
        >
          <AntDesign name="home" size={24} color="white" />
          <Text style={styles.tabText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => handlePagePress('Grades')} /* Assuming 'Grades' is the route name for this screen */
          accessibilityLabel="Navigate to Grades"
        >
          <AntDesign name="profile" size={24} color="white" />
          <Text style={styles.tabText}>Grades</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => handlePagePress('Ecosystem Website')}
          accessibilityLabel="Navigate to Website"
        >
          <AntDesign name="earth" size={24} color="white" />
          <Text style={styles.tabText}>Website</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setShowMore(!showMore)}
          accessibilityLabel="Toggle More Options"
        >
          <AntDesign name="bars" size={24} color="white" />
          <Text style={styles.tabText}>More</Text>
        </TouchableOpacity>
      </View>

      {showMore && (
        <View style={[styles.moreMenu, {backgroundColor: isDarkMode ? 'rgba(50,50,50,0.95)' : 'rgba(0,0,0,0.9)'}]}>
          <TouchableOpacity style={styles.moreMenuItem} onPress={() => handlePagePress('Games')}>
            <Text style={styles.moreMenuText}>Games</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.moreMenuItem} onPress={() => handlePagePress('Tools')}>
            <Text style={styles.moreMenuText}>Tools</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.moreMenuItem} onPress={() => handlePagePress('Links')}>
            <Text style={styles.moreMenuText}>Links</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.moreMenuItem} onPress={() => handlePagePress('DailyDiscussion')}>
            <Text style={styles.moreMenuText}>Daily Discussion</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  leftEdgeSwipe: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 50, 
    height: '100%',
    zIndex: 10,
  },
  rightEdgeSwipe: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 50,
    height: '100%',
    zIndex: 10,
  },
  webviewWrapper: {
    flex: 1,
    position: 'relative',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 15,
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 2, // Ensure it's above loading and webview
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    elevation: 2,
  },
  browserButton: {
    backgroundColor: '#34C759',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    elevation: 2,
    marginTop: 10, // Added margin for spacing in loading/error screens
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  browserButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  warningContainer: {
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    padding: 16,
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.5)',
  },
  warningText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  tabButton: {
    alignItems: 'center',
    flex: 1,
  },
  tabText: {
    color: 'white',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
  moreMenu: {
    position: 'absolute',
    bottom: 70, // Adjust based on bottomNav height
    right: 16,
    padding: 12,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  moreMenuItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  moreMenuText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default Page2Screen;