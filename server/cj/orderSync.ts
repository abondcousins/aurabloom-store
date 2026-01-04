import { getCJClient } from './client';
import { getDb } from '../db';
import { orders } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

// Product mapping: AuraBloom product slugs to CJ Dropshipping variant IDs
// These need to be updated with actual CJ product variant IDs
const PRODUCT_MAPPING: Record<string, { vid: string; cjProductId: string }> = {
  'led-photon-therapy-mask': {
    vid: '', // To be filled with actual CJ variant ID
    cjProductId: '', // To be filled with actual CJ product ID
  },
  'collagen-overnight-wrapping-mask': {
    vid: '',
    cjProductId: '',
  },
  'peel-off-lip-stain-trio': {
    vid: '',
    cjProductId: '',
  },
  'flame-effect-aromatherapy-diffuser': {
    vid: '',
    cjProductId: '',
  },
};

interface OrderItem {
  productId: number;
  productSlug: string;
  quantity: number;
  price: number;
}

interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  countryCode: string;
}

/**
 * Create an order in CJ Dropshipping
 */
export async function createCJOrder(
  orderNumber: string,
  items: OrderItem[],
  shippingAddress: ShippingAddress
): Promise<{ success: boolean; cjOrderId?: string; error?: string }> {
  try {
    const cjClient = getCJClient();

    // Map order items to CJ products
    const cjProducts = items
      .map((item) => {
        const mapping = PRODUCT_MAPPING[item.productSlug];
        if (!mapping || !mapping.vid) {
          console.warn(`[CJ] No mapping found for product: ${item.productSlug}`);
          return null;
        }
        return {
          vid: mapping.vid,
          quantity: item.quantity,
        };
      })
      .filter((p): p is { vid: string; quantity: number } => p !== null);

    if (cjProducts.length === 0) {
      return {
        success: false,
        error: 'No products could be mapped to CJ Dropshipping. Product mapping needs to be configured.',
      };
    }

    // Create the order in CJ
    const response = await cjClient.createOrder({
      orderNumber: orderNumber,
      shippingZip: shippingAddress.zipCode,
      shippingCountryCode: shippingAddress.countryCode || 'US',
      shippingCountry: shippingAddress.country || 'United States',
      shippingProvince: shippingAddress.state,
      shippingCity: shippingAddress.city,
      shippingAddress: shippingAddress.address,
      shippingCustomerName: shippingAddress.fullName,
      shippingPhone: shippingAddress.phone || '',
      remark: `AuraBloom Order #${orderNumber}`,
      products: cjProducts,
    });

    if (response.code === 200 && response.result) {
      const cjOrderId = response.data?.orderId || response.data?.orderNum;
      
      // Update our order with CJ order ID
      const db = await getDb();
      if (db && cjOrderId) {
        await db
          .update(orders)
          .set({ 
            cjOrderId: String(cjOrderId),
            cjSyncStatus: 'synced',
            cjSyncedAt: new Date(),
          })
          .where(eq(orders.orderNumber, orderNumber));
      }

      return {
        success: true,
        cjOrderId: String(cjOrderId),
      };
    }

    return {
      success: false,
      error: response.message || 'Failed to create CJ order',
    };
  } catch (error) {
    console.error('[CJ] Error creating order:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get tracking information for a CJ order
 */
export async function getCJOrderTracking(
  cjOrderId: string
): Promise<{ success: boolean; trackingNumber?: string; trackingUrl?: string; error?: string }> {
  try {
    const cjClient = getCJClient();
    const response = await cjClient.getOrderShipping(cjOrderId);

    if (response.code === 200 && response.data) {
      return {
        success: true,
        trackingNumber: response.data.trackingNumber,
        trackingUrl: response.data.trackingUrl,
      };
    }

    return {
      success: false,
      error: response.message || 'No tracking information available',
    };
  } catch (error) {
    console.error('[CJ] Error getting tracking:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Sync tracking numbers from CJ to our orders
 */
export async function syncTrackingNumbers(): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // Get orders that have CJ order IDs but no tracking numbers
  const ordersToSync = await db
    .select()
    .from(orders)
    .where(eq(orders.cjSyncStatus, 'synced'));

  for (const order of ordersToSync) {
    if (!order.cjOrderId || order.trackingNumber) continue;

    const tracking = await getCJOrderTracking(order.cjOrderId);
    if (tracking.success && tracking.trackingNumber) {
      await db
        .update(orders)
        .set({
          trackingNumber: tracking.trackingNumber,
          trackingUrl: tracking.trackingUrl,
          status: 'shipped',
        })
        .where(eq(orders.id, order.id));
      
      console.log(`[CJ] Updated tracking for order ${order.orderNumber}: ${tracking.trackingNumber}`);
    }
  }
}

/**
 * Update product mapping with CJ variant IDs
 */
export function updateProductMapping(slug: string, vid: string, cjProductId: string): void {
  PRODUCT_MAPPING[slug] = { vid, cjProductId };
}

/**
 * Get current product mapping
 */
export function getProductMapping(): typeof PRODUCT_MAPPING {
  return { ...PRODUCT_MAPPING };
}
