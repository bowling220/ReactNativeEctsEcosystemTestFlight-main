import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Linking, useWindowDimensions, Image, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview'; // Import WebView
import HTML from 'react-native-render-html';
import { SvgXml } from 'react-native-svg';



const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

const PostCard2 = ({ title = '', content = '', linkUrl = '', item = {} }) => {
    const [expanded, setExpanded] = useState(false);
    const [showWebView, setShowWebView] = useState(false);
    const [svgContent, setSvgContent] = useState(null);
    const [loading, setLoading] = useState(false);
    const windowWidth = useWindowDimensions().width;
    const [modalTitleColor] = useState(getRandomColor());
    const [htmlContentColor] = useState(getRandomColor());
    const [linkButtonColor] = useState(getRandomColor());
    const [playButtonColor] = useState(getRandomColor());

    
    // Create a reference for the WebView
    const webViewRef = useRef(null);

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

    const handlePlayGame = () => {
        setExpanded(false); // Close the expanded modal
        setShowWebView(true); // Show WebView
    };

    const renderButtonLabel = () => {
        if (showWebView) {
            return 'Load Game';
        }
        return expanded ? 'Close' : 'Show More';
    };

    // Function to refresh the WebView
    const refreshPage = () => {
        if (webViewRef.current) {
            webViewRef.current.reload(); // Call the reload method on the WebView reference
        }
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
                <Text style={styles.buttonText}>{renderButtonLabel()}</Text>
            </TouchableOpacity>
            <Modal visible={expanded} animationType="slide">
    <View style={styles.modalContent}>
        <TouchableOpacity onPress={handlePress} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>X</Text>
        </TouchableOpacity>
        <Text style={[styles.modalTitle, { backgroundColor: modalTitleColor }]}>{title}</Text>
        {/* Render the image here */}
        {renderImage()} 
        <ScrollView contentContainerStyle={styles.scrollView}>
            <View style={styles.centeredContent}>
                <HTML
                    source={{ html: content }}
                    contentWidth={windowWidth}
                    ignoredDomTags={['video']}
                    tagsStyles={{ p: { fontSize: 16, backgroundColor: htmlContentColor } }} 
                />
                {linkUrl && (
                    <TouchableOpacity onPress={handleLinkPress} style={[styles.linkButton, { backgroundColor: linkButtonColor }]}>
                        <Text style={styles.linkButtonText}>Open External</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity onPress={handlePlayGame} style={[styles.playButton, { backgroundColor: playButtonColor }]}>
                    <Text style={styles.playButtonText}>{showWebView ? 'Load Game' : 'Open In App'}</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    </View>
</Modal>

            {/* WebView for playing games */}
            <Modal visible={showWebView} animationType="slide" transparent={true}>
                <View style={styles.webViewContainer}>
                    <Text style={styles.gameTitle}>Play the Game!</Text>
                    <Text style={styles.instructions}>Get ready to have fun!</Text>
                    {loading && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#0000ff" />
                            <Text>Loading...</Text>
                        </View>
                    )}
                    <WebView
                        ref={webViewRef} // Attach the reference here
                        source={{ uri: linkUrl }}
                        style={styles.webView}
                        onLoadStart={() => setLoading(true)}
                        onLoadEnd={() => setLoading(false)}
                    />
                    <TouchableOpacity style={styles.closeGameButton} onPress={() => setShowWebView(false)}>
                        <Text style={styles.closeButtonText}>Close Game</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.refreshButton} onPress={refreshPage}>
                        <Text style={styles.refreshButtonText}>Refresh</Text>
                    </TouchableOpacity>
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
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
    },
    buttonText: {
        color: 'blue',
        fontWeight: 'bold',
    },
    modalContent: {
        flex: 1,
        paddingTop: 50,
        paddingHorizontal: 20,
        alignItems: 'center', // Center horizontally
    },
    webViewContainer: {
        flex: 1,
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        padding: 20,
    },
    webView: {
        flex: 1,
        marginTop: 20,
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 30,
        padding: 10,
        backgroundColor: 'red',
        borderRadius: 15,
    },
    closeGameButton: {
        position: 'absolute',
        bottom: 30,
        left: '75%',
        transform: [{ translateX: -50 }],
        padding: 10,
        backgroundColor: 'orange', // Different background color for refresh
        borderRadius: 10,
    },
    closeButtonText: {
        color: 'white',
        fontWeight: 'bold',
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
    centeredContent: {
        alignItems: 'center',
        width: '100%',
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
    playButton: {
        marginTop: 10,
        padding: 10,
        backgroundColor: 'green',
        borderRadius: 5,
        alignSelf: 'center',
    },
    playButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    gameTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 10,
    },
    instructions: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    loadingContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -50 }, { translateY: -50 }],
        alignItems: 'center',
    },
    refreshButton: {
        position: 'absolute',
        bottom: 30,
        left: '25%',
        transform: [{ translateX: -50 }],
        padding: 10,
        backgroundColor: 'orange', // Different background color for refresh
        borderRadius: 10,
    },
    refreshButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default PostCard2;
