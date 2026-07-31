// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// expo-sqlite's web implementation ships a wa-sqlite.wasm binary that Metro
// needs to know how to resolve as an asset.
config.resolver.assetExts.push('wasm');

module.exports = config;
