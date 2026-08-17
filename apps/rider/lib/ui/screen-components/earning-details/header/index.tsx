// GraphQL
import { RIDER_EARNINGS_GRAPH } from "@/lib/apollo/queries/earnings.query";

// Hooks
import { useUserContext } from "@/lib/context/global/user.context";
import { QueryResult, useQuery } from "@apollo/client";

// Components
import SpinnerComponent from "@/lib/ui/useable-components/spinner";

// Interfacs
import { IRiderEarningsResponse } from "@/lib/utils/interfaces/rider-earnings.interface";

// Core
import { useApptheme } from "@/lib/context/global/theme.context";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

export default function EarningDetailsHeader() {
  // Hooks
  const { appTheme } = useApptheme();
  const { t } = useTranslation();

  // States
  const [riderEarningsGrandTotal, setRiderEarningsGrandTotal] = useState({
    earnings: 0,
    tips: 0,
    totalDeliveries: 0,
  });

  // Contexts
  const { userId } = useUserContext();

  // Queries
  const { loading: isRiderEarningsLoading, data: riderEarningsData } = useQuery(
    RIDER_EARNINGS_GRAPH,
    {
      variables: {
        riderId: userId ?? "",
      },
    },
  ) as QueryResult<IRiderEarningsResponse | undefined, { riderId: string }>;

  useEffect(() => {
    if (riderEarningsData?.riderEarningsGraph?.earnings?.length) {
      const totalEarnings =
        riderEarningsData?.riderEarningsGraph?.earnings?.reduce(
          (acc, curr) => acc + curr.totalEarningsSum,
          0,
        );
      const totalTips = riderEarningsData?.riderEarningsGraph?.earnings?.reduce(
        (acc, curr) => acc + curr.totalTipsSum,
        0,
      );
      const totalDeliveries =
        riderEarningsData?.riderEarningsGraph.earnings.reduce(
          (acc, curr) => acc + curr.totalDeliveries,
          0,
        );
      setRiderEarningsGrandTotal({
        earnings: totalEarnings,
        tips: totalTips,
        totalDeliveries: totalDeliveries,
      });
    }
  }, []);

  if (isRiderEarningsLoading) return <SpinnerComponent />;
  return (
    <View
      className="py-3"
      style={{
        borderBottomWidth: 2,
        borderColor: appTheme.borderLineColor,
        backgroundColor: appTheme.white,
      }}
    >
      <Text
        className="px-5"
        style={{
          color: appTheme.fontMainColor,
          fontFamily: "Anton",
          fontSize: 20,
          textTransform: "uppercase",
        }}
      >
        {t("Summary")}
      </Text>
      <View className="flex flex-row justify-between items-start px-5 pt-4 pb-2">
        <View className="gap-1.5">
          <Text
            style={{
              color: appTheme.fontSecondColor,
              fontFamily: "Archivo800",
              fontSize: 11,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            {t("Total Earnings")}
          </Text>
          <Text style={{ color: appTheme.primary, fontFamily: "Anton", fontSize: 20 }}>
            ${Number(riderEarningsGrandTotal.earnings).toFixed(2)}
          </Text>
        </View>
        <View
          className="gap-1.5 pl-4"
          style={{ borderLeftWidth: 2, borderLeftColor: appTheme.borderLineColor }}
        >
          <Text
            style={{
              color: appTheme.fontSecondColor,
              fontFamily: "Archivo800",
              fontSize: 11,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            {t("Total Tips")}
          </Text>
          <Text style={{ color: appTheme.fontMainColor, fontFamily: "Anton", fontSize: 20 }}>
            ${Number(riderEarningsGrandTotal.tips).toFixed(2)}
          </Text>
        </View>
        <View
          className="gap-1.5 pl-4"
          style={{ borderLeftWidth: 2, borderLeftColor: appTheme.borderLineColor }}
        >
          <Text
            style={{
              color: appTheme.fontSecondColor,
              fontFamily: "Archivo800",
              fontSize: 11,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            {t("Total Deliveries")}
          </Text>
          <Text style={{ color: appTheme.fontMainColor, fontFamily: "Anton", fontSize: 20 }}>
            {riderEarningsGrandTotal.totalDeliveries}
          </Text>
        </View>
      </View>
    </View>
  );
}
