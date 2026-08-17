import { UPDATE_AVAILABILITY } from "@/lib/apollo/mutations/rider.mutation";
import { STORE_PROFILE } from "@/lib/apollo/queries";
import { useUserContext } from "@/lib/context/global/user.context";
import { useApptheme } from "@/lib/context/theme.context";
import SpinnerComponent from "@/lib/ui/useable-components/spinner";
import CustomSwitch from "@/lib/ui/useable-components/switch-button";
import { IStoreProfile } from "@/lib/utils/interfaces";
import { MutationTuple, useMutation } from "@apollo/client";
import { useTranslation } from "react-i18next";
import { Image, Text, View } from "react-native";
import { showMessage } from "react-native-flash-message";

const CustomDrawerHeader = () => {
  // Hooks
  const { appTheme } = useApptheme();
  const { t } = useTranslation();
  const { dataProfile, userId, refetchProfile, loadingProfile } = useUserContext();

  // Queries
  const [toggleAvailablity, { loading }] = useMutation(UPDATE_AVAILABILITY, {
    refetchQueries: [
      { query: STORE_PROFILE, variables: { restaurantId: userId } },
    ],
    onCompleted: (data) => {
      if (refetchProfile) {
        refetchProfile();
      }
    },
    onError: (error) => {
      showMessage({
        message:
          error?.graphQLErrors[0]?.message ||
          error?.networkError?.message ||
          error?.networkError?.message ||
          t("Unable to update availability"),
      });
    },
  }) as MutationTuple<IStoreProfile | undefined, Record<string, never>>;

  // Handlers
  async function handleToggleAvailability() {
    try {
      await toggleAvailablity();
    } catch (error) {
      console.error("error whilte toggling availabibility", error);
    }
  }

  return (
    <View
      className="w-full -mt-0 flex-col gap-4 px-5 pb-5"
      style={{ backgroundColor: appTheme.primary, paddingTop: 52 }}
    >
      <View className="flex-row items-start justify-between">
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
            <Text
              style={{
                color: appTheme.white,
                fontFamily: "Anton",
                fontSize: 20,
                letterSpacing: 0.4,
              }}
            >
              BTB
            </Text>
          )}
        </View>

        <View className="items-end gap-1.5">
          <Text
            style={{
              color: appTheme.white,
              fontFamily: "Archivo800",
              fontSize: 11,
              letterSpacing: 1.5,
              textTransform: "uppercase",
            }}
          >
            {t("Availability")}
          </Text>
          {loading || loadingProfile ? (
            <SpinnerComponent color={appTheme.white} height={10} />
          ) : (
            <CustomSwitch
              value={!!dataProfile?.isAvailable}
              isDisabled={loading}
              onToggle={handleToggleAvailability}
            />
          )}
          <Text
            style={{
              color: appTheme.white,
              fontFamily: "Archivo800",
              fontSize: 11,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            {dataProfile?.isAvailable ? t("available") : t("notAvailable")}
          </Text>
        </View>
      </View>

      <View className="gap-0.5">
        <Text
          style={{
            color: appTheme.black,
            fontFamily: "Anton",
            fontSize: 26,
            textTransform: "uppercase",
            lineHeight: 28,
          }}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {dataProfile?.name ?? t("store name")}
        </Text>
        <Text
          style={{
            color: appTheme.black,
            fontFamily: "Archivo800",
            fontSize: 12,
            letterSpacing: 1,
            opacity: 0.85,
          }}
        >
          {dataProfile?._id?.substring(0, 9)?.toUpperCase() ?? t("store id")}
        </Text>
      </View>
    </View>
  );
};

export default CustomDrawerHeader;
