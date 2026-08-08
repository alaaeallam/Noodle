import { StatusChipTone } from '@/lib/ui/useable-components/status-chip';

// Reconciles order/withdraw/ticket status codes onto the 4 brand tones.
const STATUS_TONE: Record<string, StatusChipTone> = {
  PENDING: 'amber',
  ASSIGNED: 'nile',
  ACCEPTED: 'nile',
  PICKED: 'nile',
  DELIVERED: 'mint',
  CANCELLED: 'chili',
  REQUESTED: 'amber',
  TRANSFERRED: 'mint',
  open: 'amber',
  inprogress: 'nile',
  closed: 'mint',
};

export function getStatusTone(status: string | undefined): StatusChipTone {
  return (status && STATUS_TONE[status]) || 'nile';
}
