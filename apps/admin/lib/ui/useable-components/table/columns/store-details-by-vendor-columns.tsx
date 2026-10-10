// Interfaces and Types
import { IVendorStoreDetails } from '@/lib/utils/interfaces';
import { useTranslations } from 'next-intl';
import { useConfiguration } from '@/lib/hooks/useConfiguration';

export const VENDOR_STORE_DETAILS_COLUMN = () => {
  // Hooks
  const t = useTranslations();
  const { CURRENT_SYMBOL } = useConfiguration();

  return [
    { headerName: t('Store Name'), propertyName: 'restaurantName' },
    {
      headerName: t('Total Orders'),
      propertyName: 'totalOrders',
      body: (store: IVendorStoreDetails) => store.totalOrders.toLocaleString(),
    },
    {
      headerName: t('Total Sales'),
      propertyName: 'totalSales',
      body: (store: IVendorStoreDetails) => `${CURRENT_SYMBOL} ${store.totalSales.toFixed(2)}`,
    },
    {
      headerName: t('Pickup Orders'),
      propertyName: 'pickUpCount',
      body: (store: IVendorStoreDetails) => store.pickUpCount.toLocaleString(),
    },
    {
      headerName: t('Delivery Orders'),
      propertyName: 'deliveryCount',
      body: (store: IVendorStoreDetails) =>
        store.deliveryCount.toLocaleString(),
    },
  ];
};
