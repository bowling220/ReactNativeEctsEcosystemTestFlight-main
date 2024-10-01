import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Linking, useWindowDimensions, Image } from 'react-native';
import HTML from 'react-native-render-html';
import { SvgXml } from 'react-native-svg';

const PostCard2 = ({ title = '', content = '', linkUrl = '', item = {} }) => {
    const [expanded, setExpanded] = useState(false);
    const [svgContent, setSvgContent] = useState(null);
    const windowWidth = useWindowDimensions().width;

    const imageUrl = item.image || '';

    useEffect(() => {
        if (imageUrl.endsWith('.svg')) {
            fetch(imageUrl)
                .then(response => response.text())
                .then(svg => setSvgContent(svg))
                .catch(error => {
                    console.error('Error fetching SVG:', error);
                    setSvgContent(null);
                });
        }
    }, [imageUrl]);

    const handlePress = () => {
        setExpanded(!expanded);
    };

    const handleLinkPress = () => {
        if (linkUrl) {
            Linking.openURL(linkUrl);
        }
    };

    const renderImage = () => {
        if (imageUrl.endsWith('.svg')) {
            if (svgContent) {
                return (
                    <View style={styles.svgContainer}>
                        <SvgXml xml={svgContent} width="100%" height="200" />
                    </View>
                );
            } else {
                return <Text>Loading SVG...</Text>;
            }
        } else if (imageUrl) {
            return <Image source={{ uri: imageUrl }} style={styles.image} />;
        }
        return null;
    };

    return (
        <View style={styles.card}>
            <Text style={styles.title}>{title}</Text>
            {!expanded && imageUrl && (
                <TouchableOpacity onPress={handlePress}>
                    {renderImage()}
                </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handlePress} style={styles.button}>
                <Text style={styles.buttonText}>{expanded ? 'Close' : 'Show more'}</Text>
            </TouchableOpacity>
            <Modal visible={expanded} animationType="slide">
                <View style={styles.modalContent}>
                    <TouchableOpacity onPress={handlePress} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>X</Text>
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>{title}</Text>
                    <ScrollView contentContainerStyle={styles.scrollView}>
                        <HTML
                            source={{ html: content }}
                            contentWidth={windowWidth}
                            ignoredDomTags={['video']}
                            tagsStyles={{ p: { fontSize: 16 } }} // Set font size for paragraphs
                        />
                        {linkUrl && (
                            <TouchableOpacity onPress={handleLinkPress} style={styles.linkButton}>
                                <Text style={styles.linkButtonText}>Open Link</Text>
                            </TouchableOpacity>
                        )}
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        padding: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
    },
    svgContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: 200,
    },
    image: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
        borderRadius: 5,
        marginBottom: 5,
    },
    title: {
        fontWeight: 'bold',
        marginBottom: 10,
    },
    button: {
        alignSelf: 'flex-end',
        marginTop: 5,
        padding: 5,
        zIndex: 1,
    },
    buttonText: {
        color: 'blue',
        fontWeight: 'bold',
    },
    modalContent: {
        flex: 1,
        paddingTop: 50,
        paddingHorizontal: 20,
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 30,
        padding: 10,
        backgroundColor: 'red', // Changed to red color
        borderRadius: 50, // Circular button
    },
    closeButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18, // Increased font size
    },
    modalTitle: {
        fontSize: 25,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    scrollView: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 10,
    },
    linkButton: {
        marginTop: 10,
        padding: 10,
        backgroundColor: 'blue',
        borderRadius: 5,
        alignSelf: 'center',
    },
    linkButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default React.memo(PostCard2);
