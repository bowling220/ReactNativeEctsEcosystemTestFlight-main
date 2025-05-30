import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    View,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    Animated,
    StyleSheet,
    Text,
    RefreshControl,
    Share,
    Platform, // Added Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchPosts } from '../services/api';
import PostCard from '../components/PostCard';
import { AntDesign } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import { decode } from 'html-entities';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { useTheme } from '../context/ThemeContext';

const SCREEN_NAMES = {
    HOME: 'Home',
    GRADES: 'Grades',
    ECOSYSTEM_WEBSITE: 'Ecosystem Website',
    GAMES: 'Games',
    TOOLS: 'Tools',
    LINKS: 'Links',
    DAILY_DISCUSSION: 'DailyDiscussion',
};

const extractImageUrl = (contentEncoded) => {
    if (!contentEncoded) return null;
    const regex = /<img[^>]+src="([^">]+)/g;
    const match = regex.exec(contentEncoded);
    return match && match.length >= 2 ? match[1] : null;
};

const stripHtmlTags = (htmlContent) => {
    if (!htmlContent) return '';
    return htmlContent.replace(/<\/?[^>]+(>|$)/g, '');
};

const HomeScreen = ({ layout = 'list' }) => {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isConnected, setIsConnected] = useState(null); // null: unknown, true: online, false: offline
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [isCheckingConnection, setIsCheckingConnection] = useState(true);

    const animatedValue = useRef(new Animated.Value(0)).current;

    // Use refs to get latest state values in effects and callbacks without adding them to dependencies
    const postsRef = useRef(posts);
    const loadingRef = useRef(loading);
    const initialLoadingRef = useRef(initialLoading);
    const isConnectedRef = useRef(isConnected);
    const hasMoreRef = useRef(hasMore);

    useEffect(() => { postsRef.current = posts; }, [posts]);
    useEffect(() => { loadingRef.current = loading; }, [loading]);
    useEffect(() => { initialLoadingRef.current = initialLoading; }, [initialLoading]);
    useEffect(() => { isConnectedRef.current = isConnected; }, [isConnected]);
    useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);

    const loadPostsData = useCallback(async (currentPage, isRefresh = false) => {
        // Prevent multiple simultaneous loads for pagination requests
        if (loadingRef.current && !isRefresh && currentPage > 1) {
            return;
        }

        // Handle offline state if not a refresh operation
        if (isConnectedRef.current === false && !isRefresh) {
            setError("You are offline. Please check your connection.");
            if (currentPage === 1) {
                setInitialLoading(false);
                setPosts([]); // Clear posts if offline on first load attempt
            }
            setLoading(false);
            setRefreshing(false);
            return;
        }

        setLoading(true);
        if (currentPage === 1) {
            setError(null);
            if (!isRefresh) {
                setInitialLoading(true);
                setPosts([]); // Crucial: Clear posts array immediately for a clean state
            }
        }

        try {
            const data = await fetchPosts(currentPage);
            if (data && data.channel && data.channel.item) {
                const newPostsFromApi = data.channel.item.map(post => {
                    // Check if guid is an object with a '_' property, or use other fallbacks
                    const keyBase = (post.guid && typeof post.guid === 'object' && post.guid._) 
                                 || post.link 
                                 || post.pubDate 
                                 || `fallback-${Math.random().toString(36).substring(2, 9)}`;
                    return {
                        ...post,
                        id: `${keyBase}-${Math.random().toString(36).substring(2, 9)}`, // FlatList key
                        stableKey: keyBase, // For de-duplication logic
                        imageUrl: extractImageUrl(post['content-encoded']),
                    };
                });

                setPosts(prevPosts => {
                    if (currentPage === 1) {
                        return newPostsFromApi; // For refresh or initial load, replace entirely
                    } else {
                        const existingStableKeys = new Set(prevPosts.map(p => p.stableKey));
                        const uniqueNewPosts = newPostsFromApi.filter(p => !existingStableKeys.has(p.stableKey));
                        return [...prevPosts, ...uniqueNewPosts]; // For pagination, append unique new posts
                    }
                });
                setHasMore(newPostsFromApi.length > 0);
            } else {
                setHasMore(false);
                if (currentPage === 1) setPosts([]); // No items found, ensure list is empty
            }
        } catch (err) {
            console.error("Failed to fetch posts:", err);
            if (isConnectedRef.current === false) {
                setError('Failed to load posts. Please check your connection.');
            } else {
                setError('Failed to load posts. Please try again. (' + err.message + ')');
            }
            if (currentPage === 1) setPosts([]); // Clear on error for initial load
        } finally {
            setLoading(false);
            if (currentPage === 1) setInitialLoading(false);
            setRefreshing(false);
        }
    }, []); // Empty dependency array: relies solely on refs for state access

    useEffect(() => {
        const checkInitialConnection = async () => {
            setIsCheckingConnection(true);
            try {
                const netState = await NetInfo.fetch();
                const online = !!(netState.isConnected && netState.isInternetReachable);
                setIsConnected(online);
                setIsCheckingConnection(false);

                if (online) {
                    // If online and no posts are loaded, trigger initial data fetch
                    if (postsRef.current.length === 0 && !loadingRef.current && !initialLoadingRef.current) {
                        loadPostsData(1, false);
                    }
                } else {
                    setInitialLoading(false); // If offline initially, don't show loading spinner indefinitely
                    setError("You are offline. Please check your connection.");
                }
            } catch (e) {
                console.error("NetInfo fetch error:", e);
                setIsConnected(false); 
                setIsCheckingConnection(false);
                setInitialLoading(false);
                setError("Could not check connection. Please check your connection.");
            }
        };

        checkInitialConnection(); // Run once on mount

        // Set up listener for real-time connection changes
        const unsubscribeNetInfo = NetInfo.addEventListener(netState => {
            const newOnlineStatus = !!(netState.isConnected && netState.isInternetReachable);
            
            setIsConnected(prevIsConnected => {
                if (prevIsConnected !== newOnlineStatus) {
                    if (newOnlineStatus) {
                        // If connection restored and no posts, load data
                        if (postsRef.current.length === 0 && !loadingRef.current && !initialLoadingRef.current) {
                            loadPostsData(1, false);
                        }
                    }
                }
                return newOnlineStatus;
            });
        });

        return () => {
            unsubscribeNetInfo(); // Cleanup listener on unmount
        };
    }, [loadPostsData]); // Only depends on loadPostsData being stable

    // Effect to trigger loading more posts when page state changes
    useEffect(() => {
        // Only load if page > 1 AND connected AND not already loading/refreshing AND there's more data
        if (page > 1 && isConnectedRef.current && !loadingRef.current && !refreshing && hasMoreRef.current) {
            loadPostsData(page, false);
        }
    }, [page]); // This effect now solely depends on `page` state change

    const handleLoadMore = useCallback(() => {
        if (!loading && hasMore && isConnected) {
            setPage(prevPage => prevPage + 1);
        }
    }, [loading, hasMore, isConnected]); // Keep these dependencies for internal checks before setting page

    const handleShare = useCallback(async (title, content) => {
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
                Toast.show({
                    type: 'success',
                    text1: 'Shared successfully!',
                    position: 'bottom',
                    visibilityTime: 2000,
                });
            }
        } catch (shareError) {
            Toast.show({
                type: 'error',
                text1: 'Sharing Error',
                text2: shareError.message,
                position: 'bottom',
                visibilityTime: 3000,
            });
        }
    }, []);

    const renderPostItem = useCallback(({ item }) => {
        const postProps = {
            title: item.title,
            content: item['content-encoded'],
            imageUrl: item.imageUrl,
            pubDate: item.pubDate,
            author: item.author,
            categories: item.category || [],
            onSharePress: () => handleShare(item.title, item['content-encoded']),
            layout: layout,
        };
        return <PostCard {...postProps} />;
    }, [layout, handleShare]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setPage(1); // Reset page to 1 for a full refresh
        loadPostsData(1, true); // Indicate it's a refresh
    }, [loadPostsData]); // Only depends on loadPostsData being stable

    const navigateToPage = (pageName) => {
        navigation.navigate(pageName);
        setShowMoreMenu(false);
    };

    const onGestureEvent = Animated.event(
        [{ nativeEvent: { translationX: animatedValue } }],
        { useNativeDriver: false }
    );

    const onHandlerStateChange = (event) => {
        if (event.nativeEvent.oldState === State.ACTIVE) {
            animatedValue.extractOffset(); 
            const { translationX } = event.nativeEvent;
            if (translationX < -100) {
                navigation.navigate(SCREEN_NAMES.GRADES);
            } else if (translationX > 100) {
                navigation.navigate(SCREEN_NAMES.ECOSYSTEM_WEBSITE);
            }
            animatedValue.setValue(0);
        }
    };

    // --- Conditional Rendering for Loading/Error States ---
    if (isCheckingConnection) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary || "#007AFF"} />
                <Text style={{ color: theme.colors.text, marginTop: 10 }}>Checking connection...</Text>
            </View>
        );
    }
    
    if (initialLoading && posts.length === 0 && (isConnected === true || isConnected === null)) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary || "#007AFF"} />
                <Text style={{ color: theme.colors.text, marginTop: 10 }}>Loading posts...</Text>
            </View>
        );
    }

    if (error && posts.length === 0 && !refreshing && !initialLoading) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
                <Text style={[styles.errorText, { color: theme.colors.error || '#FF3B30' }]}>{error}</Text>
                {/* Only show retry button if we are connected or connection status is unknown */}
                {(isConnected === true || isConnected === null) && (
                    <TouchableOpacity style={styles.retryButton} onPress={() => loadPostsData(1, true)}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                )}
                {/* Show specific message if confirmed offline */}
                {isConnected === false && <Text style={{ color: theme.colors.text, marginTop: 10 }}>Please check your internet connection.</Text>}
            </View>
        );
    }

    return (
        <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
            minDeltaX={10}
        >
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                {/* Offline banner */}
                {isConnected === false && ( // Only show if explicitly false
                    <View style={styles.offlineContainer}>
                        <Text style={styles.offlineText}>You are offline</Text>
                    </View>
                )}
                <FlatList
                    key={layout} // Key changes only if layout prop changes, causing full re-render
                    data={posts}
                    renderItem={renderPostItem}
                    keyExtractor={(item) => item.id} // Ensure 'id' is unique for FlatList
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    numColumns={layout === 'grid2x2' ? 2 : 1}
                    columnWrapperStyle={layout === 'grid2x2' ? styles.gridRow : undefined}
                    contentContainerStyle={[
                        styles.listContent,
                        layout === 'card' && styles.cardContent,
                        layout === 'grid2x2' && styles.gridContent,
                    ]}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[theme.colors.primary || "#007AFF"]}
                            tintColor={theme.colors.primary || "#007AFF"}
                        />
                    }
                    removeClippedSubviews={Platform.OS === 'android'} // Usually beneficial on Android, can cause issues on iOS
                    maxToRenderPerBatch={10} 
                    windowSize={21}
                    initialNumToRender={10}
                    // Removed onMomentumScrollEnd, onScrollToIndexFailed, and custom onScroll logic
                    
                    ListEmptyComponent={
                        !initialLoading && !loading && posts.length === 0 && (isConnected === true || isConnected === null) ? (
                            <View style={[styles.centered, {flex:1, minHeight: 200}]}> {/* Added minHeight for stability */}
                                <Text style={{ color: theme.colors.text }}>No posts found.</Text>
                            </View>
                        ) : null
                    }
                    ListFooterComponent={
                        // Show loading more for pagination requests
                        loading && !initialLoading && !refreshing && page > 1 ? ( 
                            <View style={styles.loadingMoreContainer}>
                                <ActivityIndicator size="small" color={theme.colors.primary || "#007AFF"} />
                                <Text style={[styles.loadingMoreText, {color: theme.colors.primary || "#007AFF"}]}>Loading more posts...</Text>
                            </View>
                        ) : (
                            // Show "no more posts" if truly finished, not loading, and have posts
                            !hasMore && posts.length > 0 && isConnected && !loading && !refreshing ? ( 
                                <View style={styles.centeredMessage}>
                                    <Text style={{ color: theme.colors.text }}>No more posts to load.</Text>
                                </View>
                            ) : null
                        )
                    }
                />

                <View style={[styles.bottomNavigation, { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border }]}>
                    <TouchableOpacity style={styles.tabButton} onPress={() => navigateToPage(SCREEN_NAMES.HOME)}>
                        <AntDesign name="home" size={24} color="white" />
                        <Text style={styles.tabText}>Home</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.tabButton} onPress={() => navigateToPage(SCREEN_NAMES.GRADES)}>
                        <AntDesign name="profile" size={24} color="white" />
                        <Text style={styles.tabText}>Grades</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.tabButton} onPress={() => navigateToPage(SCREEN_NAMES.ECOSYSTEM_WEBSITE)}>
                        <AntDesign name="earth" size={24} color="white" />
                        <Text style={styles.tabText}>Website</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.tabButton} onPress={() => setShowMoreMenu(!showMoreMenu)}>
                        <AntDesign name="bars" size={24} color="white" />
                        <Text style={styles.tabText}>More</Text>
                    </TouchableOpacity>
                </View>

                {showMoreMenu && (
                    <View style={[styles.moreMenu, {backgroundColor: theme.colors.cardHeavy || 'rgba(50,50,50,0.95)'}]}>
                        <TouchableOpacity style={styles.moreMenuItem} onPress={() => navigateToPage(SCREEN_NAMES.GAMES)}>
                            <Text style={[styles.moreMenuText, {color: theme.colors.text}]}>Games</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.moreMenuItem} onPress={() => navigateToPage(SCREEN_NAMES.TOOLS)}>
                            <Text style={[styles.moreMenuText, {color: theme.colors.text}]}>Tools</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.moreMenuItem} onPress={() => navigateToPage(SCREEN_NAMES.LINKS)}>
                            <Text style={[styles.moreMenuText, {color: theme.colors.text}]}>Links</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.moreMenuItem} onPress={() => navigateToPage(SCREEN_NAMES.DAILY_DISCUSSION)}>
                            <Text style={[styles.moreMenuText, {color: theme.colors.text}]}>Daily Discussion</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </PanGestureHandler>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: '#007AFF', // Consider theming
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    offlineContainer: {
        backgroundColor: '#FF9500',
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    offlineText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
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
        bottom: 70, 
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
        fontSize: 16,
        fontWeight: '500',
    },
    centeredMessage: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    listContent: {
        paddingBottom: 12, // Ensure space for last item / loader
    },
    cardContent: {
        paddingVertical: 16,
    },
    gridContent: {
        padding: 6,
    },
    gridRow: {
        justifyContent: 'space-between',
        paddingHorizontal: 6,
    },
    loadingMoreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
    },
    loadingMoreText: {
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 8,
    },
});

export default HomeScreen;