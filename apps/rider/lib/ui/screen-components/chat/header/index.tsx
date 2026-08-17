// Core
import { Text, TouchableOpacity, View } from "react-native";

// Components
import { CallIcon, CircleCrossIcon } from "@/lib/ui/useable-components/svg";

// Methods
import { callNumber } from "@/lib/utils/methods";

// Hooks
import { ConfigurationContext } from "@/lib/context/global/configuration.context";
import { useApptheme } from "@/lib/context/global/theme.context";
import { useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useContext } from "react";
import { useTranslation } from "react-i18next";

// Trims a raw delivery address ("2872+RQQ, Street 75, Al Abageyah, ...")
// down to the first human-readable segment, skipping plus-code prefixes.
function shortAddress(address?: string) {
  if (!address) return "";
  const parts = address
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  const meaningful = parts.find((p) => !p.includes("+")) ?? parts[0] ?? "";
  return meaningful.length > 20
    ? `${meaningful.slice(0, 20)}…`
    : meaningful;
}

export default function ChatHeader() {
  // Hooks
  const { appTheme } = useApptheme();
  const { t } = useTranslation();
  const route = useRoute();
  const router = useRouter();
  const configuration = useContext(ConfigurationContext);
  const {
    orderId,
    phoneNumber,
    customerName,
    orderAmount,
    deliveryAddress,
    distanceKm,
  } = route.params as {
    orderId: string;
    phoneNumber: string;
    customerName?: string;
    orderAmount?: string;
    deliveryAddress?: string;
    distanceKm?: string;
  };

  return (
    <View style={{ backgroundColor: appTheme.black }}>
      <View className="flex-row items-center gap-x-3.5 px-5 pt-3 pb-3.5">
        <TouchableOpacity
          onPress={() => router.back()}
          className="items-center justify-center"
          style={{
            width: 34,
            height: 34,
            borderWidth: 2,
            borderColor: "rgba(255,255,255,0.34)",
          }}
        >
          <CircleCrossIcon color={appTheme.white} height={16} width={16} />
        </TouchableOpacity>
        <Text
          className="flex-1 text-center"
          style={{
            color: appTheme.white,
            fontFamily: "Anton",
            fontSize: 20,
            letterSpacing: 0.4,
            textTransform: "uppercase",
          }}
        >
          {t("Contact Customer")}
        </Text>
        <TouchableOpacity
          onPress={() => callNumber(phoneNumber ?? "")}
          className="items-center justify-center"
          style={{ width: 34, height: 34, backgroundColor: appTheme.primary }}
        >
          <CallIcon color={appTheme.white} height={16} width={16} />
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center gap-x-2.5 px-5 pb-3.5">
        <Text
          style={{
            color: appTheme.fontSecondColor,
            fontFamily: "Archivo800",
            fontSize: 11,
            letterSpacing: 1.4,
            textTransform: "uppercase",
          }}
        >
          {t("Order")}
        </Text>
        <View
          className="px-2.5 py-1.5"
          style={{ backgroundColor: appTheme.primary }}
        >
          <Text
            style={{ color: appTheme.white, fontFamily: "Anton", fontSize: 14 }}
          >
            {orderId ?? "-"}
          </Text>
        </View>
        <Text
          className="ml-auto"
          style={{
            color: appTheme.fontSecondColor,
            fontFamily: "Archivo800",
            fontSize: 11,
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          {t("Collect")}
        </Text>
        <Text
          style={{ color: appTheme.white, fontFamily: "Anton", fontSize: 17 }}
        >
          {configuration?.currencySymbol}
          {orderAmount ?? ""}
        </Text>
      </View>

      <View
        className="flex-row items-center gap-x-2.5 px-5 py-3"
        style={{
          backgroundColor: appTheme.white,
          borderBottomWidth: 2,
          borderColor: appTheme.borderLineColor,
        }}
      >
        <View
          style={{ width: 9, height: 9, backgroundColor: appTheme.primary }}
        />
        <Text
          numberOfLines={1}
          style={{
            color: appTheme.fontMainColor,
            fontFamily: "Archivo800",
            fontSize: 13,
            letterSpacing: 0.4,
            textTransform: "uppercase",
          }}
        >
          {customerName || t("Customer")}
        </Text>
        {(!!deliveryAddress || !!distanceKm) && (
          <Text
            numberOfLines={1}
            className="ml-auto"
            style={{
              color: appTheme.fontSecondColor,
              fontFamily: "Archivo800",
              fontSize: 11,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            {[shortAddress(deliveryAddress), distanceKm ? `${distanceKm} km` : ""]
              .filter(Boolean)
              .join(" · ")}
          </Text>
        )}
      </View>
    </View>
  );
}
