const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable CSS support for web
config.resolver.assetExts.push('css');

// Add platform-specific module resolution for web
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// For web platform, resolve react-native to react-native-web
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Add alias for web compatibility
config.resolver.alias = {
  ...(config.resolver.alias || {}),
  // Only alias react-native to react-native-web on web platform
  'react-native$': 'react-native-web',
};

// Block native-only modules on web
config.resolver.blockList = [
  // Block native-only Stripe modules on web
  /node_modules\/@stripe\/stripe-react-native\/.*\/Native.*\.js$/,
  /node_modules\/react-native\/Libraries\/Utilities\/codegenNativeCommands\.js$/,
];

module.exports = config;