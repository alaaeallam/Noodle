// Core
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';

// Interface
import { IStatsCardProps } from '@/lib/utils/interfaces';

// Methods
import { formatNumber, formatNumberWithCurrency } from '@/lib/utils/methods';
import DashboardStatsCardSkeleton from '../custom-skeletons/dasboard.stats.card.skeleton';

export default function StatsCard({
  label,
  total,
  description,
  isPositive = true,
  icon,
  route,
  loading = false,
  amountConfig,
  isClickable = true,
}: IStatsCardProps) {
  const stats_card = () => (
     <div
    className={`card flex flex-col justify-between min-h-28 ${
      isClickable ? 'cursor-pointer' : 'cursor-default'
    }`}
  >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-smoke">{label}</span>

        {icon && <FontAwesomeIcon icon={icon} />}
      </div>
      <div className="text-2xl font-bold font-display text-nile">
        {' '}
        {amountConfig
          ? amountConfig?.format === 'currency'
            ? formatNumberWithCurrency(total, amountConfig.currency)
            : formatNumber(total)
          : total}
      </div>
      {description && (
        <div className={`text-sm ${isPositive ? 'text-mint' : 'text-chili'}`}>
          {' '}
          {description}
        </div>
      )}
    </div>
  );

  return loading ? (
    <DashboardStatsCardSkeleton />
  ) : isClickable ?
  (
    <Link href={route ?? ''}>{stats_card()}</Link>
  ) : (
    stats_card()
  ) ;
}
