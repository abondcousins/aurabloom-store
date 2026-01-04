import { Request, Response } from 'express';
import Stripe from 'stripe';
import { stripe } from './client';
import { notifyOwner } from '../_core/notification';
import * as db from '../db';
import { createCJOrder } from '../cj/orderSync';

export async function handleStripeWebhook(req: Request, res: Response) {
  if (!stripe) {
    console.error('[Webhook] Stripe not configured');
    return res.status(500).json({ error: 'Stripe not configured' });
  }

  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('[Webhook] STRIPE_WEBHOOK_SECRET not configured');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[Webhook] Signature verification failed: ${message}`);
    return res.status(400).json({ error: `Webhook Error: ${message}` });
  }

  // Handle test events
  if (event.id.startsWith('evt_test_')) {
    console.log("[Webhook] Test event detected, returning verification response");
    return res.json({ 
      verified: true,
    });
  }

  console.log(`[Webhook] Received event: ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`[Webhook] Payment succeeded: ${paymentIntent.id}`);
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`[Webhook] Payment failed: ${paymentIntent.id}`);
        break;
      }
      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    return res.json({ received: true });
  } catch (error) {
    console.error(`[Webhook] Error processing event: ${error}`);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log(`[Webhook] Processing checkout.session.completed: ${session.id}`);
  
  const metadata = session.metadata || {};
  const userId = metadata.user_id ? parseInt(metadata.user_id) : undefined;
  const cartSessionId = metadata.session_id || undefined;
  
  // Parse cart items from metadata
  let cartItems: Array<{
    productId: number;
    quantity: number;
    name: string;
    price: string;
  }> = [];
  
  try {
    cartItems = JSON.parse(metadata.cart_items || '[]');
  } catch (e) {
    console.error('[Webhook] Failed to parse cart items:', e);
  }

  if (cartItems.length === 0) {
    console.error('[Webhook] No cart items found in metadata');
    return;
  }

  // Get shipping details from session
  const shippingDetails = session.collected_information?.shipping_details;
  const customerDetails = session.customer_details;

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (parseFloat(item.price) * item.quantity);
  }, 0);
  const shippingTotal = 0; // Free shipping
  const total = session.amount_total ? session.amount_total / 100 : subtotal;

  // Create order in database
  const order = await db.createOrder({
    userId: userId || undefined,
    sessionId: userId ? undefined : cartSessionId,
    customerEmail: customerDetails?.email || metadata.customer_email || '',
    customerName: customerDetails?.name || metadata.customer_name || '',
    customerPhone: customerDetails?.phone || undefined,
    shippingAddress: shippingDetails?.address?.line1 || metadata.shipping_address || '',
    shippingCity: shippingDetails?.address?.city || metadata.shipping_city || '',
    shippingState: shippingDetails?.address?.state || metadata.shipping_state || undefined,
    shippingZip: shippingDetails?.address?.postal_code || metadata.shipping_zip || '',
    shippingCountry: shippingDetails?.address?.country || metadata.shipping_country || '',
    subtotal: subtotal.toFixed(2),
    shippingTotal: shippingTotal.toFixed(2),
    total: total.toFixed(2),
    notes: `Stripe Payment ID: ${session.payment_intent}`,
  });

  // Create order items
  const orderItemsData = cartItems.map(item => ({
    orderId: order.id,
    productId: item.productId,
    productName: item.name,
    quantity: item.quantity,
    price: item.price,
  }));
  await db.createOrderItems(orderItemsData);

  // Clear cart
  await db.clearCart(userId, cartSessionId);

  // Notify owner
  const itemsList = cartItems.map(item => `${item.quantity}x ${item.name}`).join(', ');
  await notifyOwner({
    title: `💳 New Paid Order: ${order.orderNumber}`,
    content: `New paid order from ${customerDetails?.name || metadata.customer_name} (${customerDetails?.email || metadata.customer_email})\n\nItems: ${itemsList}\n\nTotal: $${total.toFixed(2)}\n\nPayment ID: ${session.payment_intent}\n\nShipping to: ${shippingDetails?.address?.line1 || metadata.shipping_address}, ${shippingDetails?.address?.city || metadata.shipping_city}, ${shippingDetails?.address?.postal_code || metadata.shipping_zip}`,
  });

  console.log(`[Webhook] Order created: ${order.orderNumber}`);

  // Send enhanced order confirmation notification to owner
  // This includes all details needed for customer communication
  const customerEmail = customerDetails?.email || metadata.customer_email;
  const customerName = customerDetails?.name || metadata.customer_name;
  const shippingAddress = [
    shippingDetails?.address?.line1 || metadata.shipping_address,
    shippingDetails?.address?.line2,
    shippingDetails?.address?.city || metadata.shipping_city,
    shippingDetails?.address?.state || metadata.shipping_state,
    shippingDetails?.address?.postal_code || metadata.shipping_zip,
    shippingDetails?.address?.country || metadata.shipping_country,
  ].filter(Boolean).join(', ');

  // Send detailed order confirmation notification
  await notifyOwner({
    title: `📧 Order Confirmation Ready: ${order.orderNumber}`,
    content: `**Order Confirmation Details**\n\n` +
      `**Customer:** ${customerName}\n` +
      `**Email:** ${customerEmail}\n` +
      `**Order Number:** ${order.orderNumber}\n\n` +
      `**Items Ordered:**\n${cartItems.map(item => `• ${item.quantity}x ${item.name} - $${(parseFloat(item.price) * item.quantity).toFixed(2)}`).join('\n')}\n\n` +
      `**Order Total:** $${total.toFixed(2)}\n\n` +
      `**Shipping Address:**\n${shippingAddress}\n\n` +
      `**Estimated Delivery:** 6-20 business days\n\n` +
      `---\n` +
      `You can send a confirmation email to the customer at: ${customerEmail}`,
  });

  console.log(`[Webhook] Order confirmation notification sent for: ${customerEmail}`);

  // Sync order to CJ Dropshipping
  try {
    // Get product slugs for CJ mapping
    const productsWithSlugs = await Promise.all(
      cartItems.map(async (item) => {
        const product = await db.getProductById(item.productId);
        return {
          productId: item.productId,
          productSlug: product?.slug || '',
          quantity: item.quantity,
          price: parseFloat(item.price),
        };
      })
    );

    const cjResult = await createCJOrder(
      order.orderNumber,
      productsWithSlugs,
      {
        fullName: customerDetails?.name || metadata.customer_name || '',
        email: customerDetails?.email || metadata.customer_email || '',
        phone: customerDetails?.phone || '',
        address: shippingDetails?.address?.line1 || metadata.shipping_address || '',
        city: shippingDetails?.address?.city || metadata.shipping_city || '',
        state: shippingDetails?.address?.state || metadata.shipping_state || '',
        zipCode: shippingDetails?.address?.postal_code || metadata.shipping_zip || '',
        country: shippingDetails?.address?.country || metadata.shipping_country || 'United States',
        countryCode: shippingDetails?.address?.country || 'US',
      }
    );

    if (cjResult.success) {
      console.log(`[Webhook] Order synced to CJ Dropshipping: ${cjResult.cjOrderId}`);
      await notifyOwner({
        title: `📦 CJ Order Synced: ${order.orderNumber}`,
        content: `Order ${order.orderNumber} has been automatically synced to CJ Dropshipping.\n\nCJ Order ID: ${cjResult.cjOrderId}\n\nThe order will be processed and shipped by CJ Dropshipping.`,
      });
    } else {
      console.error(`[Webhook] Failed to sync to CJ: ${cjResult.error}`);
      await notifyOwner({
        title: `⚠️ CJ Sync Failed: ${order.orderNumber}`,
        content: `Order ${order.orderNumber} could not be automatically synced to CJ Dropshipping.\n\nError: ${cjResult.error}\n\nPlease manually create this order in CJ Dropshipping.`,
      });
    }
  } catch (cjError) {
    console.error('[Webhook] CJ sync error:', cjError);
    await notifyOwner({
      title: `⚠️ CJ Sync Error: ${order.orderNumber}`,
      content: `An error occurred while syncing order ${order.orderNumber} to CJ Dropshipping.\n\nPlease manually create this order in CJ Dropshipping.`,
    });
  }
}
