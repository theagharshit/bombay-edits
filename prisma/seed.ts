import { PrismaClient } from '@prisma/client';
import { products } from '../src/backend/models/productModel';
import { categories, collections, occasions } from '../src/backend/models/collectionModel';
import { shippingRates, currencies } from '../src/backend/models/shippingModel';

const prisma = new PrismaClient();

export async function main() {
  console.log('🌱 Starting Prisma database seeding with highly normalised relational tables...');

  // 1. Seed Categories
  console.log('1. Seeding categories...');
  const categoryMap = new Map<string, string>();
  for (const cat of categories) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        image: cat.image,
      },
      create: {
        slug: cat.slug,
        name: cat.name,
        description: cat.description,
        image: cat.image,
      },
    });
    categoryMap.set(cat.slug, record.id);
  }
  console.log(`✓ Seeded ${categories.length} categories.`);

  // 2. Seed Collections
  console.log('2. Seeding collections...');
  const collectionMap = new Map<string, string>();
  for (const col of collections) {
    const record = await prisma.collection.upsert({
      where: { slug: col.slug },
      update: {
        name: col.name,
        description: col.description,
        image: col.image,
        heroImage: col.heroImage,
      },
      create: {
        slug: col.slug,
        name: col.name,
        description: col.description,
        image: col.image,
        heroImage: col.heroImage,
      },
    });
    collectionMap.set(col.slug, record.id);
  }
  console.log(`✓ Seeded ${collections.length} collections.`);

  // 3. Seed Occasions
  console.log('3. Seeding occasions...');
  const occasionMap = new Map<string, string>();
  for (const occ of occasions) {
    const record = await prisma.occasion.upsert({
      where: { slug: occ.slug },
      update: {
        name: occ.name,
        description: occ.description,
        image: occ.image,
      },
      create: {
        slug: occ.slug,
        name: occ.name,
        description: occ.description,
        image: occ.image,
      },
    });
    occasionMap.set(occ.slug, record.id);
  }
  console.log(`✓ Seeded ${occasions.length} occasions.`);

  // 4. Seed Colours (Normalised Lookup)
  console.log('4. Seeding colours...');
  const colourMap = new Map<string, string>();
  for (const prod of products) {
    if (prod.colour && !colourMap.has(prod.colour.name)) {
      const record = await prisma.colour.upsert({
        where: { name: prod.colour.name },
        update: { hex: prod.colour.hex },
        create: { name: prod.colour.name, hex: prod.colour.hex },
      });
      colourMap.set(prod.colour.name, record.id);
    }
  }
  console.log(`✓ Seeded ${colourMap.size} unique colours.`);

  // 5. Seed Fabrics (Normalised Lookup)
  console.log('5. Seeding fabrics...');
  const fabricMap = new Map<string, string>();
  for (const prod of products) {
    if (prod.fabric && !fabricMap.has(prod.fabric)) {
      const record = await prisma.fabric.upsert({
        where: { name: prod.fabric },
        update: {},
        create: { name: prod.fabric },
      });
      fabricMap.set(prod.fabric, record.id);
    }
  }
  console.log(`✓ Seeded ${fabricMap.size} unique fabrics.`);

  // 6. Seed Embroidery Types (Normalised Lookup)
  console.log('6. Seeding embroidery types...');
  const embroideryMap = new Map<string, string>();
  for (const prod of products) {
    if (prod.embroideryType && !embroideryMap.has(prod.embroideryType)) {
      const record = await prisma.embroideryType.upsert({
        where: { name: prod.embroideryType },
        update: {},
        create: { name: prod.embroideryType },
      });
      embroideryMap.set(prod.embroideryType, record.id);
    }
  }
  console.log(`✓ Seeded ${embroideryMap.size} unique embroidery types.`);

  // 7. Seed Shipping Zones
  console.log('7. Seeding shipping zones...');
  for (const rate of shippingRates) {
    await prisma.shippingZone.upsert({
      where: { zone: rate.zone },
      update: {
        label: rate.label,
        description: rate.description,
        rate: rate.rate,
        freeAbove: rate.freeAbove || null,
        estimatedDays: rate.estimatedDays,
      },
      create: {
        zone: rate.zone,
        label: rate.label,
        description: rate.description,
        rate: rate.rate,
        freeAbove: rate.freeAbove || null,
        estimatedDays: rate.estimatedDays,
      },
    });
  }
  console.log(`✓ Seeded ${shippingRates.length} shipping zones.`);

  // 8. Seed Currencies
  console.log('8. Seeding currencies...');
  for (const curr of currencies) {
    await prisma.currency.upsert({
      where: { code: curr.code },
      update: {
        symbol: curr.symbol,
        rate: curr.rate,
        locale: curr.locale,
      },
      create: {
        code: curr.code,
        symbol: curr.symbol,
        rate: curr.rate,
        locale: curr.locale,
      },
    });
  }
  console.log(`✓ Seeded ${currencies.length} currencies.`);

  // 9. Seed Products & Child Relational Tables
  console.log('9. Seeding products with full relational normalisation...');
  for (const prod of products) {
    const categoryId = categoryMap.get(prod.category);
    const colourId = colourMap.get(prod.colour.name);
    const fabricId = fabricMap.get(prod.fabric);
    const embroideryTypeId = embroideryMap.get(prod.embroideryType);

    if (!categoryId || !colourId || !fabricId || !embroideryTypeId) {
      console.warn(`Skipping product ${prod.slug} due to missing lookup reference.`);
      continue;
    }

    // Upsert main product
    const productRecord = await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {
        id: prod.id,
        name: prod.name,
        shortDescription: prod.shortDescription,
        longDescription: prod.longDescription,
        categoryId,
        colourId,
        fabricId,
        embroideryTypeId,
        price: prod.price,
        compareAtPrice: prod.compareAtPrice || null,
        currency: prod.currency,
        work: prod.work,
        fit: prod.fit,
        modelHeightAndSize: prod.modelHeightAndSize,
        deliveryEstimate: prod.deliveryEstimate,
        isNewArrival: prod.isNewArrival,
        isBestseller: prod.isBestseller,
        isMadeToOrder: prod.isMadeToOrder,
      },
      create: {
        id: prod.id,
        slug: prod.slug,
        name: prod.name,
        shortDescription: prod.shortDescription,
        longDescription: prod.longDescription,
        categoryId,
        colourId,
        fabricId,
        embroideryTypeId,
        price: prod.price,
        compareAtPrice: prod.compareAtPrice || null,
        currency: prod.currency,
        work: prod.work,
        fit: prod.fit,
        modelHeightAndSize: prod.modelHeightAndSize,
        deliveryEstimate: prod.deliveryEstimate,
        isNewArrival: prod.isNewArrival,
        isBestseller: prod.isBestseller,
        isMadeToOrder: prod.isMadeToOrder,
      },
    });

    // Child Table: ProductImages
    await prisma.productImage.deleteMany({ where: { productId: productRecord.id } });
    if (prod.images && prod.images.length > 0) {
      await prisma.productImage.createMany({
        data: prod.images.map((img, index) => ({
          productId: productRecord.id,
          src: img.src,
          alt: img.alt,
          type: img.type,
          sortOrder: index,
        })),
      });
    }

    // Child Table: ProductSizeStock
    await prisma.productSizeStock.deleteMany({ where: { productId: productRecord.id } });
    if (prod.stockBySize) {
      const sizeEntries = Object.entries(prod.stockBySize as Record<string, number>);
      await prisma.productSizeStock.createMany({
        data: sizeEntries.map(([size, stockQuantity]) => ({
          productId: productRecord.id,
          size,
          stockQuantity,
        })),
      });
    }

    // Child Table: ProductComponents
    await prisma.productComponent.deleteMany({ where: { productId: productRecord.id } });
    if (prod.components && prod.components.length > 0) {
      await prisma.productComponent.createMany({
        data: prod.components.map(name => ({
          productId: productRecord.id,
          name,
        })),
      });
    }

    // Child Table: ProductCareInstructions
    await prisma.productCareInstruction.deleteMany({ where: { productId: productRecord.id } });
    if (prod.care && prod.care.length > 0) {
      await prisma.productCareInstruction.createMany({
        data: prod.care.map(instruction => ({
          productId: productRecord.id,
          instruction,
        })),
      });
    }

    // Join Table: ProductCollection
    await prisma.productCollection.deleteMany({ where: { productId: productRecord.id } });
    if (prod.collections && prod.collections.length > 0) {
      for (const colSlug of prod.collections) {
        const colId = collectionMap.get(colSlug);
        if (colId) {
          await prisma.productCollection.create({
            data: {
              productId: productRecord.id,
              collectionId: colId,
            },
          });
        }
      }
    }

    // Join Table: ProductOccasion
    await prisma.productOccasion.deleteMany({ where: { productId: productRecord.id } });
    if (prod.occasions && prod.occasions.length > 0) {
      for (const occSlug of prod.occasions) {
        const occId = occasionMap.get(occSlug);
        if (occId) {
          await prisma.productOccasion.create({
            data: {
              productId: productRecord.id,
              occasionId: occId,
            },
          });
        }
      }
    }
  }

  console.log(`✓ Seeded ${products.length} products with complete relations!`);
  console.log('🎉 Highly normalised database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding Prisma database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
