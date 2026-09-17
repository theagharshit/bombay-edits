export function AdminHeader() {
  return (
    <header className="h-16 border-b border-[var(--admin-border)] bg-[var(--admin-panel)] flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        {/* Breadcrumbs or Context Title could go here */}
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm text-[var(--admin-text-mute)]">Store Owner</div>
        <div className="w-8 h-8 rounded-full bg-[var(--admin-border)] flex items-center justify-center text-xs font-medium">
          SO
        </div>
      </div>
    </header>
  );
}
