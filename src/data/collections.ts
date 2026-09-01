import { CategoryInfo, CollectionInfo, OccasionInfo } from '@/types/product';
import { generatePlaceholderImage } from '@/lib/utils';

export const categories: CategoryInfo[] = [
  {
    slug: 'kurta-sets',
    name: 'Kurta sets',
    description: 'Hand-embroidered kurta sets in silk, cotton and organza. Three-piece sets crafted for everyday luxury and festive occasions.',
    image: generatePlaceholderImage(800, 1000, 'kurta-sets'),
  },
  {
    slug: 'co-ord-sets',
    name: 'Co-ord sets',
    description: 'Matched separates in contemporary silhouettes. Designed to be worn together or styled individually with your existing wardrobe.',
    image: generatePlaceholderImage(800, 1000, 'co-ord-sets'),
  },
  {
    slug: 'embroidered-shirts',
    name: 'Embroidered shirts',
    description: 'Indian craft meets the modern shirt. Zardozi, mirror work and cutwork embellishments on relaxed, wearable silhouettes.',
    image: generatePlaceholderImage(800, 1000, 'embroidered-shirts'),
  },
  {
    slug: 'shararas',
    name: 'Shararas',
    description: 'Wide-flared sharara pants paired with embroidered kurtas and dupattas. Movement, colour and celebration.',
    image: generatePlaceholderImage(800, 1000, 'shararas'),
  },
  {
    slug: 'indo-western',
    name: 'Indo-western',
    description: 'Indian techniques on contemporary silhouettes. Capes, jacket sets, dhoti pants and modern drapes.',
    image: generatePlaceholderImage(800, 1000, 'indo-western'),
  },
  {
    slug: 'occasionwear',
    name: 'Occasionwear',
    description: 'Statement pieces for weddings, receptions and celebrations. Made to order with custom sizing available.',
    image: generatePlaceholderImage(800, 1000, 'occasionwear'),
  },
];

export const collections: CollectionInfo[] = [
  {
    slug: 'signature',
    name: 'The signature edit',
    description: 'Our most distinctive pieces. Signature silhouettes with the finest embroidery and fabrics we source.',
    image: generatePlaceholderImage(800, 1000, 'signature'),
    heroImage: generatePlaceholderImage(1600, 900, 'signature-hero'),
  },
  {
    slug: 'monsoon-edit',
    name: 'The monsoon edit',
    description: 'Lightweight fabrics and easy silhouettes made for the rain-washed days of the season.',
    image: generatePlaceholderImage(800, 1000, 'monsoon'),
    heroImage: generatePlaceholderImage(1600, 900, 'monsoon-hero'),
  },
  {
    slug: 'festive-edit',
    name: 'The festive edit',
    description: 'Rich fabrics, hand embroidery and considered silhouettes for Dashain, Tihar and every celebration in between.',
    image: generatePlaceholderImage(800, 1000, 'festive'),
    heroImage: generatePlaceholderImage(1600, 900, 'festive-hero'),
  },
  {
    slug: 'bridal-edit',
    name: 'The bridal edit',
    description: 'Heirloom pieces for the bride and her closest circle. Made to order with custom embroidery and fit.',
    image: generatePlaceholderImage(800, 1000, 'bridal'),
    heroImage: generatePlaceholderImage(1600, 900, 'bridal-hero'),
  },
  {
    slug: 'everyday-luxe',
    name: 'Everyday luxe',
    description: 'Pieces that bring craft into daily wear. Comfortable, considered and quietly beautiful.',
    image: generatePlaceholderImage(800, 1000, 'everyday'),
    heroImage: generatePlaceholderImage(1600, 900, 'everyday-hero'),
  },
];

export const occasions: OccasionInfo[] = [
  {
    slug: 'wedding-guest',
    name: 'Wedding guest',
    description: 'Stand out without outshining the bride. Rich fabrics and fine embroidery for wedding celebrations.',
    image: generatePlaceholderImage(800, 1000, 'wedding-guest'),
  },
  {
    slug: 'mehendi-haldi',
    name: 'Mehendi and haldi',
    description: 'Colour, movement and joy. Lighter pieces in vibrant tones for the ceremonies that set the mood.',
    image: generatePlaceholderImage(800, 1000, 'mehendi-haldi'),
  },
  {
    slug: 'festive',
    name: 'Festive',
    description: 'For Dashain, Tihar, Diwali and every occasion that calls for something special.',
    image: generatePlaceholderImage(800, 1000, 'festive'),
  },
  {
    slug: 'everyday',
    name: 'The everyday edit',
    description: 'Indian craft for the everyday. Comfortable silhouettes, breathable fabrics, wearable embellishment.',
    image: generatePlaceholderImage(800, 1000, 'everyday'),
  },
  {
    slug: 'brunch-day',
    name: 'Brunch and day events',
    description: 'Easy, polished pieces for daytime occasions. From brunch to puja to an afternoon celebration.',
    image: generatePlaceholderImage(800, 1000, 'brunch'),
  },
];

export function getCategoryBySlug(slug: string): CategoryInfo | undefined {
  return categories.find(c => c.slug === slug);
}

export function getCollectionBySlug(slug: string): CollectionInfo | undefined {
  return collections.find(c => c.slug === slug);
}

export function getOccasionBySlug(slug: string): OccasionInfo | undefined {
  return occasions.find(o => o.slug === slug);
}
