import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Linking, useWindowDimensions, Image, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import HTML from 'react-native-render-html';
import { SvgXml } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';

const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

const PostCard2 = ({ title = '', content = '', linkUrl = '', item = {} }) => {
    const { theme, isDarkMode } = useTheme();
    const { getFontSizeMultiplier, getImageQuality } = useSettings();
    const fontSizeMultiplier = getFontSizeMultiplier();
    const imageQuality = getImageQuality();
    const [expanded, setExpanded] = useState(false);
    const [showWebView, setShowWebView] = useState(false);
    const [svgContent, setSvgContent] = useState(null);
    const [loading, setLoading] = useState(false);
    const windowWidth = useWindowDimensions().width;
    const [modalTitleColor] = useState(theme.colors.primary);
    const [htmlContentColor] = useState(theme.colors.background);
    const [linkButtonColor] = useState(theme.colors.primary);
    const [playButtonColor] = useState(theme.colors.primary);

    const webViewRef = useRef(null);

    const imageUrl = item.image || '';

    useEffect(() => {
        if (imageUrl.endsWith('.svg')) {
            fetch(imageUrl)
                .then(response => response.text())
                .then(svg => setSvgContent(svg))
                .catch(error => {
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
                return (
                    <View style={styles.svgContainer}>
                        <Text style={{ color: theme.colors.text }}>Loading SVG...</Text>
                    </View>
                );
            }
        } else if (imageUrl) {
            return (
                <Image 
                    source={{ 
                        uri: imageQuality === 'low' ? `${imageUrl}?quality=low` : imageUrl,
                        cache: 'reload'
                    }} 
                    style={styles.image} 
                />
            );
        }
        return null;
    };

    const handlePlayGame = () => {
        setExpanded(false);
        setShowWebView(true);
    };

    const renderButtonLabel = () => {
        if (showWebView) {
            return 'Load Game';
        }
        return expanded ? 'Close' : 'Show More';
    };

    const refreshPage = () => {
        if (webViewRef.current) {
            webViewRef.current.reload();
        }
    };

    return (
        <View style={[styles.card, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
            <Text style={[styles.title, { color: theme.colors.text, fontSize: 16 * fontSizeMultiplier }]}>{title}</Text>
            {!expanded && imageUrl && (
                <TouchableOpacity onPress={handlePress}>
                    {renderImage()}
                </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handlePress} style={[styles.button, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.buttonText, { color: 'white' }]}>{renderButtonLabel()}</Text>
            </TouchableOpacity>
            <Modal visible={expanded} animationType="slide">
                <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
                    <TouchableOpacity onPress={handlePress} style={[styles.closeButton, { backgroundColor: theme.colors.error }]}>
                        <Text style={[styles.closeButtonText, { fontSize: 14 * fontSizeMultiplier }]}>X</Text>
                    </TouchableOpacity>
                    <Text style={[styles.modalTitle, { backgroundColor: modalTitleColor, color: theme.colors.text, fontSize: 20 * fontSizeMultiplier }]}>{title}</Text>
                    {renderImage()} 
                    <ScrollView contentContainerStyle={styles.scrollView}>
                        <View style={styles.centeredContent}>
                            <HTML
                                source={{ html: content }}
                                contentWidth={windowWidth}
                                ignoredDomTags={['video']}
                                tagsStyles={{ 
                                    p: { 
                                        fontSize: 16 * fontSizeMultiplier, 
                                        backgroundColor: htmlContentColor,
                                        color: theme.colors.text 
                                    } 
                                }} 
                            />
                            {linkUrl && (
                                <TouchableOpacity onPress={handleLinkPress} style={[styles.linkButton, { backgroundColor: linkButtonColor }]}>
                                    <Text style={[styles.linkButtonText, { fontSize: 14 * fontSizeMultiplier }]}>Open External</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity onPress={handlePlayGame} style={[styles.playButton, { backgroundColor: playButtonColor }]}>
                                <Text style={[styles.playButtonText, { fontSize: 14 * fontSizeMultiplier }]}>{showWebView ? 'Load Game' : 'Open In App'}</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </Modal>

            <Modal visible={showWebView} animationType="slide" transparent={true}>
                <View style={[styles.webViewContainer, { backgroundColor: theme.colors.background }]}>
                    <Text style={[styles.gameTitle, { color: theme.colors.text }]}>Play the Game!</Text>
                    <Text style={[styles.instructions, { color: theme.colors.text }]}>Get ready to have fun!</Text>
                    {loading && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={theme.colors.primary} />
                            <Text style={{ color: theme.colors.text }}>Loading...</Text>
                        </View>
                    )}
                    <WebView
                        ref={webViewRef}
                        source={{ uri: linkUrl }}
                        style={styles.webView}
                        onLoadStart={() => setLoading(true)}
                        onLoadEnd={() => setLoading(false)}
                    />
                    <TouchableOpacity 
                        style={[styles.closeGameButton, { backgroundColor: theme.colors.error }]} 
                        onPress={() => setShowWebView(false)}
                    >
                        <Text style={styles.closeButtonText}>Close Game</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.refreshButton, { backgroundColor: theme.colors.primary }]} 
                        onPress={refreshPage}
                    >
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
        borderRadius: 5,
        width: '100%',
        maxWidth: '100%',
        position: 'relative',
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
        fontSize: 16,
        paddingRight: 80,
    },
    button: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 8,
        zIndex: 1,
        borderRadius: 5,
        minWidth: 80,
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#007AFF',
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.8,
        shadowRadius: 8,
    },
    buttonText: {
        fontWeight: 'bold',
        fontSize: 14,
        textShadowColor: 'rgba(0, 122, 255, 0.75)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    modalContent: {
        flex: 1,
        paddingTop: 50,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    webViewContainer: {
        flex: 1,
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
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
        borderRadius: 15,
        zIndex: 2,
    },
    closeGameButton: {
        position: 'absolute',
        bottom: 30,
        left: '75%',
        transform: [{ translateX: -50 }],
        padding: 10,
        borderRadius: 10,
        zIndex: 2,
    },
    closeButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
        padding: 10,
        width: '100%',
    },
    scrollView: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 10,
        width: '100%',
    },
    centeredContent: {
        alignItems: 'center',
        width: '100%',
        paddingBottom: 20,
    },
    linkButton: {
        marginTop: 10,
        padding: 10,
        borderRadius: 5,
        alignSelf: 'center',
        minWidth: 120,
        alignItems: 'center',
    },
    linkButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    playButton: {
        marginTop: 10,
        padding: 10,
        borderRadius: 5,
        alignSelf: 'center',
        minWidth: 120,
        alignItems: 'center',
    },
    playButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    gameTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 10,
    },
    instructions: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
    },
    loadingContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -50 }, { translateY: -50 }],
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 20,
        borderRadius: 10,
        zIndex: 2,
    },
    refreshButton: {
        position: 'absolute',
        bottom: 30,
        left: '25%',
        transform: [{ translateX: -50 }],
        padding: 10,
        borderRadius: 10,
        zIndex: 2,
    },
    refreshButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default PostCard2;
