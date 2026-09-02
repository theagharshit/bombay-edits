export interface ApiEndpointDoc {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  summary: string;
  description: string;
  rateLimit: string;
  authenticated: boolean;
  parameters?: Record<string, string>;
  requestBody?: Record<string, unknown>;
  responses: Record<number, string>;
}

export const API_CATALOG: ApiEndpointDoc[] = [
  {
    path: '/api/v1/products',
    method: 'GET',
    summary: 'List & Filter Products',
    description:
      'Query products with filters (category, collection, occasion, price, search, sort, pagination).',
    rateLimit: '120 req/min',
    authenticated: false,
    parameters: {
      category: 'Filter by category slug',
      collection: 'Filter by collection slug',
      occasion: 'Filter by occasion slug',
      q: 'Search keywords in name, fabric, embroidery',
      minPrice: 'Minimum price filter',
      maxPrice: 'Maximum price filter',
      sort: 'price-asc | price-desc | newest | name-asc',
      page: 'Page number (default 1)',
      limit: 'Page size limit',
    },
    responses: {
      200: 'Success envelope with paginated product array',
    },
  },
  {
    path: '/api/v1/products/{slug}',
    method: 'GET',
    summary: 'Get Product Detail',
    description:
      'Fetch detailed product specification, images, and sizing information by unique slug.',
    rateLimit: '120 req/min',
    authenticated: false,
    parameters: {
      slug: 'Unique product slug identifier',
    },
    responses: {
      200: 'Product detail record',
      404: 'Product not found',
    },
  },
  {
    path: '/api/v1/products/stock',
    method: 'GET',
    summary: 'Check Stock Availability',
    description: 'Verify live stock inventory for a given product size.',
    rateLimit: '120 req/min',
    authenticated: false,
    parameters: {
      id: 'Product ID',
      size: 'Size code (XS, S, M, L, XL, XXL)',
      qty: 'Requested quantity (default 1)',
    },
    responses: {
      200: 'Stock availability object { inStock, availableQuantity, isMadeToOrder }',
    },
  },
  {
    path: '/api/v1/collections',
    method: 'GET',
    summary: 'List Collections & Categories',
    description: 'Fetch categories, curated collections, and occasions lookup matrices.',
    rateLimit: '120 req/min',
    authenticated: false,
    responses: {
      200: 'Object with categories, collections, occasions arrays',
    },
  },
  {
    path: '/api/v1/shipping',
    method: 'GET',
    summary: 'Get Shipping Matrix',
    description: 'Fetch all regional shipping rates and supported multi-currency exchange configs.',
    rateLimit: '120 req/min',
    authenticated: false,
    responses: {
      200: 'Shipping rates and currencies configuration',
    },
  },
  {
    path: '/api/v1/shipping',
    method: 'POST',
    summary: 'Calculate Shipping Cost',
    description: 'Calculate shipping cost based on delivery zone and cart subtotal.',
    rateLimit: '60 req/min',
    authenticated: false,
    requestBody: {
      zone: 'Delivery zone string (mumbai | rest-of-india | nepal | rest-of-world)',
      subtotal: 'Cart subtotal amount in NPR',
    },
    responses: {
      200: 'Calculated shipping amount and rate tier details',
    },
  },
  {
    path: '/api/v1/orders',
    method: 'POST',
    summary: 'Create Checkout Order',
    description: 'Place a new order with line items, customer details, and shipping address.',
    rateLimit: '20 req/min',
    authenticated: false,
    requestBody: {
      items: 'Array of cart items with productId, slug, size, colour, quantity, price',
      customer: 'Customer details { email, firstName, lastName, phone, address, city, country }',
      shippingZone: 'Selected shipping zone',
      paymentMethod: 'Payment method string',
    },
    responses: {
      201: 'Order confirmation record { orderId, orderNumber, total, status }',
      400: 'Validation error',
    },
  },
  {
    path: '/api/v1/newsletter',
    method: 'POST',
    summary: 'Subscribe to Newsletter',
    description: 'Subscribe customer email to curated newsletter editions.',
    rateLimit: '30 req/min',
    authenticated: false,
    requestBody: {
      email: 'Subscriber email address',
      source: 'Acquisition channel tag',
    },
    responses: {
      200: 'Subscription status and confirmation message',
    },
  },
  {
    path: '/api/v1/contact',
    method: 'POST',
    summary: 'Submit Contact Inquiry',
    description: 'Submit customer support message, bespoke stitching enquiry, or order query.',
    rateLimit: '20 req/min',
    authenticated: false,
    requestBody: {
      name: 'Sender name',
      email: 'Sender email address',
      subject: 'Inquiry subject line',
      message: 'Detailed message body',
    },
    responses: {
      200: 'Inquiry receipt acknowledgment with submissionId',
    },
  },
  {
    path: '/api/v1/health',
    method: 'GET',
    summary: 'API & Gateway Health Status',
    description: 'Inspect gateway telemetry, database connection, latency, and entity counts.',
    rateLimit: '300 req/min',
    authenticated: false,
    responses: {
      200: 'System health snapshot',
    },
  },
];
