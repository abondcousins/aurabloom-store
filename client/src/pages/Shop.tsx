import { useMemo } from 'react';
import { useSearch } from 'wouter';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { trpc } from '@/lib/trpc';

export default function Shop() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const categorySlug = params.get('category');
  
  const { data: products, isLoading: productsLoading } = trpc.products.list.useQuery();
  const { data: categories } = trpc.categories.list.useQuery();
  
  const selectedCategory = categories?.find(c => c.slug === categorySlug);
  
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (!selectedCategory) return products;
    return products.filter(p => p.categoryId === selectedCategory.id);
  }, [products, selectedCategory]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-gradient-to-b from-[oklch(0.96_0.04_350)] to-background py-12 md:py-16">
          <div className="container">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {selectedCategory ? selectedCategory.name : 'All Products'}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              {selectedCategory 
                ? selectedCategory.description 
                : 'Discover our complete collection of viral self-care products.'}
            </p>
          </div>
        </section>

        {/* Filters & Products */}
        <section className="py-8 md:py-12">
          <div className="container">
            {/* Category Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-8 pb-6 border-b">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mr-2">
                <Filter className="h-4 w-4" />
                Filter:
              </div>
              
              <Button
                variant={!categorySlug ? 'default' : 'outline'}
                size="sm"
                asChild
              >
                <a href="/shop">All</a>
              </Button>
              
              {categories?.map((category) => (
                <Button
                  key={category.id}
                  variant={categorySlug === category.slug ? 'default' : 'outline'}
                  size="sm"
                  asChild
                >
                  <a href={`/shop?category=${category.slug}`}>
                    {category.name}
                  </a>
                </Button>
              ))}
              
              {categorySlug && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  asChild
                >
                  <a href="/shop">
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </a>
                </Button>
              )}
            </div>

            {/* Results Count */}
            <p className="text-sm text-muted-foreground mb-6">
              Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </p>

            {/* Products Grid */}
            {productsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
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
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-lg text-muted-foreground mb-4">
                  No products found in this category.
                </p>
                <Button asChild variant="outline">
                  <a href="/shop">View All Products</a>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
