# Stripe Implementation Details for AuraBloom

## Architecture Overview

```
Customer → AuraBloom Store → Stripe Checkout → Payment Processing
                                    ↓
                            Webhook Notification
                                    ↓
                    Order Created in Database
                                    ↓
                    CJ Dropshipping Order Sync
                                    ↓
                    Owner Email Notification
```

---

## Current Implementation

### Frontend Integration

**Location:** `client/src/pages/Checkout.tsx`

The checkout page integrates Stripe's hosted checkout:

```typescript
// Redirect to Stripe Checkout
const response = await trpc.stripe.createCheckoutSession.useMutation();
window.location.href = response.url;
```

**Features:**
- Product details pre-filled
- Customer email captured
- Automatic redirect to Stripe's secure checkout
- Post-payment redirect to confirmation page

### Backend Integration

**Location:** `server/routers.ts` and `server/routes.ts`

#### 1. Checkout Session Creation
```typescript
// Create Stripe checkout session
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [
    {
      price_data: {
        currency: 'usd',
        product_data: {
          name: product.name,
          images: [product.image],
        },
        unit_amount: Math.round(product.price * 100),
      },
      quantity: 1,
    },
  ],
  mode: 'payment',
  success_url: `${baseUrl}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${baseUrl}/cart`,
});
```

#### 2. Webhook Handler
```typescript
// Handle Stripe webhook
app.post('/api/stripe-webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(
    req.body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET
  );

  if (event.type === 'charge.succeeded') {
    // 1. Create order in database
    // 2. Sync to CJ Dropshipping
    // 3. Send owner notification
  }
});
```

#### 3. Order Confirmation
```typescript
// Retrieve session details and create order
const session = await stripe.checkout.sessions.retrieve(sessionId);
const order = await db.orders.create({
  customerId: session.customer_email,
  amount: session.amount_total,
  stripeSessionId: sessionId,
  status: 'completed',
});
```

---

## Database Schema

### Orders Table

```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  customerId VARCHAR(255),
  customerEmail VARCHAR(255),
  amount INTEGER,
  status VARCHAR(50),
  stripeSessionId VARCHAR(255),
  stripePaymentIntentId VARCHAR(255),
  cjOrderId VARCHAR(255),
  cjTrackingNumber VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  items JSON,
  shippingAddress JSON,
  metadata JSON
);
```

### CJ Mapping Table

```sql
CREATE TABLE cjProductMappings (
  id SERIAL PRIMARY KEY,
  productId INTEGER,
  cjProductId VARCHAR(255),
  cjVariantId VARCHAR(255),
  cjProductName VARCHAR(255),
  costPrice DECIMAL(10, 2),
  shippingCost DECIMAL(10, 2),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Payment Flow Sequence

### Step 1: Customer Initiates Checkout
```
Customer clicks "Checkout" button
↓
Cart data sent to backend
↓
Stripe checkout session created
↓
Customer redirected to Stripe checkout page
```

### Step 2: Customer Completes Payment
```
Customer enters card details
↓
Stripe processes payment
↓
Payment succeeds or fails
↓
Customer redirected to success/cancel URL
```

### Step 3: Webhook Processing
```
Stripe sends webhook event
↓
Webhook signature verified
↓
Order created in database
↓
CJ Dropshipping order created
↓
Tracking number stored
↓
Owner notification sent
```

### Step 4: Order Confirmation
```
Customer sees confirmation page
↓
Order details displayed
↓
Confirmation email sent
↓
Admin dashboard updated
```

---

## Environment Variables Required

### Test Mode
```bash
STRIPE_SECRET_KEY=sk_test_YOUR_TEST_SECRET_KEY
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_TEST_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET=whsec_test_YOUR_TEST_WEBHOOK_SECRET
```

### Live Mode
```bash
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET=whsec_live_YOUR_LIVE_WEBHOOK_SECRET
```

---

## Webhook Events Handled

| Event | Action |
|-------|--------|
| `charge.succeeded` | Create order, sync to CJ, send notification |
| `charge.failed` | Log failure, notify owner |
| `payment_intent.succeeded` | Update order status |
| `payment_intent.payment_failed` | Handle payment failure |
| `checkout.session.completed` | Verify session, create order |

---

## Error Handling

### Payment Failures
```typescript
if (event.type === 'charge.failed') {
  // Log the failure
  console.error('Payment failed:', event.data.object);
  
  // Notify owner
  await notifyOwner({
    title: 'Payment Failed',
    content: `Order ${orderId} payment failed: ${event.data.object.failure_message}`
  });
  
  // Update order status
  await db.orders.update(orderId, { status: 'failed' });
}
```

### CJ Sync Failures
```typescript
try {
  await syncOrderToCJ(order);
} catch (error) {
  console.error('CJ sync failed:', error);
  
  // Retry logic
  await retryQueue.add({
    orderId: order.id,
    retryCount: 0,
    maxRetries: 3
  });
  
  // Notify owner
  await notifyOwner({
    title: 'CJ Sync Failed',
    content: `Order ${order.id} failed to sync to CJ Dropshipping`
  });
}
```

---

## Testing Strategy

### Unit Tests
```bash
# Run Stripe tests
pnpm test server/stripe.test.ts

