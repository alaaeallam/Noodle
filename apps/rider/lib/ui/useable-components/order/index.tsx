import { memo, useContext } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

// Interface
import { IOrderComponentProps } from "@/lib/utils/interfaces/interface";

// Contexrtg
// Hook
import useOrder from "@/lib/hooks/useOrder";

// Cion
import { BikeRidingIcon, ChatIcon, ClockIcon } from "../svg";

// Hooks
import { ConfigurationContext } from "@/lib/context/global/configuration.context";
import { useApptheme } from "@/lib/context/global/theme.context";
import { IOrder } from "@/lib/utils/interfaces/order.interface";
import { calculateDistance } from "@/lib/utils/methods/custom-functions";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import SpinnerComponent from "../spinner";

const Order = ({
  orderId,
  _id,
  orderStatus,
  restaurant,
  deliveryAddress,
  paymentMethod,
  orderAmount,
  paymentStatus,
  acceptedAt,
  user,
  tab,
  isReadyToPickUp,
  hasUnreadChatForRider,
}: IOrderComponentProps) => {
  // Hooks
  const { t } = useTranslation();
  const { appTheme } = useApptheme();
  const { time, mutateAssignOrder, loadingAssignOrder } = useOrder({
    _id,
    acceptedAt,
  } as IOrder);
  const configuration = useContext(ConfigurationContext);
  const router = useRouter();



  if (
    !orderId ||
    !_id ||
    !orderStatus ||
    !restaurant ||
    !deliveryAddress ||
    !paymentMethod ||
    !orderAmount ||
    !paymentStatus ||
    !acceptedAt
  ) {
    return null;
  } else
    return (
      <View className="w-full" key={orderId}>
        {orderStatus === "ACCEPTED" || orderStatus === "PICKED" ? (
          <View />
        ) : null}
        {!!orderId &&
          !!_id &&
          !!orderStatus &&
          !!restaurant &&
          !!deliveryAddress &&
          !!paymentMethod &&
          !!orderAmount &&
          !!paymentStatus &&
          !!acceptedAt && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                router.push({
                  pathname: "/order-detail",
                  params: {
                    itemId: _id,
                    order: JSON.stringify({
                      _id,
                      orderStatus,
                      restaurant,
                      deliveryAddress,
                      paymentMethod,
                      orderAmount,
                      paymentStatus,
                      acceptedAt,
                      user,
                    }),
                    tab,
                  },
                });
              }}
            >
              <View
                className="flex-1 mx-4 my-3"
                style={{
                  backgroundColor: appTheme.white,
                  borderWidth: 2,
                  borderColor: appTheme.borderLineColor,
                }}
              >
                <View className="flex flex-col gap-y-2 px-4 pt-3 pb-2">
                  {/* Status */}
                  {orderStatus && (
                    <View className="flex-1 flex-row justify-between items-center">
                      <Text
                        style={{
                          color: appTheme.fontSecondColor,
                          fontFamily: "Archivo800",
                          fontSize: 12,
                          letterSpacing: 1,
                          textTransform: "uppercase",
                        }}
                      >
                        {t("Status")}
                      </Text>
                      <View
                        className="px-3 py-1.5"
                        style={{
                          backgroundColor:
                            tab === "delivered"
                              ? appTheme.black
                              : tab === "processing"
                                ? appTheme.primary
                                : "transparent",
                          borderWidth: tab === "new_orders" ? 2 : 0,
                          borderColor: appTheme.black,
                        }}
                      >
                        <Text
                          style={{
                            color:
                              tab === "new_orders"
                                ? appTheme.black
                                : appTheme.white,
                            fontFamily: "Anton",
                            fontSize: 12,
                            letterSpacing: 0.6,
                            textTransform: "uppercase",
                          }}
                        >
                          {orderStatus}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Ready for pickup, restaurant-signaled */}
                  {orderStatus === "ASSIGNED" && isReadyToPickUp && (
                    <View className="flex-1 flex-row justify-between items-center">
                      <Text
                        style={{
                          color: appTheme.fontSecondColor,
                          fontFamily: "Archivo800",
                          fontSize: 12,
                          letterSpacing: 1,
                          textTransform: "uppercase",
                        }}
                      >
                        {t("Pickup")}
                      </Text>
                      <View
                        className="px-3 py-1.5"
                        style={{ backgroundColor: appTheme.primary }}
                      >
                        <Text
                          style={{
                            color: appTheme.white,
                            fontFamily: "Anton",
                            fontSize: 12,
                            letterSpacing: 0.6,
                            textTransform: "uppercase",
                          }}
                        >
                          {t("Ready for pickup")}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Order ID */}
                  {orderId && (
                    <View className="flex-1 flex-row justify-between items-baseline">
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
                        #{orderId}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Store Image and Name */}
                <View className="w-full flex-row items-center gap-x-3 px-4 pb-3">
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      backgroundColor: appTheme.primary,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {restaurant?.image ? (
                      <Image
                        src={restaurant.image}
                        style={{ width: 44, height: 44 }}
                      />
                    ) : (
                      <Text
                        style={{
                          color: appTheme.white,
                          fontFamily: "Anton",
                          fontSize: 14,
                        }}
                      >
                        BTB
                      </Text>
                    )}
                  </View>
                  <Text
                    style={{
                      color: appTheme.fontMainColor,
                      fontFamily: "Archivo900",
                      fontSize: 17,
                      textTransform: "uppercase",
                    }}
                  >
                    {restaurant?.name}
                  </Text>
                </View>

                {/* Pick up / Drop off */}
                <View
                  className="flex flex-col gap-2.5 px-4 py-3"
                  style={{ backgroundColor: appTheme.themeBackground }}
                >
                  <View className="flex-row gap-3">
                    <Text
                      style={{
                        width: 22,
                        color: appTheme.primary,
                        fontFamily: "Anton",
                        fontSize: 13,
                        paddingTop: 2,
                      }}
                    >
                      A
                    </Text>
                    <View className="flex-1 gap-0.5">
                      <Text
                        style={{
                          color: appTheme.fontSecondColor,
                          fontFamily: "Archivo800",
                          fontSize: 11,
                          letterSpacing: 1,
                          textTransform: "uppercase",
                        }}
                      >
                        {t("Pick up")}
                      </Text>
                      <Text
                        style={{
                          color: appTheme.fontMainColor,
                          fontFamily: "Archivo800",
                          fontSize: 14,
                          lineHeight: 18,
                        }}
                      >
                        {(String(restaurant.address).length > 60
                          ? String(restaurant.address).substring(0, 60).concat("...")
                          : String(restaurant.address)) ?? "-"}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row gap-3">
                    <Text
                      style={{
                        width: 22,
                        color: appTheme.fontMainColor,
                        fontFamily: "Anton",
                        fontSize: 13,
                        paddingTop: 2,
                      }}
                    >
                      B
                    </Text>
                    <View className="flex-1 gap-0.5">
                      <Text
                        style={{
                          color: appTheme.fontSecondColor,
                          fontFamily: "Archivo800",
                          fontSize: 11,
                          letterSpacing: 1,
                          textTransform: "uppercase",
                        }}
                      >
                        {t("Drop off")}
                      </Text>
                      <Text
                        style={{
                          color: appTheme.fontMainColor,
                          fontFamily: "Archivo800",
                          fontSize: 14,
                          lineHeight: 18,
                        }}
                      >
                        {(String(deliveryAddress?.deliveryAddress).length > 60
                          ? String(deliveryAddress?.deliveryAddress)
                              .substring(0, 60)
                              .concat("...")
                          : String(deliveryAddress?.deliveryAddress)) ?? "-"}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Time / Distance */}
                <View
                  className="flex-row"
                  style={{
                    borderTopWidth: 2,
                    borderBottomWidth: 2,
                    borderColor: appTheme.borderLineColor,
                  }}
                >
                  {time && (
                    <View
                      className="flex-1 flex-row items-center gap-x-1.5 px-4 py-2.5"
                      style={{ borderRightWidth: 2, borderColor: appTheme.borderLineColor }}
                    >
                      <ClockIcon color={appTheme.fontSecondColor} />
                      <Text
                        style={{
                          color: appTheme.fontMainColor,
                          fontFamily: "Archivo700",
                          fontSize: 14,
                        }}
                      >
                        {time}
                      </Text>
                    </View>
                  )}

                  <View className="flex-1 flex-row items-center gap-x-1.5 px-4 py-2.5">
                    <BikeRidingIcon color={appTheme.fontSecondColor} />
                    <Text
                      style={{
                        color: appTheme.fontMainColor,
                        fontFamily: "Archivo700",
                        fontSize: 14,
                      }}
                    >
                      {calculateDistance(
                        Number(restaurant?.location?.coordinates[0]),
                        Number(restaurant?.location?.coordinates[1]),
                        deliveryAddress?.location?.coordinates[0],
                        deliveryAddress?.location?.coordinates[1]
                      )
                        .toFixed(2)
                        .toLocaleString()}
                      km
                    </Text>
                  </View>
                </View>

                <View className="gap-2 px-4 py-3">
                  {/* Payment Method */}
                  <View className="flex-row justify-between">
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
                      {paymentMethod}
                    </Text>
                  </View>

                  {/* Order Amount */}
                  <View className="flex-row justify-between items-baseline">
                    <Text style={{ color: appTheme.fontSecondColor, fontSize: 15 }}>
                      {t("Order Amount")}
                    </Text>
                    <Text
                      style={{
                        color: appTheme.fontMainColor,
                        fontFamily: "Archivo800",
                        fontSize: 15,
                      }}
                    >
                      {configuration?.currencySymbol}
                      {orderAmount}{" "}
                      {paymentStatus === "PAID" ? t("Paid") : t("(Not paid yet)")}
                    </Text>
                  </View>

                  {["PICKED"].includes(orderStatus) && (
                    <View className="flex-row items-center gap-x-3 pt-2">
                      <TouchableOpacity
                        onPress={() => {
                          router.push({
                            pathname: "/chat",
                            params: {
                              phoneNumber: user.phone,
                              orderId: orderId,
                              id: _id,
                              customerName: user.name,
                              orderAmount: String(orderAmount ?? ""),
                              deliveryAddress:
                                deliveryAddress?.deliveryAddress ?? "",
                              distanceKm: calculateDistance(
                                Number(restaurant?.location?.coordinates[0]),
                                Number(restaurant?.location?.coordinates[1]),
                                deliveryAddress?.location?.coordinates[0],
                                deliveryAddress?.location?.coordinates[1],
                              ).toFixed(1),
                            },
                          });
                        }}
                      >
                        <View
                          className="p-3"
                          style={{
                            borderWidth: 2,
                            borderColor: hasUnreadChatForRider
                              ? appTheme.primary
                              : appTheme.borderLineColor,
                          }}
                        >
                          <ChatIcon
                            width={26}
                            height={26}
                            color={
                              hasUnreadChatForRider
                                ? appTheme.primary
                                : appTheme.fontMainColor
                            }
                          />
                          {hasUnreadChatForRider && (
                            <View
                              style={{
                                position: "absolute",
                                top: 4,
                                right: 4,
                                width: 8,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: appTheme.primary,
                              }}
                            />
                          )}
                        </View>
                      </TouchableOpacity>
                      {/* Order Comment */}
                      <View className="flex-1">
                        <Text style={{ color: appTheme.fontSecondColor, fontSize: 13 }}>
                          {t("Order Comment")}
                        </Text>
                        <Text
                          style={{
                            color: appTheme.fontMainColor,
                            fontStyle: "italic",
                            fontSize: 14,
                          }}
                        >
                          {t("No Comment")}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>

                {tab === "new_orders" && (
                  <View className="px-4 pb-4">
                    <TouchableOpacity
                      style={{ height: 56, backgroundColor: appTheme.primary }}
                      className="items-center justify-center"
                      disabled={loadingAssignOrder}
                      onPress={() =>
                        mutateAssignOrder({
                          variables: { id: _id },
                        })
                      }
                    >
                      {loadingAssignOrder ? (
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
                          {t("Assign me")}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
      </View>
    );
};

export default memo(Order);
