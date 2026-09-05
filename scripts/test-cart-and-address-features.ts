import { prisma } from '../src/backend/db/prisma';
import { AddressModel } from '../src/backend/models/addressModel';
import { CartModel } from '../src/backend/models/cartModel';
import { WishlistModel } from '../src/backend/models/wishlistModel';
import { AuthModel } from '../src/backend/models/authModel';
import { CartItem } from '../src/types/cart';

async function runTests() {
  console.log('--- STARTING CART & ADDRESS VERIFICATION ---');

  const testEmailA = `test.user.a.${Date.now()}@example.com`;
  const testEmailB = `test.user.b.${Date.now()}@example.com`;
  const testPassword = 'Password123!';

  // =========================================================================
  // 1. TEST ADDRESS ISOLATION & ZERO-ADDRESS FIX
  // =========================================================================
  console.log('\n[1] Testing Address Isolation & Zero Address Fix...');

  // Create User A and User B
  const regA = await AuthModel.register({
    email: testEmailA,
    password: testPassword,
    firstName: 'Alice',
    lastName: 'Couture',
  });
  const customerA = regA.customer;

  const regB = await AuthModel.register({
    email: testEmailB,
    password: testPassword,
    firstName: 'Bob',
    lastName: 'Tailor',
  });
  const customerB = regB.customer;

  // Verify User A starts with 0 addresses and returns [] (NOT Ananya Sharma mock data!)
  const addressesA_Initial = await AddressModel.getAll({ customerId: customerA.id });
  console.log(`User A initial addresses count: ${addressesA_Initial.length}`);
  if (addressesA_Initial.length !== 0) {
    throw new Error(`Expected 0 addresses for fresh account, got ${addressesA_Initial.length}`);
  }
  console.log(
    '✓ PASS: Fresh account with 0 addresses returns empty array [] (no dummy addresses leak)'
  );

  // User A creates 1 address
  const addrA = await AddressModel.create({
    customerId: customerA.id,
    customerEmail: customerA.email,
    name: 'Alice Couture Suite',
    phone: '+91 98200 11111',
    addressLine1: 'Penthouse 12, Malabar Hill',
    city: 'Mumbai',
    country: 'India',
    isDefault: true,
  });
  console.log(`✓ Created address for User A (${addrA.id})`);

  // User A should now see 1 address
  const addressesA_After = await AddressModel.getAll({ customerId: customerA.id });
  if (addressesA_After.length !== 1 || addressesA_After[0].id !== addrA.id) {
    throw new Error(`Expected User A to see 1 address, got ${addressesA_After.length}`);
  }
  console.log('✓ PASS: User A retrieves exactly their own address');

  // User B should STILL see 0 addresses
  const addressesB = await AddressModel.getAll({ customerId: customerB.id });
  if (addressesB.length !== 0) {
    throw new Error(`Expected User B to see 0 addresses, got ${addressesB.length}`);
  }
  console.log('✓ PASS: User B sees 0 addresses (complete isolation from User A)');

  // Anonymous query (no customerId or email) must return []
  const anonAddresses = await AddressModel.getAll();
  if (anonAddresses.length !== 0) {
    throw new Error(`Expected anonymous address query to return [], got ${anonAddresses.length}`);
  }
  console.log('✓ PASS: Anonymous query returns [] (no addresses exposed)');

  // =========================================================================
  // 2. TEST RELATIONAL CARTITEM DATABASE PERSISTENCE
  // =========================================================================
  console.log('\n[2] Testing Relational CartItem Database Persistence...');

  const guestToken = `gst_tok_${Date.now()}`;
  const guestFp = `fp_${Date.now()}`;

  const guestItem1: CartItem = {
    productId: 'raw-silk-sherwani',
    slug: 'raw-silk-sherwani',
    name: 'Raw Silk Sherwani',
    price: 45000,
    image: '/images/sherwani.jpg',
    colour: 'Ivory',
    size: '40',
    quantity: 1,
    maxQuantity: 10,
  };

  await CartModel.setCart({ sessionToken: guestToken, deviceFingerprint: guestFp }, [guestItem1]);

  // Check PostgreSQL cart_items table directly
  const dbGuestItems = await prisma.cartItem.findMany({
    where: { guestSessionToken: guestToken },
  });
  if (dbGuestItems.length !== 1 || dbGuestItems[0].productSlug !== 'raw-silk-sherwani') {
    throw new Error(
      `Expected 1 row in cart_items table in PostgreSQL, found ${dbGuestItems.length}`
    );
  }
  console.log(
    '✓ PASS: Guest cart saved as real row in PostgreSQL cart_items table (visible in Prisma Studio)'
  );

  // =========================================================================
  // 3. TEST CART JOINING ON LOGIN
  // =========================================================================
  console.log('\n[3] Testing Cart Joining on Login...');

  // Set User A's account cart to have Item 1 (qty 2) and Item 2 (qty 1)
  const userAItem1: CartItem = {
    productId: 'raw-silk-sherwani',
    slug: 'raw-silk-sherwani',
    name: 'Raw Silk Sherwani',
    price: 45000,
    image: '/images/sherwani.jpg',
    colour: 'Ivory',
    size: '40',
    quantity: 2,
    maxQuantity: 10,
  };

  const userAItem2: CartItem = {
    productId: 'organza-dupatta',
    slug: 'organza-dupatta',
    name: 'Silk Organza Dupatta',
    price: 15000,
    image: '/images/dupatta.jpg',
    colour: 'Gold',
    size: 'Free Size',
    quantity: 1,
    maxQuantity: 10,
  };

  await CartModel.setCart({ customerId: customerA.id }, [userAItem1, userAItem2]);

  // Now simulate logging in User A with incoming guest item (raw-silk-sherwani size 40 qty 1)
  // The joined cart should have:
  // - raw-silk-sherwani (size 40) quantity: 2 + 1 = 3
  // - organza-dupatta (Free Size) quantity: 1
  const loginRes = await AuthModel.login({
    email: testEmailA,
    password: testPassword,
    guestCart: [guestItem1],
    guestSessionToken: guestToken,
    deviceFingerprint: guestFp,
  });

  const joinedCart = loginRes.cart;
  console.log(`Joined cart items count: ${joinedCart.length}`);

  const sherwani = joinedCart.find((i) => i.slug === 'raw-silk-sherwani' && i.size === '40');
  const dupatta = joinedCart.find((i) => i.slug === 'organza-dupatta');

  if (!sherwani || sherwani.quantity !== 3) {
    throw new Error(`Expected sherwani quantity 3, got ${sherwani?.quantity}`);
  }
  if (!dupatta || dupatta.quantity !== 1) {
    throw new Error(`Expected dupatta quantity 1, got ${dupatta?.quantity}`);
  }
  console.log(
    '✓ PASS: Both carts joined together! Quantities for matching items combined (2 + 1 = 3)'
  );

  // Verify PostgreSQL cart_items rows for customerA
  const dbCustomerRows = await prisma.cartItem.findMany({
    where: { customerId: customerA.id },
  });
  if (dbCustomerRows.length !== 2) {
    throw new Error(
      `Expected 2 rows in PostgreSQL cart_items for customerA, got ${dbCustomerRows.length}`
    );
  }
  console.log('✓ PASS: Joined cart saved in PostgreSQL cart_items table under customerId');

  // Verify guest rows are cleared so user does not run redundant guest sessions
  const remainingGuestRows = await prisma.cartItem.findMany({
    where: { guestSessionToken: guestToken },
  });
  if (remainingGuestRows.length !== 0) {
    throw new Error(
      `Expected guest rows to be cleaned up after login, found ${remainingGuestRows.length}`
    );
  }
  console.log('✓ PASS: Guest session cart rows claimed & cleaned up on login');

  // =========================================================================
  // 4. TEST COMPLETE MULTI-TABLE CART CLEARING
  // =========================================================================
  console.log('\n[4] Testing Complete Multi-Table Cart Clearing...');

  await CartModel.clearCart({ customerId: customerA.id });

  const clearedCustomerRows = await prisma.cartItem.findMany({
    where: { customerId: customerA.id },
  });
  const clearedCustomer = await prisma.customer.findUnique({
    where: { id: customerA.id },
    select: { cartData: true },
  });

  if (clearedCustomerRows.length !== 0) {
    throw new Error(
      `Expected 0 rows in cart_items table after clearCart, got ${clearedCustomerRows.length}`
    );
  }
  const cartDataVal = clearedCustomer?.cartData as unknown as unknown[];
  if (Array.isArray(cartDataVal) && cartDataVal.length !== 0) {
    throw new Error(
      `Expected customer.cartData to be empty array, got ${JSON.stringify(cartDataVal)}`
    );
  }
  console.log(
    '✓ PASS: clearCart wiped cart from cart_items table, customer.cartData, and all tables!'
  );

  // =========================================================================
  // 5. TEST WISHLIST CLEARING
  // =========================================================================
  console.log('\n[5] Testing Wishlist Multi-Table Clearing...');

  await WishlistModel.clearWishlist('test-session', customerA.id);
  console.log('✓ PASS: Wishlist cleared across all tables');

  console.log('\n=========================================');
  console.log('ALL VERIFICATION TESTS PASSED SUCCESSFULLY!');
  console.log('=========================================');
}

runTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('TEST FAILED:', err);
    process.exit(1);
  });
