// Core
import { useMemo, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

// Interfaces
import {
  IRiderEarnings,
  IRiderEarningsResponse,
} from "@/lib/utils/interfaces/rider-earnings.interface";

// GraphQL
import { RIDER_EARNINGS_GRAPH } from "@/lib/apollo/queries/earnings.query";

// Hooks
import { useApptheme } from "@/lib/context/global/theme.context";
import { useUserContext } from "@/lib/context/global/user.context";
import { QueryResult, useQuery } from "@apollo/client";
import { useTranslation } from "react-i18next";

// Expo
import { router } from "expo-router";

// Skeletons
import { EarningScreenMainLoading } from "@/lib/ui/skeletons";

// Components
import EarningStack from "../earnings-stack";

type TRange = "Day" | "Week" | "Month";

// startDate/endDate are already supported by RIDER_EARNINGS_GRAPH — the
// mockup's Day/Week/Month tabs just window the same query differently.
function rangeToDates(range: TRange) {
  const end = new Date();
  const start = new Date();
  if (range === "Day") {
    start.setHours(0, 0, 0, 0);
  } else if (range === "Week") {
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
  } else {
    start.setDate(start.getDate() - 29);
    start.setHours(0, 0, 0, 0);
  }
  return { startDate: start.toISOString(), endDate: end.toISOString() };
}

export default function EarningsMain() {
  // Hooks
  const { appTheme } = useApptheme();
  const { t } = useTranslation();

  // Contexts
  const { userId, setModalVisible } = useUserContext();

  // States
  const [range, setRange] = useState<TRange>("Week");
  // Memoized so startDate/endDate (which embed `new Date()`) only change
  // when the user actually switches range — otherwise a new millisecond-
  // precision timestamp on every render keeps `variables` unstable and
  // Apollo refetches in an infinite loop.
  const { startDate, endDate } = useMemo(() => rangeToDates(range), [range]);

  // Queries
  const { loading: isRiderEarningsLoading, data: riderEarningsData } = useQuery(
    RIDER_EARNINGS_GRAPH,
    {
      variables: { riderId: userId ?? "", startDate, endDate },
      skip: !userId,
    },
  ) as QueryResult<
    IRiderEarningsResponse | undefined,
    { riderId: string; startDate: string; endDate: string }
  >;

  const earnings: IRiderEarnings[] =
    riderEarningsData?.riderEarningsGraph?.earnings ?? [];
  const rangeSum = earnings.reduce(
    (sum, e) => sum + (e.totalEarningsSum ?? 0),
    0,
  );
  const rangeRuns = earnings.reduce(
    (sum, e) => sum + (e.totalDeliveries ?? 0),
    0,
  );
  const rangeAvg = rangeRuns ? Math.round(rangeSum / rangeRuns) : 0;

  const barsSource = earnings.slice(-7);
  const max = Math.max(1, ...barsSource.map((e) => e.totalEarningsSum ?? 0));

  // If loading
  if (isRiderEarningsLoading) return <EarningScreenMainLoading />;

  return (
    <View style={{ backgroundColor: appTheme.screenBackground, flex: 1 }}>
      {/* Range tabs */}
      <View
        className="flex-row"
        style={{
          backgroundColor: appTheme.white,
          borderBottomWidth: 2,
          borderColor: appTheme.borderLineColor,
        }}
      >
        {(["Day", "Week", "Month"] as TRange[]).map((r) => {
          const on = range === r;
          return (
            <TouchableOpacity
              key={r}
              onPress={() => setRange(r)}
              className="flex-1 items-center justify-center"
              style={{
                height: 46,
                borderBottomWidth: 4,
                borderColor: on ? appTheme.primary : "transparent",
              }}
            >
              <Text
                style={{
                  color: on ? appTheme.fontMainColor : "#9A9A9A",
                  fontFamily: "Archivo900",
                  fontSize: 12,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                {t(r)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Total */}
      <View
        className="px-5 pt-4 pb-3 gap-0.5"
        style={{
          backgroundColor: appTheme.white,
          borderBottomWidth: 2,
          borderColor: appTheme.borderLineColor,
        }}
      >
        <Text
          style={{
            color: appTheme.fontSecondColor,
            fontFamily: "Archivo800",
            fontSize: 11,
            letterSpacing: 1.4,
            textTransform: "uppercase",
          }}
        >
          {t(range)} {t("total")}
        </Text>
        <Text
          style={{
            color: appTheme.primary,
            fontFamily: "Anton",
            fontSize: 42,
            lineHeight: 46,
          }}
        >
          ${rangeSum.toFixed(2)}
        </Text>
        <Text
          style={{
            color: appTheme.fontMainColor,
            fontFamily: "Archivo700",
            fontSize: 13,
          }}
        >
          {rangeRuns} {t("runs")} · {t("avg")} ${rangeAvg} {t("per run")}
        </Text>
      </View>

      {/* Bars */}
      <View
        className="px-5 py-4 gap-3"
        style={{
          backgroundColor: appTheme.white,
          borderBottomWidth: 2,
          borderColor: appTheme.borderLineColor,
        }}
      >
        <View className="flex-row items-end gap-2" style={{ height: 150 }}>
          {barsSource.length ? (
            barsSource.map((e, i) => {
              const on = i === barsSource.length - 1;
              const h = Math.round(
                12 + ((e.totalEarningsSum ?? 0) / max) * 108,
              );
              return (
                <View
                  key={e._id}
                  className="flex-1 items-center gap-1.5 justify-end"
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontFamily: "Archivo800",
                      color: on ? appTheme.primary : appTheme.fontSecondColor,
                    }}
                  >
                    {e.totalEarningsSum ? `$${e.totalEarningsSum.toFixed(2)}` : ""}
                  </Text>
                  <View
                    style={{
                      width: "100%",
                      height: h,
                      backgroundColor: on
                        ? appTheme.primary
                        : e.totalEarningsSum
                          ? appTheme.black
                          : appTheme.borderLineColor,
                    }}
                  />
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: 10,
                      fontFamily: "Archivo800",
                      letterSpacing: 0.6,
                      textTransform: "uppercase",
                      color: on ? appTheme.fontMainColor : appTheme.fontSecondColor,
                    }}
                  >
                    {e._id}
                  </Text>
                </View>
              );
            })
          ) : (
            <Text style={{ color: appTheme.fontSecondColor }}>
              {t("No record found")}
            </Text>
          )}
        </View>
        <Text style={{ fontSize: 12, color: appTheme.fontSecondColor }}>
          {t("Fees only. Tips and cash settlements land in the wallet.")}
        </Text>
      </View>

      <View className="flex-row justify-between items-center px-5 pt-4 pb-2">
        <Text
          style={{
            color: appTheme.fontMainColor,
            fontFamily: "Anton",
            fontSize: 20,
            textTransform: "uppercase",
          }}
        >
          {t("Recent Activity")}
        </Text>
        <TouchableOpacity
          onPress={() => {
            setModalVisible({
              bool: false,
              _id: "",
              date: "",
              earningsArray: [],
              totalEarningsSum: 0,
              totalTipsSum: 0,
              totalDeliveries: 0,
            });
            router.push("/(tabs)/earnings/(routes)/earnings-detail");
          }}
        >
          <Text
            style={{
              color: appTheme.primary,
              fontFamily: "Archivo800",
              fontSize: 12,
              letterSpacing: 0.8,
              textTransform: "uppercase",
            }}
          >
            {t("See More")}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1 }}>
        <FlatList
          data={earnings.slice(0, 5)}
          contentContainerClassName="scroll-smooth"
          keyExtractor={(_, index) => index.toString()}
          ListEmptyComponent={
            <Text
              className="block mx-auto text-center w-full my-12 "
              style={{
                color: appTheme.fontSecondColor,
                fontFamily: "Archivo800",
              }}
            >
              {t("No record found")}
            </Text>
          }
          renderItem={(info) => {
            return (
              <EarningStack
                date={info?.item?.date}
                earning={info?.item?.totalEarningsSum}
                totalDeliveries={info?.item?.earningsArray.length}
                _id={info?.item?._id}
                tip={info?.item?.totalTipsSum}
                earningsArray={info?.item?.earningsArray}
                key={info.index}
                setModalVisible={setModalVisible}
              />
            );
          }}
        />
      </View>
    </View>
  );
}