# Test webhook handling
pnpm test server/cj.test.ts
```

### Integration Tests
```bash
# Test complete payment flow
1. Add product to cart
2. Go to checkout
3. Enter test card: 4242 4242 4242 4242
4. Complete payment
5. Verify order created
6. Verify CJ sync
7. Verify email sent
```

### Manual Testing
```bash
# Test in Stripe Dashboard
1. Go to https://dashboard.stripe.com/test/payments
2. View test transactions
3. Click on transaction to see details
4. Verify webhook logs
```

---

## Security Implementation

### Webhook Signature Verification
```typescript
// Verify webhook is from Stripe
const sig = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(
  req.body,
  sig,
  process.env.STRIPE_WEBHOOK_SECRET
);
```

### PCI Compliance
- ✅ Never store raw card data
- ✅ Use Stripe's tokenization
- ✅ HTTPS only for all communications
- ✅ Implement rate limiting
- ✅ Log all transactions

### API Key Security
- ✅ Store keys in environment variables
- ✅ Never commit keys to git
- ✅ Use restricted keys where possible
- ✅ Rotate keys regularly
- ✅ Monitor key usage

---

## Monitoring & Logging

### Transaction Logging
```typescript
// Log all transactions
const logTransaction = (event) => {
  console.log({
    timestamp: new Date(),
    eventType: event.type,
    amount: event.data.object.amount,
    currency: event.data.object.currency,
    status: event.data.object.status,
    customerId: event.data.object.customer
  });
};
```

### Error Tracking
```typescript
// Track errors
const trackError = (error, context) => {
  console.error({
    timestamp: new Date(),
    error: error.message,
    context,
    stack: error.stack
  });
};
```

### Metrics to Monitor
- Transaction success rate
- Average transaction value
- Failed payment rate
- Webhook delivery rate
- CJ sync success rate
- Email notification delivery rate

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing (pnpm test)
- [ ] Environment variables configured
- [ ] Webhook endpoint registered
- [ ] SSL certificate valid
- [ ] Rate limiting configured
- [ ] Error logging configured
- [ ] Monitoring alerts set up

### Deployment
- [ ] Code deployed to production
- [ ] Environment variables updated
- [ ] Server restarted
- [ ] Webhook endpoint verified
- [ ] Test transaction processed
- [ ] Order created successfully
- [ ] CJ sync verified
- [ ] Email notification received

### Post-Deployment
- [ ] Monitor transaction success rate
- [ ] Check webhook delivery logs
- [ ] Monitor error rates
- [ ] Verify CJ sync working
- [ ] Check email notifications
- [ ] Monitor customer feedback
- [ ] Review transaction logs daily

---

## Troubleshooting Guide

### Webhook Not Triggering
1. Check webhook endpoint is registered in Stripe Dashboard
2. Verify webhook signing secret is correct
3. Check endpoint URL is accessible
4. Review webhook logs in Stripe Dashboard
5. Test webhook manually from Stripe Dashboard

### Order Not Created
1. Check webhook is receiving events
2. Verify database connection
3. Check error logs for exceptions
4. Verify order creation code
5. Test database insert manually

### CJ Sync Failing
1. Verify CJ API key is correct
2. Check CJ product IDs are mapped
3. Verify CJ API is responding
4. Check error logs for CJ errors
5. Retry sync manually from admin dashboard

### Email Not Sending
1. Verify email service is configured
2. Check owner email address is correct
3. Verify email template is correct
4. Check email service logs
5. Test email manually

---

## Performance Optimization

### Webhook Processing
```typescript
// Process webhooks asynchronously
const processWebhook = async (event) => {
  // Queue for async processing
  await webhookQueue.add({
    eventId: event.id,
    eventType: event.type,
    data: event.data
  });
};
```

### Database Queries
```typescript
// Use indexes for common queries
CREATE INDEX idx_orders_customerId ON orders(customerId);
CREATE INDEX idx_orders_stripeSessionId ON orders(stripeSessionId);
CREATE INDEX idx_cjMappings_productId ON cjProductMappings(productId);
```

### Caching
```typescript
// Cache product data
const getProduct = async (id) => {
  const cached = await cache.get(`product:${id}`);
  if (cached) return cached;
  
  const product = await db.products.findById(id);
  await cache.set(`product:${id}`, product, 3600); // 1 hour
  return product;
};
```

---

## Scaling Considerations

### High Transaction Volume
- Implement queue-based webhook processing
- Use database connection pooling
- Add caching layer (Redis)
- Implement rate limiting
- Monitor and scale infrastructure

### Multiple Currencies
- Stripe supports multiple currencies
- Update checkout session creation
- Store currency in order record
- Handle currency conversion

### Multiple Payment Methods
- Stripe supports cards, Apple Pay, Google Pay
- Update payment method configuration
- Handle different payment flows
- Test each payment method

---

## References

- **Stripe API Docs:** https://stripe.com/docs/api
- **Stripe Payments:** https://stripe.com/docs/payments
- **Stripe Webhooks:** https://stripe.com/docs/webhooks
- **Stripe Testing:** https://stripe.com/docs/testing
- **Implementation Code:** `server/routes.ts`, `server/routers.ts`
- **Tests:** `server/stripe.test.ts`, `server/cj.test.ts`

---

**Last Updated:** January 4, 2026  
**Version:** 1.0  
**Status:** Production Ready
