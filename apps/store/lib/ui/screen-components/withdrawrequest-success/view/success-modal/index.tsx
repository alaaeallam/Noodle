// Core
import { Image, Text, View } from "react-native";

// Icons
import { Ionicons } from "@expo/vector-icons";

// Assets
import { IMAGES } from "@/lib/assets/images";

// Expo
import { router } from "expo-router";

// Interfaces
import { IWalletSuccessModalProps } from "@/lib/utils/interfaces/withdraw.interface";

// Hooks
import { useApptheme } from "@/lib/context/theme.context";
import { useTranslation } from "react-i18next";
const SuccessModal = ({ message }: IWalletSuccessModalProps) => {
  // Hooks
  const { appTheme } = useApptheme();
  const { t } = useTranslation();
  return (
    <View
      style={{
        borderWidth: 2,
        borderColor: appTheme.horizontalLine,
        backgroundColor: appTheme.white,
        justifyContent: "center",
        alignItems: "center",
        maxHeight: 400,
        marginTop: 0,
        width: 350,
        padding: 16,
      }}
    >
      <View className="absolute right-3 top-3">
        <Ionicons
          name="close-circle-outline"
          size={22}
          color={appTheme.black}
          onPress={() => {
            router.back();
          }}
        />
      </View>

      <Image
        source={IMAGES.successWithdrawRequest}
        style={{ width: 200, height: 200 }}
        resizeMode="contain"
      />
      <View className="flex flex-col gap-2 items-center justify-center self-center mx-auto w-[80%]">
        <Text
          className="text-center"
          style={{
            color: appTheme.fontMainColor,
            fontFamily: "Anton",
            fontSize: 20,
            textTransform: "uppercase",
            lineHeight: 22,
          }}
        >
          {message}
        </Text>
        <Text style={{ color: "#6B6B6B", textAlign: "center" }}>
          {t("Usually it takes 1-2 business days")}
        </Text>
      </View>
    </View>
  );
};

export default SuccessModal;
