import { LucideIcon } from 'lucide-react';

type Props = {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  filtered?: boolean; // true when filtering produced no results
};

export function EmptyState({ icon: Icon, title, description, action, filtered = false }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-[var(--admin-surface)] border border-[var(--admin-border)] flex items-center justify-center mb-4">
          <Icon className="w-5 h-5 text-[var(--admin-text-faint)]" />
        </div>
      )}
      <p className="text-sm font-semibold text-[var(--admin-text)] mb-1">{title}</p>
      <p className="text-sm text-[var(--admin-text-mute)] max-w-xs mb-5">{description}</p>
      {action && <div>{action}</div>}
      {filtered && !action && (
        <p className="text-xs text-[var(--admin-text-faint)]">
          Try adjusting or clearing your filters.
        </p>
      )}
    </div>
  );
}
