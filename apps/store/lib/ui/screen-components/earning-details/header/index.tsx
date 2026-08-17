// GraphQL
import { STORE_EARNINGS_GRAPH } from "@/lib/apollo/queries/earnings.query";

// Hooks
import { useUserContext } from "@/lib/context/global/user.context";
import { QueryResult, useQuery } from "@apollo/client";

// Components
import SpinnerComponent from "@/lib/ui/useable-components/spinner";

// Interfacs
import { IStoreEarningsResponse } from "@/lib/utils/interfaces/rider-earnings.interface";

// Core
import { useApptheme } from "@/lib/context/theme.context";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

export default function EarningDetailsHeader() {
  // States
  const [storeEarningsGrandTotal, setStoreEarningsGrandTotal] = useState({
    earnings: 0,
    totalDeliveries: 0,
  });

  // Hooks
  const { appTheme } = useApptheme();
  const { t } = useTranslation();
  const { userId } = useUserContext();

  // Queries
  const { loading: isRiderEarningsLoading, data: riderEarningsData } = useQuery(
    STORE_EARNINGS_GRAPH,
    {
      variables: {
        storeId: userId ?? "",
      },
      fetchPolicy: "cache-and-network",
    },
  ) as QueryResult<IStoreEarningsResponse | undefined, { storeId: string }>;

  useEffect(() => {
    if (riderEarningsData?.storeEarningsGraph?.earnings?.length) {
      const totalEarnings =
        riderEarningsData?.storeEarningsGraph?.earnings?.reduce(
          (acc, curr) => acc + curr.totalEarningsSum,
          0,
        );
      const totalDeliveries =
        riderEarningsData?.storeEarningsGraph.earnings.reduce(
          (acc, curr) => acc + curr.earningsArray.length,
          0,
        );
      setStoreEarningsGrandTotal({
        earnings: totalEarnings,
        totalDeliveries: totalDeliveries,
      });
    }
  }, [riderEarningsData?.storeEarningsGraph?.earnings]);

  if (isRiderEarningsLoading) return <SpinnerComponent />;
  return (
    <View
      style={{
        backgroundColor: appTheme.white,
        borderBottomWidth: 2,
        borderColor: appTheme.horizontalLine,
        paddingVertical: 12,
      }}
    >
      <Text
        className="left-5"
        style={{
          color: appTheme.fontMainColor,
          fontFamily: "Anton",
          fontSize: 18,
          textTransform: "uppercase",
        }}
      >
        {t("Summary")}
      </Text>
      <View className="flex flex-row justify-between items-center p-5">
        <View className="flex gap-2 items-center">
          <Text
            style={{
              color: "#6B6B6B",
              fontFamily: "Archivo800",
              fontSize: 11,
              letterSpacing: 1.2,
              textTransform: "uppercase",
            }}
          >
            {t("Total Earnings")}
          </Text>
          <Text
            className="text-start self-start"
            style={{
              color: appTheme.fontMainColor,
              fontFamily: "Anton",
              fontSize: 22,
            }}
          >
            ${Number(storeEarningsGrandTotal.earnings).toFixed(2)}
          </Text>
        </View>
        <View
          className="flex gap-2 items-center pl-3"
          style={{
            borderLeftWidth: 2,
            borderLeftColor: appTheme.horizontalLine,
          }}
        >
          <Text
            style={{
              color: "#6B6B6B",
              fontFamily: "Archivo800",
              fontSize: 11,
              letterSpacing: 1.2,
              textTransform: "uppercase",
            }}
          >
            {t("Total Deliveries")}
          </Text>
          <Text
            className="text-start self-start"
            style={{
              color: appTheme.fontMainColor,
              fontFamily: "Anton",
              fontSize: 22,
            }}
          >
            {storeEarningsGrandTotal.totalDeliveries}
          </Text>
        </View>
      </View>
    </View>
  );
}
