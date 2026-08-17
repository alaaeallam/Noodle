import "expo-dev-client";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import SplashVideo from "./SplashVideo";

// The app underneath is always rendered - the video is purely a fade-out
// overlay on top, so a stuck/broken video (expo-av is deprecated and
// unreliable on some devices) can never strand the user on a black screen.
export default function AnimatedSplashScreen({ children }) {
  const opacityAnimation = useSharedValue(1);
  const [showOverlay, setShowOverlay] = useState(true);

  const dismissOverlay = useCallback(() => {
    SplashScreen.hideAsync().catch(() => {});
    opacityAnimation.value = withTiming(0, {
      duration: 300,
      easing: Easing.out(Easing.exp),
    });
    setTimeout(() => setShowOverlay(false), 350);
  }, [opacityAnimation]);

  useEffect(() => {
    const timer = setTimeout(dismissOverlay, 4000);
    return () => clearTimeout(timer);
  }, [dismissOverlay]);

  const videoElement = useMemo(() => {
    return <SplashVideo onLoaded={dismissOverlay} onFinish={dismissOverlay} />;
  }, [dismissOverlay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacityAnimation.value,
  }));

  return (
    <View style={{ flex: 1 }}>
      {children}
      {showOverlay && (
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            animatedStyle,
            { backgroundColor: "black" },
          ]}
        >
          {videoElement}
        </Animated.View>
      )}
    </View>
  );
}
