/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";

// Hooks
import useAcceptOrder from "@/lib/hooks/useAcceptOrder";
import useOrderRing from "@/lib/hooks/useOrderRing";
// import usePrintOrder from "@/lib/hooks/usePrintOrder";

// Constants
import { TIMES } from "@/lib/utils/constants";

// Interface
import { ISetOrderTimeComponentProps } from "@/lib/utils/interfaces";

// UI

// Icons
import { useApptheme } from "@/lib/context/theme.context";
import { useTranslation } from "react-i18next";
import CustomContinueButton from "../custom-continue-button";
import { CircleCrossIcon } from "../svg";

const SetTimeScreenAndAcceptOrder = ({
  id,
  orderId,
  handleDismissModal,
}: ISetOrderTimeComponentProps) => {
  // Hooks
  const { appTheme } = useApptheme();
  const { t } = useTranslation();

  // States
  const [selectedTime, setSelectedTime] = useState(TIMES[0]);

  const { muteRing, loading: loadingRing } = useOrderRing();
  const { acceptOrder, loading: loadingAcceptOrder } = useAcceptOrder();
  // const { printOrder } = usePrintOrder();

  const onAcceptOrderHandler = async () => {
    try {
      await acceptOrder(id, selectedTime?.toString() || "0");
      await muteRing(orderId);
      // printOrder(id);

      handleDismissModal();
    } catch (err) {
      // FlashMessageComponent({ message: err?.message ?? "Order accept failed" });
      console.log(err);
    } finally {
      handleDismissModal();
    }
  };

  return (
    <View className="flex-1 items-center justify-center px-5 pb-20">
      <View className="mt-4 mb-6 w-full flex-row justify-between items-center">
        <Text
          style={{
            flex: 1,
            color: appTheme.fontMainColor,
            fontFamily: "Anton",
            fontSize: 22,
            textTransform: "uppercase",
          }}
        >
          {t("Set Preparation Time")}
        </Text>
        <TouchableOpacity
          onPress={handleDismissModal}
          className="w-9 h-9 items-center justify-center"
          style={{ backgroundColor: appTheme.black }}
        >
          <CircleCrossIcon width={16} height={16} color={appTheme.white} />
        </TouchableOpacity>
      </View>

      <View className="mb-6 w-full">
        <View className="flex-row flex-wrap gap-3 justify-between">
          {TIMES.map((time, index) => {
            const on = selectedTime === time;
            return (
              <Pressable
                key={index}
                onPress={() => setSelectedTime(time)}
                className="justify-center items-center px-4 py-3.5"
                style={{
                  borderWidth: 2,
                  borderColor: on ? appTheme.primary : appTheme.horizontalLine,
                  backgroundColor: on ? appTheme.primary : appTheme.white,
                  minWidth: "30%",
                }}
              >
                <Text
                  style={{
                    color: on ? appTheme.white : appTheme.fontMainColor,
                    fontFamily: "Archivo800",
                    fontSize: 14,
                  }}
                >
                  {`${time} mins`}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View className="w-full">
        <CustomContinueButton
          isLoading={loadingAcceptOrder || loadingRing}
          onPress={onAcceptOrderHandler}
          title={t("Done")}
        />
      </View>
    </View>
  );
};

export default SetTimeScreenAndAcceptOrder;
