import re

schema_path = "prisma/schema.prisma"
with open(schema_path, "r") as f:
    schema = f.read()

# ADD ENUMS AT TOP (AFTER DATASOURCE)
enums = """
enum ProductStatus {
  DRAFT
  ACTIVE
  ARCHIVED
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}

enum AdminRole {
  OWNER
  ADMIN
  STAFF
}

enum ReviewStatus {
  PENDING
  APPROVED
  REJECTED
}

enum InventoryReason {
  SALE
  RETURN
  MANUAL_ADJUSTMENT
  RESTOCK
  DAMAGE
  CANCELLATION
}

enum RelationType {
  COMPLETE_THE_LOOK
  RECOMMENDED
}

enum HomepageSectionType {
  HERO
  PRODUCT_RAIL
  COLLECTION_GRID
  PROMO_TILE
  EDITORIAL_BAND
  NEWSLETTER
}

enum DiscountType {
  PERCENT
  FIXED
  FREE_SHIPPING
}

enum PageStatus {
  DRAFT
  PUBLISHED
}
"""

schema = re.sub(r'(datasource db \{.*?\n\})', r'\1\n' + enums, schema, flags=re.DOTALL)

# UPDATE CATEGORY
schema = schema.replace(
    '  updatedAt   DateTime   @updatedAt',
    '  updatedAt   DateTime   @updatedAt\n  sortOrder   Int        @default(0)\n  isActive    Boolean    @default(true)\n  metaTitle   String?\n  metaDescription String?'
)

# UPDATE COLLECTION
schema = schema.replace(
    '  heroImage          String?',
    '  heroImage          String?\n  sortOrder          Int        @default(0)\n  isActive           Boolean    @default(true)\n  isFeatured         Boolean    @default(false)\n  metaTitle          String?\n  metaDescription    String?'
)

# UPDATE PRODUCT
product_addition = """  sku                 String?                  @unique
  lowStockThreshold   Int                      @default(3)
  modelNote           String?
  materialsNote       String?
  metaTitle           String?
  metaDescription     String?
  archivedAt          DateTime?
  sortWeight          Int                      @default(0)
  relationsOut        ProductRelation[]        @relation("ProductSource")
  relationsIn         ProductRelation[]        @relation("ProductTarget")"""

# Remove old status if exists, it was String before, now ProductStatus
schema = re.sub(r'  status              String                   @default\("ACTIVE"\)', r'  status              ProductStatus            @default(DRAFT)', schema)
schema = schema.replace('  publishedAt         DateTime?', '  publishedAt         DateTime?\n' + product_addition)

# Product Size Stock
schema = schema.replace('  stockQuantity Int         @default(0)', '  stockQuantity Int         @default(0)\n  sku           String?\n  reservedQuantity Int      @default(0)')

# ORDER UPDATE
schema = re.sub(r'  paymentMethod      String', r'  paymentMethod      String\n  paymentStatus      PaymentStatus @default(PENDING)\n  trackingNumber     String?\n  carrier            String?\n  internalNotes      String?\n  exchangeRateSnapshot Decimal @db.Decimal(10,4)\n  placedAt           DateTime @default(now())\n  confirmedAt        DateTime?\n  shippedAt          DateTime?\n  deliveredAt        DateTime?\n  cancelledAt        DateTime?\n  cancellationReason String?', schema)

# ORDER ITEM UPDATE
schema = schema.replace('  productName String', '  productName String\n  productNameSnapshot String\n  productSlugSnapshot String\n  imageUrlSnapshot   String?')

# CONTACT SUBMISSION UPDATE
schema = schema.replace('  status      String   @default("new")', '  status      String   @default("new")\n  assignedToId String?\n  internalNotes String?\n  resolvedAt   DateTime?')

# NEWSLETTER
schema = schema.replace('  subscribedAt DateTime @default(now())', '  subscribedAt DateTime @default(now())\n  unsubscribedAt DateTime?\n  confirmedAt  DateTime?')

# REVIEWS 
schema = re.sub(r'model Review \{.*?@@map\("reviews"\)\n\}', """model Review {
  id        String   @id @default(cuid())
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  customerId String?
  authorName String
  authorEmail String?
  rating    Int
  title     String?
  body      String   @db.Text
  status    ReviewStatus   @default(PENDING)
  isVerifiedPurchase Boolean @default(false)
  createdAt DateTime @default(now())
  publishedAt DateTime?

  @@index([productId])
  @@map("reviews")
}""", schema, flags=re.DOTALL)

