// Hooks
import { useApptheme } from "@/lib/context/global/theme.context";
import { useUserContext } from "@/lib/context/global/user.context";

// Constants
import { useTranslation } from "react-i18next";

// Core
import { Text, View } from "react-native";

export default function ProfileHeader() {
  // Hooks
  const { appTheme } = useApptheme();
  const { t } = useTranslation();
  const { dataProfile } = useUserContext();
  return (
    <View
      className="flex-row items-center gap-3.5 w-full p-5"
      style={{
        backgroundColor: appTheme.white,
        borderBottomWidth: 2,
        borderColor: appTheme.borderLineColor,
      }}
    >
      <View
        className="w-[60px] h-[60px] items-center justify-center"
        style={{ backgroundColor: appTheme.black }}
      >
        <Text
          style={{
            color: appTheme.white,
            fontFamily: "Anton",
            fontSize: 22,
          }}
        >
          {dataProfile?.name
            ?.split(" ")[0]
            ?.substring(0, 1)
            ?.toUpperCase()
            ?.concat(
              dataProfile?.name?.split(" ")[1]?.length > 0
                ? dataProfile?.name
                    ?.split(" ")[1]
                    ?.substring(0, 1)
                    ?.toUpperCase()
                : "",
            ) ?? "JS"}
        </Text>
      </View>
      <View className="flex-1 gap-0.5">
        <Text
          numberOfLines={1}
          style={{
            color: appTheme.fontMainColor,
            fontFamily: "Anton",
            fontSize: 26,
            textTransform: "uppercase",
            lineHeight: 30,
          }}
        >
          {dataProfile?.name ?? t("rider name")}
        </Text>
        <Text
          style={{
            color: appTheme.fontSecondColor,
            fontFamily: "Archivo800",
            fontSize: 12,
            letterSpacing: 1,
          }}
        >
          {dataProfile?._id.substring(0, 9).toUpperCase() ?? "rider id"}
        </Text>
      </View>
    </View>
  );
}
