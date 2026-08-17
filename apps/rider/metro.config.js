/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */
// const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const { getSentryExpoConfig } = require("@sentry/react-native/metro");

// eslint-disable-next-line no-undef
// const config = getDefaultConfig(__dirname);
const config = getSentryExpoConfig(__dirname);

// Both apps/rider and apps/store use the same Sentry+NativeWind Metro
// wrapper and near-identical resolver settings, so their default cache
// keys can collide, letting one app's bundler serve the other's cached
// module graph when run from the same machine. A unique cacheVersion per
// app rules that out.
config.cacheVersion = "enatega-rider-1.0";

// config.resolver.disableHierarchicalLookup = true;

module.exports = withNativeWind(config, { input: "./global.css" });
