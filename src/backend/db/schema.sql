-- ==============================================================================
-- The Bombay Edit - Highly Normalised Relational PostgreSQL Database Schema (3NF)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables in reverse dependency order (if recreation is needed)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS product_occasions CASCADE;
DROP TABLE IF EXISTS product_collections CASCADE;
DROP TABLE IF EXISTS product_care_instructions CASCADE;
DROP TABLE IF EXISTS product_components CASCADE;
DROP TABLE IF EXISTS product_size_stocks CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS product_sizes CASCADE;
DROP TABLE IF EXISTS embroidery_types CASCADE;
DROP TABLE IF EXISTS fabrics CASCADE;
DROP TABLE IF EXISTS colours CASCADE;
DROP TABLE IF EXISTS occasions CASCADE;
DROP TABLE IF EXISTS collections CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS shipping_zones CASCADE;
DROP TABLE IF EXISTS currencies CASCADE;
DROP TABLE IF EXISTS newsletter_subscribers CASCADE;
DROP TABLE IF EXISTS contact_submissions CASCADE;

-- ── 1. Lookup / Domain Taxonomies ─────────────────────────────

CREATE TABLE categories (
  id VARCHAR(64) PRIMARY KEY,
  slug VARCHAR(128) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE collections (
  id VARCHAR(64) PRIMARY KEY,
  slug VARCHAR(128) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image TEXT,
  hero_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE occasions (
  id VARCHAR(64) PRIMARY KEY,
  slug VARCHAR(128) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE colours (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) UNIQUE NOT NULL,
  hex VARCHAR(16) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE fabrics (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE embroidery_types (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_sizes (
  id VARCHAR(64) PRIMARY KEY,
  size_code VARCHAR(16) UNIQUE NOT NULL,
  sort_order INT DEFAULT 0
);

CREATE TABLE currencies (
  id VARCHAR(64) PRIMARY KEY,
  code VARCHAR(10) UNIQUE NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  exchange_rate NUMERIC(10, 4) NOT NULL DEFAULT 1.0,
  locale VARCHAR(32) NOT NULL
);

CREATE TABLE shipping_zones (
  id VARCHAR(64) PRIMARY KEY,
  zone VARCHAR(64) UNIQUE NOT NULL,
  label VARCHAR(128) NOT NULL,
  description TEXT,
  rate NUMERIC(10, 2) NOT NULL,
  free_above NUMERIC(10, 2),
  estimated_days VARCHAR(128) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ── 2. Customers & Addresses ──────────────────────────────────

CREATE TABLE customers (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(128) NOT NULL,
  last_name VARCHAR(128) NOT NULL,
  phone VARCHAR(64),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE addresses (
  id VARCHAR(64) PRIMARY KEY,
  customer_id VARCHAR(64) NOT NULL REFERENCES customers(id) ON DELETE CASCADE ON UPDATE CASCADE,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city VARCHAR(128) NOT NULL,
  state VARCHAR(128),
  postal_code VARCHAR(32),
  country VARCHAR(128) NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ── 3. Products & Normalised Relational Child Tables ───────────

CREATE TABLE products (
  id VARCHAR(64) PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  short_description TEXT NOT NULL,
  long_description TEXT NOT NULL,
  category_id VARCHAR(64) NOT NULL REFERENCES categories(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  colour_id VARCHAR(64) NOT NULL REFERENCES colours(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  fabric_id VARCHAR(64) NOT NULL REFERENCES fabrics(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  embroidery_type_id VARCHAR(64) NOT NULL REFERENCES embroidery_types(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  price NUMERIC(12, 2) NOT NULL,
  compare_at_price NUMERIC(12, 2),
  currency_id VARCHAR(64) NOT NULL REFERENCES currencies(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  work TEXT,
  fit VARCHAR(64),
  model_height_and_size VARCHAR(128),
  delivery_estimate VARCHAR(255),
  is_new_arrival BOOLEAN DEFAULT false,
  is_bestseller BOOLEAN DEFAULT false,
  is_made_to_order BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_images (
  id VARCHAR(64) PRIMARY KEY,
  product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE,
  src TEXT NOT NULL,
  alt TEXT NOT NULL,
  image_type VARCHAR(32) NOT NULL, -- 'front', 'back', 'detail', 'lifestyle'
  sort_order INT DEFAULT 0
);

CREATE TABLE product_size_stocks (
  id VARCHAR(64) PRIMARY KEY,
  product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE,
  size_id VARCHAR(64) NOT NULL REFERENCES product_sizes(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  stock_quantity INT NOT NULL DEFAULT 0,
  CONSTRAINT uq_product_size UNIQUE (product_id, size_id)
);

CREATE TABLE product_components (
  id VARCHAR(64) PRIMARY KEY,
  product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE,
  name VARCHAR(128) NOT NULL
);

CREATE TABLE product_care_instructions (
  id VARCHAR(64) PRIMARY KEY,
  product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE,
  instruction TEXT NOT NULL
);

-- Many-to-Many Join Tables
CREATE TABLE product_collections (
  product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE,
  collection_id VARCHAR(64) NOT NULL REFERENCES collections(id) ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY (product_id, collection_id)
);

CREATE TABLE product_occasions (
  product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE,
  occasion_id VARCHAR(64) NOT NULL REFERENCES occasions(id) ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY (product_id, occasion_id)
);

-- ── 4. Orders & Order Items ───────────────────────────────────

CREATE TABLE orders (
  id VARCHAR(64) PRIMARY KEY,
  order_number VARCHAR(64) UNIQUE NOT NULL,
  customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE SET NULL ON UPDATE CASCADE,
  customer_email VARCHAR(255) NOT NULL,
  customer_first_name VARCHAR(128) NOT NULL,
  customer_last_name VARCHAR(128) NOT NULL,
  customer_phone VARCHAR(64) NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_city VARCHAR(128) NOT NULL,
  shipping_state VARCHAR(128),
  shipping_postal_code VARCHAR(32),
  shipping_country VARCHAR(128) NOT NULL,
  shipping_zone_id VARCHAR(64) REFERENCES shipping_zones(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  shipping_zone_name VARCHAR(64) NOT NULL,
  currency_id VARCHAR(64) NOT NULL REFERENCES currencies(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  subtotal NUMERIC(12, 2) NOT NULL,
  shipping_cost NUMERIC(10, 2) NOT NULL,
  total NUMERIC(12, 2) NOT NULL,
  payment_method VARCHAR(64) NOT NULL,
  notes TEXT,
  status VARCHAR(32) DEFAULT 'confirmed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
  id VARCHAR(64) PRIMARY KEY,
  order_id VARCHAR(64) NOT NULL REFERENCES orders(id) ON DELETE CASCADE ON UPDATE CASCADE,
  product_id VARCHAR(64) REFERENCES products(id) ON DELETE SET NULL ON UPDATE CASCADE,
  product_slug VARCHAR(255) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  size_id VARCHAR(64) REFERENCES product_sizes(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  colour_id VARCHAR(64) REFERENCES colours(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  unit_price NUMERIC(12, 2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ── 5. Inquiries & Newsletter ─────────────────────────────────

CREATE TABLE contact_submissions (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  message TEXT NOT NULL,
  phone VARCHAR(64),
  order_number VARCHAR(64),
  status VARCHAR(32) DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE newsletter_subscribers (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  source VARCHAR(128) DEFAULT 'website',
  is_active BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ── 6. Indexes for Performance & Search Optimization ──────────

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_colour ON products(colour_id);
CREATE INDEX idx_products_fabric ON products(fabric_id);
CREATE INDEX idx_products_embroidery ON products(embroidery_type_id);
CREATE INDEX idx_products_is_new_arrival ON products(is_new_arrival);
CREATE INDEX idx_products_is_bestseller ON products(is_bestseller);
CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_product_sizes_stock_product ON product_size_stocks(product_id);
CREATE INDEX idx_product_components_product ON product_components(product_id);
CREATE INDEX idx_product_care_product ON product_care_instructions(product_id);
CREATE INDEX idx_addresses_customer ON addresses(customer_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX idx_newsletter_subscribers_email ON newsletter_subscribers(email);
