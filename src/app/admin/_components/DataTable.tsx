import React, { ReactNode } from 'react';

export type ColumnDef<T> = {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => ReactNode;
  className?: string;
};

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (item: T) => string;
  selectedIds?: string[];
  onSelectChange?: (id: string, checked: boolean) => void;
  onSelectAll?: (checked: boolean) => void;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  selectedIds,
  onSelectChange,
  onSelectAll,
}: DataTableProps<T>) {
  const allSelected = data.length > 0 && selectedIds?.length === data.length;
  const someSelected = data.length > 0 && selectedIds && selectedIds.length > 0 && selectedIds.length < data.length;

  return (
    <div className="w-full overflow-x-auto rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)]">
      <table className="w-full text-left text-[14px] text-[var(--admin-text)] border-collapse whitespace-nowrap">
        <thead className="bg-[#f5f5f4] text-[var(--admin-text-mute)] border-b border-[var(--admin-border)]">
          <tr className="h-[var(--admin-row-h)]">
            {onSelectAll && (
              <th className="px-4 py-2 w-[40px]">
                <input
                  type="checkbox"
                  className="rounded border-[var(--admin-border-str)] text-[var(--admin-focus)] focus:ring-[var(--admin-focus)]"
                  checked={allSelected}
                  ref={input => {
                    if (input) input.indeterminate = !!someSelected;
                  }}
                  onChange={(e) => onSelectAll(e.target.checked)}
                />
              </th>
            )}
            {columns.map((col, i) => (
              <th key={i} className={`px-4 py-2 font-medium ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--admin-border)]">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (onSelectAll ? 1 : 0)} className="px-4 py-8 text-center text-[var(--admin-text-mute)]">
                No results found.
              </td>
            </tr>
          ) : (
            data.map((item) => {
              const id = keyExtractor(item);
              const isSelected = selectedIds?.includes(id);

              return (
                <tr
                  key={id}
                  className={`h-[var(--admin-row-h)] hover:bg-[#f5f5f4] transition-colors ${
                    isSelected ? 'bg-blue-50/50' : ''
                  }`}
                >
                  {onSelectChange && (
                    <td className="px-4 py-2 w-[40px]">
                      <input
                        type="checkbox"
                        className="rounded border-[var(--admin-border-str)] text-[var(--admin-focus)] focus:ring-[var(--admin-focus)]"
                        checked={!!isSelected}
                        onChange={(e) => onSelectChange(id, e.target.checked)}
                      />
                    </td>
                  )}
                  {columns.map((col, i) => (
                    <td key={i} className={`px-4 py-2 ${col.className || ''}`}>
                      {col.cell ? col.cell(item) : col.accessorKey ? String(item[col.accessorKey]) : null}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
