import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, BackHandler, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchPosts } from '../services/api';
import PostCard from '../components/PostCard';
import { AntDesign } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import { Share } from 'react-native';
import { decode } from 'html-entities';
import { PanGestureHandler, State } from 'react-native-gesture-handler';



const HomeScreen = ({ route, layout, toggleLayout }) => {
    const navigation = useNavigation();
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [page, setPage] = useState(1); 
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(true);
    const [showMore, setShowMore] = useState(false);
    const [cardColor, setCardColor] = useState('#84cdee');
    const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
    const [expanded, setExpanded] = useState(false);

    // Animated value initialization
    const animatedValue = new Animated.Value(0);

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
                        onPress: () => BackHandler.exitApp(),
                        style: 'destructive',
                    },
                    {
                        text: 'Try Again',
                        onPress: () => navigation.navigate('Home', { key: Math.random() }),
                        style: 'cancel',
                    },
                ],
                { cancelable: false }
            );
        }
    }, [isConnected, navigation]);

    const ColorPicker = ({ onSelectColor }) => {
        const colors = [
            '#FFE4E1', '#E6E6FA', '#D3D3D3', '#ADD8E6', '#98FB98', '#F08080', '#50b8e7', '#00703c'
        ];

        return (
            <View style={styles.colorPickerContainer}>
                {colors.map(color => (
                    <TouchableOpacity
                        key={color}
                        style={[styles.colorButton, { backgroundColor: color }]}
                        onPress={() => onSelectColor(color)}
                    />
                ))}
            </View>
        );
    };

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
            }
        };

        if (isConnected) {
            loadPosts();
        }
    }, [page, isConnected]);

    useEffect(() => {
        if (selectedCategory) {
            const filtered = posts.filter(post => post.category.includes(selectedCategory));
            setFilteredPosts(filtered);
        } else {
            setFilteredPosts(posts);
        }
    }, [selectedCategory, posts]);

    const handleLoadMore = () => {
        if (hasMore) {
            setPage(prevPage => prevPage + 1);
        }
    };

    const handlePagePress = (pageName) => {
        navigation.navigate(pageName);
    };


    const stripHtmlTags = (htmlContent) => {
        if (!htmlContent) return '';
        // Remove all HTML tags
        return htmlContent.replace(/<\/?[^>]+(>|$)/g, '');
    };


    const handleShare = async (title, content) => {
        try {
            const googlePlayLink = 'https://play.google.com/store/apps/details?id=com.gmail.ectscmp.ecosystem&pcampaignid=web_share';
            const testFlightLink = 'https://testflight.apple.com/join/vaqG7uk2';

            const plainContent = stripHtmlTags(content);
            const decodedContent = decode(plainContent);
            const partialContent = decodedContent.length > 100 ? decodedContent.substring(0, 100) + '...' : decodedContent;

            const result = await Share.share({
                title: title,
                message: `${title}\n\n${partialContent}\n\nDownload the app:\nGoogle Play Store: ${googlePlayLink}\nTestFlight: ${testFlightLink}`,
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

    const renderPost = ({ item }) => {
        if (layout === 'list') {
            return (
                <View style={[styles.listItem, { backgroundColor: cardColor }]}>
                    <Text style={styles.title}>{item.title}</Text>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity onPress={() => handleShare(item.title, item['content-encoded'])}>
                            <Text style={styles.shareText}>Share</Text>
                            <Text style={styles.formatText}>Change Format In The Top Left To Read More</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }

        if (layout === 'card') {
            return (
                <PostCard
                    title={item.title}
                    content={item['content-encoded']}
                    imageUrl={item.imageUrl}
                />
            );
        }

        if (layout === 'grid2x2') {
            return (
                <View style={styles.gridItem2x2}>
                    <PostCard
                        title={item.title}
                        content={item['content-encoded']}
                        imageUrl={item.imageUrl}
                    />
                </View>
            );
        }
    };

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
                navigation.navigate('Ecosystem Website'); // Swipe left to navigate to Grades
            }
        }
    };
    const navigateToPage = (pageName) => {
        handlePagePress(pageName);
    };
    
    
      return (
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
        >
          <Animated.View style={[styles.container, { backgroundColor }]}>
            {layout === 'list' && <ColorPicker onSelectColor={setCardColor} />}
            <FlatList
              data={filteredPosts}
              renderItem={renderPost}
              keyExtractor={(item, index) => index.toString()}
              numColumns={layout === 'grid2x2' ? 2 : 1}
              columnWrapperStyle={layout === 'grid2x2' ? styles.gridWrapper2x2 : undefined}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.1}
              key={layout} // Add this line to change the key prop when layout changes
              ListFooterComponent={
                hasMore && isConnected && (
                  <TouchableOpacity style={styles.loadMoreButton} onPress={handleLoadMore} disabled={loading}>
                    {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.loadMoreText}>Load More</Text>}
                  </TouchableOpacity>
                )
              }
            />
            <View style={styles.bottomNavigation}>
              <TouchableOpacity style={styles.tabButton} onPress={() => handlePagePress('Home')}>
                <AntDesign name="home" size={24} color="white" />
                <Text style={styles.tabText}>Home</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tabButton} onPress={() => handlePagePress('Grades')}>
                <AntDesign name="profile" size={24} color="white" />
                <Text style={styles.tabText}>Grades</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tabButton} onPress={() => handlePagePress('Ecosystem Website')}>
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
          </Animated.View>
        </PanGestureHandler>
      );
    };
    

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listItem: {
        flex: 1,
        margin: 10,
        padding: 10,
        borderRadius: 10,
        elevation: 3,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    buttonContainer: {
        marginTop: 10,
    },
    shareText: {
        color: '#007BFF',
        fontSize: 16,
    },
    formatText: {
        fontSize: 14,
        color: '#6c757d',
    },
    colorPickerContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    colorButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        margin: 5,
    },
    gridWrapper2x2: {
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    gridItem2x2: {
        flex: 1,
        margin: 5,
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
        color: '#fff',
        fontSize: 12,
    },
    moreMenu: {
        position: 'absolute',
        bottom: 60,
        right: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 5,
        padding: 10,
    },
    moreMenuItem: {
        paddingVertical: 10,
    },
    moreMenuText: {
        fontSize: 16,
    },
    loadMoreButton: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginVertical: 10,
    },
    loadMoreText: {
        color: '#fff',
    },
});

export default HomeScreen;
