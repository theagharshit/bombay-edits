import { MetadataRoute } from 'next';
import { products } from '@/data/products';
import { categories, collections } from '@/data/collections';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://thebombayedit.com';

  const staticPages = [
    '', '/shop', '/new-arrivals', '/bestsellers', '/collections',
    '/the-craft', '/editorial', '/size-guide', '/contact', '/faq',
    '/wishlist', '/account', '/cart', '/checkout',
    '/policies/shipping', '/policies/returns', '/policies/fabric-care',
    '/policies/privacy', '/policies/terms',
  ].map(path => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : path === '/shop' ? 0.9 : 0.7,
  }));

  const productPages = products.map(p => ({
    url: `${baseUrl}/shop/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const categoryPages = categories.map(c => ({
    url: `${baseUrl}/category/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const collectionPages = collections.map(c => ({
    url: `${baseUrl}/collections/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...productPages, ...categoryPages, ...collectionPages];
}
