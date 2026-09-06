'use client';

import { useEffect } from 'react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const sizeChart = [
  { size: 'XS', bust: '32"', waist: '26"', hip: '35"', shoulder: '13.5"' },
  { size: 'S', bust: '34"', waist: '28"', hip: '37"', shoulder: '14"' },
  { size: 'M', bust: '36"', waist: '30"', hip: '39"', shoulder: '14.5"' },
  { size: 'L', bust: '38"', waist: '32"', hip: '41"', shoulder: '15"' },
  { size: 'XL', bust: '40"', waist: '34"', hip: '43"', shoulder: '15.5"' },
  { size: 'XXL', bust: '42"', waist: '36"', hip: '45"', shoulder: '16"' },
];

export function SizeGuideModal({ isOpen, onClose }: SizeGuideModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[var(--color-ivory)] border border-[var(--color-line)] rounded-none max-w-lg w-full p-6 md:p-8 relative shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[var(--color-muted)] hover:text-[var(--color-deep-brown)] p-1.5 rounded-none transition-colors cursor-pointer"
          aria-label="Close size guide"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M1 1l12 12M13 1L1 13" />
          </svg>
        </button>

        <h2 className="font-display text-2xl text-[var(--color-deep-brown)] uppercase tracking-wider mb-2">
          Size Guide
        </h2>
        <p className="text-xs text-[var(--color-muted)] font-body mb-6">
          Measurements are in inches. If you are between sizes, we recommend sizing up for a relaxed luxury drape.
        </p>

        {/* Table */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-xs font-body border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-deep-brown)]/40 text-[10.5px] uppercase tracking-[0.14em] text-[var(--color-muted)]">
                <th className="text-left py-2.5 pr-4 font-normal">Size</th>
                <th className="text-left py-2.5 pr-4 font-normal">Bust</th>
                <th className="text-left py-2.5 pr-4 font-normal">Waist</th>
                <th className="text-left py-2.5 pr-4 font-normal">Hip</th>
                <th className="text-left py-2.5 font-normal">Shoulder</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-line)]/50">
              {sizeChart.map((row) => (
                <tr key={row.size} className="hover:bg-[var(--color-cream)]/50 transition-colors">
                  <td className="py-2.5 pr-4 font-medium text-[var(--color-deep-brown)]">{row.size}</td>
                  <td className="py-2.5 pr-4 text-[var(--color-deep-brown)]/80">{row.bust}</td>
                  <td className="py-2.5 pr-4 text-[var(--color-deep-brown)]/80">{row.waist}</td>
                  <td className="py-2.5 pr-4 text-[var(--color-deep-brown)]/80">{row.hip}</td>
                  <td className="py-2.5 text-[var(--color-deep-brown)]/80">{row.shoulder}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-[var(--color-line)]/60 pt-4">
          <h3 className="text-[11px] uppercase tracking-[0.14em] font-medium text-[var(--color-deep-brown)] mb-2">
            Bespoke Tailoring
          </h3>
          <p className="text-[11px] text-[var(--color-muted)] leading-relaxed font-body">
            All our silhouettes are individually cut and finished. Complimentary custom alterations and personalized fittings are available upon request after checkout.
          </p>
        </div>
      </div>
    </div>
  );
}
