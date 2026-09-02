import { NextRequest } from 'next/server';
import { ApiGateway } from '@/backend/gateway/apiGateway';
import { productController } from '@/backend/controllers/productController';
import { collectionController } from '@/backend/controllers/collectionController';
import { shippingController } from '@/backend/controllers/shippingController';
import { orderController } from '@/backend/controllers/orderController';
import { newsletterController } from '@/backend/controllers/newsletterController';
import { contactController } from '@/backend/controllers/contactController';
import { addressController } from '@/backend/controllers/addressController';
import { healthController } from '@/backend/controllers/healthController';
import { ApiResponse } from '@/backend/utils/apiResponse';
import { RequestContext } from '@/backend/types/api';

async function dispatch(req: NextRequest, context: RequestContext) {
  const pathArray = (context.params?.path as string[]) || [];
  const method = req.method;
  const rootSegment = pathArray[0];
  const subSegment = pathArray[1];
  const thirdSegment = pathArray[2];

  // 1. /api/v1/products
  if (rootSegment === 'products') {
    if (subSegment === 'stock' && method === 'GET') {
      return productController.checkStock(req);
    }
    if (subSegment && method === 'GET') {
      context.params = { slug: subSegment };
      return productController.getProductBySlug(req, context);
    }
    if (method === 'GET') {
      return productController.getProducts(req);
    }
  }

  // 2. /api/v1/collections
  if (rootSegment === 'collections') {
    if (subSegment && method === 'GET') {
      context.params = { slug: subSegment };
      return collectionController.getCollectionBySlug(req, context);
    }
    if (method === 'GET') {
      return collectionController.getAllCollections(req);
    }
  }

  // 3. /api/v1/shipping
  if (rootSegment === 'shipping') {
    if (method === 'GET') {
      return shippingController.getShippingRates();
    }
    if (method === 'POST') {
      return shippingController.calculateShippingCost(req, context);
    }
  }

  // 4. /api/v1/orders
  if (rootSegment === 'orders') {
    if (subSegment && method === 'GET') {
      context.params = { id: subSegment };
      return orderController.getOrderById(req, context);
    }
    if (method === 'POST') {
      return orderController.createOrder(req, context);
    }
  }

  // 5. /api/v1/newsletter
  if (rootSegment === 'newsletter') {
    if (method === 'POST') {
      return newsletterController.handleNewsletterSubscription(req, context);
    }
    if (method === 'GET') {
      return newsletterController.getSubscribers();
    }
  }

  // 6. /api/v1/contact
  if (rootSegment === 'contact') {
    if (method === 'POST') {
      return contactController.handleContactSubmission(req, context);
    }
    if (method === 'GET') {
      return contactController.getSubmissions();
    }
  }

  // 7. /api/v1/addresses
  if (rootSegment === 'addresses') {
    if (subSegment && thirdSegment === 'default' && (method === 'PATCH' || method === 'POST')) {
      context.params = { id: subSegment };
      return addressController.setDefaultAddress(req, context);
    }
    if (subSegment && method === 'GET') {
      context.params = { id: subSegment };
      return addressController.getAddressById(req, context);
    }
    if (subSegment && (method === 'PATCH' || method === 'PUT')) {
      context.params = { id: subSegment };
      return addressController.updateAddress(req, context);
    }
    if (subSegment && method === 'DELETE') {
      context.params = { id: subSegment };
      return addressController.deleteAddress(req, context);
    }
    if (method === 'GET') {
      return addressController.getAddresses(req);
    }
    if (method === 'POST') {
      return addressController.createAddress(req, context);
    }
  }

  // 8. /api/v1/health
  if (rootSegment === 'health') {
    return healthController.getHealth(req);
  }

  return ApiResponse.error(
    `Route /api/v1/${pathArray.join('/')} [${method}] not found in Gateway.`,
    {
      status: 404,
      code: 'GATEWAY_ROUTE_NOT_FOUND',
    }
  );
}

export const GET = ApiGateway.handle(dispatch, {
  rateLimit: { windowMs: 60000, maxRequests: 180 },
});
export const POST = ApiGateway.handle(dispatch, {
  rateLimit: { windowMs: 60000, maxRequests: 60 },
});
export const PUT = ApiGateway.handle(dispatch, { rateLimit: { windowMs: 60000, maxRequests: 60 } });
export const DELETE = ApiGateway.handle(dispatch, {
  rateLimit: { windowMs: 60000, maxRequests: 60 },
});
export const OPTIONS = ApiGateway.handle(dispatch);
