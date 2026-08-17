// Core
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import { useContext } from "react";
import { Linking, Text, TouchableOpacity, View } from "react-native";

// Context
import { AuthContext } from "@/lib/context/global/auth.context";

// Drawer
import CustomDrawerHeader from "@/lib/ui/screen-components/home/drawer/drawer-header";

// UI-Componetns
import { useApptheme } from "@/lib/context/theme.context";
import {
  AboutIcon,
  LogoutIcon,
  PrivacyIcon,
  RightArrowIcon,
  UserIcon,
} from "@/lib/ui/useable-components/svg";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScrollView } from "react-native-gesture-handler";

export default function CustomDrawerContent(
  props: DrawerContentComponentProps,
) {
  // Hooks
  const { appTheme, currentTheme } = useApptheme();
  const { t } = useTranslation();
  const { logout } = useContext(AuthContext);

  return (
    <DrawerContentScrollView
      key={currentTheme?.concat("Drawer_Content")}
      {...props}
      // scrollEnabled={false}
      style={{ backgroundColor: appTheme.themeBackground }}
      contentContainerStyle={{
        backgroundColor: appTheme.themeBackground,
        paddingBottom: 20,
        paddingStart: 0,
        paddingEnd: 0,
        paddingTop: 0,
      }}
    >
      <CustomDrawerHeader />
      {/* Drawer Items with Right Arrow */}
      <ScrollView
        key={currentTheme?.concat("Drawer_Content").concat("Scroll_View")}
        style={{
          backgroundColor: appTheme.themeBackground,
          height: "auto",
          paddingBottom: 20,
        }}
        scrollEnabled={true}
      >
        {props.state.routes.map((route, index) => {
          const isFocused = props.state.index === index;
          const { options } = props.descriptors[route.key];
          if (route.name === "profile") {
            return (
              <TouchableOpacity
                key={route.key}
                onPress={() => {
                  router.replace("/(protected)/(tabs)/profile");
                }}
                className="flex-row justify-between items-center px-5 py-4 border-b-2"
                style={{ borderColor: appTheme.horizontalLine }}
              >
                <View className="flex-row items-center gap-3.5">
                  <View
                    className="h-[36px] w-[36px] items-center justify-center"
                    style={{
                      backgroundColor: appTheme.sidebarIconBackground,
                    }}
                  >
                    <UserIcon
                      width={16}
                      height={16}
                      color={appTheme.iconColor}
                    />
                  </View>
                  <Text
                    style={{
                      color: appTheme.fontMainColor,
                      fontFamily: "Archivo800",
                      fontSize: 15,
                    }}
                  >
                    {t("Profile")}
                  </Text>
                </View>
                <RightArrowIcon color="#B4B0AB" height={18} width={18} />
              </TouchableOpacity>
            );
          } else
            return (
              <TouchableOpacity
                key={route.key}
                onPress={() => props.navigation.navigate(route.name)}
                className="flex-row justify-between items-center px-5 py-4 border-b-2"
                style={{
                  backgroundColor: isFocused
                    ? appTheme.themeBackground
                    : appTheme.screenBackground,
                  borderColor: appTheme.horizontalLine,
                }}
              >
                {/* Left Icon and Label */}
                <View className="flex-row items-center gap-3.5">
                  <View
                    className="h-[36px] w-[36px] items-center justify-center"
                    style={{
                      backgroundColor: isFocused
                        ? appTheme.primary
                        : appTheme.sidebarIconBackground,
                    }}
                  >
                    {options.drawerIcon
                      ? options.drawerIcon({
                          color: isFocused ? appTheme.white : appTheme.iconColor,
                          size: 16,
                          focused: true,
                        })
                      : null}
                  </View>
                  <Text
                    style={{
                      color: isFocused ? appTheme.primary : appTheme.fontMainColor,
                      fontFamily: "Archivo800",
                      fontSize: 15,
                    }}
                  >
                    {(options.drawerLabel as string) ?? route.name}
                  </Text>
                </View>

                {/* Right Arrow Icon */}
                <RightArrowIcon
                  color={isFocused ? appTheme.primary : "#B4B0AB"}
                  height={18}
                  width={18}
                />
              </TouchableOpacity>
            );
        })}

        {/* EXTERNAL LINKS  */}
        <TouchableOpacity
          onPress={() => {
            Linking.openURL("https://enatega.com/");
          }}
          className="flex-row justify-between items-center px-5 py-4 border-b-2"
          style={{ borderColor: appTheme.horizontalLine }}
        >
          <View className="flex-row items-center gap-3.5">
            <View
              className="h-[36px] w-[36px] items-center justify-center"
              style={{ backgroundColor: appTheme.sidebarIconBackground }}
            >
              <AboutIcon width={16} height={16} color={appTheme.iconColor} />
            </View>
            <Text
              style={{
                color: appTheme.fontMainColor,
                fontFamily: "Archivo800",
                fontSize: 15,
              }}
            >
              {t("About Us")}
            </Text>
          </View>
          <RightArrowIcon color="#B4B0AB" height={18} width={18} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            Linking.openURL("https://multivendor.enatega.com/privacy");
          }}
          className="flex-row justify-between items-center px-5 py-4 border-b-2"
          style={{ borderColor: appTheme.horizontalLine }}
        >
          <View className="flex-row items-center gap-3.5">
            <View
              className="h-[36px] w-[36px] items-center justify-center"
              style={{ backgroundColor: appTheme.sidebarIconBackground }}
            >
              <PrivacyIcon width={16} height={16} color={appTheme.iconColor} />
            </View>
            <Text
              style={{
                color: appTheme.fontMainColor,
                fontFamily: "Archivo800",
                fontSize: 15,
              }}
            >
              {t("Privacy Policy")}
            </Text>
          </View>
          <RightArrowIcon color="#B4B0AB" height={18} width={18} />
        </TouchableOpacity>
        {/* Logout Button */}

        <TouchableOpacity
          onPress={() => {
            if (logout) logout();
          }}
          className="flex-row justify-between items-center px-5 py-4 border-b-2"
          style={{ borderColor: appTheme.horizontalLine }}
        >
          <View className="flex-row items-center gap-3.5">
            <View
              className="h-[36px] w-[36px] items-center justify-center"
              style={{ backgroundColor: appTheme.sidebarIconBackground }}
            >
              <LogoutIcon width={16} height={16} color={appTheme.iconColor} />
            </View>
            <Text
              style={{
                color: appTheme.fontMainColor,
                fontFamily: "Archivo800",
                fontSize: 15,
              }}
            >
              {t("Logout")}
            </Text>
          </View>
          <RightArrowIcon color="#B4B0AB" height={18} width={18} />
        </TouchableOpacity>
      </ScrollView>
    </DrawerContentScrollView>
  );
}
