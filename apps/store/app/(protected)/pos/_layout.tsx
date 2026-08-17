import CartProvider from "@/lib/context/global/cart.context";
import { useApptheme } from "@/lib/context/theme.context";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

export default function PosLayout() {
  const { appTheme } = useApptheme();
  const { t } = useTranslation();

  return (
    <CartProvider.Provider>
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerTitleAlign: "left",
          headerTintColor: appTheme.white,
          headerTitleStyle: {
            color: appTheme.white,
            fontFamily: "Anton",
            fontSize: 20,
          },
          headerStyle: { backgroundColor: appTheme.black },
          headerShown: true,
        }}
      >
        <Stack.Screen name="index" options={{ title: t("New Order") }} />
        <Stack.Screen name="item/[id]" options={{ title: t("Customize") }} />
        <Stack.Screen name="cart" options={{ title: t("Cart") }} />
      </Stack>
    </CartProvider.Provider>
  );
}
