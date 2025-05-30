import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, BackHandler, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import NetInfo from '@react-native-community/netinfo';
import PostCard2 from '../components/PostCard2'; // Import PostCard2 instead of PostCard
import { AntDesign } from '@expo/vector-icons'; // Import AntDesign
import { useTheme } from '../context/ThemeContext';

const ResourcePage = () => {
    const navigation = useNavigation();
    const { theme, isDarkMode } = useTheme();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isConnected, setIsConnected] = useState(true);
    const [showMore, setShowMore] = useState(false); // Manage the "More" submenu visibility

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!isConnected) {
            Alert.alert(
                'No Internet Connection',
                'Please check your internet connection and try again.',
                [
                    {
                        text: 'Close App',
                        onPress: () => {
                            Alert.alert('App Closed', 'The app will now close.', [
                                {
                                    text: 'OK',
                                    onPress: () => BackHandler.exitApp(),
                                    style: 'destructive',
                                },
                            ]);
                        },
                    },
                    {
                        text: 'Try Again',
                        onPress: () => {
                            navigation.navigate('ResourcePage', { key: Math.random() });
                        },
                        style: 'cancel',
                    },
                ],
                { cancelable: false }
            );
        }
    }, [isConnected, navigation]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`https://ects-cmp.com/appfeeds/ecosystem/resources.json?timestamp=${new Date().getTime()}`);
        
                let fetchedData = response.data;
                if (typeof fetchedData === 'string') {
                    fetchedData = JSON.parse(fetchedData);
                }
        
                if (fetchedData && typeof fetchedData === 'object' && fetchedData.games) {
        
                    const gamesWithImages = await Promise.all(fetchedData.games.map(async (game) => {
        
                        const imageUrl = game.image;
                        if (imageUrl) {
                            try {
                                const imageResponse = await axios.get(imageUrl);
                                game.imageData = imageResponse.data;
                            } catch (error) {
                                game.imageData = null;
                            }
                        }
                        return game; // Return the updated game object
                    }));
        
                    setData(gamesWithImages); // Update the data state with the array of games with images
                } else {
                    // Handle case where no games are found
                }
            } catch (error) {
            } finally {
                setLoading(false);
            }
        };
        
        
        if (isConnected) {
            fetchData();
        }
    }, [isConnected]);

    const renderCards = (items) => {
        return items.map((item, index) => (
            <PostCard2 
                key={index}
                title={item.name}
                content={item.description}
                linkUrl={item.url}
                item={item} 
            />
        ));
    };
    

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

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {loading ? (
                <View style={styles.loading}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <ScrollView style={styles.scrollView}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Games</Text>
                    {data.length > 0 ? renderCards(data) : <Text style={{ color: theme.colors.text }}>No items to display</Text>}
                </ScrollView>
            )}

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
        padding: 10,
    },
    scrollView: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    error: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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

export default ResourcePage;
