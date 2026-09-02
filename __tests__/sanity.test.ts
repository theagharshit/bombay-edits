import { describe, it, expect } from 'vitest';
import { products } from '@/backend/models/productModel';
import { categories, collections, occasions } from '@/backend/models/collectionModel';
import { shippingRates, currencies } from '@/backend/models/shippingModel';

describe('Sanity & Environment Checks', () => {
  it('should verify test runner is operational', () => {
    expect(true).toBe(true);
  });

  it('should load product catalog records properly', () => {
    expect(products.length).toBeGreaterThan(0);
    expect(products[0]).toHaveProperty('id');
    expect(products[0]).toHaveProperty('slug');
    expect(products[0]).toHaveProperty('price');
  });

  it('should load taxonomy categories and collections', () => {
    expect(categories.length).toBeGreaterThan(0);
    expect(collections.length).toBeGreaterThan(0);
    expect(occasions.length).toBeGreaterThan(0);
  });

  it('should load shipping rates and currencies configuration', () => {
    expect(shippingRates.length).toBeGreaterThan(0);
    expect(currencies.length).toBeGreaterThan(0);
    const nprCurrency = currencies.find((c) => c.code === 'NPR');
    expect(nprCurrency).toBeDefined();
  });
});
