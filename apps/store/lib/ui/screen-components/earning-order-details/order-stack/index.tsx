// Interfaces
import { useApptheme } from "@/lib/context/theme.context";
import { IStoreEarningsOrderProps } from "@/lib/utils/interfaces/rider-earnings.interface";
import { useTranslation } from "react-i18next";

// Core
import { Text, View } from "react-native";

export default function OrderStack({
  orderId,
  amount,
}: IStoreEarningsOrderProps) {
  // Hooks
  const { appTheme } = useApptheme();
  const { t } = useTranslation();

  return (
    <View
      className="flex flex-row items-center justify-between p-3"
      style={{
        backgroundColor: appTheme.white,
        borderBottomWidth: 2,
        borderColor: appTheme.horizontalLine,
      }}
    >
      <View className="flex flex-col gap-2 p-1 justify-center float-start">
        <Text style={{ color: "#6B6B6B", fontSize: 13 }}>
          {t("Order ID")}{" "}
          {orderId.substring(0, orderId.length - (orderId.length - 8))}
        </Text>
        <Text
          style={{
            color: appTheme.fontMainColor,
            fontFamily: "Archivo800",
            fontSize: 13,
            textTransform: "uppercase",
          }}
        >
          {t("Payment")}
        </Text>
      </View>

      <View className="flex flex-col gap-2 p-1 justify-center items-end">
        <View
          className="px-2.5 py-1"
          style={{ backgroundColor: appTheme.themeBackground }}
        >
          <Text
            style={{
              color: appTheme.primary,
              fontFamily: "Archivo800",
              fontSize: 11,
              textTransform: "uppercase",
            }}
          >
            {t("Completed")}
          </Text>
        </View>
        <Text style={{ color: appTheme.fontMainColor, fontFamily: "Anton", fontSize: 16 }}>
          ${amount}
        </Text>
      </View>
    </View>
  );
}
