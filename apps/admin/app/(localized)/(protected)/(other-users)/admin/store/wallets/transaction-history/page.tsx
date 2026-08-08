// Screens
import TransactionRestaurantScreen from '@/lib/ui/screens/admin/restaurant/wallet/transaction-history';

// Skip static prerendering: this page's next-intl usage crashes the
// build-time server render (useIntlContext outside provider). Live wallet
// data shouldn't be statically cached anyway.
export const dynamic = 'force-dynamic';

export default function TransactionSuperAdminPage() {
  return <TransactionRestaurantScreen />;
}
