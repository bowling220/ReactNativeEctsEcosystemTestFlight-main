// PostCard.js
import React, { useState, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, ScrollView, useWindowDimensions, ActivityIndicator, Share, SafeAreaView, Dimensions } from 'react-native';
import HTML from 'react-native-render-html';
import moment from 'moment';
import { AntDesign } from '@expo/vector-icons';
import { decode } from 'html-entities';
import Toast from 'react-native-toast-message';
import { useTheme } from '../context/ThemeContext'; // Adjust path if necessary
import { useSettings } from '../context/SettingsContext';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const PostCard = ({ title, content, linkUrl, item, pubDate, categories = [], onSharePress, layout = 'list' }) => {
    const { theme, isDarkMode } = useTheme();
    const { getFontSizeMultiplier, getImageQuality } = useSettings();
    const fontSizeMultiplier = getFontSizeMultiplier();
    const imageQuality = getImageQuality();
    const styles = useMemo(() => getDynamicStyles(theme, isDarkMode), [theme, isDarkMode]); // Memoize styles

    const [expanded, setExpanded] = useState(false);
    const [loading, setLoading] = useState(true);
    const windowWidth = useWindowDimensions().width;

    const resizeImagesInContent = (htmlContent, maxWidth) => {
        if (!htmlContent) return null;
        const imgRegex = /<img[^>]*src\s*=\s*['"]([^'"]+)['"][^>]*>/g;
        return htmlContent.replace(imgRegex, (match, url) => {
            // Add quality parameter to image URL if data saver is enabled
            const qualityParam = imageQuality === 'low' ? '?quality=low' : '';
            return `<img src='${url}${qualityParam}' style='max-width:${maxWidth}px; height:auto;'>`;
        });
    };

    const extractImageUrl = (contentEncoded) => {
        if (!contentEncoded) return null;
        const imgRegex = /<img[^>]+src\s*=\s*['"]([^'"]+)['"][^>]*>/;
        const match = imgRegex.exec(contentEncoded);
        return match ? match[1] : null;
    };

    const stripHtmlTags = (htmlContent) => {
        if (!htmlContent) return '';
        return htmlContent.replace(/<\/?[^>]+(>|$)/g, '');
    };

    const handleShareInternal = async (shareTitle, shareContent) => {
        try {
            const googlePlayLink = 'https://play.google.com/store/apps/details?id=com.gmail.ectscmp.ecosystem&pcampaignid=web_share';
            const testFlightLink = 'https://apps.apple.com/us/app/ects-cmp-ecosystem/id6504026235';

            const plainContent = stripHtmlTags(shareContent);
            const decodedContent = decode(plainContent);
            const partialContent = decodedContent.length > 100 ? decodedContent.substring(0, 100) + '...' : decodedContent;

            const result = await Share.share({
                title: shareTitle,
                message: `${shareTitle}\n\n${partialContent}\n\nDownload the app:\nGoogle Play Store: ${googlePlayLink}\niOS: ${testFlightLink}`,
            });

            if (result.action === Share.sharedAction) {
                Toast.show({
                    type: 'success',
                    text1: 'Shared successfully!',
                    position: 'bottom',
                    visibilityTime: 2000,
                });
            }
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Sharing Error',
                text2: error.message,
                position: 'bottom',
                visibilityTime: 3000,
            });
        }
    };

    const resizedContent = resizeImagesInContent(content, windowWidth - 32);
    const imageUrl = item && item.imageUrl ? item.imageUrl : extractImageUrl(content);
    const handleModalToggle = () => setExpanded(!expanded);
    const formattedPubDate = pubDate ? formatDate(pubDate) : 'Date not available';

    const getLayoutStyles = () => {
        switch (layout) {
            case 'card':
                return {
                    container: styles.cardView,
                    image: styles.cardImage,
                    title: styles.cardTitle,
                    date: styles.cardDate,
                    footer: styles.cardFooter,
                };
            case 'grid2x2':
                return {
                    container: styles.gridView,
                    image: styles.gridImage,
                    title: styles.gridTitle,
                    date: styles.gridDate,
                    footer: styles.gridFooter,
                };
            default: // 'list'
                return {
                    container: styles.listView,
                    image: styles.listImage,
                    title: styles.listTitle,
                    date: styles.listDate,
                    footer: styles.listFooter,
                };
        }
    };

    const layoutStyles = getLayoutStyles(); // This depends on `styles` which is now theme-dependent

    React.useEffect(() => {
        if ((layout === 'card' || layout === 'grid2x2') && imageUrl) {
            setLoading(true);
        } else {
            setLoading(false);
        }
    }, [imageUrl, layout]);

    const effectiveOnSharePress = onSharePress ? onSharePress : () => handleShareInternal(title, content);

    // Dynamic HTML styles based on theme and font size
    const htmlTagsStyles = {
        p: {
            fontSize: 16 * fontSizeMultiplier,
            lineHeight: 24 * fontSizeMultiplier,
            color: theme.colors.text,
            marginBottom: 16
        },
        img: {
            marginVertical: 16,
            borderRadius: 8,
        },
        a: {
            color: theme.colors.primary,
            textDecorationLine: 'none'
        }
    };

    return (
        <View style={[styles.card, layoutStyles.container]}>
            <View style={styles.header}>
                <Text style={[styles.title, layoutStyles.title, { fontSize: 18 * fontSizeMultiplier }]} numberOfLines={layout === 'grid2x2' ? 3 : 2}>{title || 'No Title'}</Text>
                <Text style={[styles.date, layoutStyles.date, { fontSize: 13 * fontSizeMultiplier }]}>{formattedPubDate}</Text>
            </View>

            {(layout === 'card' || layout === 'grid2x2') && imageUrl && (
                <View>
                    <Image
                        source={{ 
                            uri: imageQuality === 'low' ? `${imageUrl}?quality=low` : imageUrl,
                            cache: 'reload' // Force reload when quality changes
                        }}
                        style={[styles.image, layoutStyles.image]}
                        onLoad={() => setLoading(false)}
                        onError={() => {
                            setLoading(false);
                        }}
                    />
                    {loading && (
                        <ActivityIndicator
                            style={styles.loader}
                            size="small"
                            color={theme.colors.primary}
                        />
                    )}
                </View>
            )}

            <View style={[styles.footer, layoutStyles.footer]}>
                <TouchableOpacity
                    style={[
                        styles.readMoreButton,
                        layout === 'grid2x2' && styles.gridReadMoreButton
                    ]}
                    onPress={handleModalToggle}
                >
                    <Text
                        style={[
                            styles.readMoreButtonText,
                            layout === 'grid2x2' && styles.gridReadMoreButtonText
                        ]}
                    >
                        Read More
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.shareButton,
                        layout === 'grid2x2' && styles.gridShareButtonIconOnly
                    ]}
                    onPress={effectiveOnSharePress}
                >
                    <AntDesign
                        name="sharealt"
                        size={layout === 'grid2x2' ? 18 : 24}
                        color="#fff" // Share button icon color (typically white for good contrast on green)
                    />
                    {layout !== 'grid2x2' && (
                        <Text style={styles.shareButtonText}>Share</Text>
                    )}
                </TouchableOpacity>
            </View>

            <Modal
                visible={expanded}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={handleModalToggle}
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { fontSize: 22 * fontSizeMultiplier }]} numberOfLines={3}>{title || 'No Title'}</Text>
                        <Text style={[styles.modalDate, { fontSize: 14 * fontSizeMultiplier }]}>{formattedPubDate}</Text>
                        <TouchableOpacity
                            onPress={handleModalToggle}
                            style={styles.modalCloseButton}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <AntDesign name="close" size={24} color={theme.colors.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        style={styles.modalScrollView}
                        contentContainerStyle={styles.modalScrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {resizedContent ? (
                            <HTML
                                source={{ html: resizedContent }}
                                contentWidth={windowWidth - 32}
                                ignoredDomTags={['video']}
                                tagsStyles={htmlTagsStyles} // Use dynamic HTML styles
                            />
                        ) : (
                            <Text style={styles.errorText}>Content could not be rendered or is empty.</Text>
                        )}
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        </View>
    );
};

