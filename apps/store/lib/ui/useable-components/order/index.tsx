import { ConfigurationContext } from "@/lib/context/global/configuration.context";
import { MAX_TIME } from "@/lib/utils/constants";
import { AppTheme } from "@/lib/utils/interfaces/app-theme";
import { IOrder } from "@/lib/utils/interfaces/order.interface";
import { orderSubTotal } from "@/lib/utils/methods";
import { getIsAcceptButtonVisible } from "@/lib/utils/methods/gloabl";
import { ORDER_TYPE } from "@/lib/utils/types";
import moment from "moment";
import { useContext, useEffect, useRef, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import CountdownTimer from "../custom-timer";
import SpinnerComponent from "../spinner";
import { TimeLeftIcon } from "../svg";

// Hooks
import { useApptheme } from "@/lib/context/theme.context";
import useCancelOrder from "@/lib/hooks/useCancelOrder";
import useOrderPickedUp from "@/lib/hooks/useOrderPickedUp";
import useMarkOrderReady from "@/lib/hooks/useMarkOrderReady";
import { useTranslation } from "react-i18next";

interface IOrderProps {
  order: IOrder;
  tab: ORDER_TYPE;
  handlePresentModalPress?: (order: IOrder) => void;
  showDetails: Record<string, boolean>;
  onToggleDetails: (itemId: string) => void;
}

// Small uppercase Anton pill used for the Status badge (Pending / Accepted /
// Delivered) — colors follow the BTB mockup: outlined black for pending,
// solid red for in-progress, solid black once handed over.
function StatusBadge({
  label,
  variant,
  appTheme,
}: {
  label: string;
  variant: "pending" | "active" | "done";
  appTheme: AppTheme;
}) {
  const styles =
    variant === "pending"
      ? { bg: "transparent", fg: appTheme.black, bd: appTheme.black }
      : variant === "active"
        ? { bg: appTheme.primary, fg: appTheme.white, bd: appTheme.primary }
        : { bg: appTheme.black, fg: appTheme.white, bd: appTheme.black };
  return (
    <View
      style={{
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: styles.bg,
        borderWidth: 2,
        borderColor: styles.bd,
      }}
    >
      <Text
        style={{
          color: styles.fg,
          fontFamily: "Anton",
          fontSize: 13,
          letterSpacing: 0.6,
          textTransform: "uppercase",
        }}
      >
        {label}
      </Text>
    </View>
  );
}

const Order = ({
  order,
  tab,
  handlePresentModalPress,
  showDetails = {},
  onToggleDetails,
}: IOrderProps) => {
  if (!order) {
    return null; // Return early if order is not available
  }

  // Hooks can be called safely now
  const { appTheme } = useApptheme();
  const configuration = useContext(ConfigurationContext);
  const { t } = useTranslation();

  if (!configuration) {
    return null; // Configuration context is not available yet
  }
  const { cancelOrder, loading: loadingCancelOrder } = useCancelOrder();
  const { pickedUp, loading: loadingPicked } = useOrderPickedUp();
  const { markOrderReady, loading: loadingMarkReady } = useMarkOrderReady();

  // Ref
  const timer = useRef<NodeJS.Timeout>();

  // States
  const [isAcceptButtonVisible, setIsAcceptButtonVisible] = useState(
    getIsAcceptButtonVisible(order?.orderDate),
  );


  // Timer
  const timeNow = new Date();
  const date = new Date(order.orderDate);
  const acceptanceTime = moment(date).diff(timeNow, "seconds");
  const createdTime = new Date(order?.createdAt);
  let remainingTime = moment(createdTime)
    .add(MAX_TIME, "seconds")
    .diff(timeNow, "seconds");

  // Preparation Time
  const prep = new Date(order.preparationTime ?? "2023-08-16T08:00:00.000Z");
  const diffTime = prep.getTime() - timeNow.getTime();
  const totalPrep = diffTime > 0 ? diffTime / 1000 : 0;

  const decision = !isAcceptButtonVisible
    ? acceptanceTime
    : remainingTime > 0
      ? remainingTime
      : 0;

  if (decision === acceptanceTime) {
    remainingTime = 0;
  }

  // Handlers
  const onCancelOrderHandler = () => {
    cancelOrder(order._id, "not available");
  };

  const onPickupOrder = () => {
    pickedUp(order._id);
  };

  const onMarkOrderReady = () => {
    markOrderReady(order._id);
  };

  // Use Effects
  useEffect(() => {
    let isSubscribed = true;
    (() => {
      timer.current = setInterval(() => {
        const isAcceptButtonVisible = !moment().isBefore(order?.orderDate);
        if (isSubscribed) {
          setIsAcceptButtonVisible(isAcceptButtonVisible);
        }
        if (isAcceptButtonVisible) {
          if (timer.current) clearInterval(timer.current);
        }
      }, 10000);
    })();
    return () => {
      if (timer.current) clearInterval(timer.current);
      isSubscribed = false;
    };
  }, []);

  const statusBadge =
    tab === "delivered"
      ? { label: t("Delivered"), variant: "done" as const }
      : order?.orderStatus === "PENDING"
        ? { label: t(order?.orderStatus ?? ""), variant: "pending" as const }
        : { label: t(order?.orderStatus ?? ""), variant: "active" as const };

  return (
    <View className="w-full">
      <View
        className="flex-1 gap-y-3 mx-4 my-3"
        style={{
          backgroundColor: appTheme.white,
          borderWidth: 2,
          borderColor: appTheme.horizontalLine,
        }}
      >
        <View className="flex-1 gap-y-2 px-4 pt-4">
          {/* Status */}
          <View className="flex-1 flex-row justify-between items-center">
            <Text
              style={{
                color: "#8A8A8A",
                fontSize: 12,
                fontFamily: "Archivo800",
                letterSpacing: 1.4,
                textTransform: "uppercase",
              }}
            >
              {t("Status")}
            </Text>
            <StatusBadge
              label={statusBadge.label}
              variant={statusBadge.variant}
              appTheme={appTheme}
            />
          </View>

          {/* Order ID */}
          <View className="flex-1 flex-row justify-between items-baseline">
            <Text
              style={{
                color: "#8A8A8A",
                fontSize: 12,
                fontFamily: "Archivo800",
                letterSpacing: 1.4,
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
              #{order?.orderId}
            </Text>
          </View>
        </View>

        {/* Order Items header */}
        <View
          className="flex-row justify-between px-4 py-2.5"
          style={{ backgroundColor: appTheme.black }}
        >
          <Text
            style={{
              color: appTheme.white,
              fontSize: 11,
              fontFamily: "Archivo800",
              letterSpacing: 1.4,
              textTransform: "uppercase",
            }}
          >
            {t("Order")}
          </Text>
          <Text
            style={{
              color: appTheme.white,
              fontSize: 11,
              fontFamily: "Archivo800",
              letterSpacing: 1.4,
              textTransform: "uppercase",
            }}
          >
            {t("Price")}
          </Text>
        </View>

        <View className="px-4">
          {order?.items?.filter(Boolean).map((item) => {
            // Ensure variation is an object, default to empty if undefined.
            const variation = item.variation || {};
            const itemPrice = variation.price ?? 0;
            const itemTotal = itemPrice * (item.quantity ?? 1);

            return (
              <View
                key={item._id}
                className="flex-1 flex-row justify-between items-start mb-4"
              >
                {/* Left Side: Image and Details */}
                <View className="flex-row gap-x-3 flex-1">
                  {/* Image */}
                  <View
                    className="w-[64px] h-[64px] overflow-hidden"
                    style={{
                      backgroundColor: appTheme.themeBackground,
                    }}
                  >
                    <Image
                      src={item.image}
                      style={{ width: 64, height: 64 }}
                    />
                  </View>

                  {/* Item Details */}
                  <View className="flex-1 justify-between">
                    <View>
                      <Text
                        style={{
                          color: appTheme.fontMainColor,
                          fontSize: 15,
                          fontFamily: "Archivo900",
                          textTransform: "uppercase",
                        }}
                      >
                        {`${item?.quantity}x ${item?.title}`}
                      </Text>
                      <Text
                        style={{
                          color: "#6B6B6B",
                          fontSize: 13,
                          lineHeight: 18,
                        }}
                      >
                        {item?.description}
                      </Text>
                      {item?.specialInstructions ? (
                        <Text
                          style={{
                            color: "#6B6B6B",
                            fontSize: 13,
                          }}
                        >
                          {item?.specialInstructions}
                        </Text>
                      ) : null}
                    </View>

                    {/* Toggle and Collapsible Details */}
                    <View className="mt-2">
                      {(variation.title || (item?.addons && item?.addons.length > 0)) && (
                        <TouchableOpacity
                          onPress={() => onToggleDetails(item._id)}
                          className="flex-row items-center mb-2"
                        >
                          <Text
                            style={{
                              color: appTheme.primary,
                              fontSize: 12,
                              fontFamily: "Archivo800",
                              letterSpacing: 0.6,
                              textTransform: "uppercase",
                            }}
                          >
                            {showDetails[item._id] ? t("Hide Details") : t("Show Details")}
                          </Text>
                        </TouchableOpacity>
                      )}

                      {showDetails[item._id] && (
                        <View>
                          {variation.title && (
                            <View className="mb-2">
                              <View className="flex-row items-center">
                                <Text
                                  style={{
                                    color: "#6B6B6B",
                                    fontSize: 12,
                                    fontWeight: "500",
                                  }}
                                >
                                  {variation.title}
                                </Text>
                                <Text
                                  className="ml-2"
                                  style={{
                                    color: appTheme.fontMainColor,
                                    fontSize: 12,
                                    fontWeight: "600",
                                  }}
                                >
                                  {`${configuration?.currencySymbol}${variation.price}`}
                                </Text>
                              </View>
                            </View>
                          )}

                          {item?.addons?.map((addon) => (
                            <View key={addon._id} className="mb-1">
                              {addon?.options?.map((option) => (
                                <View key={option._id} className="flex-row items-center">
                                  <Text
                                    style={{
                                      color: "#6B6B6B",
                                      fontSize: 12,
                                    }}
                                  >
                                    {option.title}
                                  </Text>
                                  <Text
                                    className="ml-2"
                                    style={{
                                      color: appTheme.fontMainColor,
                                      fontSize: 12,
                                    }}
                                  >
                                    {`(+${configuration?.currencySymbol}${option?.price})`}
                                  </Text>
                                </View>
                              ))}
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                {/* Right Side: Price */}
                <View className="w-auto items-end">
                  <Text
                    style={{
                      color: appTheme.fontMainColor,
                      fontFamily: "Archivo900",
                      fontSize: 15,
                    }}
                  >
                    {`${configuration?.currencySymbol}${itemTotal.toFixed(2)}`}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Divider */}
        <View
          className="h-[2px] mx-4"
          style={{ backgroundColor: appTheme.horizontalLine }}
        />

        <View className="px-4 gap-y-2">
          {/* Sub Total */}
          <View className="flex-row justify-between">
            <Text style={{ color: "#6B6B6B", fontSize: 15 }}>
              {t("Sub Total")}
            </Text>
            <Text
              style={{
                color: appTheme.fontMainColor,
                fontSize: 15,
                fontFamily: "Archivo800",
              }}
            >
              {configuration?.currencySymbol}
              {orderSubTotal(order)}
            </Text>
          </View>

          {/* Tip */}
          {!!order?.tipping && (
            <View className="flex-row justify-between">
              <Text style={{ color: "#6B6B6B", fontSize: 15 }}>{t("Tip")}</Text>
              <Text
                style={{
                  color: appTheme.fontMainColor,
                  fontSize: 15,
                  fontFamily: "Archivo800",
                }}
              >
                {configuration?.currencySymbol}
                {order?.tipping}
              </Text>
            </View>
          )}

          {/* Tax */}
          <View className="flex-row justify-between">
            <Text style={{ color: "#6B6B6B", fontSize: 15 }}>{t("Tax")}</Text>
            <Text
              style={{
                color: appTheme.fontMainColor,
                fontSize: 15,
                fontFamily: "Archivo800",
              }}
            >
              {configuration?.currencySymbol}
              {order?.taxationAmount}
            </Text>
          </View>

          {/* Delivery */}
          {!order?.isPickedUp && (
            <View className="flex-row justify-between">
              <Text style={{ color: "#6B6B6B", fontSize: 15 }}>
                {t("Delivery Charges")}
              </Text>
              <Text
                style={{
                  color: appTheme.fontMainColor,
                  fontSize: 15,
                  fontFamily: "Archivo800",
                }}
              >
                {configuration?.currencySymbol}
                {order?.deliveryCharges}
              </Text>
            </View>
          )}

          {/* Total Amount */}
          <View
            className="flex-row justify-between items-baseline pt-2 pb-1"
            style={{
              borderTopWidth: 2,
              borderColor: appTheme.horizontalLine,
            }}
          >
            <Text
              style={{
                color: appTheme.fontMainColor,
                fontFamily: "Anton",
                fontSize: 20,
                textTransform: "uppercase",
              }}
            >
              {t("Total")}
            </Text>
            <Text
              style={{
                color: appTheme.primary,
                fontFamily: "Anton",
                fontSize: 24,
              }}
            >
              {configuration?.currencySymbol}
              {order?.orderAmount}
            </Text>
          </View>

          {/* Order Instructions */}
          {order?.instructions && (
            <View
              className="p-3 mb-2"
              style={{ backgroundColor: appTheme.themeBackground }}
            >
              <Text
                style={{
                  color: "#8A8A8A",
                  fontSize: 11,
                  fontFamily: "Archivo800",
                  letterSpacing: 1.2,
                  textTransform: "uppercase",
                }}
              >
                {t("Comment")}
              </Text>
              <Text
                style={{
                  color: appTheme.fontMainColor,
                  fontSize: 14,
                  fontStyle: "italic",
                }}
              >
                {order?.instructions}
              </Text>
            </View>
          )}
        </View>

        {/* New Order */}
        {order?.orderStatus === "PENDING" && (
          <View className="px-4 pb-4">
            <View className="flex-row gap-x-3 w-full">
              {/* Decline */}
              <TouchableOpacity
                className="flex-1 h-[54px] items-center justify-center"
                style={{ borderWidth: 2, borderColor: appTheme.black }}
                onPress={() => onCancelOrderHandler()}
              >
                {loadingCancelOrder ? (
                  <SpinnerComponent color={appTheme.black} />
                ) : (
                  <Text
                    style={{
                      color: appTheme.black,
                      fontFamily: "Anton",
                      fontSize: 17,
                      textTransform: "uppercase",
                      letterSpacing: 0.4,
                    }}
                  >
                    {t("Decline")}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Accept */}
              {handlePresentModalPress && (
                <TouchableOpacity
                  className="flex-[1.4] h-[54px] items-center justify-center"
                  style={{ backgroundColor: appTheme.primary }}
                  onPress={() => handlePresentModalPress(order)}
                >
                  <Text
                    style={{
                      color: appTheme.white,
                      fontFamily: "Anton",
                      fontSize: 19,
                      textTransform: "uppercase",
                      letterSpacing: 0.4,
                    }}
                  >
                    {t("Accept")}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Processing */}
        {["ACCEPTED", "ASSIGNED", "PICKED"].includes(
          order?.orderStatus ?? "",
        ) && (
          <>
            <View className="mx-4 mb-4 px-3.5 py-3 flex-row items-center gap-x-3.5" style={{ backgroundColor: appTheme.themeBackground, borderLeftWidth: 6, borderLeftColor: appTheme.primary }}>
              <TimeLeftIcon />
              <View>
                <Text
                  style={{
                    color: "#8A8A8A",
                    fontSize: 11,
                    fontFamily: "Archivo800",
                    letterSpacing: 1.2,
                    textTransform: "uppercase",
                  }}
                >
                  {t("Time Left")}
                </Text>

                <CountdownTimer duration={totalPrep} />
              </View>
            </View>

            {order.orderStatus === "ASSIGNED" && (
              <View className="px-4 pb-4">
                {/* Notify Rider that food is ready for pickup */}
                <TouchableOpacity
                  className="w-full h-[56px] items-center justify-center"
                  style={{
                    backgroundColor: order.isReadyToPickUp
                      ? appTheme.gray
                      : appTheme.primary,
                  }}
                  disabled={order.isReadyToPickUp || loadingMarkReady}
                  onPress={() => onMarkOrderReady()}
                >
                  {loadingMarkReady ? (
                    <SpinnerComponent color={appTheme.white} />
                  ) : (
                    <Text
                      style={{
                        color: appTheme.white,
                        fontFamily: "Anton",
                        fontSize: 18,
                        textTransform: "uppercase",
                        letterSpacing: 0.3,
                      }}
                    >
                      {order.isReadyToPickUp
                        ? t("Rider Notified")
                        : t("Food Ready - Notify Rider")}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
            {order.orderStatus === "ACCEPTED" && order.isPickedUp && (
              <View className="px-4 pb-4">
                {/* Hand Order to Rider */}
                <TouchableOpacity
                  className="w-full h-[58px] items-center justify-center"
                  style={{ backgroundColor: appTheme.primary }}
                  onPress={() => onPickupOrder()}
                >
                  {loadingPicked ? (
                    <SpinnerComponent color={appTheme.white} />
                  ) : (
                    <Text
                      style={{
                        color: appTheme.white,
                        fontFamily: "Anton",
                        fontSize: 19,
                        textTransform: "uppercase",
                        letterSpacing: 0.3,
                      }}
                    >
                      {t("Deliver Order to Customer")}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {tab === "delivered" && <View className="pb-4" />}
      </View>
    </View>
  );
};

export default Order;
