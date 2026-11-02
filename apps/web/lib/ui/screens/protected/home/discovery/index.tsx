"use client";

// BTB is one brand with several branches, not a marketplace: instead of
// listing restaurants, "Menu" sends the customer straight to the menu of the
// nearest open branch that delivers to their address (same rule as the
// mobile app's useCurrentStore).

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ProgressSpinner } from "primereact/progressspinner";

import useNearByRestaurantsPreview from "@/lib/hooks/useNearByRestaurantsPreview";
import { useUserAddress } from "@/lib/context/address/address.context";
import { getDistanceFromLatLonInKm } from "@/lib/utils/methods/helpers";

export default function DiscoveryScreen() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userAddress } = useUserAddress();

  const hasAddress = !!userAddress?.location?.coordinates?.length;
  const { queryData, loading, error } = useNearByRestaurantsPreview(hasAddress);

  const nearestBranch = useMemo(() => {
    if (!hasAddress) return null;
    const [userLng, userLat] = (userAddress?.location?.coordinates ?? []).map(Number);
    const open = queryData.filter((branch) => branch.isActive);
    const distance = (branch: (typeof open)[number]) => {
      const [lng, lat] = (branch.location?.coordinates ?? []).map(Number);
      return Number.isFinite(lat) && Number.isFinite(lng)
        ? getDistanceFromLatLonInKm(userLat, userLng, lat, lng)
        : Infinity;
    };
    return [...open].sort((a, b) => distance(a) - distance(b))[0] ?? null;
  }, [hasAddress, userAddress, queryData]);

  useEffect(() => {
    if (!nearestBranch) return;
    localStorage.setItem("currentShopType", "restaurant");
    const query = searchParams?.toString();
    router.replace(
      `/restaurant/${nearestBranch.slug}/${nearestBranch._id}${query ? `?${query}` : ""}`
    );
  }, [nearestBranch, router, searchParams]);

  if (!hasAddress) {
    return (
      <Message
        title={t("menu_set_address_title")}
        body={t("menu_set_address_message")}
        action={t("menu_set_address_button")}
        onAction={() => router.push("/")}
      />
    );
  }

  if (loading || nearestBranch) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <ProgressSpinner style={{ width: "48px", height: "48px" }} strokeWidth="4" />
      </div>
    );
  }

  return (
    <Message
      title={error ? t("something_went_wrong") : t("menu_no_branch_title")}
      body={error ? "" : t("menu_no_branch_message")}
      action={t("menu_set_address_button")}
      onAction={() => router.push("/")}
    />
  );
}

function Message({
  title,
  body,
  action,
  onAction,
}: {
  title: string;
  body: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-3 px-6 text-center">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
      {body && <p className="max-w-md text-gray-500 dark:text-gray-400">{body}</p>}
      <button
        type="button"
        onClick={onAction}
        className="mt-2 rounded-full bg-primary-color px-6 py-2 font-medium text-white"
      >
        {action}
      </button>
    </div>
  );
}
