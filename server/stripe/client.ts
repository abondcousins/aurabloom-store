import Stripe from 'stripe';

// Initialize Stripe with secret key from environment
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.warn('[Stripe] STRIPE_SECRET_KEY not configured. Payment features will be disabled.');
}

export const stripe = stripeSecretKey 
  ? new Stripe(stripeSecretKey)
  : null;

export function isStripeConfigured(): boolean {
  return !!stripe;
}
