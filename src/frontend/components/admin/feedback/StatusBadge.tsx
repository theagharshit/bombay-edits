import { cn } from '@/lib/utils';

type StatusVariant = 'ok' | 'warn' | 'danger' | 'info' | 'mute';

const STATUS_MAP: Record<string, StatusVariant> = {
  // Product
  ACTIVE: 'ok',
  DRAFT: 'mute',
  ARCHIVED: 'warn',
  // Orders
  NEW: 'info',
  CONFIRMED: 'info',
  SHIPPED: 'ok',
  DELIVERED: 'ok',
  CANCELLED: 'danger',
  // Payment
  PAID: 'ok',
  PENDING: 'warn',
  FAILED: 'danger',
  REFUNDED: 'mute',
  // Reviews
  APPROVED: 'ok',
  REJECTED: 'danger',
  // Pages
  PUBLISHED: 'ok',
  // Generic
  ACTIVE_LOWER: 'ok',
  INACTIVE: 'mute',
  true: 'ok',
  false: 'mute',
};

const VARIANT_STYLES: Record<StatusVariant, string> = {
  ok: 'bg-[#15803d]/12 text-[#15803d]',
  warn: 'bg-[#b45309]/12 text-[#b45309]',
  danger: 'bg-[#b91c1c]/12 text-[#b91c1c]',
  info: 'bg-[#1d4ed8]/12 text-[#1d4ed8]',
  mute: 'bg-[#78716c]/12 text-[#78716c]',
};

type Props = {
  status: string;
  label?: string;
  className?: string;
};

export function StatusBadge({ status, label, className }: Props) {
  const variant = STATUS_MAP[status] ?? 'mute';
  const styles = VARIANT_STYLES[variant];
  const displayLabel = label ?? status.replace(/_/g, ' ');

  return (
    <span
      className={cn(
        'inline-flex items-center h-[22px] px-2 rounded-full text-[11px] font-semibold uppercase tracking-[0.04em]',
        styles,
        className
      )}
    >
      {displayLabel}
    </span>
  );
}
