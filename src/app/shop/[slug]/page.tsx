import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { products, getProductBySlug, getProductsByCategory } from '@/data/products';
import { ProductDetailContent } from '@/components/product/ProductDetailContent';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: 'Product not found' };
  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: {
      title: `${product.name} | The Bombay Edit`,
      description: product.shortDescription,
      type: 'website',
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const categoryRelated = getProductsByCategory(product.category).filter((p) => p.id !== product.id);
  const otherRelated = products.filter((p) => p.id !== product.id && p.category !== product.category);
  const related = [...categoryRelated, ...otherRelated].slice(0, 8);

  return (
    <>
      <ProductDetailContent product={product} relatedProducts={related} />
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            description: product.shortDescription,
            image: product.images[0]?.src,
            brand: { '@type': 'Brand', name: 'The Bombay Edit' },
            offers: {
              '@type': 'Offer',
              price: product.price,
              priceCurrency: 'NPR',
              availability: product.isMadeToOrder
                ? 'https://schema.org/PreOrder'
                : 'https://schema.org/InStock',
            },
            material: product.fabric,
          }),
        }}
      />
    </>
  );
}
