import { useApptheme } from "@/lib/context/theme.context";
import { useCart } from "@/lib/context/global/cart.context";
import { useUserContext } from "@/lib/context/global/user.context";
import { GET_STORE_MENU } from "@/lib/apollo/queries";
import { IStoreMenuResponse } from "@/lib/utils/interfaces/pos.interface";
import NoRecordFound from "@/lib/ui/useable-components/no-record-found";
import SpinnerComponent from "@/lib/ui/useable-components/spinner";
import CustomContinueButton from "@/lib/ui/useable-components/custom-continue-button";
import QuantityStepper from "@/lib/ui/useable-components/quantity-stepper";
import { useQuery } from "@apollo/client";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function PosItemDetailScreen() {
  const { appTheme } = useApptheme();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userId } = useUserContext();
  const { addItem } = useCart();

  const { data, loading, error } = useQuery<IStoreMenuResponse>(
    GET_STORE_MENU,
    {
      variables: { restaurantId: userId },
      skip: !userId,
      fetchPolicy: "cache-first",
    },
  );

  const food = useMemo(
    () =>
      data?.restaurant?.categories
        .flatMap((c) => c.foods)
        .find((f) => f._id === id),
    [data, id],
  );
  const addonsCatalog = data?.restaurant?.addons ?? [];
  const optionsCatalog = data?.restaurant?.options ?? [];

  const [variationId, setVariationId] = useState<string | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<Record<string, string[]>>({});
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState("");

  useEffect(() => {
    if (food && !variationId) {
      setVariationId(food.variations[0]?._id ?? null);
    }
  }, [food, variationId]);

  const variation = food?.variations.find((v) => v._id === variationId);
  const addonsForVariation = (variation?.addons ?? [])
    .map((addonId) => addonsCatalog.find((a) => a._id === addonId))
    .filter((a): a is NonNullable<typeof a> => !!a);

  useEffect(() => {
    if (!variation) return;
    setSelectedAddons((prev) => {
      const next = { ...prev };
      addonsForVariation.forEach((addon) => {
        if (!next[addon._id]) {
          next[addon._id] = addon.defaultOptions ?? [];
        }
      });
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variationId]);

  const toggleOption = (addonId: string, optionId: string, max: number) => {
    setSelectedAddons((prev) => {
      const current = prev[addonId] ?? [];
      if (max === 1) {
        return { ...prev, [addonId]: current.includes(optionId) ? [] : [optionId] };
      }
      const exists = current.includes(optionId);
      const next = exists
        ? current.filter((o) => o !== optionId)
        : current.length < max
          ? [...current, optionId]
          : current;
      return { ...prev, [addonId]: next };
    });
  };

  const isValid = addonsForVariation.every((addon) => {
    const count = selectedAddons[addon._id]?.length ?? 0;
    return count >= addon.quantityMinimum && count <= addon.quantityMaximum;
  });

  const unitPrice = useMemo(() => {
    if (!variation) return 0;
    let total = variation.price;
    addonsForVariation.forEach((addon) => {
      (selectedAddons[addon._id] ?? []).forEach((optionId) => {
        const option = optionsCatalog.find((o) => o._id === optionId);
        const isDefault = addon.defaultOptions?.includes(optionId);
        if (option && !isDefault) total += option.price;
      });
    });
    return total;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variation, selectedAddons, addonsForVariation, optionsCatalog]);

  const onAddToCart = () => {
    if (!food || !variation || !isValid) return;
    addItem({
      food: food._id,
      variation: variation._id,
      addons: addonsForVariation.map((addon) => ({
        _id: addon._id,
        options: selectedAddons[addon._id] ?? [],
      })),
      quantity,
      specialInstructions: specialInstructions || undefined,
    });
    router.back();
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

  if (error || !food) {
    return (
      <SafeAreaView
        style={{ backgroundColor: appTheme.themeBackground }}
        className="h-full w-full"
      >
        <NoRecordFound msg="Item not found" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ backgroundColor: appTheme.themeBackground }}
      className="h-full w-full"
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {food.image ? (
          <Image source={{ uri: food.image }} style={{ width: "100%", height: 180 }} />
        ) : null}

        <View className="px-5 pt-5 gap-y-1">
          <Text
            style={{
              color: appTheme.fontMainColor,
              fontFamily: "Anton",
              fontSize: 26,
              textTransform: "uppercase",
              lineHeight: 28,
            }}
          >
            {food.title}
          </Text>
          {food.description ? (
            <Text style={{ color: "#6B6B6B", fontSize: 14 }}>{food.description}</Text>
          ) : null}
        </View>

        {food.variations.length > 1 && (
          <View className="px-5 mt-5 gap-y-2.5">
            <View className="flex-row items-baseline justify-between">
              <Text
                style={{
                  color: appTheme.fontMainColor,
                  fontFamily: "Archivo800",
                  fontSize: 12,
                  letterSpacing: 1.4,
                  textTransform: "uppercase",
                }}
              >
                {t("Variation")}
              </Text>
              <Text
                style={{
                  color: appTheme.primary,
                  fontFamily: "Archivo800",
                  fontSize: 12,
                  letterSpacing: 0.6,
                  textTransform: "uppercase",
                }}
              >
                {t("Pick one")}
              </Text>
            </View>
            {food.variations.map((v) => {
              const on = v._id === variationId;
              return (
                <TouchableOpacity
                  key={v._id}
                  onPress={() => setVariationId(v._id)}
                  className="flex-row items-center gap-x-3 h-[52px] px-3.5"
                  style={{
                    borderWidth: 2,
                    borderColor: on ? appTheme.primary : appTheme.horizontalLine,
                    backgroundColor: on ? "#FFF6F4" : appTheme.white,
                  }}
                >
                  <Text
                    style={{
                      flex: 1,
                      color: appTheme.fontMainColor,
                      fontFamily: "Archivo800",
                      fontSize: 15,
                    }}
                  >
                    {v.title}
                  </Text>
                  <Text
                    style={{
                      color: appTheme.fontMainColor,
                      fontFamily: "Archivo800",
                      fontSize: 15,
                    }}
                  >
                    ${v.price.toFixed(2)}
                  </Text>
                  <View
                    className="w-5 h-5 rounded-full"
                    style={{
                      borderWidth: 2,
                      borderColor: on ? appTheme.primary : "#C9C5C0",
                      backgroundColor: on ? appTheme.primary : appTheme.white,
                    }}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {addonsForVariation.map((addon) => (
          <View key={addon._id} className="px-5 mt-5 gap-y-2.5">
            <View className="flex-row justify-between items-baseline">
              <Text
                style={{
                  color: appTheme.fontMainColor,
                  fontFamily: "Archivo800",
                  fontSize: 12,
                  letterSpacing: 1.4,
                  textTransform: "uppercase",
                }}
              >
                {addon.title}
              </Text>
              <Text style={{ color: "#8A8A8A", fontSize: 12, fontFamily: "Archivo700", textTransform: "uppercase", letterSpacing: 0.6 }}>
                {addon.quantityMinimum > 0 ? t("Required") : t("Optional")}{" "}
                · {addon.quantityMinimum}-{addon.quantityMaximum}
              </Text>
            </View>
            {addon.options
              .map((optionId) => optionsCatalog.find((o) => o._id === optionId))
              .filter((o): o is NonNullable<typeof o> => !!o)
              .map((option) => {
                const isSelected = (selectedAddons[addon._id] ?? []).includes(option._id);
                const isDefaultOption = addon.defaultOptions?.includes(option._id);
                return (
                  <TouchableOpacity
                    key={option._id}
                    onPress={() => toggleOption(addon._id, option._id, addon.quantityMaximum)}
                    className="flex-row items-center gap-x-3 h-[48px] px-3.5"
                    style={{
                      borderWidth: 2,
                      borderColor: isSelected ? appTheme.black : appTheme.horizontalLine,
                      backgroundColor: appTheme.white,
                    }}
                  >
                    <View
                      className="w-5 h-5 items-center justify-center"
                      style={{
                        borderWidth: 2,
                        borderColor: isSelected ? appTheme.primary : "#C9C5C0",
                        backgroundColor: isSelected ? appTheme.primary : appTheme.white,
                        borderRadius: addon.quantityMaximum === 1 ? 10 : 0,
                      }}
                    >
                      {isSelected ? (
                        <Text style={{ color: appTheme.white, fontSize: 13, fontWeight: "900" }}>
                          ✓
                        </Text>
                      ) : null}
                    </View>
                    <Text
                      style={{
                        flex: 1,
                        color: isSelected ? appTheme.fontMainColor : "#8A8A8A",
                        fontFamily: "Archivo700",
                        fontSize: 15,
                      }}
                    >
                      {option.title}
                    </Text>
                    {!isDefaultOption && option.price > 0 && (
                      <Text style={{ color: "#6B6B6B", fontSize: 13, fontFamily: "Archivo700" }}>
                        +${option.price.toFixed(2)}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
          </View>
        ))}

        <View className="px-5 mt-5 gap-y-2.5">
          <Text
            style={{
              color: appTheme.fontMainColor,
              fontFamily: "Archivo800",
              fontSize: 12,
              letterSpacing: 1.4,
              textTransform: "uppercase",
            }}
          >
            {t("Special Instructions")}
          </Text>
          <TextInput
            value={specialInstructions}
            onChangeText={setSpecialInstructions}
            placeholder={t("e.g. no onions, cut in half") ?? ""}
            placeholderTextColor="#A6A6A6"
            multiline
            className="p-3.5"
            style={{
              color: appTheme.fontMainColor,
              borderWidth: 2,
              borderColor: appTheme.horizontalLine,
              minHeight: 64,
              fontSize: 14,
            }}
          />
        </View>

        <View className="px-5 mt-5 flex-row items-center justify-between">
          <Text
            style={{
              color: appTheme.fontMainColor,
              fontFamily: "Archivo800",
              fontSize: 12,
              letterSpacing: 1.4,
              textTransform: "uppercase",
            }}
          >
            {t("Quantity")}
          </Text>
          <QuantityStepper
            value={quantity}
            onIncrement={() => setQuantity((q) => q + 1)}
            onDecrement={() => setQuantity((q) => Math.max(1, q - 1))}
          />
        </View>
      </ScrollView>

      <View
        className="px-5 pb-4 pt-3"
        style={{ borderTopWidth: 2, borderColor: appTheme.horizontalLine }}
      >
        <CustomContinueButton
          title={`${t("Add to Cart")} · $${(unitPrice * quantity).toFixed(2)}`}
          disabled={!isValid}
          onPress={onAddToCart}
        />
      </View>
    </SafeAreaView>
  );
}
