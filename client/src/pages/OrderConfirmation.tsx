import { useParams, Link } from 'wouter';
import { CheckCircle, Package, Truck, Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { trpc } from '@/lib/trpc';

export default function OrderConfirmation() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  
  const { data: order, isLoading } = trpc.orders.byNumber.useQuery(
    { orderNumber: orderNumber || '' },
    { enabled: !!orderNumber }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-16">
          <div className="max-w-2xl mx-auto animate-pulse space-y-6">
            <div className="h-16 w-16 bg-muted rounded-full mx-auto" />
            <div className="h-8 bg-muted rounded w-2/3 mx-auto" />
            <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
            <div className="h-48 bg-muted rounded" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <p className="text-muted-foreground mb-6">We couldn't find an order with that number.</p>
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
        <div className="container py-12 md:py-16">
          <div className="max-w-2xl mx-auto">
            {/* Success Header */}
            <div className="text-center mb-10">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                Thank You for Your Order!
              </h1>
              <p className="text-lg text-muted-foreground">
                Your order has been confirmed and will be shipped soon.
              </p>
            </div>

            {/* Order Info Card */}
            <div className="bg-card rounded-xl border border-border/50 p-6 md:p-8 mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b">
                <div>
                  <p className="text-sm text-muted-foreground">Order Number</p>
                  <p className="text-xl font-semibold text-foreground">{order.orderNumber}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm text-muted-foreground">Order Total</p>
                  <p className="text-xl font-semibold text-foreground">${parseFloat(order.total).toFixed(2)}</p>
                </div>
              </div>

              {/* Order Status */}
              <div className="mb-6">
                <h3 className="font-semibold text-foreground mb-4">Order Status</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground capitalize">{order.status}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.status === 'pending' && 'Your order is being processed'}
                      {order.status === 'processing' && 'Your order is being prepared'}
                      {order.status === 'shipped' && 'Your order is on its way'}
                      {order.status === 'delivered' && 'Your order has been delivered'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="font-semibold text-foreground mb-4">Order Items</h3>
                <div className="space-y-3">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2">
                      <div>
                        <p className="font-medium text-foreground">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">${(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="pt-6 border-t">
                <h3 className="font-semibold text-foreground mb-3">Shipping To</h3>
                <div className="text-muted-foreground">
                  <p className="font-medium text-foreground">{order.customerName}</p>
                  <p>{order.shippingAddress}</p>
                  <p>
                    {order.shippingCity}
                    {order.shippingState && `, ${order.shippingState}`} {order.shippingZip}
                  </p>
                  <p>{order.shippingCountry}</p>
                </div>
              </div>
            </div>

            {/* What's Next */}
            <div className="bg-secondary/30 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-foreground mb-4">What's Next?</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Confirmation Email</p>
                    <p className="text-sm text-muted-foreground">
                      We've sent a confirmation to {order.customerEmail}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Shipping Updates</p>
                    <p className="text-sm text-muted-foreground">
                      You'll receive tracking information once your order ships
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Continue Shopping */}
            <div className="text-center">
              <Button asChild size="lg">
                <Link href="/shop">
                  Continue Shopping
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
