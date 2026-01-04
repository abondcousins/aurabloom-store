import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArrowLeft, Search, Link2, Check, ExternalLink, Package, Loader2 } from "lucide-react";

export default function AdminCJMapping() {
  const { user, loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Get store products
  const { data: products, isLoading: productsLoading } = trpc.products.list.useQuery();
  
  // Get current CJ mapping
  const { data: mapping, refetch: refetchMapping } = trpc.cj.getProductMapping.useQuery(undefined, {
    enabled: user?.role === "admin",
  });

  // CJ search mutation
  const searchCJ = trpc.cj.searchProducts.useMutation({
    onSuccess: (data) => {
      if (data.code === 200 && data.data?.list) {
        setSearchResults(data.data.list);
      } else {
        setSearchResults([]);
        toast.error(data.message || "No products found");
      }
      setIsSearching(false);
    },
    onError: (error) => {
      toast.error(error.message || "Search failed");
      setIsSearching(false);
    },
  });

  // Update mapping mutation
  const updateMapping = trpc.cj.updateProductMapping.useMutation({
    onSuccess: () => {
      toast.success("Product mapping updated!");
      refetchMapping();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update mapping");
    },
  });

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    searchCJ.mutate({ query: searchQuery, pageSize: 20 });
  };

  const handleMapProduct = (storeSlug: string, cjProduct: any) => {
    // Get the first variant ID if available
    const vid = cjProduct.variants?.[0]?.vid || cjProduct.vid || "";
    updateMapping.mutate({
      slug: storeSlug,
      vid: vid,
      cjProductId: cjProduct.pid,
    });
    setSelectedProduct(null);
    setSearchResults([]);
    setSearchQuery("");
  };

  if (authLoading || productsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                You need admin privileges to access this page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/">
                <Button>Return Home</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container max-w-6xl">
          {/* Back to Admin */}
          <Link href="/admin">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin Dashboard
            </Button>
          </Link>

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
              CJ Dropshipping Product Mapping
            </h1>
            <p className="text-gray-600">
              Link your store products to CJ Dropshipping variants for automatic order fulfillment.
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid gap-6">
            {products?.map((product) => {
              const productMapping = mapping?.[product.slug];
              const isMapped = productMapping?.vid && productMapping.vid.length > 0;

              return (
                <Card key={product.id} className={isMapped ? "border-green-200 bg-green-50/50" : ""}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-6">
                      {/* Product Image */}
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">
                              {product.name}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              Slug: <code className="bg-gray-100 px-1 rounded">{product.slug}</code>
                            </p>
                            <p className="text-sm text-gray-500">
                              Price: ${product.price}
                            </p>
                          </div>

                          {/* Mapping Status */}
                          <div className="flex items-center gap-3">
                            {isMapped ? (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                <Check className="h-3 w-3 mr-1" />
                                Mapped
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-amber-600 border-amber-300">
                                Not Mapped
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Current Mapping */}
                        {isMapped && (
                          <div className="mt-3 p-3 bg-white rounded-lg border">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">CJ Product ID:</span>{" "}
                              <code className="bg-gray-100 px-1 rounded">{productMapping.cjProductId}</code>
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Variant ID:</span>{" "}
                              <code className="bg-gray-100 px-1 rounded">{productMapping.vid}</code>
                            </p>
                          </div>
                        )}

                        {/* Map Button */}
                        <div className="mt-4">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant={isMapped ? "outline" : "default"}
                                size="sm"
                                onClick={() => setSelectedProduct(product.slug)}
                              >
                                <Link2 className="h-4 w-4 mr-2" />
                                {isMapped ? "Update Mapping" : "Map to CJ Product"}
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Map "{product.name}" to CJ Product</DialogTitle>
                                <DialogDescription>
                                  Search for the matching product in CJ Dropshipping and select it to create the mapping.
                                </DialogDescription>
                              </DialogHeader>

                              {/* Search Box */}
                              <div className="flex gap-2 mt-4">
                                <Input
                                  placeholder="Search CJ Dropshipping products..."
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                />
                                <Button onClick={handleSearch} disabled={isSearching}>
                                  {isSearching ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Search className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>

                              {/* Search Results */}
                              <div className="mt-4 space-y-3">
                                {searchResults.length === 0 && !isSearching && (
                                  <p className="text-sm text-gray-500 text-center py-8">
                                    Search for a product to see results
                                  </p>
                                )}
                                {isSearching && (
                                  <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                  </div>
                                )}
                                {searchResults.map((cjProduct: any) => (
                                  <div
                                    key={cjProduct.pid}
                                    className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                                  >
                                    <div className="w-16 h-16 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                                      {cjProduct.productImage ? (
                                        <img
                                          src={cjProduct.productImage}
                                          alt={cjProduct.productNameEn}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                          <Package className="h-6 w-6 text-gray-400" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-sm truncate">
                                        {cjProduct.productNameEn}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        PID: {cjProduct.pid}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        Price: ${cjProduct.sellPrice || "N/A"}
                                      </p>
                                    </div>
                                    <div className="flex gap-2">
                                      <a
                                        href={`https://cjdropshipping.com/product/${cjProduct.pid}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <Button variant="ghost" size="sm">
                                          <ExternalLink className="h-4 w-4" />
                                        </Button>
                                      </a>
                                      <Button
                                        size="sm"
                                        onClick={() => handleMapProduct(product.slug, cjProduct)}
                                      >
                                        Select
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Manual Entry */}
                              <div className="mt-6 pt-4 border-t">
                                <p className="text-sm font-medium mb-2">Or enter manually:</p>
                                <ManualMappingForm
                                  slug={product.slug}
                                  onSubmit={(vid, pid) => {
                                    updateMapping.mutate({ slug: product.slug, vid, cjProductId: pid });
                                  }}
                                />
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Help Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg">How to Map Products</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600">
              <p>
                <strong>1.</strong> Click "Map to CJ Product" on any unmapped product.
              </p>
              <p>
                <strong>2.</strong> Search for the matching product in CJ Dropshipping using keywords.
              </p>
              <p>
                <strong>3.</strong> Select the correct product from the search results.
              </p>
              <p>
                <strong>4.</strong> Once mapped, orders containing this product will automatically be created in CJ Dropshipping.
              </p>
              <p className="text-amber-600 mt-4">
                <strong>Note:</strong> Make sure to select the correct variant (color, size, etc.) that matches your store listing.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Manual mapping form component
function ManualMappingForm({ 
  slug, 
  onSubmit 
}: { 
  slug: string; 
  onSubmit: (vid: string, pid: string) => void;
}) {
  const [vid, setVid] = useState("");
  const [pid, setPid] = useState("");

  return (
    <div className="flex gap-2">
      <Input
        placeholder="CJ Product ID (PID)"
        value={pid}
        onChange={(e) => setPid(e.target.value)}
        className="flex-1"
      />
      <Input
        placeholder="Variant ID (VID)"
        value={vid}
        onChange={(e) => setVid(e.target.value)}
        className="flex-1"
      />
      <Button
        variant="outline"
        onClick={() => {
          if (vid && pid) {
            onSubmit(vid, pid);
            setVid("");
            setPid("");
          }
        }}
        disabled={!vid || !pid}
      >
        Save
      </Button>
    </div>
  );
}
