// apps/admin/lib/ui/screen-components/protected/vendor/dashboard/header/index.tsx
'use client';

import { useContext, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { ProfileContext } from '@/lib/context/vendor/profile.context';

export default function VendorDashboardHeader() {
  const t = useTranslations();
  const { vendorProfileResponse } = useContext(ProfileContext);
  const p = vendorProfileResponse?.data?.profile;

  const displayName = useMemo(() => {
    if (!p) return '';
    const full = [p.firstName, p.lastName].filter(Boolean).join(' ').trim();
    if (full) return full;
    // fallback: local-part of email
    return (p.email || '').split('@')[0] || t('Vendor');
  }, [p, t]);

  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-medium">
        {t('Hi')} {displayName}
      </h2>
      {/* ...rest of header */}
    </div>
  );
}