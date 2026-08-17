import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

import { UPDATE_AVAILABILITY } from "@/lib/apollo/mutations/rider.mutation";
import { RIDER_PROFILE } from "@/lib/apollo/queries";
import { useApptheme } from "@/lib/context/global/theme.context";
import { useUserContext } from "@/lib/context/global/user.context";
import SpinnerComponent from "@/lib/ui/useable-components/spinner";
import CustomSwitch from "@/lib/ui/useable-components/switch-button";
import { IRiderProfile } from "@/lib/utils/interfaces";
import { MutationTuple, useMutation } from "@apollo/client";
// import { showMessage } from "react-native-flash-message";
import { useEffect, useState } from "react";
import { showMessage } from "react-native-flash-message";
import { isBoolean } from "lodash";

const CustomDrawerHeader = () => {
  // Hook
  const { appTheme } = useApptheme();
  const { t } = useTranslation();
  const { dataProfile, loadingProfile } = useUserContext();
  const [isRiderAvailable, setIsRiderAvailable] = useState(false);

  useEffect(() => {
    setIsRiderAvailable(dataProfile?.available || false);
  }, [dataProfile?.available]);

  // Queries
  const [toggleAvailablity, { loading }] = useMutation(UPDATE_AVAILABILITY, {
    refetchQueries: [
      { query: RIDER_PROFILE, variables: { id: dataProfile?._id?.toString() } },
    ],
    awaitRefetchQueries: true,
    // onCompleted: () => {
    // Don't manually update state - let the refetch handle it through useEffect
    // The refetch will update dataProfile and trigger the useEffect to update isRiderAvailable
    // showMessage({
    //   message: t(!isRiderAvailable ? "You are now online" : "You are now offline"),
    //   type: "success",
    // });
    // },
    // onError: (error) => {
    //   showMessage({
    //     message:
    //       error.graphQLErrors[0]?.message ||
    //       error?.networkError?.message ||
    //       t("Unable to update availability"),
    //     type: "danger",
    //   });
    // },
  }) as MutationTuple<IRiderProfile | undefined, { id: string }>;

  return (
    <View
      className="w-full flex-col gap-3 px-5 pb-[18px]"
      style={{ backgroundColor: appTheme.primary, paddingTop: 48 }}
    >
      <View className="flex-row items-start justify-between">
        <View
          className="w-[54px] h-[54px] items-center justify-center"
          style={{ backgroundColor: appTheme.black }}
        >
          <Text
            className="text-[20px]"
            style={{
              color: appTheme.white,
              fontFamily: "Anton",
            }}
          >
            {dataProfile?.name
              ?.split(" ")[0]
              ?.substring(0, 1)
              ?.toUpperCase()
              ?.concat(
                "",
                dataProfile?.name?.split(" ")[1]?.length
                  ? (dataProfile?.name
                      ?.split(" ")[1]
                      ?.substring(0, 1)
                      ?.toUpperCase() ?? "")
                  : ""
              ) ?? "JS"}
          </Text>
        </View>

        <View className="items-end gap-1.5">
          <Text
            className="text-[11px] uppercase"
            style={{
              color: appTheme.white,
              fontFamily: "Archivo800",
              letterSpacing: 1.4,
            }}
          >
            {t("Availability")}
          </Text>
          {loading || loadingProfile ? (
            <SpinnerComponent color={appTheme.white} />
          ) : (
            <CustomSwitch
              value={isRiderAvailable}
              isDisabled={loading}
              onToggle={async () => {
                try {
                  if (!dataProfile?._id?.toString()) {
                    showMessage({
                      message: t("User ID is missing"),
                      type: "danger",
                    });
                    return;
                  }

                  await toggleAvailablity({
                    variables: { id: dataProfile?._id?.toString() ?? "" },
                  });
                } catch (error) {
                  // Error is already handled in the mutation's onError callback
                  console.error("Toggle availability error:", error);
                }
              }}
            />
          )}
          <Text
            className="text-[11px] uppercase"
            style={{
              color: appTheme.white,
              fontFamily: "Archivo800",
              letterSpacing: 1,
            }}
          >
            {isBoolean(dataProfile?.available)
              ? dataProfile?.available
                ? t("Available")
                : t("Paused")
              : ""}
          </Text>
        </View>
      </View>

      <View className="gap-0.5">
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{
            color: appTheme.white,
            fontFamily: "Anton",
            fontSize: 26,
            textTransform: "uppercase",
            lineHeight: 30,
          }}
        >
          {dataProfile?.name ?? t("rider name")}
        </Text>
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{
            color: appTheme.white,
            fontFamily: "Archivo800",
            fontSize: 13,
            letterSpacing: 1,
            opacity: 0.85,
          }}
        >
          {dataProfile?._id.substring(0, 9).toUpperCase() ?? "rider id"}
        </Text>
      </View>
    </View>
  );
};

export default CustomDrawerHeader;
