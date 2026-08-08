// Screens
import EarningSuperAdminScreen from '@/lib/ui/screens/super-admin/wallet/earnings';

// Skip static prerendering: this page's next-intl usage crashes the
// build-time server render (useIntlContext outside provider). Live wallet
// data shouldn't be statically cached anyway.
export const dynamic = 'force-dynamic';

export default function EarningSuperAdminPage() {
  return <EarningSuperAdminScreen />;
}
