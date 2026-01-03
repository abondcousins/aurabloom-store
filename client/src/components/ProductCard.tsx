import { Link } from 'wouter';
import { ShoppingBag, Star, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    slug: string;
    price: string;
    compareAtPrice: string | null;
    imageUrl: string;
    rating: string | null;
    reviewCount: number | null;
    shippingDaysMin: number | null;
    shippingDaysMax: number | null;
    isHero: boolean | null;
    isFeatured: boolean | null;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  
  const hasDiscount = product.compareAtPrice && parseFloat(product.compareAtPrice) > parseFloat(product.price);
  const discountPercent = hasDiscount
    ? Math.round((1 - parseFloat(product.price) / parseFloat(product.compareAtPrice!)) * 100)
    : 0;
  
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addToCart(product.id, 1);
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  return (
    <Link href={`/product/${product.slug}`}>
      <div className="group relative bg-card rounded-xl overflow-hidden border border-border/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {hasDiscount && (
              <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-primary/90 text-primary-foreground">
                -{discountPercent}%
              </span>
            )}
            {product.isHero && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-secondary text-secondary-foreground">
                <Truck className="h-3 w-3" />
                Fast Ship
              </span>
            )}
          </div>
          
          {/* Quick Add Button */}
          <div className="absolute bottom-3 left-3 right-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <Button 
              onClick={handleAddToCart}
              className="w-full gap-2 shadow-lg"
              size="sm"
            >
              <ShoppingBag className="h-4 w-4" />
              Add to Cart
            </Button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4">
          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1 mb-2">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-sm font-medium">{product.rating}</span>
              {product.reviewCount && product.reviewCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  ({product.reviewCount})
                </span>
              )}
            </div>
          )}
          
          {/* Name */}
          <h3 className="font-medium text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          
          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-foreground">
              ${parseFloat(product.price).toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                ${parseFloat(product.compareAtPrice!).toFixed(2)}
              </span>
            )}
          </div>
          
          {/* Shipping Info */}
          {product.shippingDaysMin && product.shippingDaysMax && (
            <p className="text-xs text-muted-foreground mt-2">
              Ships in {product.shippingDaysMin}-{product.shippingDaysMax} days
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
