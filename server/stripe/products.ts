// Stripe product configuration for AuraBloom
// Products are created dynamically based on cart items

export interface StripeProduct {
  name: string;
  description: string;
  priceInCents: number;
  images: string[];
}

// Helper to convert database product to Stripe line item format
export function productToLineItem(product: {
  name: string;
  description: string | null;
  price: string;
  images: string[] | null;
}, quantity: number, baseUrl: string) {
  const priceInCents = Math.round(parseFloat(product.price) * 100);
  const images = product.images || [];
  
  // Convert relative image paths to absolute URLs
  const absoluteImages = images.slice(0, 1).map(img => {
    if (img.startsWith('http')) return img;
    return `${baseUrl}${img}`;
  });

  return {
    price_data: {
      currency: 'usd',
      product_data: {
        name: product.name,
        description: product.description?.substring(0, 500) || '',
        images: absoluteImages.length > 0 ? absoluteImages : undefined,
      },
      unit_amount: priceInCents,
    },
    quantity,
  };
}
