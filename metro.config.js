const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable CSS support for web
config.resolver.assetExts.push('css');

// Fix Stripe React Native web compatibility
config.resolver.unstable_conditionNames = ['browser', 'require', 'react-native'];

// Add platform-specific module resolution for web
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Resolve react-native to react-native-web for web platform
config.resolver.alias = {
  'react-native': 'react-native-web',
};

// Add extra node modules mapping for web compatibility
config.resolver.extraNodeModules = {
  'react-native': require.resolve('react-native-web'),
};

module.exports = config;