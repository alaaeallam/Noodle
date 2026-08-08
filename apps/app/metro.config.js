const path = require('path')
const { getDefaultConfig } = require('@expo/metro-config')

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, '../..')

const defaultConfig = getDefaultConfig(projectRoot)
defaultConfig.resolver.sourceExts.push('cjs')

// pnpm workspace: hoisted deps (e.g. react-async-hook, a transitive dep of
// react-native-country-picker-modal) live inside the monorepo root's pnpm
// virtual store, which Metro never crawls unless it's an explicit watchFolder.
defaultConfig.watchFolders = [
  workspaceRoot,
  path.resolve(workspaceRoot, 'node_modules/.pnpm'),
]
defaultConfig.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
]
defaultConfig.resolver.unstable_enableSymlinks = true
defaultConfig.resolver.disableHierarchicalLookup = false

// Metro's file-map crawler never properly indexes react-async-hook's symlink
// inside react-native-country-picker-modal's nested pnpm store entry (a
// known Metro + pnpm virtual-store crawler gap — confirmed by re-running
// metro-resolver's own algorithm against a plain fs-backed context, where it
// resolves instantly). That makes resolvePackageEntryPoint throw before
// Metro ever reaches nodeModulesPaths/extraNodeModules fallbacks, so those
// don't help here — short-circuit the module name directly instead.
const reactAsyncHookPath = path.resolve(projectRoot, 'node_modules/react-async-hook/dist/index.js')
// react-native-maps has no web target — its default export pulls in native
// codegen files Metro can't bundle for web at all. Swapped for a harmless
// placeholder on web only, so screens that import it don't break the whole
// bundle; native builds are untouched (gated on platform === 'web').
const reactNativeMapsWebShim = path.resolve(projectRoot, 'web-shims/react-native-maps.js')
// expo-tracking-transparency unconditionally calls requireNativeModule at
// import time (no web target exists for it), which throws during the very
// first synchronous module evaluation and silently aborts the entire bundle
// before React ever mounts anything — this was the actual cause of a blank
// white page with zero DOM output and no console error (Metro's require
// runtime swallows the throw rather than surfacing it to window.onerror).
const trackingTransparencyWebShim = path.resolve(projectRoot, 'web-shims/expo-tracking-transparency.js')
const { resolveRequest: defaultResolveRequest } = defaultConfig.resolver
defaultConfig.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react-async-hook') {
    return { type: 'sourceFile', filePath: reactAsyncHookPath }
  }
  if (moduleName === 'react-native-maps' && platform === 'web') {
    return { type: 'sourceFile', filePath: reactNativeMapsWebShim }
  }
  if (moduleName === 'expo-tracking-transparency' && platform === 'web') {
    return { type: 'sourceFile', filePath: trackingTransparencyWebShim }
  }
  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform)
  }
  return context.resolveRequest(context, moduleName, platform)
}

module.exports = defaultConfig
