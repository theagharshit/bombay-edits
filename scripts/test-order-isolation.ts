import { OrderModel } from '../src/backend/models/orderModel';
import { orderController } from '../src/backend/controllers/orderController';
import { signJwt } from '../src/backend/utils/jwt';
import { NextRequest } from 'next/server';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`  ✓ PASS: ${message}`);
}

async function runOrderIsolationTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING ORDER PRIVACY & ISOLATION TESTS');
  console.log('====================================================\n');

  console.log('--- Suite 1: Database Model Email Scoping ---');
  const userOrders = await OrderModel.getAll({ email: 'a@g.com' });
  assert(Array.isArray(userOrders), 'Returns array of orders');
  assert(userOrders.length > 0, 'Found orders for a@g.com');
  const allMatchEmail = userOrders.every((o) => o.customer.email.toLowerCase() === 'a@g.com');
  assert(allMatchEmail, 'Every returned order strictly belongs to a@g.com');

  const otherOrdersFound = userOrders.some(
    (o) => o.customer.email.toLowerCase() === 'anya@atelier.com'
  );
  assert(!otherOrdersFound, 'Zero orders from other clients (e.g. anya@atelier.com) are returned');

  console.log('\n--- Suite 2: Empty Account Privacy (No Dummy Mock Leaks) ---');
  const emptyUserOrders = await OrderModel.getAll({ email: 'brand_new_zero_orders@test.com' });
  assert(Array.isArray(emptyUserOrders), 'Returns array for new account');
  assert(
    emptyUserOrders.length === 0,
    'User with no orders receives clean empty array [] (no mock Madame Anya leaks)'
  );

  console.log('\n--- Suite 3: Controller Authenticated Session Enforcement ---');
  const existingCustomer = await OrderModel['prisma']?.customer?.findUnique({
    where: { email: 'a@g.com' },
  });
  const customerId = existingCustomer ? existingCustomer.id : 'cmto74ix90004ou0l0b8vd8ji';

  const userToken = await signJwt({
    customerId,
    email: 'a@g.com',
    firstName: 'Yash',
    lastName: 'Agrawal',
    role: 'customer',
    isGuest: false,
  });

  // 3A: Authenticated request
  const authReq = new NextRequest('http://localhost:3000/api/orders', {
    headers: {
      cookie: `auth_token=${userToken}`,
    },
  });
  const authRes = await orderController.getOrders(authReq);
  const authBody = await authRes.json();
  assert(authBody.success === true, 'Authenticated request succeeds');
  assert(Array.isArray(authBody.data), 'Returns data array');
  assert(authBody.data.length > 0, 'Returns user own orders');
  assert(
    authBody.data.every((o: any) => o.customer.email.toLowerCase() === 'a@g.com'),
    'Controller only returns orders matching authenticated customer email'
  );

  // 3B: Tampering attempt: regular member attempts to spy by passing ?email=anya@atelier.com
  const spoofReq = new NextRequest('http://localhost:3000/api/orders?email=anya@atelier.com', {
    headers: {
      cookie: `auth_token=${userToken}`,
    },
  });
  const spoofRes = await orderController.getOrders(spoofReq);
  const spoofBody = await spoofRes.json();
  assert(
    spoofBody.data.every((o: any) => o.customer.email.toLowerCase() === 'a@g.com'),
    'Controller overrides query email and protects other clients from spoofing'
  );

  console.log('\n--- Suite 4: Unauthenticated Anonymous Protection ---');
  // 4A: Anonymous visitor calls /api/orders without credentials
  const anonReq = new NextRequest('http://localhost:3000/api/orders');
  const anonRes = await orderController.getOrders(anonReq);
  const anonBody = await anonRes.json();
  assert(
    Array.isArray(anonBody.data) && anonBody.data.length === 0,
    'Unauthenticated anonymous visitor receives empty array (zero data leakage)'
  );

  // 4B: Guest lookup with verified order number and matching email
  const guestLookupReq = new NextRequest(
    'http://localhost:3000/api/orders?orderNumber=TBE-2026-89329&email=a@g.com'
  );
  const guestRes = await orderController.getOrders(guestLookupReq);
  const guestBody = await guestRes.json();
  assert(guestBody.data.length === 1, 'Verified guest order lookup returns matching order');
  assert(guestBody.data[0].orderNumber === 'TBE-2026-89329', 'Guest order number matches query');

  // 4C: Guest lookup with wrong email fails to return order
  const guestWrongEmailReq = new NextRequest(
    'http://localhost:3000/api/orders?orderNumber=TBE-2026-89329&email=wrong@hacker.com'
  );
  const wrongEmailRes = await orderController.getOrders(guestWrongEmailReq);
  const wrongEmailBody = await wrongEmailRes.json();
  assert(
    wrongEmailBody.data.length === 0,
    'Guest lookup with mismatched email is rejected with 0 results'
  );

  console.log('\n====================================================');
  console.log('🎉 ALL 11/11 ORDER ISOLATION TESTS PASSED!');
  console.log('====================================================\n');
}

runOrderIsolationTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
