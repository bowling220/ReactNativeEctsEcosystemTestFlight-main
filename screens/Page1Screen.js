import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, BackHandler, TouchableOpacity, Animated, Dimensions, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const Page1Screen = () => {
    const navigation = useNavigation();
    const { theme, isDarkMode } = useTheme();
    const [visitedUrls, setVisitedUrls] = useState(['https://ecosystem.ects-cmp.com/']);
    const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
    const webViewRef = useRef(null);
    const [showMore, setShowMore] = useState(false); // State to manage the "More" submenu visibility
    const animatedValue = useState(new Animated.Value(0))[0]; // Pan gesture animated value
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
        return () => backHandler.remove();
    }, [currentUrlIndex]);

    const handlePagePress = (pageName) => {
        navigation.navigate(pageName);
    };

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft: () => null,
        });
    }, [navigation]);

    const handleBackPress = () => {
        if (currentUrlIndex > 0) {
            goBack();
            return true;
        }
        return false;
    };

    const goBack = () => {
        if (currentUrlIndex > 0) {
            setCurrentUrlIndex((prevIndex) => prevIndex - 1);
            webViewRef.current && webViewRef.current.goBack();
        }
    };

    const handleNavigationStateChange = (navState) => {
        const { url } = navState;

        if (url && url !== visitedUrls[currentUrlIndex]) {
            // Add the new URL to the history stack
            setVisitedUrls((prevUrls) => [...prevUrls.slice(0, currentUrlIndex + 1), url]);
            setCurrentUrlIndex(currentUrlIndex + 1);
        }
    };

    const navigateToPage = (pageName) => {
        handlePagePress(pageName);
    };

    const handleWebViewError = (syntheticEvent) => {
        const { nativeEvent } = syntheticEvent;
        setHasError(true);
        setErrorMessage(nativeEvent.description || 'Failed to load the page');
        setIsLoading(false);
    };

    const handleLoadStart = () => {
        setIsLoading(true);
        setHasError(false);
    };

    const handleLoadEnd = () => {
        setIsLoading(false);
    };

    // Pan Gesture Handling for right swipe
    const onGestureEvent = Animated.event(
        [{ nativeEvent: { translationX: animatedValue } }],
        { useNativeDriver: false }
    );

    const onHandlerStateChange = (event) => {
        if (event.nativeEvent.state === State.END) {
            const { translationX } = event.nativeEvent;

            if (translationX > 100) {
                navigation.navigate('Grades'); // Only navigate to "Grades" if swiped right
            } else if (translationX < -100) {
                navigation.navigate('Home');
              }

            Animated.spring(animatedValue, {
                toValue: 0,
                useNativeDriver: false,
            }).start();
        }
    };

    return (
        <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
            activeOffsetX={[-15, 15]}
        >
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <WebView
                    ref={webViewRef}
                    source={{ uri: visitedUrls[currentUrlIndex] }}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    onNavigationStateChange={handleNavigationStateChange}
                    onError={handleWebViewError}
                    onLoadStart={handleLoadStart}
                    onLoadEnd={handleLoadEnd}
                    renderLoading={() => (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={theme.colors.primary} />
                        </View>
                    )}
                    startInLoadingState={true}
                    renderError={(errorDomain, errorCode, errorDesc) => (
                        <View style={styles.errorContainer}>
                            <Text style={[styles.errorText, { color: theme.colors.text }]}>
                                {errorDesc || 'Failed to load the page'}
                            </Text>
                            <TouchableOpacity 
                                style={styles.retryButton}
                                onPress={() => {
                                    setHasError(false);
                                    webViewRef.current?.reload();
                                }}
                            >
                                <Text style={styles.retryButtonText}>Retry</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />
                {/* Custom bottom navigation */}
                <View style={styles.bottomNavigation}>
                    <TouchableOpacity style={styles.tabButton} onPress={() => navigateToPage('Home')}>
                        <AntDesign name="home" size={24} color="white" />
                        <Text style={styles.tabText}>Home</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.tabButton} onPress={() => navigateToPage('Grades')}>
                        <AntDesign name="profile" size={24} color="white" />
                        <Text style={styles.tabText}>Grades</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.tabButton} onPress={() => navigateToPage('Ecosystem Website')}>
                        <AntDesign name="earth" size={24} color="white" />
                        <Text style={styles.tabText}>Website</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.tabButton} onPress={() => setShowMore(!showMore)}>
                        <AntDesign name="bars" size={24} color="white" />
                        <Text style={styles.tabText}>More</Text>
                    </TouchableOpacity>
                </View>
                {showMore && (
                    <View style={styles.moreMenu}>
                        <TouchableOpacity style={styles.moreMenuItem} onPress={() => navigateToPage('Games')}>
                            <Text style={styles.moreMenuText}>Games</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.moreMenuItem} onPress={() => navigateToPage('Tools')}>
                            <Text style={styles.moreMenuText}>Tools</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.moreMenuItem} onPress={() => navigateToPage('Links')}>
                            <Text style={styles.moreMenuText}>Links</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.moreMenuItem} onPress={() => navigateToPage('DailyDiscussion')}>
                            <Text style={styles.moreMenuText}>Daily Discussion</Text>
                        </TouchableOpacity>
                    </View>
                )}
                {/* Back button for web page history */}
                <TouchableOpacity style={styles.backButton} onPress={goBack}>
                    <AntDesign name="arrowleft" size={24} color="black" />
                </TouchableOpacity>
            </View>
        </PanGestureHandler>
    );
};

const styles = StyleSheet.create({
    container: {
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
    backButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 1, // Ensure the button is above the WebView
    },
    moreMenu: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        position: 'absolute',
        bottom: 60,
        right: 0,
        padding: 10,
        borderRadius: 5,
    },
      moreMenuItem: {
        paddingVertical: 10,
      },
      moreMenuText: {
        color: 'white',
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
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
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 16,
    },
});

export default Page1Screen;
