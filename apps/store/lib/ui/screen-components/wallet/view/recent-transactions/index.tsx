// Interfaces
import { useApptheme } from "@/lib/context/theme.context";
import { IStoreTransaction } from "@/lib/utils/interfaces/rider.interface";

// Icons
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

// Core
import { Text, View } from "react-native";

export default function RecentTransaction({
  transaction,
  isLast,
}: {
  transaction: IStoreTransaction;
  isLast: boolean;
}) {
  // Hooks
  const { appTheme } = useApptheme();
  const { t } = useTranslation();

  // Constants
  const date = new Date(transaction.createdAt);
  return (
    <View
      className={`flex flex-row justify-between p-4 w-full ${isLast && "mb-32"}`}
      style={{
        backgroundColor: appTheme.themeBackground,
      }}
    >
      <View className="flex flex-row gap-3 items-center">
        <Ionicons
          size={20}
          name={
            transaction.status === "TRANSFERRED"
              ? "cash-outline"
              : transaction.status === "PAID"
                ? "cash-sharp"
                : transaction.status === "CANCELLED"
                  ? "remove-circle-outline"
                  : "arrow-down-circle"
          }
          color={
            transaction.status === "TRANSFERRED"
              ? "#90E36D"
              : transaction.status === "PAID"
                ? "orange"
                : transaction.status === "CANCELLED"
                  ? "red"
                  : transaction.status === "REQUESTED"
                    ? "#0EA5E9"
                    : "arrow-down-circle"
          }
        />
        <View className="flex flex-col justify-between gap-1">
          <Text
            style={{
              color: appTheme.fontMainColor,
              fontFamily: "Archivo800",
              fontSize: 13,
              textTransform: "uppercase",
              letterSpacing: 0.4,
            }}
          >
            {t(transaction.status)}
          </Text>
          <Text style={{ color: "#6B6B6B", fontSize: 12 }}>
            {date.toDateString()}
          </Text>
        </View>
      </View>
      <Text
        style={{
          fontFamily: "Anton",
          fontSize: 17,
          color:
            transaction.status === "REQUESTED"
              ? "#0EA5E9"
              : appTheme.fontMainColor,
        }}
      >
        ${transaction?.amountTransferred?.toFixed(2) || "0.00"}
      </Text>
    </View>
  );
}
