import { CartItem, WishlistItem } from '@/types/cart';

/**
 * Cleanly merges two arrays of CartItem.
 * If the same product and size/colour exists in both carts, their quantities are joined
 * (capped at maxQuantity). All other items are unified.
 */
export function mergeCarts(
  existingItems: CartItem[] = [],
  incomingItems: CartItem[] = []
): CartItem[] {
  const merged: CartItem[] = [];

  const allItems = [...existingItems, ...incomingItems].filter(
    (i) => i && (i.productId || i.slug) && i.quantity > 0
  );

  for (const item of allItems) {
    const existingIndex = merged.findIndex((m) =>
      Boolean(
        ((m.productId && item.productId && m.productId === item.productId) ||
          (m.slug && item.slug && m.slug === item.slug) ||
          (m.productId && item.slug && m.productId === item.slug) ||
          (m.slug && item.productId && m.slug === item.productId)) &&
        (m.size || 'standard').toLowerCase().trim() ===
          (item.size || 'standard').toLowerCase().trim()
      )
    );

    if (existingIndex >= 0) {
      const existing = merged[existingIndex];
      const max = item.maxQuantity || existing.maxQuantity || 10;
      merged[existingIndex] = {
        ...existing,
        productId: existing.productId || item.productId,
        slug: existing.slug || item.slug,
        name: existing.name || item.name,
        price: existing.price || item.price,
        image: existing.image || item.image,
        colour: existing.colour || item.colour,
        quantity: Math.min(existing.quantity + item.quantity, max),
      };
    } else {
      merged.push({ ...item });
    }
  }

  return merged;
}

/**
 * Cleanly merges two arrays of WishlistItem, eliminating duplicates by productId.
 */
export function mergeWishlists(
  existingItems: WishlistItem[] = [],
  incomingItems: WishlistItem[] = []
): WishlistItem[] {
  const map = new Map<string, WishlistItem>();

  for (const item of existingItems) {
    if (!item || !item.productId) continue;
    map.set(item.productId, { ...item });
  }

  for (const incoming of incomingItems) {
    if (!incoming || !incoming.productId) continue;
    if (!map.has(incoming.productId)) {
      map.set(incoming.productId, { ...incoming });
    }
  }

  return Array.from(map.values());
}
