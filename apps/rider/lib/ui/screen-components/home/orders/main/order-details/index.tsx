/* eslint-disable @typescript-eslint/no-require-imports */
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Linking,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import MapView, {
  LatLng,
  MapStyleElement,
  Marker,
  PROVIDER_DEFAULT,
} from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { Easing } from "react-native-reanimated";

// Methods
import { linkToMapsApp } from "@/lib/utils/methods";

// Icons
import Icons from "@expo/vector-icons/MaterialIcons";

// Screen Components
import ItemDetails from "@/lib/ui/screen-components/home/orders/main/item-details";

// Hooks
import useDetails from "@/lib/hooks/useDetail";
import useOrderDetail from "@/lib/hooks/useOrderDetails";

// Context
import { ConfigurationContext } from "@/lib/context/global/configuration.context";

// UI Components
import { RIDER_ORDERS } from "@/lib/apollo/queries";
import { useApptheme } from "@/lib/context/global/theme.context";
import { useUserContext } from "@/lib/context/global/user.context";
import { CustomContinueButton } from "@/lib/ui/useable-components";
import AccordionItem from "@/lib/ui/useable-components/accordian";
import SpinnerComponent from "@/lib/ui/useable-components/spinner";
import { HomeIcon } from "@/lib/ui/useable-components/svg";
import WelldoneComponent from "@/lib/ui/useable-components/well-done";
import { CustomMapStyles } from "@/lib/utils/constants/map";
import { map_styles } from "@/lib/utils/constants/order-details";
import { IOrder } from "@/lib/utils/interfaces/order.interface";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { height } = Dimensions.get("window");

// Helper function to check if coordinates are valid
// Added to prevent array bounds crashes when using invalid coordinates
const isValidCoordinate = (coord?: LatLng): boolean => {
  if (!coord) return false;
  return (
    coord.latitude !== undefined &&
    coord.longitude !== undefined &&
    !isNaN(coord.latitude) &&
    !isNaN(coord.longitude) &&
    Math.abs(coord.latitude) <= 90 &&
    Math.abs(coord.longitude) <= 180
  );
};

