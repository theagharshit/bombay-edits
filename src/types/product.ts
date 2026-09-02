export interface ProductImage {
  src: string;
  alt: string;
  type: 'front' | 'back' | 'detail' | 'lifestyle';
}

export interface ProductColour {
  name: string;
  hex: string;
}

export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';

export type Fabric =
  | 'Chanderi silk'
  | 'Organza'
  | 'Tissue'
  | 'Cotton silk'
  | 'Georgette'
  | 'Raw silk'
  | 'Linen'
  | 'Velvet'
  | 'Chiffon'
  | 'Mashru silk';

export type EmbroideryType =
  | 'Hand embroidery'
  | 'Zardozi'
  | 'Thread work'
  | 'Sequin work'
  | 'Mirror work'
  | 'Cutwork'
  | 'Chikankari'
  | 'Aari work'
  | 'Gota patti';

export type Fit = 'Relaxed' | 'Straight' | 'A-line' | 'Flared' | 'Fitted';

export type Category =
  | 'kurta-sets'
  | 'co-ord-sets'
  | 'embroidered-shirts'
  | 'shararas'
  | 'indo-western'
  | 'occasionwear';

export type Occasion = 'wedding-guest' | 'mehendi-haldi' | 'festive' | 'everyday' | 'brunch-day';

export type Collection =
  'signature' | 'monsoon-edit' | 'festive-edit' | 'bridal-edit' | 'everyday-luxe';

export interface Product {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  category: Category;
  collections: Collection[];
  occasions: Occasion[];
  price: number;
  compareAtPrice?: number;
  currency: 'NPR';
  images: ProductImage[];
  colour: ProductColour;
  availableSizes: Size[];
  fabric: Fabric;
  embroideryType: EmbroideryType;
  work: string;
  components: string[];
  care: string[];
  fit: Fit;
  modelHeightAndSize: string;
  deliveryEstimate: string;
  isNewArrival: boolean;
  isBestseller: boolean;
  isMadeToOrder: boolean;
  stockBySize: Record<Size, number>;
}

export interface CategoryInfo {
  slug: Category;
  name: string;
  description: string;
  image: string;
}

export interface CollectionInfo {
  slug: Collection;
  name: string;
  description: string;
  image: string;
  heroImage: string;
}

export interface OccasionInfo {
  slug: Occasion;
  name: string;
  description: string;
  image: string;
}
