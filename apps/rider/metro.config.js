/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */
// const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");
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

// pnpm installs the same package version more than once when its peer
// deps differ (e.g. a type-only @types/react, or a different @babel/core),
// and Metro then bundles every copy. For packages that must be singletons
// that means two React Native / Expo runtimes clobbering each other's
// globals and native view registrations - Release builds crashed on launch
// ("ViewManagerAdapter_ExpoVideoView ... must be a function",
// "URLSearchParams.has is not implemented", then a Hermes SIGSEGV).
// Pin each one to the copy this app resolves, which is also the copy its
// native pods are built from.
const singletonPackages = [
  "react",
  "react-native",
  "expo",
  "expo-modules-core",
  "expo-asset",
  "expo-constants",
  "expo-linear-gradient",
  "@react-native/virtualized-lists",
  "react-native-reanimated",
  "react-native-safe-area-context",
  "react-native-css-interop",
  "react-native-is-edge-to-edge",
  "recyclerlistview",
];
const resolveFrom = [__dirname];
const singletonDirs = {};
for (const name of singletonPackages) {
  try {
    singletonDirs[name] = path.dirname(
      require.resolve(`${name}/package.json`, { paths: resolveFrom })
    );
    // Later packages (e.g. expo-asset) may only be reachable via expo or RN.
    resolveFrom.push(singletonDirs[name]);
  } catch {
    // Not installed for this app; nothing to pin.
  }
}
const upstreamResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  for (const name in singletonDirs) {
    if (moduleName === name || moduleName.startsWith(name + "/")) {
      moduleName = singletonDirs[name] + moduleName.slice(name.length);
      break;
    }
  }
  return upstreamResolveRequest
    ? upstreamResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

// config.resolver.disableHierarchicalLookup = true;

module.exports = withNativeWind(config, { input: "./global.css" });
