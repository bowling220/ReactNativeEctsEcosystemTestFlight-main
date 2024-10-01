import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Animated, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { AntDesign } from '@expo/vector-icons';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window'); // Get screen width

const DailyDiscussion = () => {
  const navigation = useNavigation();
  const [showMore, setShowMore] = useState(false);
  const animatedValue = useState(new Animated.Value(0))[0];

  const handlePagePress = (pageName) => {
    navigation.navigate(pageName);
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
    if (event.nativeEvent.state === State.END) {
      const { translationX } = event.nativeEvent;
      if (translationX < -30) {
        // Swipe from right edge - navigate to 'Ecosystem Website'
        navigation.navigate('Ecosystem Website');
      } else if (translationX > 30) {
        // Swipe from left edge - navigate to 'Home'
        navigation.navigate('Home');
      }
      // Reset animation after swipe
      Animated.spring(animatedValue, {
        toValue: 0,
        useNativeDriver: false,
      }).start();
    }
  };

  return (
    <View style={styles.container}>
      {/* Left edge swipe handler (Home) */}
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        activeOffsetX={[-15, 15]} // Increased sensitivity by lowering the threshold
      >
        <Animated.View style={styles.leftEdgeSwipe} pointerEvents="box-none" />
      </PanGestureHandler>

      {/* Right edge swipe handler (Ecosystem Website) */}
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        activeOffsetX={[-15, 15]} // Increased sensitivity by lowering the threshold
      >
        <Animated.View style={styles.rightEdgeSwipe} pointerEvents="box-none" />
      </PanGestureHandler>

      <View style={styles.webviewWrapper}>
        <WebView
          source={{ uri: 'https://ectspa.infinitecampus.org' }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          style={styles.webview}
        />
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
          onPress={() => handlePagePress('Grades')}
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
          accessibilityLabel="Navigate to More"
        >
          <AntDesign name="bars" size={24} color="white" />
          <Text style={styles.tabText}>More</Text>
        </TouchableOpacity>
      </View>

      {showMore && (
        <View style={styles.moreMenu}>
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
    backgroundColor: '#fff',
  },
  leftEdgeSwipe: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 50, // Increase edge width to 50px for easier swipe detection
    height: '100%',
    zIndex: 10,
  },
  rightEdgeSwipe: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 50, // Increase edge width to 50px for easier swipe detection
    height: '100%',
    zIndex: 10,
  },
  webviewWrapper: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  bottomNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'black',
    paddingVertical: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabButton: {
    alignItems: 'center',
  },
  tabText: {
    color: 'white',
    fontSize: 12,
    marginTop: 5,
  },
  moreMenu: {
    position: 'absolute',
    bottom: 60,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  moreMenuItem: {
    paddingVertical: 10,
  },
  moreMenuText: {
    fontSize: 16,
  },
});

export default DailyDiscussion;
