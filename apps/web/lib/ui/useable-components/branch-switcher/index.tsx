"use client";

// "Switch branch" link + dialog on the menu page, mirroring the mobile app's
// StoreSwitcherModal: lists every BTB branch (nearest first when we know the
// customer's address) and remembers the pick so /discovery reopens it.

import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Dialog } from "primereact/dialog";

import { ALL_BRANCHES } from "@/lib/api/graphql";
import { useUserAddress } from "@/lib/context/address/address.context";
import { getDistanceFromLatLonInKm } from "@/lib/utils/methods/helpers";

export const PREFERRED_BRANCH_LS_KEY = "btb-preferred-branch";

interface IBranch {
  _id: string;
  name: string;
  slug: string;
  address?: string;
  shopType?: string;
  isActive?: boolean;
  location?: { coordinates: (string | number)[] };
}

export default function BranchSwitcher({
  currentBranchId,
  className,
}: {
  currentBranchId: string;
  className?: string;
}) {
  const t = useTranslations();
  const router = useRouter();
  const { userAddress } = useUserAddress();
  const [visible, setVisible] = useState(false);
  const { data } = useQuery<{ restaurantList: IBranch[] | null }>(ALL_BRANCHES, {
    fetchPolicy: "cache-and-network",
  });

  const branches = useMemo(() => {
    const [userLng, userLat] = (userAddress?.location?.coordinates ?? []).map(Number);
    const hasUser = Number.isFinite(userLat) && Number.isFinite(userLng);
    return (data?.restaurantList ?? [])
      .filter((b) => b.isActive && (!b.shopType || b.shopType === "restaurant"))
      .map((b) => {
        const [lng, lat] = (b.location?.coordinates ?? []).map(Number);
        const distanceKm =
          hasUser && Number.isFinite(lat) && Number.isFinite(lng)
            ? getDistanceFromLatLonInKm(userLat, userLng, lat, lng)
            : undefined;
        return { ...b, distanceKm };
      })
      .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
  }, [data, userAddress]);

  if (branches.length < 2) return null;

  const pick = (branch: IBranch) => {
    localStorage.setItem(PREFERRED_BRANCH_LS_KEY, branch._id);
    setVisible(false);
    if (branch._id !== currentBranchId) {
      router.push(`/restaurant/${branch.slug}/${branch._id}`);
    }
  };

  return (
    <>
      <a
        href="#"
        className={className}
        onClick={(e) => {
          e.preventDefault();
          setVisible(true);
        }}
      >
        {t("switch_branch_label")}
      </a>
      <Dialog
        header={t("switch_branch_title")}
        visible={visible}
        onHide={() => setVisible(false)}
        dismissableMask
        className="w-[92vw] max-w-md"
      >
        <ul className="flex flex-col">
          {branches.map((branch) => {
            const active = branch._id === currentBranchId;
            return (
              <li key={branch._id}>
                <button
                  type="button"
                  onClick={() => pick(branch)}
                  className={`flex w-full flex-col items-start gap-0.5 border-b border-gray-100 px-2 py-3 text-start dark:border-gray-800 ${
                    active ? "text-primary-color" : "text-gray-900 dark:text-white"
                  }`}
                >
                  <span className="font-semibold uppercase">{branch.name.trim()}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {[
                      branch.address,
                      branch.distanceKm !== undefined
                        ? `${branch.distanceKm.toFixed(1)} km`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </Dialog>
    </>
  );
}
