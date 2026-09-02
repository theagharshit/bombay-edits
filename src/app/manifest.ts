import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'The Bombay Edit — Luxury Indian Couture & Handcrafted Ready-to-Wear',
    short_name: 'The Bombay Edit',
    description: 'Bespoke hand-embroidered kurta sets, lehengas, and contemporary silhouettes crafted by master artisans.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F6EDE6',
    theme_color: '#2A1C15',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
