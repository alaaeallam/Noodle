'use client';
// Core
import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Prime React
import { Chart } from 'primereact/chart';
import {
  IDashboardGrowthOverviewComponentsProps,
  IDashboardVendorGrowthOverViewTabularComponentsProps,
  IVendorStoreDetails,
} from '@/lib/utils/interfaces';
import DashboardUsersByYearStatsSkeleton from '@/lib/ui/useable-components/custom-skeletons/dasboard.user.year.stats.skeleton';
import { VendorLayoutContext } from '@/lib/context/vendor/layout-vendor.context';
import Table from '@/lib/ui/useable-components/table';
import { DataTableRowClickEvent } from 'primereact/datatable';
import { onUseLocalStorage } from '@/lib/utils/methods';
import { generateVendorStoreDetails } from '@/lib/utils/dummy';
import { useTranslations } from 'next-intl';
import { VENDOR_STORE_DETAILS_COLUMN } from '@/lib/ui/useable-components/table/columns/store-details-by-vendor-columns';

// ── Graph (kept static for now) ─────────────────────────────
const VendorGrowthOverViewGraph = () => {
  const t = useTranslations();
  const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});

  const onChartDataChange = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    const data = {
      labels: [
        t('January'),
        t('February'),
        t('March'),
        t('April'),
        t('May'),
        t('June'),
        t('July'),
        t('August'),
        t('September'),
        t('October'),
        t('November'),
        t('December'),
      ],
      datasets: [
        {
          label: t('Stores'),
          data: Array(12).fill(0),
          fill: false,
          borderColor: documentStyle.getPropertyValue('--pink-500'),
          backgroundColor: documentStyle.getPropertyValue('--pink-100'),
          tension: 0.5,
        },
        {
          label: t('Orders'),
          data: Array(12).fill(0),
          fill: false,
          borderColor: documentStyle.getPropertyValue('--blue-500'),
          backgroundColor: documentStyle.getPropertyValue('--blue-100'),
          tension: 0.5,
        },
        {
          label: t('Sales'),
          data: Array(12).fill(0),
          fill: false,
          borderColor: documentStyle.getPropertyValue('--yellow-500'),
          backgroundColor: documentStyle.getPropertyValue('--yellow-100'),
          tension: 0.5,
        },
      ],
    };

    const options = {
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: {
        legend: {
          marginBottom: '20px',
          labels: {
            usePointStyle: true,
            pointStyle: 'circle',
            backgroundColor: textColor,
            color: textColor,
          },
        },
      },
      scales: {
        x: {
          ticks: { color: textColorSecondary },
          grid: { color: surfaceBorder },
        },
        y: {
          ticks: { color: textColorSecondary },
          grid: { color: surfaceBorder },
        },
      },
    };

    setChartData(data);
    setChartOptions(options);
  };

  useEffect(() => {
    onChartDataChange();
  }, []);

  return (
    <div className="w-full p-3">
      <h2 className="text-lg font-semibold">{t('Growth Overview')}</h2>
      <p className="text-gray-500">
        {t('Tracking Vendor Growth Over the Year')} ({new Date().getFullYear()})
      </p>
      <div className="mt-4">
        <Chart type="line" data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

// ── Tabular (now dummy-only, no GraphQL) ───────────────────
const VendorGrowthOverViewTabular = ({
  dateFilter,
}: IDashboardVendorGrowthOverViewTabularComponentsProps) => {
  const {
    vendorLayoutContextData: { vendorId },
  } = useContext(VendorLayoutContext);

  const router = useRouter();

  // dummy for now because backend doesn’t expose the query
  const tableData = generateVendorStoreDetails();
  const loading = false;

  const handleRowClick = (event: DataTableRowClickEvent) => {
    const details = event.data as IVendorStoreDetails;
    onUseLocalStorage('save', 'restaurantId', details._id);
    router.push('/admin/store/');
  };

  return (
    <div className="p-3">
      <Table
        data={tableData}
        setSelectedData={() => {}}
        selectedData={[]}
        columns={VENDOR_STORE_DETAILS_COLUMN()}
        loading={loading}
        handleRowClick={handleRowClick}
      />
    </div>
  );
};

export default function VendorGrowthOverView({
  isStoreView,
  dateFilter,
}: IDashboardGrowthOverviewComponentsProps) {
  return isStoreView ? (
    <VendorGrowthOverViewTabular dateFilter={dateFilter} />
  ) : (
    <VendorGrowthOverViewGraph />
  );
}