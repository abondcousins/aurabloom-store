import { useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowRight, Sparkles, Truck, Shield, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { trpc } from '@/lib/trpc';

export default function Home() {
  // Seed data on first load
  const seedMutation = trpc.seed.useMutation();
  const { data: products, isLoading } = trpc.products.featured.useQuery();
  
  useEffect(() => {
    seedMutation.mutate();
  }, []);

  const heroProduct = products?.find(p => p.isHero);
  const featuredProducts = products?.slice(0, 4) || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.96_0.04_350)] via-background to-[oklch(0.95_0.02_145/0.3)]" />
          
          <div className="container relative py-16 md:py-24 lg:py-32">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Text Content */}
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                  <Sparkles className="h-4 w-4" />
                  Trending on TikTok
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
                  Curated Viral Self-Care.{' '}
                  <span className="text-primary">Real Results, Real Fast.</span>
                </h1>
                
                <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
                  Discover the products everyone's talking about. Handpicked viral favorites 
                  that actually work, delivered straight to your door.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button asChild size="lg" className="gap-2 text-base">
                    <Link href="/shop">
                      Shop Now
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="text-base">
                    <Link href="/shop?category=skin-care">
                      Explore Skin Care
                    </Link>
                  </Button>
                </div>
                
                {/* Trust Badges */}
                <div className="flex flex-wrap gap-6 mt-10 justify-center lg:justify-start">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Truck className="h-4 w-4 text-primary" />
                    Free Shipping
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4 text-primary" />
                    Secure Checkout
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 text-primary" />
                    Fast Delivery
                  </div>
                </div>
              </div>
              
              {/* Hero Product Image */}
              <div className="relative">
                <div className="relative aspect-square max-w-md mx-auto">
                  {/* Decorative elements */}
                  <div className="absolute -top-4 -right-4 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
                  <div className="absolute -bottom-4 -left-4 w-48 h-48 bg-secondary/30 rounded-full blur-2xl" />
                  
                  {/* Product Image */}
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 border border-border/50">
                    <img
                      src={heroProduct?.imageUrl || "https://images.unsplash.com/photo-1602928321679-560bb453f190?w=800&q=80"}
                      alt="Featured Product"
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Fast Shipping Badge */}
                    <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 rounded-full bg-secondary/90 backdrop-blur-sm text-secondary-foreground text-sm font-medium">
                      <Truck className="h-4 w-4" />
                      6-13 Day Delivery
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Viral Favorites
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                The products that broke the internet. Tried, tested, and loved by thousands.
              </p>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-card rounded-xl overflow-hidden border border-border/50 animate-pulse">
                    <div className="aspect-square bg-muted" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-muted rounded w-1/4" />
                      <div className="h-5 bg-muted rounded w-3/4" />
                      <div className="h-5 bg-muted rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
            
            <div className="text-center mt-10">
              <Button asChild variant="outline" size="lg">
                <Link href="/shop">
                  View All Products
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Trust Signals Section */}
        <section className="py-16 md:py-24 bg-card border-y">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {/* Fast Shipping */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Truck className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Fast Global Shipping
                </h3>
                <p className="text-muted-foreground">
                  Get your favorites delivered in 6-20 days. Hero products ship even faster 
                  with our express delivery option.
                </p>
              </div>
              
              {/* Quality Guarantee */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Quality Guaranteed
                </h3>
                <p className="text-muted-foreground">
                  Every product is carefully vetted and tested. If you're not satisfied, 
                  we'll make it right.
                </p>
              </div>
              
              {/* Real Reviews */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Star className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Real Customer Reviews
                </h3>
                <p className="text-muted-foreground">
                  Join thousands of happy customers who've transformed their self-care routine 
                  with our curated products.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary/90 to-primary p-8 md:p-16 text-center">
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-x-1/4 translate-y-1/4" />
              
              <div className="relative">
                <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                  Ready to Glow Up?
                </h2>
                <p className="text-lg text-primary-foreground/90 mb-8 max-w-xl mx-auto">
                  Start your self-care journey today with products that actually deliver results.
                </p>
                <Button asChild size="lg" variant="secondary" className="text-base">
                  <Link href="/shop">
                    Shop the Collection
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
