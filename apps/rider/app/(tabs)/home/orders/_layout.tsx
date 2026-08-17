// Expo
import { Tabs } from "expo-router";

// Core
import { Platform, Pressable, Text, View } from "react-native";

// Hooks
import { useApptheme } from "@/lib/context/global/theme.context";
import { useTranslation } from "react-i18next";

export default function Layout() {
  // Hooks
  const { t } = useTranslation();
  const { appTheme } = useApptheme();
  return (
    <Tabs
      // initialRouteName="processing"
      screenOptions={{
        tabBarIcon: () => null,
        tabBarActiveTintColor: appTheme.primary,

        headerShown: false,
        tabBarIconStyle: {
          display: "none",
        },
        tabBarLabel: ({ children, focused }) => (
          <View
            className="w-full"
            style={{
              alignItems: "center",
              borderBottomWidth: focused ? 4 : 0,
              borderBottomColor: focused ? appTheme.primary : "transparent",
              paddingBottom: 11,
              backgroundColor: appTheme.white,
            }}
          >
            <Text
              style={{
                color: focused ? appTheme.fontMainColor : "#9A9A9A",
                fontFamily: focused ? "Archivo900" : "Archivo800",
                fontSize: 13,
                letterSpacing: 0.6,
                textTransform: "uppercase",
              }}
            >
              {children}
            </Text>
          </View>
        ),

        tabBarButton: (props) => {
          return (
            <Pressable
              {...props}
              android_ripple={{ color: "transparent" }} // Remove ripple on Android
              style={({ pressed }) => [
                props.style,
                { opacity: pressed ? 1 : 1 }, // Remove opacity change on iOS
              ]}
            />
          );
        },
        tabBarPosition: "bottom",
        tabBarItemStyle: {
          height: 44,
          backgroundColor: appTheme.white,
        },

        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
            top: 0,
            height: 34,
            shadowColor: "white",
            shadowOpacity: 0,
            backgroundColor: appTheme.white,
            borderBottomWidth: 2,
            borderBottomColor: appTheme.borderLineColor,
            paddingTop: 20,
            color: appTheme.fontMainColor,
          },
          android: {
            position: "absolute",
            top: 0,
            height: 54,
            shadowColor: "white",
            shadowOpacity: 0,
            paddingTop: 20,
            backgroundColor: appTheme.white,
            borderBottomWidth: 2,
            borderBottomColor: appTheme.borderLineColor,
            elevation: 0,
            color: appTheme.fontMainColor,
          },
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("New Orders"),
        }}
      />
      <Tabs.Screen
        name="processing"
        options={{
          title: t("Processing"),
        }}
      />
      <Tabs.Screen
        name="delivered"
        options={{
          title: t("Delivered"),
        }}
      />
    </Tabs>
  );
}
