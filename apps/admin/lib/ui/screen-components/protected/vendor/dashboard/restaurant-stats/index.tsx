// apps/admin/lib/ui/screen-components/protected/vendor/dashboard/restaurant-stats/index.tsx

'use client';

import { useContext, useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { VendorLayoutContext } from '@/lib/context/vendor/layout-vendor.context';
import { useConfiguration } from '@/lib/hooks/useConfiguration';
import { useQueryGQL } from '@/lib/hooks/useQueryQL';

import { GET_STORE_DETAILS_BY_VENDOR_ID } from '@/lib/api/graphql/queries/dashboard';

import StatsCard from '@/lib/ui/useable-components/stats-card';
import { faShop } from '@fortawesome/free-solid-svg-icons'; // ✅ added

import type {
  IDashboardOrderStatsComponentsProps,
  IQueryResult,
  IVendorStoreDetailsResponseGraphQL,
} from '@/lib/utils/interfaces';

export default function RestaurantStats({
  dateFilter,
}: IDashboardOrderStatsComponentsProps) {
  const t = useTranslations();
  const {
    vendorLayoutContextData: { vendorId },
  } = useContext(VendorLayoutContext);

  const { CURRENCY_CODE } = useConfiguration();

  const shouldSkip = !vendorId;

  const { data, loading } = useQueryGQL(
    GET_STORE_DETAILS_BY_VENDOR_ID,
    {
      id: vendorId ?? '',
      dateKeyword: dateFilter?.dateKeyword,
      starting_date: dateFilter?.startDate ?? '',
      ending_date: dateFilter?.endDate ?? '',
    },
    {
      fetchPolicy: 'network-only',
      debounceMs: 300,
      enabled: !shouldSkip,
    }
  ) as IQueryResult<IVendorStoreDetailsResponseGraphQL | undefined, undefined>;

  const dashboardStats = useMemo(() => {
    const stores = data?.getStoreDetailsByVendorId ?? [];

    return {
      totalRestaurants: stores.length,
      totalOrders: stores.reduce((sum, s) => sum + (s.totalOrders ?? 0), 0),
      totalSales: stores.reduce((sum, s) => sum + (s.totalSales ?? 0), 0),
      totalDeliveries: stores.reduce(
        (sum, s) => sum + (s.deliveryCount ?? 0),
        0
      ),
    };
  }, [data]);

  return (
    <div className="grid grid-cols-1 items-center gap-6 p-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {/* ✅ this is the one you wanted to navigate */}
      <StatsCard
        label={t('Total Stores')}
        total={dashboardStats.totalRestaurants}
        icon={faShop}
        route="/admin/vendor/stores"  
        loading={loading || shouldSkip}
        amountConfig={{ format: 'number', currency: 'USD' }}
      />

      <StatsCard
        label={t('Total Sales')}
        total={dashboardStats.totalSales}
        route=""
        loading={loading || shouldSkip}
        amountConfig={{
          format: 'currency',
          currency: CURRENCY_CODE ?? 'USD',
        }}
      />

      <StatsCard
        label={t('Total Orders')}
        total={dashboardStats.totalOrders}
        route=""
        loading={loading || shouldSkip}
        amountConfig={{ format: 'number', currency: 'USD' }}
      />

      <StatsCard
        label={t('Total Deliveries')}
        total={dashboardStats.totalDeliveries}
        route=""
        loading={loading || shouldSkip}
        amountConfig={{ format: 'number', currency: 'USD' }}
      />
    </div>
  );
}