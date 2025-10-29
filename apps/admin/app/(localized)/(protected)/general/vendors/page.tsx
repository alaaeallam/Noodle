'use client';
//apps/admin/app/(localized)/(protected)/(super-admin)/general/vendors/page.tsx
import VendorsScreen from '@/lib/ui/screens/super-admin/general/vendors';
import { useRequireRole } from '@/lib/hooks/useRequireRole';

export default function VendorsPage() {
  // Only admins should access Super Admin vendors management
  useRequireRole(['ADMIN']);
  return <VendorsScreen />;
}