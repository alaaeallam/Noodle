import "expo-dev-client";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export default function AnimatedSplashScreen({ children }:any) {
  const opacityAnimation = useSharedValue(1); // Shared value for opacity
  const scaleAnimation = useSharedValue(1); // Shared value for scale
  const [isAppReady, setAppReady] = useState(false);
  const [isSplashVideoComplete, setSplashVideoComplete] = useState(false);
  const [isSplashAnimationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    if (isAppReady && isSplashVideoComplete) {
      // Start fade out and scale down animation when the app is ready and video has completed
      opacityAnimation.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.exp),
      });

      scaleAnimation.value = withTiming(
        2,
        {
          duration: 300,
          easing: Easing.out(Easing.exp),
        },
        () => {
          runOnJS(setAnimationComplete)(true); // Update the animation completion state
        },
      );
    }
  }, [isAppReady, isSplashVideoComplete]);

  const onImageLoaded = useCallback(async () => {
    try {
      await SplashScreen.hideAsync();
      // Load stuff
      await Promise.all([]);
    } catch (e) {
      console.log("Error hiding splash screen:", e);
      // Handle errors
    } finally {
      setAppReady(true);
    }
  }, []);

  useEffect(() => {
    onImageLoaded();
    setSplashVideoComplete(true);
  }, [onImageLoaded]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacityAnimation.value, // Use shared value for opacity
      transform: [{ scale: scaleAnimation.value }], // Use shared value for scale
    };
  });

  return (
    <View style={{ flex: 1 }}>
      {isSplashAnimationComplete ? children : null}
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          animatedStyle,
          { backgroundColor: "black" },
        ]}
      />
    </View>
  );
}
