import { useApptheme } from "@/lib/context/theme.context";
import { Entypo } from "@expo/vector-icons";
import { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
export default function HelpAccordian({
  heading,
  children,
  isLast,
}: {
  heading: string;
  children: ReactNode;
  isLast: boolean;
}) {
  // Hooks
  const { appTheme } = useApptheme();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <View
      className="flex w-full items-center justify-between"
      style={{
        backgroundColor: appTheme.white,
        borderWidth: 2,
        borderColor: appTheme.horizontalLine,
        marginBottom: isLast ? 30 : 0,
      }}
    >
      <TouchableOpacity
        className="flex flex-row items-center justify-between w-full px-4 py-4 active:opacity-80"
        onPress={() => setOpen(!open)}
        activeOpacity={0.7}
      >
        <Text
          className="w-80"
          style={{
            color: appTheme.fontMainColor,
            fontFamily: "Archivo800",
            fontSize: 15,
          }}
        >
          {t(heading)}
        </Text>
        <Entypo
          name={open ? "chevron-small-up" : "chevron-small-down"}
          size={24}
          color={appTheme.primary}
        />
      </TouchableOpacity>

      {open && (
        <View
          className="w-full p-3"
          style={{
            backgroundColor: appTheme.themeBackground,
            borderTopWidth: 2,
            borderTopColor: appTheme.horizontalLine,
          }}
        >
          {children}
        </View>
      )}
    </View>
  );
}
