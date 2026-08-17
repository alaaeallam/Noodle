import { useLocationContext } from "@/lib/context/global/location.context";
import { useApptheme } from "@/lib/context/global/theme.context";
import { ILocationPermissionComponentProps } from "@/lib/utils/interfaces";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Linking, Text, TouchableOpacity, View } from "react-native";
import Modal from "react-native-modal";
import SpinnerComponent from "../spinner";

export default function LocationPermissionComponent({
  children,
}: ILocationPermissionComponentProps) {
  // Hooks
  const { appTheme } = useApptheme();
  const { t } = useTranslation();
  const { setLocationPermission } = useLocationContext();

  // States
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const getLocationPermission = async () => {
    setLoading(true);
    const { status } = await Location.getForegroundPermissionsAsync();
    setLoading(false);
    if (status === "granted") {
      setLocationPermission(true);
      setIsModalVisible(false);
    } else {
      setIsModalVisible(true);
    }
  };

  const LocationAlert = async () => {
    Alert.alert(
      "Location access",
      "Location permissions are required to use this app. Kindly open settings to allow location access.",
      [
        {
          text: "Open settings",
          onPress: async () => {
            await Linking.openSettings();
          },
        },
      ],
    );
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status === "granted") {
      setLocationPermission(true);
      setIsModalVisible(false);
    }
  };

  const askLocationPermission = async () => {
    setLoading(true);
    const { status, canAskAgain } =
      await Location.getForegroundPermissionsAsync();
    setLoading(false);
    if (status === "granted") {
      setLocationPermission(true);
      setIsModalVisible(false);
    }
    if (canAskAgain) {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLoading(false);
      if (status === "granted") {
        setLocationPermission(true);
        setIsModalVisible(false);
      } else {
        LocationAlert();
      }
    } else {
      LocationAlert();
    }
  };

  useEffect(() => {
    getLocationPermission();
  }, []);

  return (
    <View className="flex-1">
      {children}

      <Modal
        isVisible={isModalVisible}
        coverScreen={false}
        backdropOpacity={0.5}
      >
        <View className="h-fit w-full bg-transparent justify-around items-center">
          <View
            className="h-fit w-[95%] p-5 items-center justify-around"
            style={{
              backgroundColor: appTheme.white,
              borderColor: appTheme.borderLineColor,
              borderWidth: 2,
            }}
          >
            <View className="gap-y-2.5">
              <Text
                style={{
                  color: appTheme.fontMainColor,
                  fontFamily: "Anton",
                  fontSize: 20,
                  textTransform: "uppercase",
                  textAlign: "center",
                  lineHeight: 22,
                }}
              >
                {t("Enable Location For Better Experience")}
              </Text>
              <Text
                style={{
                  color: appTheme.fontSecondColor,
                  fontSize: 14,
                  lineHeight: 20,
                  textAlign: "center",
                }}
              >
                {t(
                  "We need your location to find nearby restaurants, ensure accurate delivery, and provide the best service possible",
                )}
              </Text>
            </View>

            <TouchableOpacity
              className="items-center justify-center mt-4 w-full"
              style={{ height: 52, backgroundColor: appTheme.primary }}
              onPress={() => {
                askLocationPermission();
              }}
            >
              {isLoading ? (
                <SpinnerComponent color={appTheme.white} />
              ) : (
                <Text
                  style={{
                    color: appTheme.white,
                    fontFamily: "Anton",
                    fontSize: 15,
                    textTransform: "uppercase",
                    letterSpacing: 0.4,
                  }}
                >
                  {t("Continue")}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
