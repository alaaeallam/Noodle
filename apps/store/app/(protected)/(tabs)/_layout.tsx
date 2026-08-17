import { useApptheme } from "@/lib/context/theme.context";
import { HapticTab } from "@/lib/ui/useable-components/HapticTab";
import {
  CurrencyIcon,
  HomeIcon,
  PersonIcon,
  WalletIcon,
} from "@/lib/ui/useable-components/svg";
import { Tabs, usePathname } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Platform } from "react-native";

const RootLayout = () => {
  const [tabKey, setTabKey] = useState(0);
  const pathName = usePathname();
  const { t } = useTranslation();
  const { appTheme } = useApptheme();

  useEffect(() => {
    setTabKey((prev) => prev + 1);
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
            zIndex: 0,
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
          href: "/(protected)/(tabs)/home/orders",
          title: t("Home"),
          tabBarIcon: ({ color }) => (
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
          headerShown: true,
          headerTitle: t("Profile"),
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: appTheme.themeBackground },
          headerTitleStyle: { color: appTheme.fontMainColor },
          title: t("Profile"),
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
