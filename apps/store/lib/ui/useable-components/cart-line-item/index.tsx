import { useApptheme } from "@/lib/context/theme.context";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import QuantityStepper from "../quantity-stepper";

interface ICartLineItemProps {
  title: string;
  variationTitle?: string;
  addonSummary?: string;
  quantity: number;
  lineTotal: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}

export default function CartLineItem({
  title,
  variationTitle,
  addonSummary,
  quantity,
  lineTotal,
  onIncrement,
  onDecrement,
  onRemove,
}: ICartLineItemProps) {
  const { appTheme } = useApptheme();
  const { t } = useTranslation();

  return (
    <View
      className="gap-y-2 px-5 py-3.5"
      style={{ backgroundColor: appTheme.white, borderBottomWidth: 2, borderColor: appTheme.horizontalLine }}
    >
      <View className="flex-row justify-between gap-x-3">
        <Text
          numberOfLines={1}
          style={{
            color: appTheme.fontMainColor,
            fontSize: 16,
            fontFamily: "Archivo900",
            textTransform: "uppercase",
            flex: 1,
          }}
        >
          {title}
        </Text>
        <Text style={{ color: appTheme.fontMainColor, fontFamily: "Anton", fontSize: 19 }}>
          ${lineTotal.toFixed(2)}
        </Text>
      </View>
      {(variationTitle || addonSummary) ? (
        <Text style={{ color: "#6B6B6B", fontSize: 13, lineHeight: 18 }}>
          {[variationTitle, addonSummary].filter(Boolean).join(" · ")}
        </Text>
      ) : null}

      <View className="flex-row items-center justify-between">
        <TouchableOpacity onPress={onRemove}>
          <Text
            style={{
              color: appTheme.primary,
              fontFamily: "Archivo800",
              fontSize: 13,
              letterSpacing: 0.6,
              textTransform: "uppercase",
            }}
          >
            {t("Remove")}
          </Text>
        </TouchableOpacity>
        <QuantityStepper
          value={quantity}
          onIncrement={onIncrement}
          onDecrement={onDecrement}
          min={1}
        />
      </View>
    </View>
  );
}
