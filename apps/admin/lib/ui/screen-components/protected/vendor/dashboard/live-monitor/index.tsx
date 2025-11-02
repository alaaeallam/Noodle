'use client';
import { useContext } from 'react';
import { VendorLayoutContext } from '@/lib/context/vendor/layout-vendor.context';
import { useTranslations } from 'next-intl';

export default function VendorLiveMonitor() {
  const t = useTranslations();
  const {
    vendorLayoutContextData: { vendorId },
  } = useContext(VendorLayoutContext);

  const hasVendor = !!vendorId;

  return (
    <div className="mx-auto max-w-md p-2 lg:p-4">
      <h1 className="text-base font-semibold lg:text-lg">
        {t('Live Monitor')}
      </h1>
      <p className="mb-2 text-sm text-gray-500 lg:mb-4 lg:text-base">
        {t('Track the health of your business')}
      </p>

      {!hasVendor ? (
        <div className="rounded border border-dashed border-gray-300 bg-gray-50 p-3 text-sm text-gray-600">
          {t('Select a vendor to view live data.')}
        </div>
      ) : (
        <div className="rounded border border-dashed border-gray-300 bg-gray-50 p-3 text-sm text-gray-600">
          {t(
            'Live monitor is not available in this backend build. We will display real-time store status once the API exposes getLiveMonitorData.'
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 mt-4 lg:grid-cols-1 lg:gap-4">
        <div className="flex items-center rounded-lg border p-2 lg:p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#CED111] text-white bg-[#CED111] lg:h-10 lg:w-10">
            <span className="text-base font-semibold lg:text-lg">0</span>
          </div>
          <div className="ml-2 lg:ml-4">
            <h2 className="lg:text-md text-sm font-semibold">{t('Stores')}</h2>
            <p className="text-xs text-gray-500 lg:text-sm">N/A</p>
          </div>
        </div>

        <div className="flex items-center rounded-lg border p-2 lg:p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-red-500 text-white bg-red-500 lg:h-10 lg:w-10">
            <span className="text-base font-semibold lg:text-lg">0</span>
          </div>
          <div className="ml-2 lg:ml-4">
            <h2 className="lg:text-md text-sm font-semibold">
              {t('Cancelled Orders')}
            </h2>
            <p className="text-xs text-gray-500 lg:text-sm">N/A</p>
          </div>
        </div>

        <div className="flex items-center rounded-lg border p-2 lg:p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-500 text-white bg-gray-500 lg:h-10 lg:w-10">
            <span className="text-base font-semibold lg:text-lg">0</span>
          </div>
          <div className="ml-2 lg:ml-4">
            <h2 className="lg:text-md text-sm font-semibold">
              {t('Delayed Orders')}
            </h2>
            <p className="text-xs text-gray-500 lg:text-sm">N/A</p>
          </div>
        </div>

        <div className="flex items-center rounded-lg border p-2 lg:p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-black text-white lg:h-10 lg:w-10">
            <span className="text-base font-semibold lg:text-lg">0</span>
          </div>
          <div className="ml-2 lg:ml-4">
            <h2 className="lg:text-md text-sm font-semibold">{t('Ratings')}</h2>
            <p className="text-xs text-gray-500 lg:text-sm">N/A</p>
          </div>
        </div>
      </div>
    </div>
  );
}
