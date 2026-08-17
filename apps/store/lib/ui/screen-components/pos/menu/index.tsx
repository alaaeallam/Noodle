import { useApptheme } from "@/lib/context/theme.context";
import { useCart } from "@/lib/context/global/cart.context";
import { useUserContext } from "@/lib/context/global/user.context";
import { GET_STORE_MENU } from "@/lib/apollo/queries";
import { IStoreMenuResponse } from "@/lib/utils/interfaces/pos.interface";
import { resolveCartItem } from "@/lib/utils/methods";
import MenuItemCard from "@/lib/ui/useable-components/menu-item-card";
import NoRecordFound from "@/lib/ui/useable-components/no-record-found";
import SpinnerComponent from "@/lib/ui/useable-components/spinner";
import { useQuery } from "@apollo/client";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function PosMenuScreen() {
  const { appTheme } = useApptheme();
  const { t } = useTranslation();
  const { userId } = useUserContext();
  const { items } = useCart();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );

  const { data, loading, error } = useQuery<IStoreMenuResponse>(
    GET_STORE_MENU,
    {
      variables: { restaurantId: userId },
      skip: !userId,
      fetchPolicy: "cache-first",
    },
  );

  const categories = data?.restaurant?.categories ?? [];
  const addonsCatalog = data?.restaurant?.addons ?? [];
  const optionsCatalog = data?.restaurant?.options ?? [];

  const defaultCategoryId =
    categories.find((c) => c.foods?.length > 0)?._id ?? categories[0]?._id ?? null;
  const activeCategoryId = selectedCategoryId ?? defaultCategoryId;
  const activeCategory = categories.find((c) => c._id === activeCategoryId);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = items.reduce((sum, item) => {
    const resolved = resolveCartItem(
      item,
      categories,
      addonsCatalog,
      optionsCatalog,
    );
    return sum + (resolved?.lineTotal ?? 0);
  }, 0);

  return (
    <SafeAreaView
      style={{ backgroundColor: appTheme.themeBackground }}
      className="h-full w-full"
    >
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <SpinnerComponent color={appTheme.spinnerColor} />
        </View>
      ) : error ? (
        <NoRecordFound msg="Something went wrong" />
      ) : categories.length === 0 ? (
        <NoRecordFound msg="No menu items found" />
      ) : (
        <View className="flex-1">
          <View
            className="h-[64px] w-full"
            style={{
              borderColor: appTheme.horizontalLine,
              borderBottomWidth: 2,
              backgroundColor: appTheme.white,
            }}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                flexGrow: 1,
                alignItems: "center",
                paddingHorizontal: 16,
                gap: 8,
              }}
            >
              {categories.map((category) => {
                const isActive = category._id === activeCategoryId;
                return (
                  <TouchableOpacity
                    key={category._id}
                    onPress={() => setSelectedCategoryId(category._id)}
                    className="h-[38px] px-3.5 items-center justify-center"
                    style={{
                      borderWidth: 2,
                      backgroundColor: isActive ? appTheme.black : appTheme.white,
                      borderColor: isActive ? appTheme.black : appTheme.horizontalLine,
                    }}
                  >
                    <Text
                      style={{
                        color: isActive ? appTheme.white : "#6B6B6B",
                        fontFamily: "Archivo900",
                        fontSize: 12,
                        letterSpacing: 0.8,
                        textTransform: "uppercase",
                      }}
                    >
                      {category.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <FlatList
            style={{ flex: 1, backgroundColor: appTheme.themeBackground }}
            data={activeCategory?.foods ?? []}
            keyExtractor={(food) => food._id}
            renderItem={({ item: food }) => (
              <MenuItemCard
                title={food.title}
                description={food.description}
                image={food.image}
                isOutOfStock={food.isOutOfStock}
                variations={food.variations}
                onPress={() => router.push(`/pos/item/${food._id}`)}
              />
            )}
            ListEmptyComponent={<NoRecordFound msg="No items in this category" />}
            contentContainerStyle={{ paddingBottom: cartCount > 0 ? 90 : 20 }}
          />
        </View>
      )}

      {cartCount > 0 && (
        <TouchableOpacity
          onPress={() => router.push("/pos/cart")}
          className="absolute bottom-0 left-0 right-0 h-[58px] flex-row items-center justify-between px-5"
          style={{ backgroundColor: appTheme.primary }}
        >
          <Text
            style={{
              color: appTheme.white,
              fontFamily: "Anton",
              fontSize: 17,
              textTransform: "uppercase",
              letterSpacing: 0.3,
            }}
          >
            {t("View Cart")} · {cartCount}
          </Text>
          <Text
            style={{
              color: appTheme.white,
              fontFamily: "Anton",
              fontSize: 17,
            }}
          >
            ${cartTotal.toFixed(2)}
          </Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}
