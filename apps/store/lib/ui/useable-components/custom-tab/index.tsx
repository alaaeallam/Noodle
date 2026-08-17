import { Text, TouchableOpacity, View } from "react-native";

import { useApptheme } from "@/lib/context/theme.context";
import { ICustomTabProps } from "@/lib/utils/interfaces";
import { useTranslation } from "react-i18next";

const CustomTab = ({
  options,
  selectedTab,
  setSelectedTab,
  deliveryCount,
  pickupCount,
}: ICustomTabProps) => {
  // Hooks
  const { appTheme } = useApptheme();
  const { t } = useTranslation();

  return (
    <View
      className="sticky top-0 z-10 w-full px-4 pt-3 pb-1"
      style={{ backgroundColor: appTheme.themeBackground }}
    >
      <View className="h-[48px] w-full flex-row" style={{ gap: 12 }}>
        {options.map((option) => {
          const isActive = selectedTab === option;
          const count =
            option === "Delivery Orders" ? deliveryCount : pickupCount;
          return (
            <TouchableOpacity
              key={String(option)}
              onPress={() => setSelectedTab(option)}
              className="flex-1 items-center justify-center"
              style={{
                position: "relative",
                backgroundColor: isActive ? appTheme.primary : appTheme.white,
                borderWidth: 2,
                borderColor: isActive ? appTheme.primary : appTheme.horizontalLine,
              }}
            >
              <Text
                style={{
                  color: isActive ? appTheme.white : "#8A8A8A",
                  fontFamily: "Anton",
                  fontSize: 15,
                  letterSpacing: 0.6,
                  textTransform: "uppercase",
                }}
              >
                {t(option)}
              </Text>
              <View
                style={{
                  position: "absolute",
                  top: -9,
                  left: -9,
                  width: 24,
                  height: 24,
                  backgroundColor: appTheme.black,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: appTheme.white,
                    fontFamily: "Archivo800",
                    fontSize: 12,
                  }}
                >
                  {count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default CustomTab;
