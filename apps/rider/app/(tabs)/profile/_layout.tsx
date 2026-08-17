// Expo
import { useApptheme } from "@/lib/context/global/theme.context";
import { Stack } from "expo-router";

// Hooks
import { useTranslation } from "react-i18next";
import { View } from "react-native";

export default function ProfileLayout() {
  // Hooks
  const { t } = useTranslation();
  const { appTheme } = useApptheme();

  return (
    <View style={{ flex: 1, backgroundColor: appTheme.screenBackground }}>
      <Stack screenOptions={{ headerShown: false, headerShadowVisible: false }}>
        <Stack.Screen
          name="index"
          options={{
            headerShown: true,
            headerTitleAlign: "center",
            headerTitle: t("Profile"),
            headerTitleStyle: {
              color: appTheme.white,
              fontFamily: "Anton",
              fontSize: 20,
              textTransform: "uppercase",
            },
            headerStyle: { backgroundColor: appTheme.black },
          }}
        />
      </Stack>
    </View>
  );
}
