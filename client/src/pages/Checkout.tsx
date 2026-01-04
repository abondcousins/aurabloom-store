import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { ChevronLeft, Loader2, Shield, Truck, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

export default function Checkout() {
  const [, navigate] = useLocation();
  const { items, subtotal, sessionId } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
  });

  // Check if Stripe is configured
  const { data: stripeConfig } = trpc.stripe.isConfigured.useQuery();

  const createCheckoutMutation = trpc.stripe.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        toast.success('Redirecting to secure checkout...');
        window.open(data.checkoutUrl, '_blank');
      } else {
        toast.error('Failed to create checkout session');
        setIsSubmitting(false);
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create checkout session');
      setIsSubmitting(false);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!stripeConfig?.configured) {
      toast.error('Payment system is not configured. Please contact support.');
      return;
    }

    setIsSubmitting(true);
    
    createCheckoutMutation.mutate({
      sessionId,
      customerEmail: formData.customerEmail || undefined,
      customerName: formData.customerName || undefined,
    });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Add some products before checking out.</p>
          <Button asChild>
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container py-6 md:py-8">
          {/* Back Link */}
          <Link href="/cart" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Cart
          </Link>

          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-8">Checkout</h1>

          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Checkout Form */}
              <div className="lg:col-span-2 space-y-8">
                {/* Contact Information */}
                <div className="bg-card rounded-xl border border-border/50 p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">Contact Information</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Enter your email to receive order updates. Shipping address will be collected on the next page.
                  </p>
                  
                  <div className="grid gap-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="customerName">Full Name (optional)</Label>
                        <Input
                          id="customerName"
                          name="customerName"
                          value={formData.customerName}
                          onChange={handleChange}
                          placeholder="Jane Smith"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customerEmail">Email (optional)</Label>
                        <Input
                          id="customerEmail"
                          name="customerEmail"
                          type="email"
                          value={formData.customerEmail}
                          onChange={handleChange}
                          placeholder="jane@example.com"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">Secure Payment</h2>
                      <p className="text-sm text-muted-foreground">Powered by Stripe</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    You'll be redirected to Stripe's secure checkout page to complete your payment. 
                    We accept all major credit cards, Apple Pay, and Google Pay.
                  </p>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    <div className="px-3 py-1 bg-background rounded-md text-xs font-medium border">Visa</div>
                    <div className="px-3 py-1 bg-background rounded-md text-xs font-medium border">Mastercard</div>
                    <div className="px-3 py-1 bg-background rounded-md text-xs font-medium border">Amex</div>
                    <div className="px-3 py-1 bg-background rounded-md text-xs font-medium border">Apple Pay</div>
                    <div className="px-3 py-1 bg-background rounded-md text-xs font-medium border">Google Pay</div>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-xl border border-border/50 p-6 sticky top-24">
                  <h2 className="text-lg font-semibold text-foreground mb-4">Order Summary</h2>
                  
                  {/* Cart Items */}
                  <div className="space-y-3 mb-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground line-clamp-1">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          <p className="text-sm font-medium">
                            ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-medium text-primary">Free</span>
                    </div>
                  </div>
                  
                  <div className="border-t my-4" />
                  
                  <div className="flex justify-between text-lg font-semibold mb-6">
                    <span>Total</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={isSubmitting || !stripeConfig?.configured}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Redirecting...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Pay with Stripe
                      </>
                    )}
                  </Button>

                  {!stripeConfig?.configured && (
                    <p className="mt-2 text-xs text-center text-amber-600">
                      Payment system is being configured...
                    </p>
                  )}

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Shield className="h-4 w-4 text-primary" />
                      256-bit SSL encrypted checkout
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Truck className="h-4 w-4 text-primary" />
                      Free shipping worldwide
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
