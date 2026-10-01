/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */
// const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");
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

// The native ExpoModulesCore pod is built from this app's own
// node_modules/expo-modules-core, but pnpm hands other expo packages
// (e.g. expo-av) a different version from the root store. Two JS copies
// that disagree with the native side crash Release builds on first render
// ("View config getter callback for component ViewManagerAdapter_ExpoVideoView
// must be a function"), so pin every import to the copy the pod uses.
const expoModulesCoreDir = path.dirname(
  require.resolve("expo-modules-core/package.json", { paths: [__dirname] })
);
const upstreamResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "expo-modules-core" || moduleName.startsWith("expo-modules-core/")) {
    moduleName = expoModulesCoreDir + moduleName.slice("expo-modules-core".length);
  }
  return upstreamResolveRequest
    ? upstreamResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

// config.resolver.disableHierarchicalLookup = true;

module.exports = withNativeWind(config, { input: "./global.css" });