# INVENTORY MOVEMENTS 
schema = re.sub(r'model InventoryMovement \{.*?@@map\("inventory_movements"\)\n\}', """model InventoryMovement {
  id            String          @id @default(cuid())
  productId     String
  sizeId        String
  delta         Int
  reason        InventoryReason
  referenceType String?
  referenceId   String?
  note          String?
  actorId       String?
  createdAt     DateTime        @default(now())

  @@index([productId, sizeId])
  @@map("inventory_movements")
}""", schema, flags=re.DOTALL)

# ADD NEW MODELS
new_models = """

model AdminUser {
  id           String    @id @default(cuid())
  email        String    @unique
  passwordHash String
  name         String
  role         AdminRole @default(STAFF)
  isActive     Boolean   @default(true)
  lastLoginAt  DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@map("admin_users")
}

model OrderStatusEvent {
  id         String   @id @default(cuid())
  orderId    String
  fromStatus String
  toStatus   String
  note       String?
  actorId    String?
  createdAt  DateTime @default(now())

  @@map("order_status_events")
}

model ProductRelation {
  id               String       @id @default(cuid())
  productId        String
  product          Product      @relation("ProductSource", fields: [productId], references: [id], onDelete: Cascade)
  relatedProductId String
  relatedProduct   Product      @relation("ProductTarget", fields: [relatedProductId], references: [id], onDelete: Cascade)
  type             RelationType
  sortOrder        Int          @default(0)

  @@index([productId])
  @@index([relatedProductId])
  @@map("product_relations")
}

model HomepageSection {
  id           String              @id @default(cuid())
  key          String              @unique
  type         HomepageSectionType
  title        String?
  subtitle     String?
  ctaLabel     String?
  ctaHref      String?
  imageUrl     String?
  collectionId String?
  sortOrder    Int                 @default(0)
  isActive     Boolean             @default(true)
  config       Json?

  @@map("homepage_sections")
}

model NavigationItem {
  id        String          @id @default(cuid())
  parentId  String?
  parent    NavigationItem? @relation("NavHierarchy", fields: [parentId], references: [id])
  children  NavigationItem[] @relation("NavHierarchy")
  label     String
  href      String
  sortOrder Int             @default(0)
  isActive  Boolean         @default(true)
  group     String?

  @@map("navigation_items")
}

model Page {
  id              String     @id @default(cuid())
  slug            String     @unique
  title           String
  body            String     @db.Text
  metaTitle       String?
  metaDescription String?
  status          PageStatus @default(DRAFT)
  updatedAt       DateTime   @updatedAt

  @@map("pages")
}

model SizeGuide {
  id         String  @id @default(cuid())
  name       String
  categoryId String?
  rows       Json
  notes      String?

  @@map("size_guides")
}

model MediaAsset {
  id           String   @id @default(cuid())
  url          String
  pathname     String
  filename     String
  mimeType     String
  sizeBytes    Int
  width        Int?
  height       Int?
  altText      String?
  folder       String?
  uploadedById String
  createdAt    DateTime @default(now())

  @@map("media_assets")
}

model Discount {
  id               String       @id @default(cuid())
  code             String       @unique
  type             DiscountType
  value            Int
  minSubtotal      Int?
  usageLimit       Int?
  usageCount       Int          @default(0)
  perCustomerLimit Int?
  startsAt         DateTime
  endsAt           DateTime?
  isActive         Boolean      @default(true)
  appliesTo        Json?

  @@map("discounts")
}

model StoreSetting {
  key       String   @id
  value     Json
  updatedAt DateTime @updatedAt

  @@map("store_settings")
}
"""

schema = schema + new_models

# Add missing indexes asked by the user
# Indexes: Product(status, createdAt), Product(categoryId, status), Order(status, placedAt), Order(customerId), Review(productId, status), ProductSizeStock(productId).

# Product indexes:
schema = schema.replace(
    '  @@index([categoryId])\n  @@index([colourId])',
    '  @@index([categoryId])\n  @@index([colourId])\n  @@index([status, createdAt])\n  @@index([categoryId, status])'
)

# Order indexes:
schema = schema.replace(
    '  @@index([customerEmail])\n  @@index([orderNumber])\n  @@map("orders")',
    '  @@index([customerEmail])\n  @@index([orderNumber])\n  @@index([status, placedAt])\n  @@index([customerId])\n  @@map("orders")'
)

# Review index:
schema = schema.replace(
    '  @@index([productId])\n  @@map("reviews")',
    '  @@index([productId])\n  @@index([productId, status])\n  @@map("reviews")'
)


with open(schema_path, "w") as f:
    f.write(schema)

print("Schema updated successfully")
