import * as SplashScreen from 'expo-splash-screen'
import React, { useEffect } from 'react'
import { View } from 'react-native'

// expo-video's VideoView currently fails to register its Fabric view config
// in this project ("View config getter callback ... must be a function"),
// crashing on mount regardless of platform — ruled out React version
// mismatch, stale codegen, and pnpm hoisting as causes. The splash video and
// its fade animation are purely cosmetic, so render children immediately on
// every platform until expo-video is root-caused separately.
export default function AnimatedSplashScreen({ children }) {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {})
  }, [])

  return <View style={{ flex: 1 }}>{children}</View>
}
