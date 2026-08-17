// Hooks
import { useUserContext } from "@/lib/context/global/user.context";
import { useTranslation } from "react-i18next";

// Types & Interfaces
import { TRiderProfileBottomBarBit } from "@/lib/utils/types/rider";
import { Dispatch, SetStateAction } from "react";

// Core
import { useApptheme } from "@/lib/context/global/theme.context";
import { Text, TouchableOpacity, View } from "react-native";

export default function DocumentsSection({
  setIsFormOpened,
}: {
  setIsFormOpened: Dispatch<SetStateAction<TRiderProfileBottomBarBit>>;
}) {
  // Hooks
  const { appTheme } = useApptheme();
  const { t } = useTranslation();
  const { dataProfile } = useUserContext();
  return (
    <View
      className="flex flex-col w-full items-center"
      style={{ backgroundColor: appTheme.screenBackground }}
    >
      <View className="w-full px-5 pt-4 pb-1">
        <Text
          style={{
            color: appTheme.fontSecondColor,
            fontFamily: "Archivo800",
            fontSize: 12,
            letterSpacing: 1.4,
            textTransform: "uppercase",
          }}
        >
          {t("Documents")}
        </Text>
      </View>
      <View
        className="flex-row items-center gap-3 w-full px-5 py-3.5"
        style={{ backgroundColor: appTheme.white, borderTopWidth: 2, borderColor: appTheme.borderLineColor }}
      >
        <View className="flex-1 gap-1.5">
          <Text
            style={{
              color: appTheme.fontMainColor,
              fontFamily: "Archivo900",
              fontSize: 15,
              textTransform: "uppercase",
            }}
          >
            {t("Driving License")}
          </Text>
          <View
            className="self-start px-2.5 py-1"
            style={{
              backgroundColor: dataProfile?.licenseDetails
                ? appTheme.themeBackground
                : "#FFE3DE",
            }}
          >
            <Text
              style={{
                color: dataProfile?.licenseDetails ? appTheme.fontMainColor : "#C21400",
                fontFamily: "Archivo900",
                fontSize: 11,
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              {dataProfile?.licenseDetails
                ? t("Submitted Data")
                : t("Missing Data")}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => setIsFormOpened("LICENSE_FORM")}
          className="items-center justify-center px-4"
          style={{
            height: 40,
            borderWidth: 2,
            borderColor: dataProfile?.licenseDetails ? appTheme.borderLineColor : appTheme.primary,
            backgroundColor: dataProfile?.licenseDetails ? appTheme.white : appTheme.primary,
          }}
        >
          <Text
            style={{
              color: dataProfile?.licenseDetails ? appTheme.fontMainColor : appTheme.white,
              fontFamily: "Anton",
              fontSize: 14,
              textTransform: "uppercase",
            }}
          >
            {dataProfile?.licenseDetails ? t("Update") : t("Add")}
          </Text>
        </TouchableOpacity>
      </View>
      <View
        className="flex-row items-center gap-3 w-full px-5 py-3.5"
        style={{ backgroundColor: appTheme.white, borderTopWidth: 2, borderColor: appTheme.borderLineColor }}
      >
        <View className="flex-1 gap-1.5">
          <Text
            style={{
              color: appTheme.fontMainColor,
              fontFamily: "Archivo900",
              fontSize: 15,
              textTransform: "uppercase",
            }}
          >
            {t("Vehicle Plate")}
          </Text>
          <View
            className="self-start px-2.5 py-1"
            style={{
              backgroundColor: dataProfile?.vehicleDetails
                ? appTheme.themeBackground
                : "#FFE3DE",
            }}
          >
            <Text
              style={{
                color: dataProfile?.vehicleDetails ? appTheme.fontMainColor : "#C21400",
                fontFamily: "Archivo900",
                fontSize: 11,
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              {dataProfile?.vehicleDetails
                ? t("Submitted Data")
                : t("Missing Data")}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => setIsFormOpened("VEHICLE_FORM")}
          className="items-center justify-center px-4"
          style={{
            height: 40,
            borderWidth: 2,
            borderColor: dataProfile?.vehicleDetails ? appTheme.borderLineColor : appTheme.primary,
            backgroundColor: dataProfile?.vehicleDetails ? appTheme.white : appTheme.primary,
          }}
        >
          <Text
            style={{
              color: dataProfile?.vehicleDetails ? appTheme.fontMainColor : appTheme.white,
              fontFamily: "Anton",
              fontSize: 14,
              textTransform: "uppercase",
            }}
          >
            {dataProfile?.vehicleDetails ? t("Update") : t("Add")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
