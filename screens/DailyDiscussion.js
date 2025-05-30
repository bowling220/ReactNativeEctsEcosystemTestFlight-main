import React, { useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, PanResponder, Animated, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { AntDesign } from '@expo/vector-icons';
import { HeaderBackButton } from '@react-navigation/stack';
import { useTheme } from '../context/ThemeContext';

const DailyDiscussionFragment = ({ navigation }) => {
    const { theme, isDarkMode } = useTheme();
    const [webViewOpacity] = React.useState(new Animated.Value(1));
    const webViewRef = useRef(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [hasError, setHasError] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState('');
    const [showMore, setShowMore] = React.useState(false); // State to manage the "More" submenu visibility

    const handlePagePress = (pageName) => {
        if (pageName === 'Home') {
            navigation.navigate('Home');
        } else if (pageName === 'Grades') {
            navigation.navigate('Grades');
        } else if (pageName === 'Website') {
            navigation.navigate('Ecosystem Website');
        } else if (pageName === 'DailyDiscussion') {
            navigation.navigate('DailyDiscussion');
        } else if (pageName === 'Games') {
            navigation.navigate('Games');
        } else if (pageName === 'Tools') {
            navigation.navigate('Tools');
        } else if (pageName === 'Links') {
            navigation.navigate('Links');
        }
    };

    const handleReload = () => {
        if (!isLoading) {
            setIsLoading(true);
            webViewRef.current && webViewRef.current.reload();
        }
    };

    const panResponder = React.useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (evt, gestureState) => {
                return gestureState.dy > 50;
            },
            onPanResponderRelease: (evt, gestureState) => {
                if (gestureState.dy > 50) {
                    handleReload();
                }
            },
        })
    ).current;

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

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft: () => null,
        });
    }, [navigation]);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Animated.View style={{ flex: 1, opacity: webViewOpacity }} {...panResponder.panHandlers}>
                <WebView
                    originWhitelist={['*']}
                    ref={webViewRef}
                    source={{ uri: 'https://ects-computerprogramming.com/ClassCompanions/DailyDiscussion/' }}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
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
            </Animated.View>
            <View style={styles.bottomNavigation}>
                <TouchableOpacity style={styles.tabButton} onPress={() => handlePagePress('Home')}>
                    <AntDesign name="home" size={24} color="white" />
                    <Text style={styles.tabText}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabButton} onPress={() => handlePagePress('Grades')}>
                    <AntDesign name="profile" size={24} color="white" />
                    <Text style={styles.tabText}>Grades</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabButton} onPress={() => handlePagePress('Website')}>
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
});

export default DailyDiscussionFragment;
