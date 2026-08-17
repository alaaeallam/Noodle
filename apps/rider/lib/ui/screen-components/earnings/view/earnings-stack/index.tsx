// Interfaces
import { IEarningStackProps } from "@/lib/utils/interfaces/earning.interface";

import { useTranslation } from "react-i18next";

// Core
import { useApptheme } from "@/lib/context/global/theme.context";
import { Text, TouchableOpacity, View } from "react-native";

export default function EarningStack({
  date,
  earning,
  setModalVisible,
  _id,
  earningsArray,
  tip,
  totalDeliveries,
}: IEarningStackProps) {
  // Hooks
  const { appTheme } = useApptheme();
  const { t } = useTranslation();

  // Handlers
  function handleForwardPress() {
    setModalVisible({
      bool: true,
      _id: _id,
      date: date,
      earningsArray: earningsArray,
      totalTipsSum: tip,
      totalEarningsSum: earning,
      totalDeliveries: totalDeliveries,
    });
  }
  return (
    <TouchableOpacity
      onPress={handleForwardPress}
      className="flex-row items-center gap-3 px-5 py-[13px] w-full"
      style={{ borderTopWidth: 2, borderColor: appTheme.borderLineColor }}
    >
      <View
        style={{
          width: 38,
          height: 38,
          backgroundColor: appTheme.themeBackground,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: appTheme.fontMainColor, fontFamily: "Anton", fontSize: 13 }}>
          RUN
        </Text>
      </View>
      <View className="flex-1 gap-0.5">
        <Text
          style={{ color: appTheme.fontMainColor, fontFamily: "Archivo800", fontSize: 15 }}
        >
          {t("Total Earnings")}
        </Text>
        <Text
          style={{
            color: appTheme.fontSecondColor,
            fontFamily: "Archivo700",
            fontSize: 12,
            letterSpacing: 0.6,
            textTransform: "uppercase",
          }}
        >
          {date}
        </Text>
      </View>
      <Text style={{ color: appTheme.fontMainColor, fontFamily: "Anton", fontSize: 19 }}>
        ${Number(earning ?? 0).toFixed(2)}
      </Text>
    </TouchableOpacity>
  );
}
