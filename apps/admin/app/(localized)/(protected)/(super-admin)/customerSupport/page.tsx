import ComingSoon from '@/lib/ui/useable-components/coming-soon';
import React from 'react';

// The support-ticket screen (lib/ui/screens/super-admin/customerSupport)
// queries getTicketUsers and friends, which the API has never implemented,
// and no app lets customers create tickets yet - so it only ever showed
// "Error loading users". Show the coming-soon page until tickets are built.
export default function CustomerSupportPage() {
  return <ComingSoon />;
}
