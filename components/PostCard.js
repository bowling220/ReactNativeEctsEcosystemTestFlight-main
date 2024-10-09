import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, ScrollView, useWindowDimensions, ActivityIndicator, Share } from 'react-native';
import HTML from 'react-native-render-html';
import moment from 'moment';
import { AntDesign } from '@expo/vector-icons';
import { decode } from 'html-entities';

const PostCard = ({ title, content, linkUrl, item, pubDate, categories = [] }) => {
    const [expanded, setExpanded] = useState(false);
    const [categoriesExpanded, setCategoriesExpanded] = useState(false);
    const [loading, setLoading] = useState(true);
    const windowWidth = useWindowDimensions().width;

    const resizeImagesInContent = (content, maxWidth) => {
        if (!content) return null;
        const imgRegex = /<img[^>]*src\s*=\s*['"]([^'"]+)['"][^>]*>/g;
        return content.replace(imgRegex, (match, url) => `<img src='${url}' style='max-width:${maxWidth}px; height:auto;'>`);
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

    const resizedContent = resizeImagesInContent(content, windowWidth);
    const imageUrl = item && item.imageUrl ? item.imageUrl : extractImageUrl(content);
    const handleModalToggle = () => setExpanded(!expanded);
    const formattedPubDate = pubDate ? moment(pubDate).format('MMMM D, YYYY [at] h:mm A') : 'Date not available';

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.title}>{title || 'No Title'}</Text>
                
                <View style={styles.categoryContainer}>
                    {Array.isArray(categories) && categories.length > 0 ? ( // Check if categories is an array
                        <>
                            <Text style={styles.category}>{categories[0]}</Text>
                            {categories.length > 1 && (
                                <>
                                    <TouchableOpacity onPress={() => setCategoriesExpanded(!categoriesExpanded)}>
                                        <Text style={styles.moreButton}>
                                            {categoriesExpanded ? 'Hide categories' : `+ ${categories.length - 1} more`}
                                        </Text>
                                    </TouchableOpacity>
                                    {categoriesExpanded && (
                                        <View style={styles.additionalCategories}>
                                            {categories.slice(1).map((category, index) => (
                                                <Text key={index} style={styles.category}>{category}</Text>
                                            ))}
                                        </View>
                                    )}
                                </>
                            )}
                        </>
                    ) : (
                        <Text style={styles.noCategoriesText}>No categories</Text> // Display if there are no categories
                    )}
                                    <Text style={styles.pubDate}>{formattedPubDate}</Text>
 
                </View>
    
                <TouchableOpacity style={styles.shareButton} onPress={() => handleShare(title, content)}>
                    <AntDesign name="sharealt" size={24} color="#fff" />
                    <Text style={styles.shareButtonText}>Share</Text>
                </TouchableOpacity>
            </View>
    
            {imageUrl && (
                <Image
                    source={{ uri: imageUrl }}
                    style={styles.image}
                    onLoad={() => setLoading(false)}
                    onError={() => setLoading(false)}
                />
            )}
            {loading && <ActivityIndicator style={styles.loader} size="small" color="#fff" />}
    
            <TouchableOpacity onPress={handleModalToggle}>
                <Text style={styles.readMoreButton}>Read More</Text>
            </TouchableOpacity>
    
            <Modal visible={expanded} animationType="slide" transparent={true}>
                <View style={styles.modalContent}>
                    <TouchableOpacity onPress={handleModalToggle} style={styles.closeButton}>
                        <View style={styles.closeButtonArea}>
                            <Text style={styles.closeButtonText}>Close</Text>
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>{title || 'No Title'}</Text>
                    <Text style={styles.modalDate}>{formattedPubDate}</Text>
    
                    <ScrollView contentContainerStyle={styles.scrollView} showsVerticalScrollIndicator={false}>
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
                    </ScrollView>
                </View>
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
        overflow: 'hidden', // Prevent horizontal overflow
    },
    additionalCategories: {
        marginTop: 5,
    },
    header: {
        marginBottom: 0,
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
    categoryContainer: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    category: {
        fontSize: 14,
        color: '#00000',
        marginBottom: 0,
    },
    noCategoriesText: {
        fontSize: 14,
        color: 'gray',
        fontStyle: 'italic',
        marginBottom: 5,
    },
    moreButton: {
        fontSize: 14,
        color: '#007BFF',
        fontWeight: 'bold',
        marginTop: 5,
    },
    pubDate: {
        fontSize: 14,
        color: '#888',
        marginBottom: 10,
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
        color: '#fff',
        marginLeft: 5,
        fontWeight: 'bold',
    },
    readMoreButton: {
        backgroundColor: '#007BFF',
        color: '#FFFFFF',
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 10,
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    
    
    modalContent: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    scrollView: {
        paddingBottom: 20,
    },
    closeButton: {
        marginTop:15,
        marginBottom: 10,
    },
    closeButtonArea: {
        padding: 10,
        backgroundColor: '#ff4c4c',
        borderRadius: 25,
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalDate: {
        fontSize: 16,
        color: '#888',
        marginBottom: 20,
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
    },
});

export default PostCard;
