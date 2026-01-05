# Complete Stripe Setup Guide for AuraBloom

This guide walks you through setting up Stripe payments for your AuraBloom e-commerce store, from test mode configuration to live payment activation.

## Table of Contents

1. [Current Setup Status](#current-setup-status)
2. [Understanding Test vs Live Mode](#understanding-test-vs-live-mode)
3. [Test Mode Configuration](#test-mode-configuration)
4. [Live Payment Activation](#live-payment-activation)
5. [Webhook Configuration](#webhook-configuration)
6. [Testing Payment Flows](#testing-payment-flows)
7. [Troubleshooting](#troubleshooting)
8. [Security Best Practices](#security-best-practices)

---

## Current Setup Status

Your AuraBloom store is currently configured with **Stripe Test Mode**. This means:

- ✅ All transactions are simulated (no real money charged)
- ✅ You can test the full payment flow without risk
- ✅ Test cards are available for different scenarios
- ✅ Webhooks are configured to sync orders to CJ Dropshipping
- ⚠️ Real customers cannot make purchases yet

### Current Configuration

| Setting | Value |
|---------|-------|
| **Mode** | Test (Sandbox) |
| **Publishable Key** | `pk_test_*` (stored in VITE_STRIPE_PUBLISHABLE_KEY) |
| **Secret Key** | `sk_test_*` (stored in STRIPE_SECRET_KEY) |
| **Webhook Secret** | Configured in STRIPE_WEBHOOK_SECRET |
| **Status** | ✅ Working - Ready to test |

---

## Understanding Test vs Live Mode

### Test Mode (Current)
- **Purpose:** Development, testing, and learning
- **Transactions:** Simulated, no real charges
- **Cards:** Use test card numbers (provided below)
- **Data:** Isolated from live data
- **Fees:** None (no real transactions)
- **Best For:** Development, QA, training

### Live Mode (Production)
- **Purpose:** Accept real customer payments
- **Transactions:** Real money charged to customers
- **Cards:** Real credit/debit cards
- **Data:** Integrated with your business account
- **Fees:** Standard Stripe processing fees (2.9% + $0.30 per transaction)
- **Best For:** Production e-commerce store

---

## Test Mode Configuration

### Test Mode is Already Active

Your store is ready to test. Here's what you need to know:

#### Test Card Numbers

Use these card numbers to test different payment scenarios:

| Scenario | Card Number | Expiry | CVC |
|----------|-------------|--------|-----|
| **Successful Payment** | 4242 4242 4242 4242 | Any future date | Any 3 digits |
| **Declined Payment** | 4000 0000 0000 0002 | Any future date | Any 3 digits |
| **Insufficient Funds** | 4000 0000 0000 9995 | Any future date | Any 3 digits |
| **Lost Card** | 4000 0000 0000 9987 | Any future date | Any 3 digits |
| **Stolen Card** | 4000 0000 0000 9979 | Any future date | Any 3 digits |
| **3D Secure Required** | 4000 0025 0000 3155 | Any future date | Any 3 digits |

#### Test Mode Dashboard

1. Go to [https://dashboard.stripe.com/test/dashboard](https://dashboard.stripe.com/test/dashboard)
2. You'll see "Viewing test data" at the top
3. All transactions here are simulated
4. Use the toggle in the top right to switch between test and live mode (when available)

#### Testing the Checkout Flow

1. Visit your AuraBloom store: [https://3000-inuqfwm97w05qznh45fye-16d82eb6.us1.manus.computer](https://3000-inuqfwm97w05qznh45fye-16d82eb6.us1.manus.computer)
2. Add products to your cart
3. Click "Checkout"
4. Enter test card details (e.g., 4242 4242 4242 4242)
5. Use any future expiry date and any 3-digit CVC
6. Complete the purchase
7. You should see an order confirmation
8. Check your admin dashboard for the new order

### Viewing Test Transactions

1. Go to [https://dashboard.stripe.com/test/payments](https://dashboard.stripe.com/test/payments)
2. You'll see all test transactions
3. Click on any payment to see details
4. Verify the amount, customer info, and status

---

## Live Payment Activation

### Step 1: Prepare Your Stripe Account

Before going live, ensure your Stripe account is fully set up:

1. **Complete Your Business Profile**
   - Go to [https://dashboard.stripe.com/settings/account](https://dashboard.stripe.com/settings/account)
   - Fill in your business details
   - Add your business address
   - Verify your phone number

2. **Add Banking Information**
   - Go to [https://dashboard.stripe.com/settings/payouts](https://dashboard.stripe.com/settings/payouts)
   - Add your bank account for payouts
   - Verify the account (Stripe will deposit small amounts to verify)

3. **Enable Payment Methods**
   - Go to [https://dashboard.stripe.com/settings/payment_methods](https://dashboard.stripe.com/settings/payment_methods)
   - Enable credit/debit cards
   - Consider enabling other payment methods (Apple Pay, Google Pay, etc.)

### Step 2: Generate Live API Keys

1. **Access API Keys**
   - Go to [https://dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)
   - You should see both "Test mode" and "Live mode" sections

2. **Copy Live Keys**
   - In the "Live mode" section, copy:
     - **Publishable key** (starts with `pk_live_`)
     - **Secret key** (starts with `sk_live_`)
   - Keep these secure - never share them publicly

3. **Restricted API Keys (Recommended)**
   - For enhanced security, create restricted keys:
   - Go to [https://dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)
   - Click "Create restricted key"
   - Grant only necessary permissions:
     - `read` and `write` on Charges
     - `read` and `write` on Customers
     - `read` and `write` on Invoices
     - `read` on Events (for webhooks)

### Step 3: Update AuraBloom Configuration

#### Option A: Using Manus Management UI (Recommended)

1. Go to your AuraBloom project settings
2. Click "Settings" → "Secrets"
3. Update these environment variables:

   ```
   STRIPE_SECRET_KEY = sk_live_YOUR_LIVE_SECRET_KEY
   VITE_STRIPE_PUBLISHABLE_KEY = pk_live_YOUR_LIVE_PUBLISHABLE_KEY
   ```

4. Keep `STRIPE_WEBHOOK_SECRET` unchanged (unless you're creating a new webhook)
5. Save and restart the server

#### Option B: Manual Environment Variable Update

If updating via the Manus UI, the system will automatically:
1. Update the environment variables
2. Restart the development server
3. Apply changes to the running application

### Step 4: Update Webhook Endpoint

Your webhook endpoint needs to be registered with Stripe:

1. **Get Your Webhook URL**
   - Your AuraBloom store URL: `https://3000-inuqfwm97w05qznh45fye-16d82eb6.us1.manus.computer`
   - Webhook endpoint: `https://3000-inuqfwm97w05qznh45fye-16d82eb6.us1.manus.computer/api/stripe-webhook`

2. **Register Webhook in Stripe Dashboard**
   - Go to [https://dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
   - Click "Add endpoint"
   - Enter your webhook URL: `https://3000-inuqfwm97w05qznh45fye-16d82eb6.us1.manus.computer/api/stripe-webhook`
   - Select events to listen for:
     - `charge.succeeded`
     - `charge.failed`
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
   - Click "Add endpoint"
   - Copy the webhook signing secret
   - Update `STRIPE_WEBHOOK_SECRET` in your environment variables

3. **Test the Webhook**
   - In Stripe Dashboard, go to your webhook
   - Click "Send test webhook"
   - Verify it receives a 200 response

### Step 5: Verify Live Mode is Active

1. **Check Dashboard**
   - Go to [https://dashboard.stripe.com/dashboard](https://dashboard.stripe.com/dashboard)
   - Look for "Viewing live data" at the top (not "Viewing test data")

2. **Test a Live Transaction**
   - Use a real test credit card (Stripe provides test cards that work in live mode)
   - Process a small transaction
   - Verify it appears in your Stripe dashboard

3. **Monitor Transactions**
   - Go to [https://dashboard.stripe.com/payments](https://dashboard.stripe.com/payments)
   - You should see real transactions here

---

## Webhook Configuration

### What Are Webhooks?

Webhooks are HTTP callbacks that notify your application when events happen in Stripe. For AuraBloom, webhooks:

1. **Notify your store** when a payment succeeds
2. **Trigger CJ Dropshipping order creation** automatically
3. **Update order status** in your database
4. **Send owner notifications** to abondcousins@gmail.com

### Current Webhook Setup

Your AuraBloom store has webhooks configured to handle:

| Event | Action |
|-------|--------|
| `charge.succeeded` | Create order in database, sync to CJ Dropshipping |
| `charge.failed` | Log failure, notify owner |
| `payment_intent.succeeded` | Update order status |
| `payment_intent.payment_failed` | Handle payment failure |

### Webhook Endpoint Code

The webhook is handled in `server/routes.ts`:

```typescript
// Webhook endpoint that Stripe calls
app.post('/api/stripe-webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(
    req.body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET
  );

  if (event.type === 'charge.succeeded') {
    // Create order in database
    // Sync to CJ Dropshipping
    // Send owner notification
  }
});
```

### Testing Webhooks

1. **In Stripe Dashboard**
   - Go to [https://dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
   - Find your webhook endpoint
   - Click "Send test webhook"
   - Select an event type (e.g., `charge.succeeded`)
   - Click "Send test webhook"

2. **Check Your Logs**
   - Go to your AuraBloom admin dashboard
   - Check the orders section
   - Verify the test order was created

3. **Monitor Webhook Deliveries**
   - In Stripe Dashboard, click your webhook
   - Scroll to "Events"
   - You'll see all webhook deliveries
   - Click on any event to see details and response

---

## Testing Payment Flows

### Complete Test Scenario

Follow this checklist to test the entire payment flow:

#### 1. Test Successful Payment
- [ ] Add products to cart
- [ ] Go to checkout
- [ ] Enter test card: `4242 4242 4242 4242`
- [ ] Enter any future expiry date
- [ ] Enter any 3-digit CVC
- [ ] Complete payment
- [ ] Verify order confirmation page
- [ ] Check admin dashboard for order
- [ ] Verify CJ Dropshipping sync

#### 2. Test Failed Payment
- [ ] Add products to cart
- [ ] Go to checkout
- [ ] Enter test card: `4000 0000 0000 0002`
- [ ] Try to complete payment
- [ ] Verify payment is declined
- [ ] Check error message is displayed

#### 3. Test 3D Secure (if applicable)
- [ ] Add products to cart
- [ ] Go to checkout
- [ ] Enter test card: `4000 0025 0000 3155`
- [ ] Complete payment
- [ ] Verify 3D Secure challenge appears
- [ ] Complete authentication
- [ ] Verify payment succeeds

#### 4. Test Order Confirmation Email
- [ ] Complete a successful payment
- [ ] Check your email for order confirmation
- [ ] Verify all order details are correct
- [ ] Verify CJ Dropshipping order number is included

#### 5. Test Admin Dashboard
- [ ] Log in to admin dashboard
- [ ] Go to Orders section
- [ ] Verify new order appears
- [ ] Check order status
- [ ] Verify CJ Dropshipping tracking information

### Monitoring Live Transactions

Once live, monitor transactions regularly:

1. **Daily Review**
   - Go to [https://dashboard.stripe.com/payments](https://dashboard.stripe.com/payments)
   - Review all transactions
   - Check for any failed payments

2. **Weekly Reports**
   - Go to [https://dashboard.stripe.com/reports/overview](https://dashboard.stripe.com/reports/overview)
   - Review revenue trends
   - Check average transaction value
   - Monitor conversion rates

3. **Set Up Alerts**
   - Go to [https://dashboard.stripe.com/settings/notifications](https://dashboard.stripe.com/settings/notifications)
   - Enable email alerts for:
     - Large transactions
     - Failed payments
     - Suspicious activity

---

## Troubleshooting

### Payment Declined Errors

**Problem:** Customers see "Payment declined" error

**Solutions:**
1. Verify the card number is correct
2. Check expiry date hasn't passed
3. Ensure CVC is correct
4. Try a different card
5. Contact Stripe support if issue persists

### Webhook Not Triggering

**Problem:** Orders aren't being created after payment

**Solutions:**
1. Verify webhook endpoint is registered in Stripe Dashboard
2. Check webhook signing secret is correct in environment variables
3. Verify endpoint URL is accessible (not behind firewall)
4. Check Stripe Dashboard webhook logs for errors
5. Restart your application server

### Test Cards Not Working

**Problem:** Test card numbers are being rejected

**Solutions:**
1. Ensure you're in test mode (not live mode)
2. Use correct test card numbers from the table above
3. Use any future expiry date (e.g., 12/25)
4. Use any 3-digit CVC (e.g., 123)
5. Clear browser cache and try again

### Live Mode Not Activating

**Problem:** Can't switch to live mode in Stripe Dashboard

**Solutions:**
1. Complete your Stripe account verification
2. Add banking information for payouts
3. Accept Stripe's terms and conditions
4. Wait for account review (can take 24-48 hours)
5. Contact Stripe support if still blocked

### Orders Not Syncing to CJ Dropshipping

**Problem:** Payments succeed but orders don't appear in CJ

**Solutions:**
1. Verify CJ API key is correct in environment variables
2. Check CJ product variant IDs are mapped correctly
3. Verify webhook is triggering (check logs)
4. Ensure CJ API is responding (check CJ Dashboard)
5. Review error logs in your application

---

## Security Best Practices

### API Keys Security

1. **Never Commit Keys to Git**
   - ✅ Store in environment variables
   - ✅ Use Manus Secrets management
   - ❌ Never hardcode in source files
   - ❌ Never commit to GitHub

2. **Rotate Keys Regularly**
   - Generate new keys every 90 days
   - Revoke old keys after rotation
   - Keep a log of key rotations

3. **Use Restricted Keys**
   - Create separate keys for different purposes
   - Grant minimum necessary permissions
   - Use restricted keys for frontend (if needed)

### Webhook Security

1. **Verify Webhook Signatures**
   - Always verify webhook signatures using `STRIPE_WEBHOOK_SECRET`
   - Reject unsigned webhooks
   - Log all webhook events

2. **Use HTTPS Only**
   - Ensure webhook endpoint is HTTPS
   - Use valid SSL certificate
   - Redirect HTTP to HTTPS

3. **Implement Idempotency**
   - Handle duplicate webhook events gracefully
   - Store webhook event IDs to prevent double-processing
   - Implement retry logic for failed webhooks

### Payment Data Security

1. **PCI Compliance**
   - Never store raw credit card data
   - Use Stripe's tokenization for card data
   - Implement PCI DSS compliance measures

2. **Encryption**
   - Encrypt sensitive data in database
   - Use HTTPS for all communications
   - Implement TLS 1.2 or higher

3. **Access Control**
   - Restrict admin dashboard access
   - Use strong passwords
   - Enable two-factor authentication
   - Implement role-based access control

### Monitoring & Alerts

1. **Set Up Alerts**
   - Large transactions
   - Failed payments
   - Unusual patterns
   - Webhook failures

2. **Regular Audits**
   - Review transaction logs weekly
   - Check for suspicious activity
   - Monitor failed payment rates
   - Track refund requests

3. **Incident Response**
   - Have a plan for security incidents
   - Document all incidents
   - Review and improve processes
   - Communicate with customers if needed

---

## Additional Resources

### Stripe Documentation
- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe Payments Documentation](https://stripe.com/docs/payments)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Test Mode Guide](https://stripe.com/docs/testing)

### AuraBloom Implementation
- **Stripe Integration Code:** `server/routes.ts`
- **Webhook Handler:** `server/routes.ts` (POST `/api/stripe-webhook`)
- **CJ Sync Logic:** `server/cj/orderSync.ts`
- **Tests:** `server/stripe.test.ts`

### Support
- **Stripe Support:** [https://support.stripe.com](https://support.stripe.com)
- **AuraBloom Owner Email:** abondcousins@gmail.com
- **GitHub Repository:** [https://github.com/abondcousins/aurabloom-store](https://github.com/abondcousins/aurabloom-store)

---

## Checklist: Going Live with Stripe

Use this checklist to ensure everything is ready for live payments:

- [ ] Stripe account fully verified and activated
- [ ] Business profile completed
- [ ] Banking information added and verified
- [ ] Live API keys generated
- [ ] Live API keys updated in environment variables
- [ ] Webhook endpoint registered in Stripe Dashboard
- [ ] Webhook signing secret updated in environment variables
- [ ] Application restarted with new keys
- [ ] Test transaction completed successfully
- [ ] Order appears in admin dashboard
- [ ] Order synced to CJ Dropshipping
- [ ] Owner notification email received
- [ ] Webhook logs show successful delivery
- [ ] All tests passing (pnpm test)
- [ ] Security audit completed
- [ ] Alerts configured in Stripe Dashboard
- [ ] Documentation reviewed and updated
- [ ] Team trained on payment processes
- [ ] Backup and disaster recovery plan in place
- [ ] Ready to accept real customer payments ✅

---

## Next Steps

1. **Complete Stripe Account Setup** - Finish verification and add banking info
2. **Generate Live API Keys** - Get your pk_live and sk_live keys
3. **Update Environment Variables** - Use Manus Secrets management
4. **Test Live Transactions** - Process a test payment
5. **Monitor and Optimize** - Track metrics and improve conversion

For questions or issues, refer to the [Stripe Support](https://support.stripe.com) or contact your AuraBloom team.

---

**Last Updated:** January 4, 2026  
**Version:** 1.0  
**Status:** Ready for Implementation
