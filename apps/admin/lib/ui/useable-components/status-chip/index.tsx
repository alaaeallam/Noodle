export type StatusChipTone = 'mint' | 'amber' | 'nile' | 'chili';

export interface StatusChipProps {
  label: string;
  tone: StatusChipTone;
  className?: string;
}

const TONE: Record<StatusChipTone, { bg: string; text: string; dot: string }> = {
  mint: { bg: 'bg-mint-tint', text: 'text-mint', dot: 'bg-mint' },
  amber: { bg: 'bg-amber-tint', text: 'text-amber', dot: 'bg-amber' },
  nile: { bg: 'bg-nile-tint', text: 'text-nile', dot: 'bg-nile' },
  chili: { bg: 'bg-chili-tint', text: 'text-chili', dot: 'bg-chili' },
};

export default function StatusChip({ label, tone, className = '' }: StatusChipProps) {
  const s = TONE[tone];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-bold ${s.bg} ${s.text} ${className}`}
    >
      <span className={`h-[7px] w-[7px] rounded-full ${s.dot}`} />
      {label}
    </span>
  );
}
