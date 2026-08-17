import { useApptheme } from "@/lib/context/global/theme.context";
import type { PropsWithChildren, JSX } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from '@expo/vector-icons'


type AccordionItemPros = PropsWithChildren<{
  title: string;
}>;

export default function AccordionItem({
  children,
  title,
}: AccordionItemPros): JSX.Element {
  // Hooks
  const { t } = useTranslation();
  const { appTheme } = useApptheme();
  const [expanded, setExpanded] = useState(false);

  function toggleItem() {
    setExpanded(!expanded);
  }

  return (
    <View>
      <TouchableOpacity
        className="bg-transparent flex-1 flex-row justify-between items-center py-2"
        onPress={toggleItem}
      >
        <Text
          style={{
            color: appTheme.fontMainColor,
            fontFamily: "Anton",
            fontSize: 16,
            textTransform: "uppercase",
            letterSpacing: 0.4,
          }}
        >
          {t(title)}
        </Text>
        <MaterialIcons
          name={expanded ? "expand-less" : "expand-more"}
          size={26}
          color={appTheme.primary}
        />
      </TouchableOpacity>
      {expanded && children}
    </View>
  );
}
