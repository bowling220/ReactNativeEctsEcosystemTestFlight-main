// metro.config.js
const { getDefaultConfig } = require('@expo/metro-config');

module.exports = (async () => {
    const defaultConfig = await getDefaultConfig(__dirname);
    const {
        resolver: { sourceExts, assetExts }
    } = defaultConfig;
    return {
        transformer: {
            babelTransformerPath: require.resolve('react-native-svg-transformer')
        },
        resolver: {
            assetExts: assetExts.filter(ext => ext !== 'svg'),
            sourceExts: [...sourceExts, 'svg']
        },
        ...defaultConfig
    };
})();
