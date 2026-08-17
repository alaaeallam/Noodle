/* eslint-disable @typescript-eslint/no-require-imports */
// Core
import { Text, View } from "react-native";
import Modal from "react-native-modal";

// Interface
import { IWellDoneComponentProps } from "@/lib/utils/interfaces";

// Hooks
import { useApptheme } from "@/lib/context/global/theme.context";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function WelldoneComponent({
  orderId = "",
  status = "Delivered",
  setOrderId,
}: IWellDoneComponentProps) {
  // Use Effect
  useEffect(() => {
    setTimeout(() => {
      setOrderId("");
    }, 3000);
  }, [orderId]);

  // Hooks
  const { t } = useTranslation();
  const { appTheme } = useApptheme();
  return (
    <Modal
      isVisible={!!orderId}
      onBackdropPress={() => setOrderId("")}
      onBackButtonPress={() => setOrderId("")}
      collapsable={true}
      coverScreen={false}
    >
      <View className="h-fit w-full bg-transparent items-center">
        <View
          className="w-[95%] gap-1 px-5 py-4"
          style={{ backgroundColor: appTheme.black }}
        >
          <Text
            style={{
              color: appTheme.white,
              fontFamily: "Anton",
              fontSize: 18,
              textTransform: "uppercase",
              letterSpacing: 0.4,
            }}
          >
            {t("Well Done Rider")}
          </Text>
          <Text style={{ color: "#B4B0AB", fontSize: 13 }}>
            {t("Order Number")} #{orderId.substring(0, 5)} {t(status)}
          </Text>
        </View>
      </View>
    </Modal>
  );
}
