// Core
import { ScrollView, Text, TouchableOpacity } from "react-native";

// Hooks
import { useApptheme } from "@/lib/context/global/theme.context";
import { useTranslation } from "react-i18next";

const QUICK_REPLIES = ["On my way", "Outside", "Cash?"];

export default function QuickReplies({
  onSelect,
}: {
  onSelect: (text: string) => void;
}) {
  const { appTheme } = useApptheme();
  const { t } = useTranslation();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="px-5 pt-3 pb-1"
      contentContainerStyle={{ gap: 8 }}
    >
      {QUICK_REPLIES.map((reply) => (
        <TouchableOpacity
          key={reply}
          onPress={() => onSelect(t(reply))}
          className="px-3 py-2"
          style={{ borderWidth: 2, borderColor: appTheme.black }}
        >
          <Text
            style={{
              color: appTheme.fontMainColor,
              fontFamily: "Archivo800",
              fontSize: 12,
              letterSpacing: 0.5,
              textTransform: "uppercase",
            }}
          >
            {t(reply)}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
