"use client";
import React from "react";
import { Dialog } from "primereact/dialog";
import { useMutation } from "@apollo/client";
import { ABORT_ORDER } from "@/lib/api/graphql";
import useToast from "@/lib/hooks/useToast";
import { useAuth } from "@/lib/context/auth/auth.context";
import { useTranslations } from "next-intl";

interface CancelOrderModalProps {
  visible: boolean;
  onHide: () => void;
  orderId: string;
  onSuccess: () => void;
}

function CancelOrderModal({
  visible,
  onHide,
  orderId,
  onSuccess,
}: CancelOrderModalProps) {
  const { showToast } = useToast();
  const { authToken } = useAuth(); // Get auth context for authentication
  const t = useTranslations();

  const [abortOrder, { loading }] = useMutation(ABORT_ORDER, {
    onCompleted: (data) => {
      console.log("Order cancelled successfully:", data);
      showToast({
        type: "success",
        title: t("order_cancelled_title"),
        message: t("order_cancelled_success_message"),
      });
      console.log("onSuccess is called");
      onSuccess();
      // Refresh the order tracking page to show the updated status
    },
    onError: (error) => {
      console.error("Abort order error:", error);
      console.error("Error details:", {
        message: error.message,
        graphQLErrors: error.graphQLErrors,
        networkError: error.networkError,
      });
      showToast({
        type: "error",
        title: t("cancellation_failed_title"),
        message: error.message || t("unable_to_cancel_order_message"),
      });
    },
    // Ensure token is sent with the request
    context: {
      headers: {
        Authorization: authToken ? `Bearer ${authToken}` : "", // Changed to uppercase 'Authorization'
      },
    },
  });

  const handleCancelOrder = () => {
    if (!authToken) {
      console.error("No authentication token available");
      showToast({
        type: "error",
        title: t("authentication_required_title"),
        message: t("login_to_cancel_order_message"),
      });
      return;
    }

    console.log("Cancelling order:", {
      orderId,
      authToken: authToken ? "Present" : "Missing",
      tokenLength: authToken?.length,
    });

    abortOrder({
      variables: {
        id: orderId,
      },
    });
  };

  return (
    <Dialog
      contentClassName="p-6 dark:bg-gray-900 dark:text-gray-300"
      headerClassName="dark:bg-gray-900 dark:text-gray-300"
      visible={visible}
      onHide={onHide}
      modal
      className="w-full max-w-md mx-4 bg-white dark:bg-gray-900 p-5"
     
      showHeader={false}
      closable={true}
      dismissableMask
    >
      <div className="text-center">
        <div className="flex justify-end mb-2">
          <button
            onClick={onHide}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-500 dark:text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <h2 className="text-xl font-semibold mb-3 dark:text-gray-100">
          {t("order_cancel_warning_line2")}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
          {t("order_cancel_warning_line1")}
          <br />
          {t("order_cancel_warning_line2")}
        </p>

        <div className="space-y-3">
          <button
            onClick={handleCancelOrder}
            disabled={loading}
            className="w-full py-3 px-4 bg-red-500 text-white rounded-full font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {loading ? t("cancelling_text") : t("cancel_my_order_button")}
          </button>

          <button
            onClick={onHide}
            disabled={loading}
            className="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-full font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {t("ill_wait_for_my_order_button")}
          </button>
        </div>
      </div>
    </Dialog>
  );
}

export default CancelOrderModal;
