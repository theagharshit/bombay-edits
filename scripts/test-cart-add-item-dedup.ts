import { mergeCarts } from '../src/backend/utils/cartMerge';
import { CartModel } from '../src/backend/models/cartModel';
import { prisma } from '../src/backend/db/prisma';
import { CartItem } from '../src/types/cart';

async function testDeduplicationAndQuantityIncrease() {
  console.log('--- TESTING CART DEDUPLICATION & QUANTITY MERGING ---');

  const item1: CartItem = {
    productId: 'prod-festive-kurta-123',
    slug: 'festive-kurta',
    name: 'Festive Kurta',
    price: 2999,
    image: '/images/kurta.jpg',
    colour: 'Crimson',
    size: 'M',
    quantity: 1,
    maxQuantity: 10,
  };

  // Same product added again by slug (e.g. from product card quick add)
  const item2Same: CartItem = {
    productId: 'festive-kurta',
    slug: 'festive-kurta',
    name: 'Festive Kurta',
    price: 2999,
    image: '/images/kurta.jpg',
    colour: 'Crimson',
    size: 'M',
    quantity: 2,
    maxQuantity: 10,
  };

  // Same product added with different size
  const item3DiffSize: CartItem = {
    productId: 'prod-festive-kurta-123',
    slug: 'festive-kurta',
    name: 'Festive Kurta',
    price: 2999,
    image: '/images/kurta.jpg',
    colour: 'Crimson',
    size: 'L',
    quantity: 1,
    maxQuantity: 10,
  };

  // 1. Test mergeCarts
  const merged = mergeCarts([item1], [item2Same, item3DiffSize]);
  console.log('Merged items count:', merged.length);

  const mItem = merged.find(
    (i) => (i.slug === 'festive-kurta' || i.productId === 'festive-kurta') && i.size === 'M'
  );
  const lItem = merged.find(
    (i) => (i.slug === 'festive-kurta' || i.productId === 'festive-kurta') && i.size === 'L'
  );

  if (!mItem || mItem.quantity !== 3) {
    throw new Error(`Expected size M quantity 3 (1 + 2), got ${mItem?.quantity}`);
  }
  console.log(
    '✓ PASS: Adding duplicate product correctly merged and increased quantity (1 + 2 = 3)'
  );

  if (!lItem || lItem.quantity !== 1) {
    throw new Error(`Expected size L to be distinct with quantity 1, got ${lItem?.quantity}`);
  }
  console.log('✓ PASS: Different sizes for same product remain separate line items');

  // 2. Test database persistence of deduplicated items
  const testSessionToken = `test_dedup_${Date.now()}`;
  await CartModel.setCart({ sessionToken: testSessionToken }, [item1, item2Same, item3DiffSize]);

  const dbRows = await prisma.cartItem.findMany({
    where: { guestSessionToken: testSessionToken },
  });

  if (dbRows.length !== 2) {
    throw new Error(
      `Expected exactly 2 rows in PostgreSQL cart_items table, found ${dbRows.length}`
    );
  }

  const dbMRow = dbRows.find((r) => r.size === 'M');
  if (!dbMRow || dbMRow.quantity !== 3) {
    throw new Error(`Expected DB row for size M to have quantity 3, got ${dbMRow?.quantity}`);
  }
  console.log('✓ PASS: PostgreSQL cart_items table saved deduplicated rows with merged quantity 3');

  // Cleanup
  await CartModel.clearCart({ sessionToken: testSessionToken });
  console.log('✓ PASS: Cleanup completed');

  console.log('\n=============================================');
  console.log('ALL DEDUPLICATION TESTS PASSED SUCCESSFULLY!');
  console.log('=============================================');
}

testDeduplicationAndQuantityIncrease()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('TEST FAILED:', err);
    process.exit(1);
  });
