import { GuestSessionModel, GUEST_SESSION_TTL_MS } from '../src/backend/models/guestSessionModel';
import { prisma } from '../src/backend/db/prisma';
import { Prisma } from '@prisma/client';
import { CartItem, WishlistItem } from '../src/types/cart';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`  ✓ PASS: ${message}`);
}

async function runGuestSessionTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING PERSISTENT GUEST SESSION & CLEANUP TESTS');
  console.log('====================================================\n');

  console.log('--- Suite 1: Guest Session Creation & 30-Day Expiration Window ---');
  const { session: newSession, isNew } = await GuestSessionModel.getOrCreateSession();
  assert(isNew === true, 'New guest session flagged as isNew = true');
  assert(typeof newSession.sessionToken === 'string', 'Session token is string');
  assert(newSession.sessionToken.startsWith('gst_'), 'Session token format starts with gst_');

  const expectedLifetimeMs = newSession.expiresAt.getTime() - newSession.lastActiveAt.getTime();
  const approx30Days = Math.abs(expectedLifetimeMs - GUEST_SESSION_TTL_MS) < 5000;
  assert(approx30Days, 'Session expiration correctly set to 30 days from activity');

  // Verify in Prisma DB
  const dbRecord = await prisma.guestSession.findUnique({
    where: { sessionToken: newSession.sessionToken },
  });
  assert(dbRecord !== null, 'Session persisted immediately to guest_sessions PostgreSQL table');

  console.log('\n--- Suite 2: Cart Persistence in Database ---');
  const sampleCartItem: CartItem = {
    productId: 'ks-001',
    slug: 'chandni-chanderi-set',
    name: 'Chandni Chanderi set',
    price: 14500,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8',
    colour: 'Ivory',
    size: 'M',
    quantity: 2,
    maxQuantity: 5,
  };

  const updatedSession = await GuestSessionModel.updateCart(newSession.sessionToken, [
    sampleCartItem,
  ]);
  assert(updatedSession.cart.length === 1, 'Cart items updated in memory / model return');
  assert(updatedSession.cart[0].productId === 'ks-001', 'Item productId matches');
  assert(updatedSession.cart[0].quantity === 2, 'Item quantity matches');
  assert(updatedSession.cart[0].size === 'M', 'Item size matches');

  // Direct database check
  const dbCartRecord = await prisma.guestSession.findUnique({
    where: { sessionToken: newSession.sessionToken },
  });
  const dbCart = dbCartRecord?.cartData as unknown as CartItem[];
  assert(
    Array.isArray(dbCart) && dbCart.length === 1,
    'Cart data stored in PostgreSQL json column'
  );
  assert(dbCart[0].productId === 'ks-001', 'PostgreSQL cart item matches');

  console.log('\n--- Suite 3: Guest Refresh & Session Restoration ---');
  // Simulate returning guest or refreshing page using the same session token
  const { session: restoredSession, isNew: restoredIsNew } =
    await GuestSessionModel.getOrCreateSession(newSession.sessionToken);

  assert(restoredIsNew === false, 'Returning guest recognized as existing session (isNew = false)');
  assert(restoredSession.sessionToken === newSession.sessionToken, 'Session tokens match');
  assert(restoredSession.cart.length === 1, 'Cart items successfully restored on refresh');
  assert(restoredSession.cart[0].slug === 'chandni-chanderi-set', 'Restored cart contents intact');

  console.log('\n--- Suite 4: Wishlist Persistence in Database ---');
  const sampleWishlistItem: WishlistItem = {
    productId: 'ow-004',
    addedAt: new Date().toISOString(),
  };

  const sessionWithWishlist = await GuestSessionModel.updateWishlist(newSession.sessionToken, [
    sampleWishlistItem,
  ]);
  assert(sessionWithWishlist.wishlist.length === 1, 'Wishlist updated in guest session');
  assert(sessionWithWishlist.wishlist[0].productId === 'ow-004', 'Wishlist productId matches');

  // Direct database check
  const dbWishlistRecord = await prisma.guestSession.findUnique({
    where: { sessionToken: newSession.sessionToken },
  });
  const dbWishlist = dbWishlistRecord?.wishlistData as unknown as WishlistItem[];
  assert(
    Array.isArray(dbWishlist) && dbWishlist.length === 1,
    'Wishlist stored in PostgreSQL json column'
  );

  console.log('\n--- Suite 5: 30-Day Inactive Session Cleanup Job ---');
  // Create an expired dummy session (simulating 31 days of inactivity)
  const expiredToken = 'gst_test_expired_session_31_days';
  const thirtyOneDaysAgo = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);

  await prisma.guestSession.upsert({
    where: { sessionToken: expiredToken },
    create: {
      sessionToken: expiredToken,
      cartData: [{ productId: 'old-item', quantity: 1 }] as Prisma.InputJsonValue,
      wishlistData: [],
      lastActiveAt: thirtyOneDaysAgo,
      expiresAt: thirtyOneDaysAgo,
    },
    update: {
      lastActiveAt: thirtyOneDaysAgo,
      expiresAt: thirtyOneDaysAgo,
    },
  });

  const expiredExistsBefore = await prisma.guestSession.findUnique({
    where: { sessionToken: expiredToken },
  });
  assert(expiredExistsBefore !== null, 'Expired session successfully seeded for test');

  // Run cleanup routine
  const { deletedCount } = await GuestSessionModel.cleanupExpiredSessions();
  assert(deletedCount >= 1, `Cleanup job removed expired session(s) (count: ${deletedCount})`);

  // Verify expired session was removed
  const expiredExistsAfter = await prisma.guestSession.findUnique({
    where: { sessionToken: expiredToken },
  });
  assert(expiredExistsAfter === null, 'Expired session was purged from PostgreSQL');

  // Verify active session was preserved
  const activeStillExists = await prisma.guestSession.findUnique({
    where: { sessionToken: newSession.sessionToken },
  });
  assert(
    activeStillExists !== null,
    'Active guest session (< 30 days) is securely preserved in database'
  );

  // Cleanup active test session
  await prisma.guestSession.delete({
    where: { sessionToken: newSession.sessionToken },
  });

  console.log('\n====================================================');
  console.log('🎉 ALL PERSISTENT GUEST SESSION TESTS PASSED!');
  console.log('====================================================\n');
}

runGuestSessionTests()
  .catch((err) => {
    console.error('Fatal test error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
