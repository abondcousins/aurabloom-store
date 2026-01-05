# Stripe Setup - Quick Start Guide

## 🚀 5-Minute Quick Start

### Current Status
✅ **Test Mode Active** - Ready to test payments with fake cards

### Go Live in 3 Steps

#### Step 1: Get Live API Keys (2 min)
1. Go to [https://dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)
2. Switch to "Live mode" (toggle in top right)
3. Copy your live keys:
   - **Publishable Key:** `pk_live_...`
   - **Secret Key:** `sk_live_...`

#### Step 2: Update Environment Variables (1 min)
1. Go to AuraBloom Management UI → Settings → Secrets
2. Update these two variables:
   ```
   STRIPE_SECRET_KEY = sk_live_YOUR_KEY_HERE
   VITE_STRIPE_PUBLISHABLE_KEY = pk_live_YOUR_KEY_HERE
   ```
3. Click Save (server will restart automatically)

#### Step 3: Test Live Payment (2 min)
1. Visit your store: [https://3000-inuqfwm97w05qznh45fye-16d82eb6.us1.manus.computer](https://3000-inuqfwm97w05qznh45fye-16d82eb6.us1.manus.computer)
2. Add product to cart → Checkout
3. Use a real test card (e.g., `4242 4242 4242 4242`)
4. Complete payment
5. Verify order in admin dashboard

---

## 📋 Test Cards

| Scenario | Card | Expiry | CVC |
|----------|------|--------|-----|
| Success | 4242 4242 4242 4242 | Any future | Any 3 |
| Decline | 4000 0000 0000 0002 | Any future | Any 3 |
| 3D Secure | 4000 0025 0000 3155 | Any future | Any 3 |

---

## 🔑 API Keys Location

| Mode | Publishable Key | Secret Key |
|------|-----------------|-----------|
| **Test** | `pk_test_...` | `sk_test_...` |
| **Live** | `pk_live_...` | `sk_live_...` |

**Get them here:** [https://dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)

---

## ⚙️ Environment Variables

### Current (Test Mode)
```
STRIPE_SECRET_KEY = sk_test_...
VITE_STRIPE_PUBLISHABLE_KEY = pk_test_...
STRIPE_WEBHOOK_SECRET = whsec_test_...
```

### After Going Live
```
STRIPE_SECRET_KEY = sk_live_...
VITE_STRIPE_PUBLISHABLE_KEY = pk_live_...
STRIPE_WEBHOOK_SECRET = whsec_live_...
```

---

## 🧪 Testing Checklist

- [ ] Add product to cart
- [ ] Go to checkout
- [ ] Enter test card number
- [ ] Complete payment
- [ ] See order confirmation
- [ ] Check admin dashboard
- [ ] Verify CJ Dropshipping sync
- [ ] Check email notification

---

## 🔗 Important Links

| Link | Purpose |
|------|---------|
| [Stripe Dashboard](https://dashboard.stripe.com) | Main control panel |
| [API Keys](https://dashboard.stripe.com/apikeys) | Get your keys |
| [Payments](https://dashboard.stripe.com/payments) | View transactions |
| [Webhooks](https://dashboard.stripe.com/webhooks) | Webhook management |
| [Settings](https://dashboard.stripe.com/settings) | Account settings |

---

## ❓ Common Issues

**Q: Payment declined?**  
A: Use test card `4242 4242 4242 4242` in test mode

**Q: Order not created?**  
A: Check webhook is registered and signing secret is correct

**Q: Can't find API keys?**  
A: Go to [https://dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys) and make sure you're in the right mode (test vs live)

**Q: Want more details?**  
A: Read the full guide: `docs/STRIPE_SETUP_GUIDE.md`

---

## 📞 Support

- **Stripe Help:** [https://support.stripe.com](https://support.stripe.com)
- **Full Guide:** `docs/STRIPE_SETUP_GUIDE.md`
- **Code:** `server/routes.ts` (webhook handler)

---

**Ready? Start with Step 1 above! 🎉**
