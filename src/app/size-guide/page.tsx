import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Size guide',
  description: 'Find your perfect fit with our detailed size guide and measurement chart.',
};

const sizeChart = [
  { size: 'XS', bust: '32"', waist: '26"', hip: '35"', shoulder: '13.5"' },
  { size: 'S', bust: '34"', waist: '28"', hip: '37"', shoulder: '14"' },
  { size: 'M', bust: '36"', waist: '30"', hip: '39"', shoulder: '14.5"' },
  { size: 'L', bust: '38"', waist: '32"', hip: '41"', shoulder: '15"' },
  { size: 'XL', bust: '40"', waist: '34"', hip: '43"', shoulder: '15.5"' },
  { size: 'XXL', bust: '42"', waist: '36"', hip: '45"', shoulder: '16"' },
];

export default function SizeGuidePage() {
  return (
    <div className="container-site section-padding max-w-3xl mx-auto">
      <h1 className="font-display text-3xl md:text-4xl text-ink mb-4">Size guide</h1>
      <p className="text-sm text-text-muted mb-10">All measurements are in inches. If you are between sizes, we recommend sizing up for a relaxed fit or sizing down for a fitted look.</p>

      {/* Size chart */}
      <div className="overflow-x-auto mb-12">
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="border-b border-ink">
              <th className="text-left py-3 pr-6 text-xs text-text-muted font-normal">Size</th>
              <th className="text-left py-3 pr-6 text-xs text-text-muted font-normal">Bust</th>
              <th className="text-left py-3 pr-6 text-xs text-text-muted font-normal">Waist</th>
              <th className="text-left py-3 pr-6 text-xs text-text-muted font-normal">Hip</th>
              <th className="text-left py-3 text-xs text-text-muted font-normal">Shoulder</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {sizeChart.map(row => (
              <tr key={row.size}>
                <td className="py-3 pr-6 text-ink font-medium">{row.size}</td>
                <td className="py-3 pr-6 text-deep-brown">{row.bust}</td>
                <td className="py-3 pr-6 text-deep-brown">{row.waist}</td>
                <td className="py-3 pr-6 text-deep-brown">{row.hip}</td>
                <td className="py-3 text-deep-brown">{row.shoulder}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* How to measure */}
      <div className="mb-12">
        <h2 className="font-display text-xl text-ink mb-4">How to measure</h2>
        <div className="space-y-4 text-sm text-deep-brown leading-relaxed">
          <p><strong className="text-ink">Bust:</strong> Measure around the fullest part of your bust, keeping the tape level.</p>
          <p><strong className="text-ink">Waist:</strong> Measure around your natural waistline, the narrowest part of your torso.</p>
          <p><strong className="text-ink">Hip:</strong> Measure around the fullest part of your hips, keeping the tape level.</p>
          <p><strong className="text-ink">Shoulder:</strong> Measure from the edge of one shoulder to the other across the back.</p>
        </div>
      </div>

      {/* Custom stitching */}
      <div className="bg-cream p-8 rounded-sm">
        <h2 className="font-display text-xl text-ink mb-3">Custom stitching</h2>
        <p className="text-sm text-deep-brown leading-relaxed mb-4">
          For our occasionwear and bridal pieces, we offer custom stitching to your exact measurements. This service is included for all made-to-order pieces. For ready-to-wear pieces, custom stitching is available for an additional fee.
        </p>
        <Link href="/contact" className="inline-block text-sm font-body text-ink border-b border-ink pb-0.5 hover:text-deep-brown hover:border-deep-brown transition-colors" style={{ transitionDuration: 'var(--duration-fast)' }}>
          Enquire about custom stitching
        </Link>
      </div>
    </div>
  );
}
