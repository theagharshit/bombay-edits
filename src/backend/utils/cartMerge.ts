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
  const map = new Map<string, CartItem>();

  const makeKey = (item: CartItem) =>
    `${item.productId}__${item.size || 'standard'}__${(item.colour || '').toLowerCase().trim()}`;

  for (const item of existingItems) {
    if (!item || !item.productId) continue;
    map.set(makeKey(item), { ...item });
  }

  for (const incoming of incomingItems) {
    if (!incoming || !incoming.productId) continue;
    const key = makeKey(incoming);
    const existing = map.get(key);

    if (existing) {
      const max = incoming.maxQuantity || existing.maxQuantity || 10;
      const combinedQuantity = Math.min(existing.quantity + incoming.quantity, max);
      map.set(key, {
        ...existing,
        quantity: combinedQuantity,
      });
    } else {
      map.set(key, { ...incoming });
    }
  }

  return Array.from(map.values());
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
