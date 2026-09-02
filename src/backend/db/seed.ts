import { query, transaction, getDbPool } from './connection';
import { products } from '../models/productModel';
import { categories, collections, occasions } from '../models/collectionModel';
import { shippingRates } from '../models/shippingModel';
import { logger } from '../utils/logger';

export async function runSeed() {
  logger.info('Seeding PostgreSQL database with initial catalog and settings...');

  try {
    await transaction(async (client) => {
      // 1. Seed Categories
      for (const cat of categories) {
        await client.query(
          `INSERT INTO categories (id, slug, name, description, image)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (slug) DO UPDATE
           SET name = EXCLUDED.name, description = EXCLUDED.description, image = EXCLUDED.image`,
          [cat.slug, cat.slug, cat.name, cat.description, cat.image]
        );
      }
      logger.info(`✓ Seeded ${categories.length} categories.`);

      // 2. Seed Collections
      for (const col of collections) {
        await client.query(
          `INSERT INTO collections (id, slug, name, description, image, hero_image)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (slug) DO UPDATE
           SET name = EXCLUDED.name, description = EXCLUDED.description, image = EXCLUDED.image, hero_image = EXCLUDED.hero_image`,
          [col.slug, col.slug, col.name, col.description, col.image, col.heroImage]
        );
      }
      logger.info(`✓ Seeded ${collections.length} collections.`);

      // 3. Seed Occasions
      for (const occ of occasions) {
        await client.query(
          `INSERT INTO occasions (id, slug, name, description, image)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (slug) DO UPDATE
           SET name = EXCLUDED.name, description = EXCLUDED.description, image = EXCLUDED.image`,
          [occ.slug, occ.slug, occ.name, occ.description, occ.image]
        );
      }
      logger.info(`✓ Seeded ${occasions.length} occasions.`);

      // 4. Seed Products
      for (const prod of products) {
        await client.query(
          `INSERT INTO products (
            id, slug, name, short_description, long_description,
            category, collections, occasions, price, compare_at_price,
            currency, images, colour, available_sizes, fabric,
            embroidery_type, work, components, care, fit,
            model_height_and_size, delivery_estimate, is_new_arrival,
            is_bestseller, is_made_to_order, stock_by_size
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
            $21, $22, $23, $24, $25, $26
          )
          ON CONFLICT (slug) DO UPDATE
          SET name = EXCLUDED.name,
              short_description = EXCLUDED.short_description,
              long_description = EXCLUDED.long_description,
              category = EXCLUDED.category,
              collections = EXCLUDED.collections,
              occasions = EXCLUDED.occasions,
              price = EXCLUDED.price,
              compare_at_price = EXCLUDED.compare_at_price,
              currency = EXCLUDED.currency,
              images = EXCLUDED.images,
              colour = EXCLUDED.colour,
              available_sizes = EXCLUDED.available_sizes,
              fabric = EXCLUDED.fabric,
              embroidery_type = EXCLUDED.embroidery_type,
              work = EXCLUDED.work,
              components = EXCLUDED.components,
              care = EXCLUDED.care,
              fit = EXCLUDED.fit,
              model_height_and_size = EXCLUDED.model_height_and_size,
              delivery_estimate = EXCLUDED.delivery_estimate,
              is_new_arrival = EXCLUDED.is_new_arrival,
              is_bestseller = EXCLUDED.is_bestseller,
              is_made_to_order = EXCLUDED.is_made_to_order,
              stock_by_size = EXCLUDED.stock_by_size`,
          [
            prod.id,
            prod.slug,
            prod.name,
            prod.shortDescription,
            prod.longDescription,
            prod.category,
            prod.collections,
            prod.occasions,
            prod.price,
            prod.compareAtPrice || null,
            prod.currency,
            JSON.stringify(prod.images),
            JSON.stringify(prod.colour),
            prod.availableSizes,
            prod.fabric,
            prod.embroideryType,
            prod.work,
            prod.components,
            prod.care,
            prod.fit,
            prod.modelHeightAndSize,
            prod.deliveryEstimate,
            prod.isNewArrival,
            prod.isBestseller,
            prod.isMadeToOrder,
            JSON.stringify(prod.stockBySize),
          ]
        );
      }
      logger.info(`✓ Seeded ${products.length} products.`);

      // 5. Seed Shipping Rates
      for (const rate of shippingRates) {
        await client.query(
          `INSERT INTO shipping_rates (zone, label, description, rate, free_above, estimated_days)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (zone) DO UPDATE
           SET label = EXCLUDED.label,
               description = EXCLUDED.description,
               rate = EXCLUDED.rate,
               free_above = EXCLUDED.free_above,
               estimated_days = EXCLUDED.estimated_days`,
          [
            rate.zone,
            rate.label,
            rate.description,
            rate.rate,
            rate.freeAbove || null,
            rate.estimatedDays,
          ]
        );
      }
      logger.info(`✓ Seeded ${shippingRates.length} shipping rates.`);
    });

    logger.info('✓ PostgreSQL database seeding completed successfully!');
    return true;
  } catch (error) {
    logger.error('Failed to seed PostgreSQL database', error);
    throw error;
  }
}

// Allow direct execution via tsx
if (process.argv[1]?.endsWith('seed.ts')) {
  runSeed()
    .then(async () => {
      await getDbPool().end();
      process.exit(0);
    })
    .catch(async () => {
      await getDbPool().end();
      process.exit(1);
    });
}
