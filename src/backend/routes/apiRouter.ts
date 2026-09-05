import { withMiddlewares } from '../middlewares/withMiddlewares';
import { contactController } from '../controllers/contactController';
import { newsletterController } from '../controllers/newsletterController';
import { productController } from '../controllers/productController';
import { collectionController } from '../controllers/collectionController';
import { shippingController } from '../controllers/shippingController';
import { orderController } from '../controllers/orderController';
import { wishlistController } from '../controllers/wishlistController';

/**
 * Backend API Route registry mapping HTTP methods & controller actions
 */
export const ApiRouter = {
  contact: {
    post: withMiddlewares(contactController.handleContactSubmission.bind(contactController)),
    get: withMiddlewares(contactController.getSubmissions.bind(contactController)),
  },
  newsletter: {
    post: withMiddlewares(
      newsletterController.handleNewsletterSubscription.bind(newsletterController)
    ),
    get: withMiddlewares(newsletterController.getSubscribers.bind(newsletterController)),
    delete: withMiddlewares(newsletterController.handleUnsubscribe.bind(newsletterController)),
  },
  products: {
    list: withMiddlewares(productController.getProducts.bind(productController)),
    bySlug: withMiddlewares(productController.getProductBySlug.bind(productController)),
    stock: withMiddlewares(productController.checkStock.bind(productController)),
  },
  collections: {
    list: withMiddlewares(collectionController.getAllCollections.bind(collectionController)),
    bySlug: withMiddlewares(collectionController.getCollectionBySlug.bind(collectionController)),
    categoryBySlug: withMiddlewares(
      collectionController.getCategoryBySlug.bind(collectionController)
    ),
  },
  shipping: {
    get: withMiddlewares(shippingController.getShippingRates.bind(shippingController)),
    calculate: withMiddlewares(shippingController.calculateShippingCost.bind(shippingController)),
  },
  orders: {
    list: withMiddlewares(orderController.getOrders.bind(orderController)),
    create: withMiddlewares(orderController.createOrder.bind(orderController)),
    byId: withMiddlewares(orderController.getOrderById.bind(orderController)),
  },
  wishlist: {
    get: withMiddlewares(wishlistController.getWishlist.bind(wishlistController)),
    post: withMiddlewares(wishlistController.handleWishlistAction.bind(wishlistController)),
    delete: withMiddlewares(wishlistController.removeWishlist.bind(wishlistController)),
  },
};
