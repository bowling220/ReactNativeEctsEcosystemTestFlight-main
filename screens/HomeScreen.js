import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, TouchableOpacity, Animated, StyleSheet, Alert, Text, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchPosts } from '../services/api';
import PostCard from '../components/PostCard';
import { AntDesign } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import { Share } from 'react-native';
import { decode } from 'html-entities';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview'; // Import WebView

const HomeScreen = () => {
    const navigation = useNavigation();
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(true);
    const [showMore, setShowMore] = useState(false);
    const [showForm, setShowForm] = useState(false); // State for WebView
    const [refreshing, setRefreshing] = useState(false); // Refreshing state

    // Animated value initialization
    const animatedValue = new Animated.Value(0);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected);
        });
        return () => unsubscribe();
    }, [navigation]);

    useEffect(() => {
        const loadPosts = async () => {
            try {
                setLoading(true);
                const data = await fetchPosts(page);
                if (data && data.channel && data.channel.item) {
                    const newPosts = data.channel.item.map(post => {
                        const imageUrl = extractImageUrl(post['content-encoded']);
                        return { ...post, imageUrl };
                    });
                    if (page === 1) {
                        setPosts(newPosts);
                        setFilteredPosts(newPosts);
                    } else {
                        setPosts(prevPosts => [...prevPosts, ...newPosts]);
                        setFilteredPosts(prevPosts => [...prevPosts, ...newPosts]);
                    }
                }
            } catch (error) {
                console.error('Error fetching posts:', error);
            } finally {
                setLoading(false);
                setRefreshing(false); // End the refreshing state
            }
        };

        if (isConnected) {
            loadPosts();
        }
    }, [page, isConnected]);

    const handleLoadMore = () => {
        if (hasMore) {
            setPage(prevPage => prevPage + 1);
        }
    };

    const stripHtmlTags = (htmlContent) => {
        if (!htmlContent) return '';
        return htmlContent.replace(/<\/?[^>]+(>|$)/g, '');
    };

    const handleShare = async (title, content) => {
        try {
            const googlePlayLink = 'https://play.google.com/store/apps/details?id=com.gmail.ectscmp.ecosystem&pcampaignid=web_share';
            const testFlightLink = 'https://apps.apple.com/us/app/ects-cmp-ecosystem/id6504026235';

            const plainContent = stripHtmlTags(content);
            const decodedContent = decode(plainContent);
            const partialContent = decodedContent.length > 100 ? decodedContent.substring(0, 100) + '...' : decodedContent;

            const result = await Share.share({
                title: title,
                message: `${title}\n\n${partialContent}\n\nDownload the app:\nGoogle Play Store: ${googlePlayLink}\niOS: ${testFlightLink}`,
            });

            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // Handle activity type if needed
                } else {
                    alert('Shared successfully!');
                }
            } else if (result.action === Share.dismissedAction) {
                alert('Share action dismissed.');
            }
        } catch (error) {
            alert('Error sharing the post: ' + error.message);
        }
    };

    const extractImageUrl = (contentEncoded) => {
        const regex = /<img[^>]+src="([^">]+)/g;
        const match = regex.exec(contentEncoded);
        return match && match.length >= 2 ? match[1] : null;
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

    const handlePagePress = (pageName) => {
        navigation.navigate(pageName);
    };

    // Handle swipe gestures
    const onGestureEvent = Animated.event(
        [{ nativeEvent: { translationX: animatedValue } }],
        { useNativeDriver: false }
    );

    const onHandlerStateChange = (event) => {
        if (event.nativeEvent.state === State.END) {
            const { translationX } = event.nativeEvent;
            if (translationX < -100) {
                navigation.navigate('Grades'); // Swipe left to navigate to Grades
            } else if (translationX > 100) {
                navigation.navigate('Ecosystem Website'); // Swipe right to navigate to Ecosystem Website
            }
        }
    };

    const navigateToPage = (pageName) => {
        navigation.navigate(pageName);
    };

    const onRefresh = () => {
        setRefreshing(true); // Start the refreshing state
        setPage(1); // Reset the page to 1 to refresh data
    };

    return (
        <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
        >
            <Animated.View style={styles.container}>
                <FlatList
                    data={filteredPosts}
                    renderItem={renderPost}
                    keyExtractor={(item, index) => index.toString()}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.1}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                        />
                    }
                    ListFooterComponent={
                        hasMore && isConnected && (
                            <TouchableOpacity style={styles.loadMoreButton} onPress={handleLoadMore} disabled={loading}>
                                {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.loadMoreText}>Load More</Text>}
                            </TouchableOpacity>
                        )
                    }
                />

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
            </Animated.View>
        </PanGestureHandler>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    webView: {
        flex: 1, // This should generally work
        height: '100%', // You can explicitly set this as well
        marginTop: 20,
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
    },
    loadMoreButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#007AFF',
        borderRadius: 5,
        alignItems: 'center',
        marginVertical: 20,
        alignSelf: 'center',
    },
    loadMoreText: {
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

export default HomeScreen;
