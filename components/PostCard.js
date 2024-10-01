import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, ScrollView, Linking, useWindowDimensions, ActivityIndicator, Share } from 'react-native';
import HTML from 'react-native-render-html';
import moment from 'moment';
import { AntDesign } from '@expo/vector-icons';
import { decode } from 'html-entities';
import Animated, { Easing, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const PostCard = ({ title, content, linkUrl, item, author, pubDate }) => {
    const [expanded, setExpanded] = useState(false);
    const [loading, setLoading] = useState(true);
    const windowWidth = useWindowDimensions().width;
    const slideAnim = useSharedValue(0); // Animation value for sliding

    // Resize images in HTML content
    const resizeImagesInContent = (content, maxWidth) => {
        if (!content) return null;
        const imgRegex = /<img[^>]*src\s*=\s*['"]([^'"]+)['"][^>]*>/g;
        return content.replace(imgRegex, (match, url) => `<img src='${url}' style='max-width:${maxWidth}px; height:auto;'>`);
    };

    // Extract the first image URL from content
    const extractImageUrl = (contentEncoded) => {
        if (!contentEncoded) return null;
        const imgRegex = /<img[^>]+src\s*=\s*['"]([^'"]+)['"][^>]*>/;
        const match = imgRegex.exec(contentEncoded);
        return match ? match[1] : null;
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

    // Prepare the content for rendering
    const resizedContent = resizeImagesInContent(content, windowWidth);
    const imageUrl = item && item.imageUrl ? item.imageUrl : extractImageUrl(content);

    // Toggle modal visibility
    const handlePress = () => setExpanded(!expanded);
    const handleLinkPress = () => {
        if (linkUrl) {
            Linking.openURL(linkUrl);
        }
    };

    // Format publication date
    const formattedPubDate = pubDate ? moment(pubDate).format('MMMM D, YYYY [at] h:mm A') : 'Date not available';

    // Animated style
    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: slideAnim.value }],
        };
    });

    // Trigger animation when modal opens
    React.useEffect(() => {
        slideAnim.value = withSpring(expanded ? 0 : 40, { damping: 7, stiffness: 75 });
    }, [expanded]);

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.title}>{title || 'No Title'}</Text>
                {author && <Text style={styles.author}>By {author}</Text>}
            </View>

            <TouchableOpacity
                style={styles.shareButton}
                onPress={() => handleShare(title, content)}
            >
                <AntDesign name="sharealt" size={24} color="#fff" />
                <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>

            {!expanded && imageUrl && (
                <Image
                    source={{ uri: imageUrl }}
                    style={styles.image}
                    onLoad={() => setLoading(false)}
                    onError={() => setLoading(false)}
                />
            )}
            {loading && !expanded && <ActivityIndicator style={styles.loader} size="small" color="#fff" />}
            <TouchableOpacity onPress={handlePress} style={styles.button} accessibilityLabel={expanded ? 'Close content' : 'Show more content'} accessibilityRole="button">
                <Text style={styles.buttonText}>{expanded ? 'Close' : 'Show more'}</Text>
            </TouchableOpacity>
            <Modal visible={expanded} animationType="none" transparent={true}>
                <Animated.View style={[styles.modalContent, animatedStyle]}>
                    <TouchableOpacity onPress={handlePress} style={styles.closeButton} accessibilityLabel="Close modal" accessibilityRole="button">
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>{title || 'No Title'}</Text>
                    <ScrollView contentContainerStyle={styles.scrollView}>
                        {resizedContent ? (
                            <HTML
                                source={{ html: resizedContent }}
                                contentWidth={windowWidth}
                                ignoredDomTags={['video']}
                                tagsStyles={{ p: { fontSize: 16 } }}
                            />
                        ) : (
                            <Text style={styles.errorText}>Content could not be rendered.</Text>
                        )}
                        {linkUrl && (
                            <TouchableOpacity onPress={handleLinkPress} style={styles.linkButton} accessibilityLabel="Open external link" accessibilityRole="button">
                                <Text style={styles.linkButtonText}>Open Link</Text>
                            </TouchableOpacity>
                        )}
                    </ScrollView>
                </Animated.View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 15,
        backgroundColor: '#f5f5f5',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    header: {
        marginBottom: 10,
    },
    image: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
        borderRadius: 15,
        marginBottom: 10,
    },
    loader: {
        marginVertical: 10,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    author: {
        fontSize: 16,
        fontStyle: 'italic',
        color: '#666',
        marginBottom: 5,
    },
    pubDate: {
        fontSize: 14,
        color: '#888',
        marginBottom: 10,
    },
    button: {
        alignSelf: 'flex-end',
        marginTop: 5,
        padding: 10,
    },
    buttonText: {
        color: '#007BFF',
        fontWeight: 'bold',
    },
    shareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#007BFF',
        borderRadius: 5,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 3,
    },
    shareButtonText: {
        color: 'white',
        marginLeft: 5,
        fontWeight: 'bold',
    },
    modalContent: {
        flex: 1,
        backgroundColor: '#fff',
        marginTop: 'auto',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    closeButton: {
        alignSelf: 'flex-end',
        padding: 10,
        backgroundColor: '#007BFF', // Use a background color to make it stand out
        borderRadius: 5, // Rounded corners
        marginBottom: 5,
        marginTop: 18,
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 13, // Increase font size for better readability
        fontWeight: 'bold',
    },
    
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    modalDate: {
        fontSize: 14,
        color: '#888',
        marginBottom: 20,
    },
    scrollView: {
        paddingBottom: 20,
    },
    linkButton: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#007BFF',
        borderRadius: 5,
    },
    linkButtonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    errorText: {
        fontSize: 16,
        color: '#ff0000',
        textAlign: 'center',
        marginTop: 20,
    },
});

export default PostCard;
