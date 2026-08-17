import { useApptheme } from "@/lib/context/theme.context";
import CustomDrawerContent from "@/lib/ui/screen-components/home/drawer/drawer-content";
import {
  CardIcon,
  HelpIcon,
  HomeIcon,
  LanguageIcon,
} from "@/lib/ui/useable-components/svg";
import ScheduleIcon from "@/lib/ui/useable-components/svg/schedule";
import { Colors } from "@/lib/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import { DrawerActions } from "@react-navigation/native";
import { Drawer } from "expo-router/drawer";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity } from "react-native";

export default function DrawerMain() {
  // Hooks
  const { appTheme } = useApptheme();
  const { t } = useTranslation();
  return (
    <Drawer
      drawerContent={CustomDrawerContent}
      initialRouteName="orders"
      screenOptions={({ navigation }) => ({
        swipeEnabled: false,
        lazy: true,
        headerTintColor: appTheme.white,
        headerLeft: () => {
          return (
            <TouchableOpacity
              onPress={() => {
                navigation.dispatch(DrawerActions.toggleDrawer());
              }}
              style={{
                marginLeft: 16,
                width: 38,
                height: 38,
                backgroundColor: appTheme.primary,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="menu" size={19} color={appTheme.white} />
            </TouchableOpacity>
          );
        },
        headerTitleStyle: {
          fontFamily: "Anton",
          fontSize: 22,
          color: appTheme.white,
          textTransform: "uppercase",
        },
        drawerHideStatusBarOnOpen: true,
        drawerActiveBackgroundColor: Colors.light.lowOpacityPrimaryColor,
        drawerActiveTintColor: Colors.light.mainTextColor,
        headerShadowVisible: false,
        headerTitleAlign: "left",
        headerStyle: {
          backgroundColor: appTheme.black,
        },
        drawerStatusBarAnimation: "slide",
        drawerItemStyle: {
          borderRadius: 0,
          marginTop: 4,
        },
        drawerStyle: {
          marginBottom: 45,
        },
      })}
    >
      <Drawer.Screen
        name="orders"
        options={{
          drawerLabel: t("Home"),
          title: t("Orders"),
          drawerIcon: ({ color, size }) => (
            <HomeIcon color={color} height={size} width={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="work-schedule"
        options={{
          drawerLabel: t("Work Schedule"),
          title: t("Work Schedule"),
          drawerIcon: ({ color, size }) => (
            <ScheduleIcon color={color} height={size + 20} width={size + 20} />
          ),
        }}
      />
      <Drawer.Screen
        name="language"
        options={{
          drawerLabel: t("Language"),
          title: t("Language"),
          drawerIcon: ({ color, size }) => (
            <LanguageIcon color={color} height={size} width={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="bank-management"
        options={{
          drawerLabel: t("Bank Management"),
          title: t("Bank Management"),
          drawerIcon: ({ color, size }) => (
            <CardIcon color={color} height={size} width={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="help"
        options={{
          drawerLabel: t("Help"),
          title: t("Help"),
          drawerIcon: ({ color, size }) => (
            <HelpIcon color={color} height={size} width={size} />
          ),
        }}
      />
    </Drawer>
  );
}
