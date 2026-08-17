// Interfaces
import { IWithdrawModalProps } from "@/lib/utils/interfaces/withdraw.interface";

// Core
import { Text, TextInput, View } from "react-native";
import { ReactNativeModal } from "react-native-modal";

// Components
import { CustomContinueButton } from "@/lib/ui/useable-components";

// Hooks
import { useApptheme } from "@/lib/context/global/theme.context";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function WithdrawModal({
  isBottomModalOpen,
  setIsBottomModalOpen,
  currentTotal,
  handleFormSubmission,
  amountErrMsg,
  setAmountErrMsg,
  withdrawRequestLoading,
}: IWithdrawModalProps) {
  // Hooks
  const { appTheme } = useApptheme();
  const { t } = useTranslation();

  // States
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [ModalMarginTop, setModalMargintTop] = useState(480);

  // Handlers
  function handleTextChange(val: string) {
    setWithdrawAmount(val);
    setAmountErrMsg("");
  }
  return (
    <ReactNativeModal
      isVisible={isBottomModalOpen}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      onBackdropPress={() => {
        setIsBottomModalOpen(false);
      }}
      useNativeDriver={true}
      style={{
        maxHeight: 370,
        width: "100%",
        height: "100%",
        backgroundColor: appTheme.white,
        padding: 5,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        marginLeft: 0,
        marginTop: ModalMarginTop,
        shadowOpacity: 0.25,
        shadowRadius: 4,
      }}
    >
      <View className="flex flex-col justify-between h-[75%] p-2 items-center w-full">
        <View
          className="flex flex-row justify-between w-full pb-3"
          style={{ borderBottomWidth: 2, borderBottomColor: appTheme.borderLineColor }}
        >
          <Text
            style={{ color: appTheme.fontMainColor, fontFamily: "Archivo800", fontSize: 16 }}
          >
            {t("Available Amount")}
          </Text>
          <Text
            style={{ color: appTheme.fontMainColor, fontFamily: "Anton", fontSize: 18 }}
          >
            ${currentTotal}
          </Text>
        </View>
        <View className=" flex flex-col gap-3 w-full">
          <Text
            style={{
              color: appTheme.fontMainColor,
              fontFamily: "Anton",
              fontSize: 18,
              textTransform: "uppercase",
            }}
          >
            {t("Enter Amount")}
          </Text>
          <TextInput
            value={withdrawAmount}
            onChangeText={(val) => handleTextChange(val)}
            maxLength={9999999}
            onFocus={() => setModalMargintTop(200)}
            onBlur={() => setModalMargintTop(480)}
            placeholder="$0.00"
            keyboardType="number-pad"
            returnKeyType="done"
            style={{
              color: appTheme.fontMainColor,
              borderWidth: 2,
              borderColor: amountErrMsg ? appTheme.textErrorColor : appTheme.borderLineColor,
            }}
            className="w-full h-[52px] p-3 placeholder:text-gray-500"
          />
          {amountErrMsg && (
            <Text style={{ color: appTheme.textErrorColor, fontSize: 13 }}>{amountErrMsg}</Text>
          )}
        </View>
        <View className="w-full">
          <CustomContinueButton
            title={
              !withdrawRequestLoading ? t("Confirm Withdraw") : t("Please wait")
            }
            disabled={withdrawRequestLoading}
            onPress={() =>
              handleFormSubmission(Number(withdrawAmount)).then(() =>
                setWithdrawAmount(""),
              )
            }
            style={{ marginTop: 20 }}
          />
        </View>
      </View>
    </ReactNativeModal>
  );
}
