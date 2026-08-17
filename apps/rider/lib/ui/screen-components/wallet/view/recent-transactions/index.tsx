// Interfaces
import { useApptheme } from "@/lib/context/global/theme.context";
import { IRiderTransaction } from "@/lib/utils/interfaces/rider.interface";

// Icons
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

// Core
import { Text, View } from "react-native";

export default function RecentTransaction({
  transaction,
  isLast,
}: {
  transaction: IRiderTransaction;
  isLast: boolean;
}) {
  // Hooks
  const { appTheme } = useApptheme();
  const { t } = useTranslation();

  // Constants
  const date = new Date(transaction.createdAt);
  const isCredit = ["TRANSFERRED", "PAID"].includes(transaction.status);
  return (
    <View
      className={`flex flex-row items-center gap-3 px-5 py-[13px] w-full ${isLast && "mb-24"}`}
      style={{ borderTopWidth: 2, borderColor: appTheme.borderLineColor }}
    >
      <View
        style={{
          width: 38,
          height: 38,
          backgroundColor: isCredit ? "#FFF0ED" : appTheme.themeBackground,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons
          size={17}
          name={
            transaction.status === "TRANSFERRED"
              ? "arrow-down"
              : transaction.status === "PAID"
                ? "arrow-down"
                : transaction.status === "CANCELLED"
                  ? "close"
                  : transaction.status === "REQUESTED"
                    ? "time-outline"
                    : "arrow-up"
          }
          color={isCredit ? appTheme.primary : appTheme.fontMainColor}
        />
      </View>
      <View className="flex-1 gap-0.5">
        <Text
          style={{
            color: appTheme.fontMainColor,
            fontFamily: "Archivo800",
            fontSize: 15,
          }}
        >
          {t(transaction.status)}
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
          {date.toDateString()}
        </Text>
      </View>
      <Text
        style={{
          color: isCredit ? appTheme.primary : appTheme.fontMainColor,
          fontFamily: "Anton",
          fontSize: 19,
        }}
      >
        ${transaction?.amountTransferred}
      </Text>
    </View>
  );
}
