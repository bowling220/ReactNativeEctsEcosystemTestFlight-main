import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet, Alert, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchPosts } from '../services/api';  // Ensure fetchPosts supports abort signal
import PostCard from '../components/PostCard';
import { AntDesign } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

const HomeScreen = () => {
    const navigation = useNavigation();
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [refreshTimedOut, setRefreshTimedOut] = useState(false);
    const [showMore, setShowMore] = useState(false);

    // Request notification permissions when the app starts
    useEffect(() => {
        registerForPushNotificationsAsync();
    }, []);

    // Listen for new notifications
    useEffect(() => {
        const subscription = Notifications.addNotificationReceivedListener(notification => {
            console.log('Notification Received:', notification);
        });

        return () => subscription.remove();
    }, []);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected);
        });
        return () => unsubscribe();
    }, [navigation]);

    useEffect(() => {
        loadPosts(1);
    }, []);

    useEffect(() => {
        const intervalId = setInterval(() => {
            loadPosts(1, true); // Check for new posts
        }, 10000); // 10 seconds

        return () => clearInterval(intervalId); // Clean up on unmount
    }, []);

    const loadPosts = async (pageNumber, appendNew = false) => {
        setLoading(true);
        setRefreshTimedOut(false);

        const controller = new AbortController();
        const signal = controller.signal;

        const timeout = setTimeout(() => {
            setRefreshTimedOut(true);
            controller.abort(); // Abort after timeout
        }, 3000);

        try {
            const data = await fetchPosts(pageNumber, { signal });

            if (data && data.channel && data.channel.item) {
                const newPosts = data.channel.item.map(post => {
                    const imageUrl = extractImageUrl(post['content-encoded']);
                    return { ...post, imageUrl };
                });

                if (appendNew) {
                    const existingPostIds = posts.map(post => post.pubDate);
                    const freshPosts = newPosts.filter(post => !existingPostIds.includes(post.pubDate));

                    if (freshPosts.length > 0) {
                        setPosts(prevPosts => [...freshPosts, ...prevPosts]);
                        setFilteredPosts(prevFiltered => [...freshPosts, ...prevFiltered]);

                        // Trigger a notification for the new posts
                        sendNotification(freshPosts.length);
                    }
                } else {
                    if (pageNumber === 1) {
                        setPosts(newPosts);
                        setFilteredPosts(newPosts);
                    } else {
                        setPosts(prevPosts => [...prevPosts, ...newPosts]);
                        setFilteredPosts(prevFiltered => [...prevFiltered, ...newPosts]);
                    }
                }
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                Alert.alert('Request timed out. Please try again.');
            } else {
                console.error('Error fetching posts:', error);
                Alert.alert('Error fetching posts. Please try again.');
            }
        } finally {
            clearTimeout(timeout);
            setLoading(false);
            setRefreshing(false);
        }
    };

    const extractImageUrl = (contentEncoded) => {
        const regex = /<img[^>]+src="([^">]+)/g;
        const match = regex.exec(contentEncoded);
        return match && match.length >= 2 ? match[1] : null;
    };

    const sendNotification = async (newPostCount) => {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "New Posts Available",
                body: `${newPostCount} new post${newPostCount > 1 ? 's' : ''} just arrived!`,
            },
            trigger: { seconds: 1 },
        });
    };

    const registerForPushNotificationsAsync = async () => {
        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                Alert.alert('Failed to get push token for push notification!');
                return;
            }
        } else {
            Alert.alert('Must use physical device for Push Notifications');
        }
    };

    const handleLoadMore = () => {
        if (!loading) {
            setPage(prevPage => prevPage + 1);
            loadPosts(page + 1);
        }
    };

    const renderPost = ({ item }) => (
        <PostCard
            title={item.title}
            content={item['content-encoded']}
            imageUrl={item.imageUrl}
            pubDate={item.pubDate}
            author={item.author}
            categories={item.category || []}
        />
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={filteredPosts}
                renderItem={renderPost}
                keyExtractor={(item, index) => index.toString()}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.1}
                ListFooterComponent={
                    <TouchableOpacity style={styles.loadMoreButton} onPress={handleLoadMore} disabled={loading}>
                        {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.loadMoreText}>Load More</Text>}
                    </TouchableOpacity>
                }
            />

            <View style={styles.bottomNavigation}>
                <TouchableOpacity style={styles.tabButton} onPress={() => navigation.navigate('Home')}>
                    <AntDesign name="home" size={24} color="white" />
                    <Text style={styles.tabText}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabButton} onPress={() => navigation.navigate('Grades')}>
                    <AntDesign name="profile" size={24} color="white" />
                    <Text style={styles.tabText}>Grades</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabButton} onPress={() => navigation.navigate('Ecosystem Website')}>
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
                    <TouchableOpacity style={styles.moreMenuItem} onPress={() => navigation.navigate('Games')}>
                        <Text style={styles.moreMenuText}>Games</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.moreMenuItem} onPress={() => navigation.navigate('Tools')}>
                        <Text style={styles.moreMenuText}>Tools</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.moreMenuItem} onPress={() => navigation.navigate('Links')}>
                        <Text style={styles.moreMenuText}>Links</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.moreMenuItem} onPress={() => navigation.navigate('DailyDiscussion')}>
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
        backgroundColor: '#FFFFFF',
    },
    bottomNavigation: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: 'black',
        paddingBottom: 20,
        paddingTop: 10,
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
    loadMoreButton: {
        paddingVertical: 10,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 10,
        marginHorizontal: 50,
        borderRadius: 5,
    },
    loadMoreText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    moreMenu: {
        position: 'absolute',
        bottom: 60,
        left: 0,
        right: 0,
        backgroundColor: '#333',
        padding: 10,
    },
    moreMenuItem: {
        padding: 10,
        borderBottomColor: '#555',
        borderBottomWidth: 1,
    },
    moreMenuText: {
        color: 'white',
        fontSize: 16,
    },
});

export default HomeScreen;
