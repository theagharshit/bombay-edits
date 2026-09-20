'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { importCsvInventory } from '@/app/actions/admin/inventory';
import { InventoryReason } from '@prisma/client';

export function CsvImportDialog({ triggerBtn }: { triggerBtn?: React.ReactNode }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [reason, setReason] = useState<InventoryReason>('RESTOCK');
  const [note, setNote] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setSuccess('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('Please upload a valid CSV file.');
      return;
    }

    setLoading(true);
    try {
      const text = await file.text();
      const result = await importCsvInventory(text, reason, note);
      if (result.success) {
        setSuccess(`Successfully imported ${result.importedCount} inventory updates.`);
        setTimeout(() => {
          setIsOpen(false);
          router.refresh();
        }, 2000);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to import CSV');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        {triggerBtn || (
          <button className="px-4 py-2 bg-[var(--admin-accent)] text-white rounded hover:opacity-90 text-sm">
            Import CSV
          </button>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded p-6 max-w-md w-full shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Import Inventory CSV</h2>

            <p className="text-sm text-gray-600 mb-4">
              Upload a CSV with headers: <code>sku, size, quantity</code>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Reason</label>
                <select
                  className="w-full border rounded p-2"
                  value={reason}
                  onChange={(e) => setReason(e.target.value as InventoryReason)}
                >
                  {Object.values(InventoryReason).map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Note (optional)</label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">CSV File</label>
                <input
                  type="file"
                  accept=".csv"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  disabled={loading}
                  className="w-full"
                />
              </div>
            </div>

            {loading && <p className="text-blue-600 mt-4 text-sm">Importing...</p>}
            {error && <p className="text-red-600 mt-4 text-sm">{error}</p>}
            {success && <p className="text-green-600 mt-4 text-sm">{success}</p>}

            <div className="mt-6 flex justify-end gap-2">
              <button
                disabled={loading}
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 border rounded text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
