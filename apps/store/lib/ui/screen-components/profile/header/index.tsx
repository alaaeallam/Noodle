// Hooks
import { useUserContext } from "@/lib/context/global/user.context";
import { useTranslation } from "react-i18next";

// Constants

// Core
import { useApptheme } from "@/lib/context/theme.context";
import { Image, ImageBackground, Text, View } from "react-native";

export default function ProfileHeader() {
  // Hooks
  const { appTheme } = useApptheme();
  const { t } = useTranslation();
  const { dataProfile } = useUserContext();

  return (
    <ImageBackground
      source={{ uri: dataProfile?.image as string }}
      width={100}
      height={100}
      resizeMode="cover"
      className="backdrop-blur-3xl"
    >
      <View className="flex-row h-[130px] w-full items-center gap-x-3.5 p-4">
        <View
          className="w-[60px] h-[60px] items-center justify-center overflow-hidden"
          style={{ backgroundColor: appTheme.black }}
        >
          {dataProfile?.logo ? (
            <Image
              source={{ uri: dataProfile.logo }}
              width={60}
              height={60}
              resizeMode="cover"
            />
          ) : (
            <Text style={{ color: appTheme.white, fontFamily: "Anton", fontSize: 20 }}>
              BTB
            </Text>
          )}
        </View>
        <View className="flex-1 pr-4 gap-y-1">
          <Text
            numberOfLines={1}
            style={{
              color: appTheme.fontMainColor,
              fontFamily: "Anton",
              fontSize: 22,
              textTransform: "uppercase",
            }}
          >
            {dataProfile?.name ?? t("store name")}
          </Text>
          <Text
            numberOfLines={1}
            style={{
              color: appTheme.fontMainColor,
              fontFamily: "Archivo800",
              fontSize: 12,
              letterSpacing: 1,
            }}
          >
            {dataProfile?._id
              ? dataProfile._id.substring(0, 9).toUpperCase()
              : t("store id")}
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
}
