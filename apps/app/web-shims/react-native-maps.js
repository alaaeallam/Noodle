// Web-only stub. react-native-maps has no web target (its default export
// pulls in native codegen files that Metro cannot bundle for web), so this
// swaps in a harmless placeholder for browser-only testing — see
// metro.config.js's resolveRequest override, which only activates this for
// platform === 'web'.
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e6e6e6',
    minHeight: 200,
  },
  text: {
    color: '#666',
    padding: 12,
    textAlign: 'center',
  },
});

const MapView = ({ children, style }) => (
  <View style={[styles.container, style]}>
    <Text style={styles.text}>Map preview unavailable in web mode</Text>
  </View>
);

export const PROVIDER_GOOGLE = 'google';
export const PROVIDER_DEFAULT = 'default';
export const Marker = () => null;
export const Circle = () => null;
export const Polyline = () => null;
export const Polygon = () => null;
export const Callout = () => null;

export default MapView;
