import React, { useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, PanResponder, Animated, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { AntDesign } from '@expo/vector-icons';
import { HeaderBackButton } from '@react-navigation/stack';

const DailyDiscussionFragment = ({ navigation }) => {
    const [webViewOpacity] = React.useState(new Animated.Value(1));
    const webViewRef = useRef(null);
    const [isLoading, setIsLoading] = React.useState(false);
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

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft: () => null,
        });
    }, [navigation]);

    return (
        <View style={{ flex: 1 }}>
            <Animated.View style={{ flex: 1, opacity: webViewOpacity }} {...panResponder.panHandlers}>
                <WebView
                    originWhitelist={['*']}
                    ref={webViewRef}
                    source={{ uri: 'https://ects-computerprogramming.com/ClassCompanions/DailyDiscussion/' }}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    onLoadStart={() => {
                        setIsLoading(true);
                        Animated.timing(webViewOpacity, {
                            toValue: 0,
                            duration: 250,
                            useNativeDriver: true,
                        }).start();
                    }}
                    onLoad={() => {
                        setIsLoading(false);
                        Animated.timing(webViewOpacity, {
                            toValue: 1,
                            duration: 250,
                            useNativeDriver: true,
                        }).start();
                    }}
                />
                {isLoading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator color="black" size="small" />
                    </View>
                )}
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
    bottomNavigation: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: 'black',
        paddingBottom: 20,  // Keep the bottom padding as is
        paddingTop: 10,     // Reduce the top padding
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
    },
    loadingContainer: {
        ...StyleSheet.absoluteFill,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
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
