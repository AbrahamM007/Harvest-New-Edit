const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable CSS support for web
config.resolver.assetExts.push('css');

// Fix Stripe React Native web compatibility
config.resolver.unstable_conditionNames = ['browser', 'require', 'react-native'];
module.exports = config;