// Interfaces
import { useApptheme } from "@/lib/context/global/theme.context";
import { IRiderEarningsOrderProps } from "@/lib/utils/interfaces/rider-earnings.interface";
import { useTranslation } from "react-i18next";

// Core
import { Text, View } from "react-native";

export default function OrderStack({
  orderId,
  amount,
  isLast,
}: IRiderEarningsOrderProps) {
  // Hooks
  const { appTheme } = useApptheme();
  const { t } = useTranslation();
  return (
    <View
      className="flex flex-row items-center justify-between p-4"
      style={{
        borderTopWidth: 2,
        borderTopColor: appTheme.borderLineColor,
        backgroundColor: appTheme.white,
        marginBottom: isLast ? 100 : 0,
      }}
    >
      <View className="gap-1.5">
        <Text style={{ color: appTheme.fontMainColor, fontFamily: "Anton", fontSize: 16 }}>
          {t("Order ID")}
          {orderId.slice(0, orderId.length - orderId.length / 2)}
        </Text>
        <Text
          style={{
            color: appTheme.fontSecondColor,
            fontFamily: "Archivo800",
            fontSize: 11,
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          {t("Payment")}
        </Text>
      </View>
      <View className="gap-1.5 items-end">
        <View className="px-2.5 py-1" style={{ backgroundColor: appTheme.themeBackground }}>
          <Text
            style={{
              color: appTheme.fontMainColor,
              fontFamily: "Archivo900",
              fontSize: 11,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            {t("Completed")}
          </Text>
        </View>
        <Text style={{ color: appTheme.primary, fontFamily: "Anton", fontSize: 17 }}>
          ${amount}
        </Text>
      </View>
    </View>
  );
}
