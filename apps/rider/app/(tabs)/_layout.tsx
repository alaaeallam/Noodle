import { Tabs, usePathname } from "expo-router";
import { Platform } from "react-native";

// UI Components
import { HapticTab } from "@/lib/ui/useable-components/HapticTab";
import {
  CurrencyIcon,
  HomeIcon,
  PersonIcon,
  WalletIcon,
} from "@/lib/ui/useable-components/svg";

// Hooks
import { useApptheme } from "@/lib/context/global/theme.context";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const RootLayout = () => {
  // States
  const [tabKey, setTabKey] = useState(1);

  // Hooks
  const pathName = usePathname();
  const { t } = useTranslation();
  const { appTheme } = useApptheme();

  useEffect(() => {
    if (pathName.startsWith("/wallet/success")) {
      setTabKey((prev) => prev + 1); // Force a re-render of the tab bar
    }
  }, [pathName]);

  return (
    <Tabs
      key={tabKey}
      screenOptions={{
        tabBarActiveTintColor: appTheme.primary,
        tabBarInactiveTintColor: "#7A7A7A",
        tabBarLabelStyle: {
          fontFamily: "Archivo800",
          fontSize: 11,
          letterSpacing: 0.6,
          textTransform: "uppercase",
        },
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: Platform.select({
          ios: {
            backgroundColor: appTheme.tabNaviatorBackground,
            borderTopWidth: 0,
            paddingTop: 8,
          },
          android: {
            backgroundColor: appTheme.tabNaviatorBackground,
            display: pathName.startsWith("/wallet/success") ? "none" : "flex",
            borderTopWidth: 0,
            paddingTop: 8,
            elevation: 0,
          },
        }),
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          href: "/(tabs)/home/orders",

          title: t("Home"),
          tabBarIcon: ({ color }) => (
            // <IconSymbol size={28} name="home" color={color} />
            <HomeIcon
              color={color}
              width={25}
              height={25}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: t("Wallet"),
          tabBarIcon: ({ color }) => (
            <WalletIcon
              color={color}
              width={25}
              height={25}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: t("Earnings"),
          tabBarIcon: ({ color }) => (
            <CurrencyIcon
              color={color}
              width={25}
              height={25}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("Profile"),
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <PersonIcon
              color={color}
              width={25}
              height={25}
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default RootLayout;
