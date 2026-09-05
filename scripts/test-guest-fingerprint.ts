import { prisma } from '../src/backend/db/prisma';
import { GuestSessionModel } from '../src/backend/models/guestSessionModel';
import { CartItem } from '../src/types/cart';

async function main() {
  console.log('--- Starting Device Fingerprinting & Deduplication Tests ---');

  const testFingerprint = `dfp_test_device_${Date.now()}`;
  console.log(`Using test fingerprint: ${testFingerprint}`);

  // Test 1: First request with fingerprint creates 1 session
  console.log('\n[Test 1] Creating initial session with deviceFingerprint...');
  const res1 = await GuestSessionModel.getOrCreateSession({
    deviceFingerprint: testFingerprint,
  });

  if (!res1.isNew) {
    throw new Error('Expected first session to be marked isNew=true');
  }
  if (res1.session.deviceFingerprint !== testFingerprint) {
    throw new Error(
      `Expected fingerprint ${testFingerprint}, got ${res1.session.deviceFingerprint}`
    );
  }
  const firstSessionId = res1.session.id;
  const firstToken = res1.session.sessionToken;
  const initialExpiry = res1.session.expiresAt.getTime();
  console.log(`✓ Created session id: ${firstSessionId}, token: ${firstToken}`);

  // Test 2: Second request with ONLY fingerprint (no cookie / token) retrieves the same session
  console.log(
    '\n[Test 2] Second request with ONLY deviceFingerprint (simulating returning user or new tab)...'
  );
  // Wait 10ms so timestamps differ
  await new Promise((r) => setTimeout(r, 50));

  const res2 = await GuestSessionModel.getOrCreateSession({
    deviceFingerprint: testFingerprint,
  });

  if (res2.isNew) {
    throw new Error('Expected returning session to be marked isNew=false');
  }
  if (res2.session.id !== firstSessionId) {
    throw new Error(
      `Deduplication failed! Expected session id ${firstSessionId}, got ${res2.session.id}`
    );
  }
  if (res2.session.sessionToken !== firstToken) {
    throw new Error(`Expected token ${firstToken}, got ${res2.session.sessionToken}`);
  }
  if (res2.session.expiresAt.getTime() < initialExpiry) {
    throw new Error('Expected expiry date to be refreshed/slid forward');
  }
  console.log(`✓ Successfully retrieved SAME session without token! Deduplicated.`);
  console.log(`✓ Expiry date slid forward: ${res2.session.expiresAt.toISOString()}`);

  // Test 3: Update cart & verify it's persisted under this session
  console.log('\n[Test 3] Updating cart for session...');
  const sampleCartItem: CartItem = {
    productId: 'test-prod-1',
    slug: 'test-slug-1',
    name: 'Test Regal Anarkali',
    price: 32000,
    image: '/images/products/test.jpg',
    size: 'M',
    colour: 'Crimson Red',
    quantity: 2,
    maxQuantity: 5,
  };

  const updatedSession = await GuestSessionModel.updateCart(
    firstToken,
    [sampleCartItem],
    testFingerprint
  );
  if (updatedSession.cart.length !== 1 || updatedSession.cart[0].productId !== 'test-prod-1') {
    throw new Error('Failed to update cart on session');
  }
  console.log(`✓ Cart updated successfully with 1 item`);

  // Test 4: Verify querying again with fingerprint retrieves the cart!
  console.log('\n[Test 4] Querying with fingerprint retrieves updated cart...');
  const res3 = await GuestSessionModel.getOrCreateSession({
    deviceFingerprint: testFingerprint,
  });
  if (res3.session.cart.length !== 1 || res3.session.cart[0].productId !== 'test-prod-1') {
    throw new Error('Cart not preserved across fingerprint sessions');
  }
  console.log(
    `✓ Cart preserved! Item: ${res3.session.cart[0].name} (Qty: ${res3.session.cart[0].quantity})`
  );

  // Test 5: Concurrent parallel requests with the same fingerprint (simulating concurrent page loads)
  console.log('\n[Test 5] Simulating 5 concurrent parallel requests with a new fingerprint...');
  const concurrentFp = `dfp_concurrent_${Date.now()}`;
  const parallelPromises = Array.from({ length: 5 }, () =>
    GuestSessionModel.getOrCreateSession({
      deviceFingerprint: concurrentFp,
    })
  );

  const parallelResults = await Promise.all(parallelPromises);
  const sessionIds = new Set(parallelResults.map((r) => r.session.id));
  const sessionTokens = new Set(parallelResults.map((r) => r.session.sessionToken));

  console.log(
    `Results generated ${sessionIds.size} unique session ID(s) and ${sessionTokens.size} unique token(s).`
  );
  if (sessionIds.size !== 1 || sessionTokens.size !== 1) {
    throw new Error(
      `Race condition detected! Expected 1 session, but got ${sessionIds.size} sessions.`
    );
  }

  // Double check DB count for this fingerprint
  if (prisma.guestSession) {
    const dbCount = await prisma.guestSession.count({
      where: { deviceFingerprint: concurrentFp },
    });
    if (dbCount !== 1) {
      throw new Error(`Expected exactly 1 DB row for concurrent fingerprint, found ${dbCount}`);
    }
    console.log(`✓ Verified exactly 1 row in PostgreSQL guest_sessions table!`);

    // Clean up test rows
    await prisma.guestSession.deleteMany({
      where: {
        deviceFingerprint: {
          in: [testFingerprint, concurrentFp],
        },
      },
    });
    console.log('✓ Cleaned up test database records.');
  }

  console.log('\n======================================================');
  console.log('🎉 ALL DEVICE FINGERPRINTING & DEDUPLICATION TESTS PASSED!');
  console.log('======================================================');
}

main()
  .catch((err) => {
    console.error('❌ Test failed with error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
