# AuraBloom: Curated Self-Care E-Commerce Store

A complete dropshipping e-commerce platform for AuraBloom, a self-care products brand specializing in trending viral beauty and wellness products.

**Live Site:** [https://3000-inuqfwm97w05qznh45fye-16d82eb6.us1.manus.computer](https://3000-inuqfwm97w05qznh45fye-16d82eb6.us1.manus.computer)

## 🎯 Project Overview

AuraBloom is a modern, mobile-first e-commerce platform featuring:
- **Soft luxury aesthetic** with pink hues and feminine typography
- **4 trending self-care products** validated through market research
- **Automated order fulfillment** via CJ Dropshipping API
- **Secure payments** through Stripe integration (test mode)
- **Admin dashboard** for order management and inventory control
- **Responsive design** optimized for mobile and desktop

### Brand Tagline
> "Curated Self-Care. Real Results, Real Fast."

## 📦 Featured Products

1. **LED Photon Therapy Mask** - $79.99
   - Advanced light therapy for skin rejuvenation
   - 6-13 day shipping from CJ Dropshipping
   - Profit margin: ~$35-40 per unit

2. **Collagen Overnight Wrapping Mask** - $34.99
   - Intensive hydration and anti-aging treatment
   - Fast fulfillment with CJ integration
   - Profit margin: ~$15-18 per unit

3. **Peel-Off Lip Stain Trio** - $24.99
   - Set of 3 long-lasting lip colors
   - Quick shipping and high demand
   - Profit margin: ~$10-12 per unit

4. **Flame Effect Aromatherapy Diffuser** - $39.99
   - Decorative essential oil diffuser with flame effect
   - Trending home wellness product
   - Profit margin: ~$18-22 per unit

5. **Glow-Up Bundle** - $93.00 (Save $40)
   - LED Mask + Collagen Mask combo
   - Premium bundle offering
   - Profit margin: ~$45-50 per unit

## 🛠 Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS 4
- **Backend:** Express.js, tRPC 11
- **Database:** PostgreSQL with Drizzle ORM
- **Payments:** Stripe (test mode configured)
- **Fulfillment:** CJ Dropshipping API integration
- **Hosting:** Manus platform

## 🚀 Key Features

### E-Commerce
- Product catalog with category filtering
- Product detail pages with image galleries
- Customer reviews and ratings
- Shopping cart with session persistence
- Secure checkout flow
- Order confirmation page

### Payments & Fulfillment
- Stripe payment gateway (test mode)
- Automatic order sync to CJ Dropshipping
- Tracking number sync from CJ to store
- Owner email notifications on new orders
- Order status management

### Admin Dashboard
- Revenue analytics and KPIs
- Order management with status updates
- Product inventory controls
- CJ Dropshipping product mapping
- Customer management section
- Settings and integrations panel

### Brand & Design
- Custom AuraBloom logo (minimalist peony flower)
- Soft pink color palette with golden accents
- Mobile-first responsive design
- Accessibility-focused UI with shadcn/ui components
- Fast shipping badge (6-13 days)

### Pages & Navigation
- **Home:** Hero section with brand USP and featured products
- **Products:** Category-based product catalog
- **Product Details:** Full product information with reviews and gallery
- **Cart & Checkout:** Complete purchase flow
- **About Us:** Brand story, mission, and values
- **FAQ:** Comprehensive Q&A section
- **Shipping Info:** Delivery estimates and tracking information
- **Contact:** Inquiry form with email notifications
- **Admin Dashboard:** Full backend management interface

### Social Media Integration
- Instagram: [@aura_bloomwellness](https://instagram.com/aura_bloomwellness)
- Facebook: AuraBloom Wellness
- TikTok: [@aura.bloom.wellne](https://tiktok.com/@aura.bloom.wellne)

## 📁 Project Structure

```
aurabloom_store/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities (tRPC client)
│   │   └── App.tsx        # Main app routing
│   └── public/            # Static assets
├── server/                # Express backend
│   ├── routers.ts         # tRPC procedure definitions
│   ├── db.ts              # Database query helpers
│   ├── routes.ts          # API routes
│   ├── lib/               # Server utilities
│   │   └── cj-dropshipping.ts  # CJ API client
│   └── _core/             # Framework core (OAuth, auth)
├── drizzle/               # Database schema & migrations
├── docs/                  # Documentation
│   ├── research/          # Market research files
│   └── marketing/         # Marketing strategy & brand docs
├── shared/                # Shared types & constants
└── storage/               # S3 file storage helpers
```

## 🔧 Setup & Installation

### Prerequisites
- Node.js 22+
- pnpm package manager
- PostgreSQL database
- Stripe account (test mode)
- CJ Dropshipping account

### Environment Variables

Required secrets (injected by Manus platform):
```
DATABASE_URL              # PostgreSQL connection string
JWT_SECRET               # Session signing secret
STRIPE_SECRET_KEY        # Stripe API secret key
STRIPE_WEBHOOK_SECRET    # Stripe webhook signing secret
CJ_API_KEY              # CJ Dropshipping API key
VITE_STRIPE_PUBLISHABLE_KEY  # Stripe public key
```

### Installation Steps

```bash
# Install dependencies
pnpm install

# Push database migrations
pnpm db:push

# Start development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
```

## 💳 Payment Integration

### Stripe Setup (Test Mode)
The store is currently configured with Stripe test mode. To enable live payments:

1. Log in to your Stripe dashboard
2. Navigate to Settings → Payment methods
3. Add your live API keys (pk_live and sk_live)
4. Update environment variables with live keys
5. Test the payment flow with real test cards

### Test Cards (Stripe)
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Expiry: Any future date
- CVC: Any 3 digits

## 📦 CJ Dropshipping Integration

The store automatically syncs orders to CJ Dropshipping for fulfillment:

1. **Product Mapping:** Each product is mapped to a CJ variant ID
2. **Order Creation:** When a Stripe payment succeeds, an order is created in CJ
3. **Tracking Sync:** Tracking numbers from CJ are synced back to store orders
4. **Admin Management:** Admin dashboard shows CJ order status

### Product Variant IDs
- LED Mask: `[CJ_VID]`
- Collagen Mask: `[CJ_VID]`
- Lip Stain Trio: `[CJ_VID]`
- Flame Diffuser: `[CJ_VID]`
- Glow-Up Bundle: `[CJ_VID]`

## 📊 Marketing Strategy

See `docs/marketing/marketing_strategy_30_day.md` for the comprehensive 30-day launch plan.

**Key Focus Areas:**
- Hero Product: LED Photon Therapy Mask (premium positioning)
- Viral Product: Flame Effect Diffuser (trending home wellness)
- Bundle Strategy: Glow-Up Bundle for upsells
- Social Media: TikTok-first content strategy
- Email: Newsletter signup for retention

## 📚 Documentation

- **Market Research:** `docs/research/top_5_validated_products_precise.md`
- **Brand Identity:** `docs/marketing/brand_identity_proposal.md`
- **Marketing Strategy:** `docs/marketing/marketing_strategy_30_day.md`
- **CJ Integration:** `docs/marketing/cj_product_mapping.md`

## 🧪 Testing

The project includes comprehensive vitest unit tests:

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run specific test file
pnpm test server/auth.logout.test.ts
```

## 📈 Performance & Analytics

- Mobile-first responsive design
- Optimized images and lazy loading
- Fast checkout flow (< 3 steps)
- Analytics tracking via Manus platform
- Owner notifications for key events

## 🔐 Security

- Secure session management with JWT
- Protected API routes with authentication
- Stripe webhook signature verification
- Environment variable isolation
- HTTPS only in production

## 🎨 Design System

### Color Palette
- **Primary:** Dusty Pink (#E8B4C8)
- **Accent:** Golden (#D4AF37)
- **Background:** Soft White (#FAFAF8)
- **Text:** Dark Charcoal (#2C2C2C)

### Typography
- **Headings:** Playfair Display (serif)
- **Body:** Inter (sans-serif)
- **Accents:** Cormorant Garamond (serif)

### Spacing & Layout
- Mobile-first responsive design
- 4px base spacing unit
- Consistent padding and margins
- Flexible grid system with Tailwind

## 📞 Contact & Support

**Store Owner:** abondcousins@gmail.com

**Social Media:**
- Instagram: [@aura_bloomwellness](https://instagram.com/aura_bloomwellness)
- TikTok: [@aura.bloom.wellne](https://tiktok.com/@aura.bloom.wellne)
- Facebook: AuraBloom Wellness

## 📝 License

This project is private and proprietary to AuraBloom.

## 🚀 Next Steps

- [ ] Activate live Stripe payments
- [ ] Set up customer email notifications (SendGrid/Resend)
- [ ] Add newsletter signup form to footer
- [ ] Create Returns & Refunds policy page
- [ ] Add product videos (TikTok-style content)
- [ ] Implement customer account dashboard
- [ ] Set up SMS notifications for orders
- [ ] Create loyalty/rewards program
- [ ] Expand product catalog with seasonal items
- [ ] Launch influencer partnership program

---

**Built with ❤️ for AuraBloom**
