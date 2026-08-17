/* eslint-disable @typescript-eslint/no-require-imports */
import * as SplashScreen from "expo-splash-screen";
import "react-native-reanimated";

// import * as Sentry from "sentry-expo";
import * as Sentry from "@sentry/react-native";

// Service
import setupApollo from "@/lib/apollo";

// Providers
import { AuthProvider } from "@/lib/context/global/auth.context";
import { ConfigurationProvider } from "@/lib/context/global/configuration.context";
import { ApolloProvider } from "@apollo/client";

// Service
import { initSentry } from "@/lib/utils/service";

// Locale
import "@/i18next";

// Style
import "../global.css";

// Hooks
import { UserProvider } from "@/lib/context/global/user.context";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import FlashMessage from "react-native-flash-message";

// PRoviders
import InternetProvider from "@/lib/context/global/internet-provider";
// UI
import AppThemeProvidor, { useApptheme } from "@/lib/context/theme.context";
import AnimatedSplashScreen from "@/lib/ui/useable-components/splash/AnimatedSplashScreen";
import UnavailableStatus from "@/lib/ui/useable-components/unavailable-status";
import * as Clarity from '@microsoft/react-native-clarity';

import { Slot } from "expo-router";

initSentry();

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();


// Clarity.initialize('nq7dea7dt4', {
//   logLevel: Clarity.LogLevel.None, // Note: Use "LogLevel.Verbose" value while testing to debug initialization issues.
// });


function RootLayout() {
  console.log("DIAG: RootLayout called");
  // Hooks
  const { currentTheme, appTheme } = useApptheme();
  console.log("DIAG: useApptheme done");
  const [loaded, fontError] = useFonts({
    SpaceMono: require("../lib/assets/fonts/SpaceMono-Regular.ttf"),
    Inter: require("../lib/assets/fonts/Inter.ttf"),
    Anton: require("../lib/assets/fonts/Anton/Anton-Regular.ttf"),
    Archivo400: require("../lib/assets/fonts/Archivo/Archivo-Regular.ttf"),
    Archivo500: require("../lib/assets/fonts/Archivo/Archivo-Medium.ttf"),
    Archivo600: require("../lib/assets/fonts/Archivo/Archivo-SemiBold.ttf"),
    Archivo700: require("../lib/assets/fonts/Archivo/Archivo-Bold.ttf"),
    Archivo800: require("../lib/assets/fonts/Archivo/Archivo-ExtraBold.ttf"),
    Archivo900: require("../lib/assets/fonts/Archivo/Archivo-Black.ttf"),
  });
  console.log("DIAG: useFonts done", { loaded, fontError });

  const client = setupApollo();
  console.log("DIAG: setupApollo done");

  // A font load failure must never strand the app on a permanent blank
  // screen - log it and fall back to the system font instead of blocking.
  const ready = loaded || !!fontError;

  useEffect(() => {
    if (fontError) {
      console.error("Font load error:", fontError);
    }
  }, [fontError]);

  useEffect(() => {
    console.log("DIAG: ready effect fired, ready =", ready);
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) {
    console.log("DIAG: returning null (not ready)");
    return null;
  }
  console.log("DIAG: rendering full tree");

  return (
    <ApolloProvider client={client}>
      <AppThemeProvidor>
        <AnimatedSplashScreen>
          <InternetProvider>
            <ConfigurationProvider>
              <AuthProvider client={client}>
                <StatusBar
                  style={currentTheme ?? "dark"}
                  backgroundColor={appTheme.themeBackground ?? ""}
                />
                <UserProvider>
                  <UnavailableStatus />
                  <Slot />
                </UserProvider>
              </AuthProvider>
            </ConfigurationProvider>
          </InternetProvider>
        </AnimatedSplashScreen>
        <FlashMessage position="center" />
      </AppThemeProvidor>
    </ApolloProvider>
  );
}

export default Sentry.wrap(RootLayout);
