import { hashPassword, verifyPassword, signJwt, verifyJwt } from '../src/backend/utils/jwt';
import { AuthModel } from '../src/backend/models/authModel';
import { OrderModel } from '../src/backend/models/orderModel';
import { prisma } from '../src/backend/db/prisma';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING AUTH & GUEST CHECKOUT FRAMEWORK TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      throw new Error(`Assertion failed: ${testName}`);
    }
  }

  // TEST SUITE 1: Password Hashing & Verification
  console.log('--- Suite 1: Web Crypto Password Hashing ---');
  const plainPassword = 'CoutureSecretPass2026!';
  const hashedPassword = await hashPassword(plainPassword);
  assert(hashedPassword.includes(':'), 'Hash contains salt:hash delimiter');
  assert(
    await verifyPassword(plainPassword, hashedPassword),
    'Password correctly verifies with valid input'
  );
  assert(
    !(await verifyPassword('WrongPassword', hashedPassword)),
    'Password fails with invalid input'
  );

  // TEST SUITE 2: Standards-compliant JWT Signing & Verification
  console.log('\n--- Suite 2: JWT Signing & Verification ---');
  const payload = {
    customerId: 'cust_test_999',
    email: 'madame.anya@test.com',
    role: 'customer',
    isGuest: false,
  };
  const token = await signJwt(payload, 3600);
  assert(
    typeof token === 'string' && token.split('.').length === 3,
    'JWT has 3 parts (header.payload.signature)'
  );

  const verified = await verifyJwt<{
    customerId: string;
    email: string;
    role: string;
    isGuest: boolean;
  }>(token);
  assert(verified !== null && verified.email === payload.email, 'JWT payload verified correctly');
  assert(verified?.customerId === payload.customerId, 'Customer ID matches in JWT payload');

  const tampered = token.slice(0, -4) + 'abcd';
  assert((await verifyJwt(tampered)) === null, 'Tampered JWT correctly rejected');

  // TEST SUITE 3: Friction-Free Guest Checkout (No Account Needed)
  console.log('\n--- Suite 3: Friction-Free Guest Checkout ---');
  const guestEmail = `guest_${Date.now()}@bombayedits.test`;
  const guestOrder = await OrderModel.createOrder({
    items: [
      {
        productId: 'prod_chandni_1',
        slug: 'chandni-chanderi-set',
        name: 'Chandni Chanderi Kurta Set',
        price: 18500,
        quantity: 1,
        size: 'M',
        colour: 'Ivory',
      },
    ],
    customer: {
      email: guestEmail,
      firstName: 'Priya',
      lastName: 'Kapoor',
      phone: '+91 98200 12345',
      address: 'Suite 402, Sterling Tower, Worli',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400018',
      country: 'India',
    },
    shippingZone: 'mumbai',
    paymentMethod: 'upi',
  });

  assert(Boolean(guestOrder.orderNumber), 'Guest order placed successfully without an account');
  assert(
    guestOrder.customer.email.toLowerCase() === guestEmail.toLowerCase(),
    'Order has correct guest contact email'
  );
  const dbCustomerBeforeReg = await prisma.customer.findUnique({ where: { email: guestEmail } });
  assert(
    dbCustomerBeforeReg?.isGuest === true,
    'Customer created as guest without password (isGuest=true)'
  );

  // TEST SUITE 4: Registration & Automatic Linking of Past Guest Orders
  console.log('\n--- Suite 4: Member Registration & Guest Order Linking ---');
  const regResult = await AuthModel.register({
    email: guestEmail,
    password: 'PriyaSecurePass2026!',
    firstName: 'Priya',
    lastName: 'Kapoor',
    phone: '+91 98200 12345',
  });

  assert(Boolean(regResult.token), 'Registration returns valid JWT auth token');
  assert(regResult.customer.email === guestEmail, 'Customer record created with correct email');
  assert(
    regResult.customer.isGuest === false,
    'Customer marked as authenticated member (isGuest=false)'
  );

  // Verify that the guest order placed earlier is now linked to this customer's ID in the DB
  const linkedOrder = await prisma.order.findUnique({
    where: { orderNumber: guestOrder.orderNumber },
  });
  assert(
    linkedOrder?.customerId === regResult.customer.id,
    'Past guest order automatically linked to customer profile in database'
  );

  // TEST SUITE 5: Member Login & Invalid Credential Protection
  console.log('\n--- Suite 5: Member Login & Credential Security ---');
  const loginResult = await AuthModel.login({
    email: guestEmail,
    password: 'PriyaSecurePass2026!',
  });
  assert(Boolean(loginResult.token), 'Valid credentials log in successfully and return JWT');
  assert(
    loginResult.customer.id === regResult.customer.id,
    'Logged in customer matches registered customer'
  );

  let loginFailed = false;
  try {
    await AuthModel.login({
      email: guestEmail,
      password: 'WrongPassword!',
    });
  } catch {
    loginFailed = true;
  }
  assert(loginFailed, 'Incorrect password correctly rejected with error');

  // TEST SUITE 6: Token Session Hydration (getCustomerFromToken)
  console.log('\n--- Suite 6: Session Hydration ---');
  const sessionCustomer = await AuthModel.getCustomerFromToken(loginResult.token);
  assert(sessionCustomer !== null, 'Session customer successfully hydrated from JWT');
  assert(sessionCustomer?.id === regResult.customer.id, 'Hydrated customer ID matches');

  // Clean up test data
  try {
    await prisma.orderItem.deleteMany({ where: { order: { customerEmail: guestEmail } } });
    await prisma.order.deleteMany({ where: { customerEmail: guestEmail } });
    await prisma.customer.deleteMany({ where: { email: guestEmail } });
  } catch {
    // Ignore cleanup errors
  }

  console.log('\n====================================================');
  console.log(`🎉 ALL ${passed}/${total} TESTS PASSED SUCCESSFULLY IN ONE GO!`);
  console.log('====================================================\n');
}

runTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Test failed with error:', err);
    process.exit(1);
  });
