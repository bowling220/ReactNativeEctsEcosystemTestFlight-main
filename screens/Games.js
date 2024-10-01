import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, BackHandler, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import NetInfo from '@react-native-community/netinfo';
import PostCard2 from '../components/PostCard2'; // Import PostCard2 instead of PostCard
import { AntDesign } from '@expo/vector-icons'; // Import AntDesign

const ResourcePage = () => {
    const navigation = useNavigation();
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
                console.log('Fetching data...');
                const response = await axios.get('https://ects-cmp.com/appfeeds/ecosystem/resources.json');
                console.log('Raw data:', response.data);
                
                // Ensure data is an object and not a string
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
                                game.imageData = imageResponse.data; // Storing image data in a separate key
                            } catch (error) {
                                console.error('Error fetching image:', error);
                            }
                        }
                        return game;
                    }));
        
                    setData(gamesWithImages);
                    console.log('Data set in state:', gamesWithImages);
                } else {
                    console.error('Fetched data is not valid:', fetchedData);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
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
            <PostCard2 // Use PostCard2 instead of PostCard
                key={index}
                title={item.name}
                content={item.description}
                linkUrl={item.url}
                item={item} // Pass the whole item to PostCard2
            />
        ));
    };

    const handlePagePress = (pageName) => {
        if (pageName === 'Home') {
            navigation.navigate('Home');
        } else if (pageName === 'Grades') {
            navigation.navigate('Infinite Campus');
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
        <View style={styles.container}>
            {loading ? (
                <View style={styles.loading}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            ) : (
                <ScrollView style={styles.scrollView}>
                    <Text style={styles.sectionTitle}>Games</Text>
                    {data.length > 0 ? renderCards(data) : <Text>No items to display</Text>}
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
        backgroundColor: '#fff',
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

export default ResourcePage;
