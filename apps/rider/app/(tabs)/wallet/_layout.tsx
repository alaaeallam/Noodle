// Expo
import { useApptheme } from "@/lib/context/global/theme.context";
import { Stack } from "expo-router";

// Hooks
import { useTranslation } from "react-i18next";
import { View } from "react-native";

export default function StackLayout() {
  // Hooks
  const { appTheme } = useApptheme();
  const { t } = useTranslation();
  return (
    <View style={{ flex: 1, backgroundColor: appTheme.screenBackground }}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: true,
            headerTitle: t("Wallet"),
            headerTitleAlign: "center",
            headerShadowVisible: false,
            headerStyle: { backgroundColor: appTheme.black },
            headerTitleStyle: {
              color: appTheme.white,
              fontFamily: "Anton",
              fontSize: 20,
              textTransform: "uppercase",
            },
            contentStyle: {
              backgroundColor: appTheme.screenBackground,
            },
            headerBackTitle: "Wallet",
          }}
        />
        <Stack.Screen
          name="(routes)/success"
          options={{ headerShown: false }}
        />
      </Stack>
    </View>
  );
}
