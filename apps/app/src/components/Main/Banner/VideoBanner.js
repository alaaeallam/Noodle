import React from 'react';
import { View, StyleSheet } from 'react-native';

// expo-video's VideoView currently fails to register its Fabric view config
// in this project ("View config getter callback ... must be a function"),
// crashing on mount regardless of platform or linker mode — ruled out React
// version mismatch, stale codegen, and pnpm hoisting as causes. Rendering a
// plain background in place of the video until that's root-caused separately.
export default function VideoBanner(props) {
  return (
    <View style={[styles.container, styles.video, props?.style]}>
      {props?.children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 8,
  },
  video: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
});