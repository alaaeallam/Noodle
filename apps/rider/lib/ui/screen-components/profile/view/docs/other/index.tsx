// Hooks
import { useApptheme } from "@/lib/context/global/theme.context";
import { useUserContext } from "@/lib/context/global/user.context";
import { app_theme } from "@/lib/utils/types/theme";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

// Core
import { Text, View } from "react-native";
import { Switch } from "react-native-switch";

export default function OtherDetailsSection() {
  // Hooks
  const { t } = useTranslation();
  const { dataProfile } = useUserContext();
  const { currentTheme, toggleTheme, appTheme } = useApptheme();

  return (
    <View className="flex flex-col items-start w-full px-5 pb-24 pt-2 gap-3">
      <Text
        style={{
          color: appTheme.fontSecondColor,
          fontFamily: "Archivo800",
          fontSize: 12,
          letterSpacing: 1.4,
          textTransform: "uppercase",
        }}
      >
        {t("Other information")}
      </Text>
      {[
        { label: t("Email"), value: dataProfile?.email ?? "example@email.com" },
        { label: t("Password"), value: dataProfile?.password ?? "Password@123" },
        { label: t("Phone"), value: dataProfile?.phone ?? "+324 234 328979" },
      ].map((field) => (
        <View key={field.label} className="w-full gap-1.5">
          <Text
            style={{
              color: appTheme.fontSecondColor,
              fontFamily: "Archivo800",
              fontSize: 11,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            {field.label}
          </Text>
          <View
            className="w-full px-3.5 justify-center"
            style={{ height: 46, borderWidth: 2, borderColor: appTheme.borderLineColor }}
          >
            <Text style={{ color: appTheme.fontMainColor, fontFamily: "Archivo700", fontSize: 15 }}>
              {field.value}
            </Text>
          </View>
        </View>
      ))}

      <View className="flex flex-row items-center justify-between w-full mt-2">
        <Text
          style={{
            color: appTheme.fontMainColor,
            fontFamily: "Anton",
            fontSize: 18,
            textTransform: "uppercase",
          }}
        >
          {t("Theme")}
        </Text>
        <View className="flex flex-row gap-2 items-center justify-center">
          <Switch
            containerStyle={{ width: "20%" }}
            switchWidthMultiplier={3}
            activeText={"Dark"}
            inActiveText={"Light"}
            renderInsideCircle={() => {
              return (
                <Ionicons
                  name={
                    currentTheme === "dark"
                      ? "moon"
                      : currentTheme === "light"
                        ? "sunny"
                        : "phone-portrait"
                  }
                  size={22}
                />
              );
            }}
            circleActiveColor={appTheme.primary}
            backgroundActive={appTheme.primary}
            activeTextStyle={{ color: appTheme.black }}
            value={currentTheme === "dark"}
            onValueChange={() => toggleTheme(currentTheme as app_theme)}
          />
        </View>
      </View>
    </View>
  );
}
