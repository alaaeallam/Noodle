// Icons
import { useApptheme } from "@/lib/context/theme.context";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

// Core
import { Text, View } from "react-native";

export default function NoRecordFound({
  msg = "No record found",
}: {
  msg?: string;
}) {
  // Hooks
  const { appTheme } = useApptheme();
  const { t } = useTranslation();
  return (
    <View className="items-center flex-col gap-y-2 my-24 justify-center px-10">
      <Ionicons name="sad-outline" color={appTheme.primary} size={28} />
      <Text
        style={{
          color: appTheme.fontMainColor,
          fontFamily: "Anton",
          fontSize: 18,
          textTransform: "uppercase",
          textAlign: "center",
        }}
      >
        {t(msg)}
      </Text>
    </View>
  );
}
