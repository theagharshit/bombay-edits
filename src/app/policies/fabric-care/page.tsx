import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Fabric and garment care' };

export default function FabricCarePage() {
  return (
    <div className="container-site section-padding max-w-2xl mx-auto">
      <h1 className="font-display text-3xl text-ink mb-8">Fabric and garment care</h1>
      <div className="space-y-6 text-sm text-deep-brown leading-relaxed">
        <p>Our garments are crafted from fine fabrics with delicate hand embroidery. With proper care, they will retain their beauty for years.</p>
        <section><h2 className="font-display text-xl text-ink mb-3">General care</h2><p>Dry clean is recommended for all embroidered pieces. Hand washing is suitable for unembroidered cotton and linen garments in cold water with mild detergent. Never machine wash embroidered garments.</p></section>
        <section><h2 className="font-display text-xl text-ink mb-3">Storage</h2><p>Store garments flat or on padded hangers in breathable muslin or cotton garment bags. Avoid plastic covers which can trap moisture. Keep away from direct sunlight which may fade colours over time.</p></section>
        <section><h2 className="font-display text-xl text-ink mb-3">Ironing</h2><p>Iron on low to medium heat on the reverse side. Use a pressing cloth between the iron and any embroidered areas. Steam gently for delicate fabrics like organza and tissue.</p></section>
        <section><h2 className="font-display text-xl text-ink mb-3">Fabric-specific care</h2>
          <div className="space-y-2 mt-3">
            <p><strong className="text-ink">Chanderi silk:</strong> Dry clean only. Iron on silk setting with pressing cloth.</p>
            <p><strong className="text-ink">Organza:</strong> Dry clean only. Handle with care — the fabric is delicate.</p>
            <p><strong className="text-ink">Cotton silk:</strong> Can be hand washed gently. Hang dry in shade.</p>
            <p><strong className="text-ink">Georgette:</strong> Dry clean recommended. Iron on low heat.</p>
            <p><strong className="text-ink">Raw silk:</strong> Dry clean only. Store in breathable garment bag.</p>
            <p><strong className="text-ink">Velvet:</strong> Professional dry clean only. Store flat or draped over a padded hanger.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