export default function OrderDetailScreen() {
  // Ref
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Context
  const configuration = useContext(ConfigurationContext);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const insets = useSafeAreaInsets();

  // Hooks
  const { appTheme, currentTheme } = useApptheme();
  const { t } = useTranslation();
  const {
    restaurantAddressPin,
    deliveryAddressPin,
    GOOGLE_MAPS_KEY,
    setDistance,
    setDuration,
    order,
    tab,
    locationPin,
  } = useOrderDetail();
  const { userId } = useUserContext();
  const [localOrder, setLocalOrder] = useState<IOrder>({} as IOrder);
  const { mutateAssignOrder, mutateOrderStatus, loadingOrderStatus } =
    useDetails(order);

  // States
  const [customMapStyles, setCustomMapStyles] = useState<MapStyleElement[]>();
  const [orderId, setOrderId] = useState("");
  const [retryCount, setRetryCount] = useState(0); // Added to implement retry logic

  // Ref
  const latitude = useRef(
    new Animated.Value(locationPin.location.latitude),
  ).current;
  const longitude = useRef(
    new Animated.Value(locationPin.location.longitude),
  ).current;
  const waveAnimation = useRef(new Animated.Value(0)).current; // Wave animation value

  // Handler
  const moveMarker = (newLocation: LatLng) => {
    // Safety check for valid coordinates before starting animation
    // This prevents trying to animate to invalid coordinates which could cause crashes
    if (!isValidCoordinate(newLocation)) {
      console.warn("Attempted to move marker to invalid location", newLocation);
      return;
    }

    // Use a single animation group to prevent potential race conditions
    // This prevents array index issues by ensuring animations stay in sync
    Animated.parallel([
      Animated.timing(latitude, {
        toValue: newLocation.latitude,
        duration: 2000,
        useNativeDriver: false,
      }),
      Animated.timing(longitude, {
        toValue: newLocation.longitude,
        duration: 2000,
        useNativeDriver: false,
      }),
    ]).start();
  };

  useEffect(() => {
    return () => {
      // Clean up any pending retry timeouts
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, []);

  const openMaps = () => {
    try {
      // Validate all required coordinates to prevent app crashes
      // when trying to construct navigation URLs with invalid data
      if (!isValidCoordinate(locationPin?.location)) {
        console.log("Invalid rider location for maps navigation");
        Alert.alert(t("Navigation Error"), t("Rider location is unavailable."));
        return;
      }

      if (!isValidCoordinate(restaurantAddressPin?.location)) {
        console.log("Invalid store location for maps navigation");
        Alert.alert(
          t("Navigation Error"),
          t("Restaurant location is unavailable."),
        );
        return;
      }

      if (!isValidCoordinate(deliveryAddressPin?.location)) {
        console.log("Invalid customer location for maps navigation");
        Alert.alert(
          t("Navigation Error"),
          t("Delivery location is unavailable."),
        );
        return;
      }

      const rider = `${locationPin.location.latitude},${locationPin.location.longitude}`;
      const store = `${restaurantAddressPin.location.latitude},${restaurantAddressPin.location.longitude}`;
      const customer = `${deliveryAddressPin.location.latitude},${deliveryAddressPin.location.longitude}`;

      if (Platform.OS === "ios") {
        // Apple Maps (Only Rider -> Store -> Customer)
        const appleMapsUrl = `maps://app?saddr=${rider}&daddr=${localOrder?.orderStatus === "PICKED" ? customer : store}`;
        // Added error handling for Linking
        Linking.openURL(appleMapsUrl).catch(() => {
          Alert.alert(
            t("Navigation Error"),
            t("Could not open maps application"),
          );
        });
      } else {
        // Google Maps (Supports waypoints: Rider -> Store -> Customer)
        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${rider}&destination=${customer}&waypoints=${store}`;
        // Added error handling for Linking
        Linking.openURL(googleMapsUrl).catch(() => {
          Alert.alert(
            t("Navigation Error"),
            t("Could not open maps application"),
          );
        });
      }
    } catch (error) {
      // Added global error handling
      console.log("Error opening maps:", error);
      Alert.alert(
        t("Navigation Error"),
        t("An error occurred when trying to open maps"),
      );
    }
  };

  // Use Effect
  useEffect(() => {
    const styles_for_map = CustomMapStyles(appTheme);
    if (currentTheme && appTheme) {
      setCustomMapStyles(styles_for_map);
    }

    // Added validation for Google Maps API key to catch common configuration issues
    if (!GOOGLE_MAPS_KEY || GOOGLE_MAPS_KEY === "") {
      console.log("Google Maps API key is missing or invalid");
    }
  }, [appTheme, currentTheme, GOOGLE_MAPS_KEY]);

  useEffect(() => {
    // Only set up the animation if locationPin.location exists and is valid
    // This prevents trying to animate when location data is invalid
    if (!locationPin?.location || !isValidCoordinate(locationPin.location)) {
      console.warn("Location pin is invalid or missing:", locationPin);
      return;
    }

    // Reference to the timer for proper cleanup
    let intervalId: NodeJS.Timeout | null = null;

    try {
      // Safely initialize marker position before starting animations
      // This prevents issues with undefined initial values
      const initialLatitude = locationPin.location.latitude;
      const initialLongitude = locationPin.location.longitude;

      // Initial positioning (without animation)
      latitude.setValue(initialLatitude);
      longitude.setValue(initialLongitude);

      // Start periodic updates with proper error handling
      intervalId = setInterval(() => {
        if (
          !locationPin?.location ||
          !isValidCoordinate(locationPin.location)
        ) {
          console.warn("Skipping marker update due to invalid location data");
          return;
        }

        const newLatitude = locationPin.location.latitude;
        const newLongitude = locationPin.location.longitude;
        moveMarker({ latitude: newLatitude, longitude: newLongitude });
      }, 5000);

      // Start wave animation
      const animation = Animated.loop(
        Animated.timing(waveAnimation, {
          toValue: 1000,
          duration: 10000,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
      );

      animation.start();

      return () => {
        // Proper cleanup to prevent animation continuing after unmount
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
        animation.stop();
      };
    } catch (error) {
      // Error handling to prevent uncaught exceptions
      console.log("Error in location animation setup:", error);
      if (intervalId) {
        clearInterval(intervalId);
      }
      return () => { };
    }
    // Added proper dependency array to control rerunning this effect
    // This prevents stale closures that might reference outdated data
  }, [locationPin?.location?.latitude, locationPin?.location?.longitude]);

  useEffect(() => {
    if (order) {
      setLocalOrder(order);
    }
  }, [order]);

  if (!localOrder) return;

  return (
    <>
      <GestureHandlerRootView
        className="flex-1"
        style={{ backgroundColor: appTheme.themeBackground, height: "100%" }}
      >
        <View
          style={{
            height: height * 0.5,
            backgroundColor: "transparent",
          }}
        >
          {/* <Button title="Open in Maps" onPress={openMaps} /> */}
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",

              width: 38,
              backgroundColor: appTheme.themeBackground,
              opacity: 0.75,
              position: "absolute",
              top: 60,
              right: 12,
              zIndex: 1,
            }}
          >
            <TouchableOpacity onPress={openMaps}>
              <Icons
                name="navigation"
                size={30}
                color="#1f2937"
                className={appTheme.fontMainColor}
              />
            </TouchableOpacity>
          </View>
          {locationPin && GOOGLE_MAPS_KEY ? (
            <MapView
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: appTheme.themeBackground,
              }}
              customMapStyle={customMapStyles}
              showsUserLocation
              zoomEnabled={true}
              zoomControlEnabled={true}
              rotateEnabled={false}
              initialRegion={{
                latitude: locationPin?.location?.latitude ?? 0.0,
                longitude: locationPin?.location?.longitude ?? 0.0,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
              provider={PROVIDER_DEFAULT}
            // customMapStyle={MapStyles}
            >
              {deliveryAddressPin?.location && (
                <Marker
                  coordinate={deliveryAddressPin.location}
                  title={t("Delivery Address")}
                  onPress={() => {
                    linkToMapsApp(
                      deliveryAddressPin.location,
                      deliveryAddressPin.label,
                    );
                  }}
                >
                  <Image
                    source={require("@/lib/assets/home_icon.png")}
                    style={{ height: 35, width: 32 }}
                  />
                </Marker>
              )}
              {restaurantAddressPin?.location && (
                <Marker
                  coordinate={restaurantAddressPin.location}
                  title={t("Restaurant")}
                  onPress={() => {
                    linkToMapsApp(
                      restaurantAddressPin.location,
                      restaurantAddressPin.label,
                    );
                  }}
                >
                  <Image
                    source={require("@/lib/assets/rest_icon.png")}
                    style={{ height: 35, width: 32 }}
                  />
                </Marker>
              )}
              {/* Added multiple validation checks for rider marker to prevent array index errors */}
              {locationPin?.location &&
                isValidCoordinate(locationPin.location) && (
                  <Marker.Animated
                    coordinate={{ latitude, longitude }}
                    title="Rider"
                    description={t("This is rider's location")}
                    onPress={() => {
                      if (
                        locationPin?.location &&
                        isValidCoordinate(locationPin.location)
                      ) {
                        linkToMapsApp(locationPin.location, locationPin.label);
                      }
                    }}
                  >
                    <Image
                      source={require("@/lib/assets/rider_icon.png")}
                      style={{ height: 35, width: 32 }}
                    />
                  </Marker.Animated>
                )}

              {/* Added validation for rider to restaurant directions */}
              {localOrder?.orderStatus === "ACCEPTED" ||
                localOrder?.orderStatus === "ASSIGNED"
                ? isValidCoordinate(locationPin?.location) &&
                isValidCoordinate(restaurantAddressPin?.location) &&
                GOOGLE_MAPS_KEY && (
                  <MapViewDirections
                    origin={locationPin?.location}
                    destination={restaurantAddressPin?.location}
                    apikey={GOOGLE_MAPS_KEY}
                    strokeWidth={2}
                    strokeColor={"#f95509"}
                    precision="low"
                    resetOnChange={false} // Prevents unnecessary recalculations
                    onReady={(results) => {
                      if (results && results.distance) {
                        setDistance(results.distance);
                        setDuration(results.duration);
                      }
                    }}
                    optimizeWaypoints={true}
                    onError={(error) => {
                      console.log("Detailed route error:", error);
                      // Retry logic for NOT_FOUND errors
                      if (
                        error.toString().includes("NOT_FOUND") &&
                        retryCount < 10
                      ) {
                        setRetryCount((prev) => prev + 1);
                      }
                    }}
                  />
                )
                : null}

              {/* Added validation for rider to customer directions */}
              {localOrder?.orderStatus === "PICKED" &&
                isValidCoordinate(locationPin?.location) &&
                isValidCoordinate(deliveryAddressPin?.location) &&
                GOOGLE_MAPS_KEY && (
                  <MapViewDirections
                    origin={locationPin?.location}
                    destination={deliveryAddressPin?.location}
                    apikey={GOOGLE_MAPS_KEY}
                    strokeWidth={2}
                    strokeColor={"#f95509"}
                    precision="low"
                    resetOnChange={false}
                    optimizeWaypoints={true}
                    onReady={(result) => {
                      setDistance(result.distance);
                      setDuration(result.duration);
                    }}
                    onError={(error) => {
                      console.log("Delivery route error:", error);
                      // Retry logic for NOT_FOUND errors
                      if (
                        error.toString().includes("NOT_FOUND") &&
                        retryCount < 10
                      ) {
                        setRetryCount((prev) => prev + 1);
                      }
                    }}
                  />
                )}

              {/* Added validation for restaurant to customer directions */}
              {localOrder?.orderStatus !== "ACCEPTED" &&
                localOrder?.orderStatus !== "PICKED" &&
                localOrder?.orderStatus !== "ASSIGNED" &&
                isValidCoordinate(restaurantAddressPin?.location) &&
                isValidCoordinate(deliveryAddressPin?.location) && (
                  <MapViewDirections
                    origin={restaurantAddressPin?.location}
                    destination={deliveryAddressPin?.location}
                    apikey={GOOGLE_MAPS_KEY ?? ""}
                    strokeWidth={2}
                    precision="low"
                    strokeColor={"#f95509"}
                    resetOnChange={false}
                    optimizeWaypoints={true}
                    onReady={(result) => {
                      if (result) {
                        setDistance(result.distance);
                        setDuration(result.duration);
                      }
                    }}
                    onError={(error) => {
                      console.log("Default route error:", error);
                      // Retry logic for NOT_FOUND errors
                      if (
                        error.toString().includes("NOT_FOUND") &&
                        retryCount < 10
                      ) {
                        setRetryCount((prev) => prev + 1);
                      }
                    }}
                  />
                )}
              {/* <Button title="Open in Maps" onPress={openMaps} /> */}
            </MapView>
          ) : (
            <View className="flex-1 justify-center items-center gap-y-3">
              <Text className="text-3xl">{t("Map not loaded.")}</Text>
              <Text
                className="text-lg "
                style={{ color: appTheme.fontSecondColor }}
              >
                {t("Please check for permissions.")}
              </Text>
            </View>
          )}
        </View>

        <BottomSheet
          ref={bottomSheetRef}
          index={0} // Initially, the sheet starts at 50% height (snap point 0)
          snapPoints={["50%"]} // Snap points: 50%
          backgroundStyle={map_styles.backgroundStyle} // Optional, to style the background
          animateOnMount={true} // Ensure that the initial animation is applied
          handleIndicatorStyle={{
            backgroundColor: "transparent",
          }}
          enableDynamicSizing
          enableOverDrag={false}
          maxDynamicContentSize={height * 0.8} // Set a maximum dynamic content size (optional)
        >
          <BottomSheetView
            className="flex-1 p-2"
            style={{
              backgroundColor: appTheme.white,
              borderWidth: 2,
              borderColor: appTheme.borderLineColor,
            }}
          >
            <BottomSheetScrollView
              className="p-2"
              showsVerticalScrollIndicator={false}
              style={{ backgroundColor: appTheme.white }}
            >
              {/* Order ID */}
              <View className="flex-row justify-between items-baseline mb-3">
                <Text
                  style={{
                    color: appTheme.fontSecondColor,
                    fontFamily: "Archivo800",
                    fontSize: 12,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                  }}
                >
                  {t("Order ID")}
                </Text>
                <Text
                  style={{
                    color: appTheme.fontMainColor,
                    fontFamily: "Anton",
                    fontSize: 20,
                    letterSpacing: 0.4,
                  }}
                >
                  #{localOrder?.orderId ?? "-"}
                </Text>
              </View>

              <View className="flex-1 flex-row items-center gap-x-3 mb-4">
                <View
                  style={{
                    width: 44,
                    height: 44,
                    backgroundColor: appTheme.primary,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {localOrder?.restaurant?.image ? (
                    <Image
                      src={localOrder.restaurant.image}
                      style={{ width: 44, height: 44 }}
                    />
                  ) : (
                    <Text style={{ color: appTheme.white, fontFamily: "Anton", fontSize: 14 }}>
                      BTB
                    </Text>
                  )}
                </View>

                {localOrder?.restaurant?.name && (
                  <Text
                    style={{
                      color: appTheme.fontMainColor,
                      fontFamily: "Archivo900",
                      fontSize: 17,
                      textTransform: "uppercase",
                    }}
                  >
                    {localOrder?.restaurant?.name}
                  </Text>
                )}
              </View>

              {/* Progress steps (processing tab only) */}
              {tab === "processing" && (
                <View
                  className="mb-4 px-3 py-3"
                  style={{ backgroundColor: appTheme.themeBackground }}
                >
                  {[
                    { key: "ASSIGNED", kicker: t("Assigned"), text: t("Head to") + " " + (localOrder?.restaurant?.name ?? "") },
                    { key: "PICKED", kicker: t("Picked up"), text: t("Items collected · bag sealed") },
                    { key: "DELIVERED", kicker: t("Drop off"), text: localOrder?.deliveryAddress?.deliveryAddress ?? "-" },
                  ].map((step, i) => {
                    const stageIdx = { ASSIGNED: 0, PICKED: 1, DELIVERED: 2 }[
                      localOrder?.orderStatus as string
                    ] ?? 0;
                    const done = i < stageIdx;
                    const now = i === stageIdx;
                    const dotColor = done ? appTheme.black : now ? appTheme.primary : appTheme.white;
                    const dotBorder = done ? appTheme.black : now ? appTheme.primary : appTheme.borderLineColor;
                    const lineColor = done ? appTheme.black : appTheme.borderLineColor;
                    return (
                      <View key={step.key} className="flex-row gap-3">
                        <View className="items-center" style={{ width: 20 }}>
                          <View
                            style={{
                              width: 14,
                              height: 14,
                              backgroundColor: dotColor,
                              borderWidth: 2,
                              borderColor: dotBorder,
                            }}
                          />
                          {i < 2 && (
                            <View style={{ width: 2, flex: 1, minHeight: 14, backgroundColor: lineColor }} />
                          )}
                        </View>
                        <View className="pb-3 flex-1">
                          <Text
                            style={{
                              color: appTheme.fontSecondColor,
                              fontFamily: "Archivo800",
                              fontSize: 11,
                              letterSpacing: 1,
                              textTransform: "uppercase",
                            }}
                          >
                            {step.kicker}
                          </Text>
                          <Text
                            style={{
                              color: done || now ? appTheme.fontMainColor : "#9A9A9A",
                              fontFamily: "Archivo800",
                              fontSize: 14,
                            }}
                            numberOfLines={2}
                          >
                            {step.text}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}

              {/* Pick Up Order */}
              <View className="w-[90%] flex-row items-center gap-x-2.5 mb-4">
                <View>
                  <HomeIcon
                    width={26}
                    height={26}
                    color={appTheme.fontMainColor}
                  />
                </View>
                <View>
                  <Text
                    style={{
                      color: appTheme.fontSecondColor,
                      fontFamily: "Archivo800",
                      fontSize: 11,
                      letterSpacing: 1,
                      textTransform: "uppercase",
                    }}
                  >
                    {t("Pickup Order")}
                  </Text>
                  <Text
                    style={{
                      color: appTheme.fontMainColor,
                      fontFamily: "Archivo800",
                      fontSize: 14,
                    }}
                  >
                    {localOrder?.restaurant?.address ?? "-"}
                  </Text>
                </View>
              </View>

              {/* Payment Method */}
              <View className="flex-1 flex-row justify-between items-center mb-3">
                <Text style={{ color: appTheme.fontSecondColor, fontSize: 15 }}>
                  {t("Payment Method")}
                </Text>
                <Text
                  style={{
                    color: appTheme.fontMainColor,
                    fontFamily: "Archivo900",
                    fontSize: 15,
                    textTransform: "uppercase",
                  }}
                >
                  {localOrder?.paymentMethod}
                </Text>
              </View>

              {/* Order Amount */}
              <View className="w-[99%] flex-row justify-between items-baseline pb-3" style={{ borderBottomWidth: 2, borderColor: appTheme.borderLineColor }}>
                <Text style={{ color: appTheme.fontSecondColor, fontSize: 15 }}>
                  {t("Order Amount")}
                </Text>

                <Text
                  style={{
                    color: appTheme.fontMainColor,
                    fontFamily: "Anton",
                    fontSize: 18,
                  }}
                >
                  {configuration?.currencySymbol}
                  {localOrder?.orderAmount}{" "}
                  {localOrder.paymentStatus === "PAID"
                    ? t("Paid")
                    : t("(Not paid yet)")}
                </Text>
              </View>

              <View className="flex-1 h-4" />

              <AccordionItem title={t("Order Details")}>
                <ItemDetails orderData={localOrder} tab={tab} />
              </AccordionItem>

              {/* Pick up Button */}
              {tab === "processing" &&
                localOrder.orderStatus === "ASSIGNED" && (
                <>
                  <Text
                    className="text-center mt-4"
                    style={{
                      color: localOrder.isReadyToPickUp
                        ? appTheme.primary
                        : appTheme.fontSecondColor,
                      fontFamily: "Archivo800",
                      fontSize: 13,
                      letterSpacing: 0.4,
                    }}
                  >
                    {localOrder.isReadyToPickUp
                      ? t("Restaurant marked this order ready for pickup")
                      : t("Waiting for restaurant to mark order ready")}
                  </Text>
                  <TouchableOpacity
                    className="w-full mt-4 mb-10 items-center justify-center"
                    style={{ height: 56, backgroundColor: appTheme.primary }}
                    disabled={loadingOrderStatus}
                    onPress={() =>
                      mutateOrderStatus({
                        variables: { id: localOrder?._id, status: "PICKED" },
                      })
                    }
                  >
                    {loadingOrderStatus ? (
                      <SpinnerComponent color={appTheme.white} />
                    ) : (
                      <Text
                        style={{
                          color: appTheme.white,
                          fontFamily: "Anton",
                          fontSize: 18,
                          letterSpacing: 0.4,
                          textTransform: "uppercase",
                        }}
                      >
                        {t("Pick up")}
                      </Text>
                    )}
                  </TouchableOpacity>
                </>
                )}

              {tab == "processing" && localOrder.orderStatus === "PICKED" && (
                <TouchableOpacity
                  className="w-full mt-4 mb-10 items-center justify-center"
                  style={{ height: 56, backgroundColor: appTheme.primary }}
                  disabled={loadingOrderStatus}
                  onPress={async () => {
                    await mutateOrderStatus({
                      variables: { id: localOrder?._id, status: "DELIVERED" },
                      onCompleted: () => {
                        setOrderId(localOrder?.orderId);
                      },
                    });
                    setOrderId(localOrder?.orderId);
                  }}
                >
                  {loadingOrderStatus ? (
                    <SpinnerComponent color={appTheme.white} />
                  ) : (
                    <Text
                      style={{
                        color: appTheme.white,
                        fontFamily: "Anton",
                        fontSize: 18,
                        letterSpacing: 0.4,
                        textTransform: "uppercase",
                      }}
                    >
                      {t("Mark as Delivered")}
                    </Text>
                  )}
                </TouchableOpacity>
              )}

              {tab === "new_orders" &&
                localOrder.orderStatus === "ACCEPTED" && (
                  <View style={{ paddingBottom: Platform.OS === 'ios' ? insets.bottom : insets.bottom + 10 }}>
                    <CustomContinueButton
                      title={t("Assign me")}
                      className="w-[55%] mx-auto"
                      onPress={() =>
                        mutateAssignOrder({
                          variables: { id: localOrder?._id },
                          refetchQueries: [
                            {
                              query: RIDER_ORDERS,
                              variables: { userId: userId },
                            },
                          ],
                        })
                      }
                    />
                  </View>
                )}
            </BottomSheetScrollView>
          </BottomSheetView>
        </BottomSheet>
      </GestureHandlerRootView>
      {
        <WelldoneComponent
          orderId={orderId}
          setOrderId={setOrderId}
          status={localOrder?.orderStatus === "DELIVERED" ? "Delivered" : ""}
        />
      }
    </>
  );
}
