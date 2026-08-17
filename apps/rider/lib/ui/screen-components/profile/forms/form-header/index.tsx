// Hooks
import { useApptheme } from "@/lib/context/global/theme.context";
import { useTranslation } from "react-i18next";

// Core
import { Text, View } from "react-native";

export default function FormHeader({ title }: { title: string }) {
  // Hooks
  const { t } = useTranslation();
  const { appTheme } = useApptheme();
  return (
    <View
      className="w-full items-start self-start p-3"
      style={{ borderBottomWidth: 2, borderBottomColor: appTheme.borderLineColor }}
    >
      <Text
        style={{
          color: appTheme.fontMainColor,
          fontFamily: "Anton",
          fontSize: 18,
          textTransform: "uppercase",
        }}
      >
        {t(title)}
      </Text>
    </View>
  );
}
