"use client"
import OrderCardSkeleton from "@/lib/ui/useable-components/custom-skeletons/order.card.skelton";
import OrderCard from "@/lib/ui/useable-components/order-card";
import EmptyState from "@/lib/ui/useable-components/orders-empty-state";
import { IActiveOrdersProps, IOrder } from "@/lib/utils/interfaces/orders.interface";
import { twMerge } from "tailwind-merge";
import { useRouter } from "next/navigation";
import useDebounceFunction from "@/lib/hooks/useDebounceForFunction";
import TextComponent from "@/lib/ui/useable-components/text-field";
import { useTranslations } from "next-intl";


export default function ActiveOrders({ activeOrders, isOrdersLoading }: IActiveOrdersProps) {
  const t = useTranslations()
  const router = useRouter()

  //Handlers
  // use debouncefunction if user click multiple times at once it will call function only 1 time
  const handleTrackOrderClicked = useDebounceFunction((orderId: string | undefined) => {
    console.log("orderId", orderId)
    router.push(`/order/${orderId}/tracking`);
  }, 500);

  // if orders are loading dislay custom skelton of orderCardSkelton and optionally pass props of how many cards skeltons to display
  if (isOrdersLoading) {
    return (
      <OrderCardSkeleton count={2} />
    )
  }

  //   If No Active orders then display Empty state card and pass props
  if (activeOrders?.length === 0) {
    return (
      <EmptyState
        title={t("no_active_orders_title")}
        message={t("no_active_orders_message")}
        actionLabel={t("browse_store_button")}
        actionLink="/store"
      />
    )
  }

  //   If there are active orders then display them in order card and pass props
  //   and also pass the order object to display the order details in the order card
  //   and also pass the handleTrackOrderClicked function to handle the click event of the order card
  //   and also pass the type of order to display the order card in different style
  //   and also pass the className to style the order card
  //  (optional) we can use styling for order status- for example if order is pending then display the order card style in yellow color 
  return (
    <div className="space-y-4 py-4">
      <TextComponent text={t("active_orders_title")} className="text-xl md:text-2xl font-semibold mb-6 dark:text-gray-100" />
      <div className="space-y-4">
        {activeOrders?.map((order: IOrder) => (
          <OrderCard
            key={order._id}
            order={order}
            handleTrackOrderClicked={handleTrackOrderClicked}
            type="active"
            className={twMerge(
              "border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800",
              //   order.orderStatus === "PENDING" && "border-l-4 border-l-yellow-500",
              //   order.orderStatus === "ACCEPTED" && "border-l-4 border-l-blue-500",
              //   order.orderStatus === "ASSIGNED" && "border-l-4 border-l-[#0EA5E9]",
              //   order.orderStatus === "PICKED" && "border-l-4 border-l-green-500",
            )}
          />
        ))}
      </div>
    </div>
  )
}