// Define styles as a function that takes theme and isDarkMode
const getDynamicStyles = (theme, isDarkMode) => StyleSheet.create({
    card: {
        backgroundColor: theme.colors.card, // Themed
        borderRadius: 12,
        shadowColor: theme.colors.text, // Themed (black for light, white for dark - creates a glow effect on dark)
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.15,
        shadowRadius: 3.84,
        elevation: 5,
        overflow: 'hidden',
    },
    listView: {
        marginVertical: 10,
        marginHorizontal: 16,
    },
    cardView: {
        marginVertical: 8,
        marginHorizontal: 16,
    },
    gridView: {
        margin: 6,
        flex: 1,
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.text, // Themed
        lineHeight: 24,
    },
    listTitle: {
        marginBottom: 4,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: '600',
        lineHeight: 22,
    },
    gridTitle: {
        fontSize: 14,
        lineHeight: 18,
        minHeight: 36,
    },
    date: {
        fontSize: 13,
        color: theme.colors.text, // Themed
        opacity: 0.7, // Make it slightly less prominent
        marginTop: 4,
    },
    listDate: {},
    cardDate: {},
    gridDate: {
        fontSize: 11,
        marginTop: 2,
    },
    image: {
        width: '100%',
        resizeMode: 'cover',
        backgroundColor: theme.colors.border, // Themed (placeholder background)
    },
    listImage: {
        height: 220,
    },
    cardImage: {
        height: 200,
    },
    gridImage: {
        height: 120,
    },
    loader: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -12 }, { translateY: -12 }],
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border, // Themed
    },
    listFooter: {},
    cardFooter: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    gridFooter: {
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    readMoreButton: {
        backgroundColor: theme.colors.primary, // Themed
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        flexShrink: 1,
    },
    readMoreButtonText: {
        color: isDarkMode ? theme.colors.text : theme.colors.background, // Contrast with primary button
        fontWeight: '600',
        fontSize: 14,
    },
    gridReadMoreButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginRight: 8,
    },
    gridReadMoreButtonText: {
        fontSize: 12,
    },
    shareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#34C759', // Kept green as per original design
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    shareButtonText: {
        color: '#FFFFFF', // White text for green button
        marginLeft: 8,
        fontWeight: '600',
        fontSize: 14,
    },
    gridShareButtonIconOnly: {
        paddingVertical: 8,
        paddingHorizontal: 10,
        marginLeft: 0,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: theme.colors.background, // Themed
    },
    modalHeader: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border, // Themed
        backgroundColor: theme.colors.card, // Themed
    },
    modalCloseButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 1,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: isDarkMode ? theme.colors.border : '#e9e9eb', // Themed background
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: theme.colors.text, // Themed
        marginBottom: 4,
        paddingRight: 40,
    },
    modalDate: {
        fontSize: 14,
        color: theme.colors.text, // Themed
        opacity: 0.7, // Make it slightly less prominent
        marginBottom: 8,
    },
    modalScrollView: {
        flex: 1,
    },
    modalScrollContent: {
        padding: 16,
        backgroundColor: theme.colors.card, // Themed
    },
    errorText: {
        color: theme.colors.notification, // Themed
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
        paddingHorizontal: 16,
    },
});

export default PostCard;