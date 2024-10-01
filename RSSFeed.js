import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import HTMLView from 'react-native-htmlview';

const RSSFeed = () => {
    const [feedData, setFeedData] = useState(null);

    useEffect(() => {
        fetch('https://ects-cmp.com/appfeeds/ecosystem/resources.json')
            .then((response) => response.text())
            .then((responseData) => {
                // Parse the XML data
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(responseData, 'text/xml');

                // Convert XML data to JSON
                const items = Array.from(xmlDoc.getElementsByTagName('item')).map((item) => {
                    const title = item.getElementsByTagName('title')[0].textContent;
                    const link = item.getElementsByTagName('link')[0].textContent;
                    const pubDate = item.getElementsByTagName('pubDate')[0].textContent;
                    const category = Array.from(item.getElementsByTagName('category')).map((cat) => cat.textContent);
                    const description = item.getElementsByTagName('description')[0].textContent;
                    const contentEncoded = item.getElementsByTagName('content:encoded')[0].textContent;
                    return { title, link, pubDate, category, description, contentEncoded };
                });

                setFeedData(items);
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);

    return (
        <ScrollView style={styles.container}>
            {feedData &&
                feedData.map((item, index) => (
                    <View key={index} style={styles.item}>
                        <Text style={styles.title}>{item.title}</Text>
                        <HTMLView value={item.contentEncoded} stylesheet={styles.html} />
                    </View>
                ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#fff',
    },
    item: {
        marginBottom: 20,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    html: {
        fontSize: 14,
    },
});

export default RSSFeed;
