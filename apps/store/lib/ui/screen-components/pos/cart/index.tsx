import { useApptheme } from "@/lib/context/theme.context";
import { useCart } from "@/lib/context/global/cart.context";
import { useUserContext } from "@/lib/context/global/user.context";
import { GET_STORE_MENU } from "@/lib/apollo/queries";
import { PLACE_ORDER_POS } from "@/lib/apollo/mutations/pos-order.mutation";
import { IStoreMenuResponse } from "@/lib/utils/interfaces/pos.interface";
import { resolveCartItem } from "@/lib/utils/methods";
import CartLineItem from "@/lib/ui/useable-components/cart-line-item";
import NoRecordFound from "@/lib/ui/useable-components/no-record-found";
import SpinnerComponent from "@/lib/ui/useable-components/spinner";
import CustomContinueButton from "@/lib/ui/useable-components/custom-continue-button";
import FlashMessageComponent from "@/lib/ui/useable-components/flash-message";
import { useMutation, useQuery } from "@apollo/client";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, SafeAreaView, Text, TextInput, View } from "react-native";

export default function PosCartScreen() {
  const { appTheme } = useApptheme();
  const { t } = useTranslation();
  const { userId } = useUserContext();
  const { items, updateQuantity, removeItem, clearCart } = useCart();
  const [instructions, setInstructions] = useState("");

  const { data, loading } = useQuery<IStoreMenuResponse>(GET_STORE_MENU, {
    variables: { restaurantId: userId },
    skip: !userId,
    fetchPolicy: "cache-first",
  });

  const [placeOrderPOS, { loading: placingOrder }] = useMutation(
    PLACE_ORDER_POS,
    {
      onCompleted: (res) => {
        clearCart();
        FlashMessageComponent({
          message: `${t("Order placed")} #${res?.placeOrderPOS?.orderId}`,
        });
        router.replace("/(protected)/(tabs)/home/orders");
      },
      onError: (err) => {
        FlashMessageComponent({
          message:
            err?.graphQLErrors?.[0]?.message ??
            err?.networkError?.message ??
            t("Something went wrong"),
        });
      },
    },
  );

  const categories = data?.restaurant?.categories ?? [];
  const addonsCatalog = data?.restaurant?.addons ?? [];
  const optionsCatalog = data?.restaurant?.options ?? [];
  const taxRate = data?.restaurant?.tax ?? 0;

  const resolvedItems = items
    .map((item) => resolveCartItem(item, categories, addonsCatalog, optionsCatalog))
    .filter((item): item is NonNullable<typeof item> => !!item);

  const subtotal = resolvedItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const estimatedTax = +((subtotal * taxRate) / 100).toFixed(2);
  const estimatedTotal = subtotal + estimatedTax;

  const onPlaceOrder = () => {
    if (!userId || items.length === 0) return;
    placeOrderPOS({
      variables: {
        orderInput: {
          restaurant: userId,
          orderInput: items.map((item) => ({
            food: item.food,
            quantity: item.quantity,
            variation: item.variation,
            addons: item.addons,
            specialInstructions: item.specialInstructions,
          })),
          instructions: instructions || undefined,
        },
      },
    });
  };

  if (loading) {
    return (
      <SafeAreaView
        style={{ backgroundColor: appTheme.themeBackground }}
        className="h-full w-full items-center justify-center"
      >
        <SpinnerComponent color={appTheme.spinnerColor} />
      </SafeAreaView>
    );
  }

  if (items.length === 0) {
    return (
      <SafeAreaView
        style={{ backgroundColor: appTheme.themeBackground }}
        className="h-full w-full"
      >
        <NoRecordFound msg="Your cart is empty" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ backgroundColor: appTheme.themeBackground }}
      className="h-full w-full"
    >
      <FlatList
        style={{ backgroundColor: appTheme.themeBackground }}
        data={resolvedItems}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <CartLineItem
            title={item.title}
            variationTitle={item.variationTitle}
            addonSummary={item.addonSummary}
            quantity={item.quantity}
            lineTotal={item.lineTotal}
            onIncrement={() => updateQuantity(item.key, item.quantity + 1)}
            onDecrement={() => updateQuantity(item.key, item.quantity - 1)}
            onRemove={() => removeItem(item.key)}
          />
        )}
        ListFooterComponent={
          <View className="px-5 py-4 gap-y-2.5">
            <Text
              style={{
                color: appTheme.fontMainColor,
                fontFamily: "Archivo800",
                fontSize: 12,
                letterSpacing: 1.4,
                textTransform: "uppercase",
              }}
            >
              {t("Order Notes")}
            </Text>
            <TextInput
              value={instructions}
              onChangeText={setInstructions}
              placeholder={t("Optional note for the kitchen") ?? ""}
              placeholderTextColor="#A6A6A6"
              multiline
              className="p-3.5"
              style={{
                color: appTheme.fontMainColor,
                borderWidth: 2,
                borderColor: appTheme.horizontalLine,
                backgroundColor: appTheme.white,
                minHeight: 60,
                fontSize: 14,
              }}
            />
          </View>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <View
        className="px-5 pt-3.5 pb-4"
        style={{
          backgroundColor: appTheme.white,
          borderTopWidth: 2,
          borderColor: appTheme.horizontalLine,
        }}
      >
        <View className="flex-row justify-between mb-2">
          <Text style={{ color: "#6B6B6B", fontSize: 15 }}>{t("Subtotal")}</Text>
          <Text style={{ color: appTheme.fontMainColor, fontFamily: "Archivo800", fontSize: 15 }}>
            ${subtotal.toFixed(2)}
          </Text>
        </View>
        <View className="flex-row justify-between mb-2">
          <Text style={{ color: "#6B6B6B", fontSize: 15 }}>
            {t("Tax")} ({taxRate}%)
          </Text>
          <Text style={{ color: appTheme.fontMainColor, fontFamily: "Archivo800", fontSize: 15 }}>
            ${estimatedTax.toFixed(2)}
          </Text>
        </View>
        <View
          className="flex-row justify-between items-baseline pt-2 pb-1 mb-1"
          style={{ borderTopWidth: 2, borderColor: appTheme.horizontalLine }}
        >
          <Text
            style={{
              color: appTheme.fontMainColor,
              fontFamily: "Anton",
              fontSize: 20,
              textTransform: "uppercase",
            }}
          >
            {t("Total")}
          </Text>
          <Text style={{ color: appTheme.primary, fontFamily: "Anton", fontSize: 26 }}>
            ${estimatedTotal.toFixed(2)}
          </Text>
        </View>
        <CustomContinueButton
          title={t("Send to Kitchen")}
          isLoading={placingOrder}
          onPress={onPlaceOrder}
        />
      </View>
    </SafeAreaView>
  );
}
