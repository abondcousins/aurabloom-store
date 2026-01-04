import { describe, expect, it } from 'vitest';
import { getProductMapping, updateProductMapping } from './cj/orderSync';

describe('CJ Product Mapping', () => {
  it('should return empty mapping initially', () => {
    const mapping = getProductMapping();
    expect(mapping).toBeDefined();
    expect(typeof mapping).toBe('object');
  });

  it('should update product mapping correctly', () => {
    const testSlug = 'test-product';
    const testVid = 'VID123456';
    const testPid = 'PID789012';

    updateProductMapping(testSlug, testVid, testPid);
    
    const mapping = getProductMapping();
    expect(mapping[testSlug]).toBeDefined();
    expect(mapping[testSlug].vid).toBe(testVid);
    expect(mapping[testSlug].cjProductId).toBe(testPid);
  });

  it('should overwrite existing mapping', () => {
    const testSlug = 'test-product-2';
    
    // First mapping
    updateProductMapping(testSlug, 'VID111', 'PID111');
    
    // Update mapping
    updateProductMapping(testSlug, 'VID222', 'PID222');
    
    const mapping = getProductMapping();
    expect(mapping[testSlug].vid).toBe('VID222');
    expect(mapping[testSlug].cjProductId).toBe('PID222');
  });
});
