/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */
// const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const { getSentryExpoConfig } = require("@sentry/react-native/metro");

// eslint-disable-next-line no-undef
// const config = getDefaultConfig(__dirname);
const config = getSentryExpoConfig(__dirname);

// Both apps/store and apps/rider use the same Sentry+NativeWind Metro
// wrapper and near-identical resolver settings, so their default cache
// keys can collide, letting one app's bundler serve the other's cached
// module graph when run from the same machine. A unique cacheVersion per
// app rules that out.
config.cacheVersion = "enatega-store-1.0";

// Add Node.js polyfills for React Native
config.resolver.alias = {
  ...config.resolver.alias,
  assert: require.resolve('assert'),
  events: require.resolve('events'),
  stream: require.resolve('stream'),
  util: require.resolve('util'),
  buffer: require.resolve('buffer'),
  process: require.resolve('process'),
};

// Add fallbacks for Node.js modules
config.resolver.fallback = {
  ...config.resolver.fallback,
  assert: require.resolve('assert'),
  events: require.resolve('events'),
  stream: require.resolve('stream'),
  util: require.resolve('util'),
  buffer: require.resolve('buffer'),
  process: require.resolve('process'),
};

// config.resolver.disableHierarchicalLookup = true;

module.exports = withNativeWind(config, { input: "./global.css" });


