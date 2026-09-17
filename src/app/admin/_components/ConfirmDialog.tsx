'use client';

import React, { useState } from 'react';

type ConfirmDialogProps = {
  trigger: React.ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
};

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm
}: ConfirmDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isWorking, setIsWorking] = useState(false);

  const handleConfirm = async () => {
    setIsWorking(true);
    try {
      await onConfirm();
      setIsOpen(false);
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)} className="inline-block">
        {trigger}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-600 mb-6">{description}</p>
            
            <div className="flex justify-end gap-3">
              <button
                disabled={isWorking}
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 border rounded text-sm hover:bg-gray-50"
              >
                {cancelLabel}
              </button>
              <button
                disabled={isWorking}
                onClick={handleConfirm}
                className="px-4 py-2 bg-[var(--admin-danger)] text-white rounded text-sm hover:opacity-90 disabled:opacity-50"
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
