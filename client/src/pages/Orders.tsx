import { Link } from 'wouter';
import { Package, Clock, Truck, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { getLoginUrl } from '@/const';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

const statusConfig: Record<OrderStatus, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  pending: { label: 'Pending', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  processing: { label: 'Processing', icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
  shipped: { label: 'Shipped', icon: Truck, color: 'text-purple-600', bg: 'bg-purple-50' },
  delivered: { label: 'Delivered', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
};

export default function Orders() {
  const { isAuthenticated, loading } = useAuth();
  
  const { data: orders, isLoading } = trpc.orders.myOrders.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-muted rounded" />
            <div className="h-32 bg-muted rounded" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <Package className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-3">Sign in to view your orders</h1>
            <p className="text-muted-foreground mb-8">
              Track your orders and view your purchase history by signing in to your account.
            </p>
            <Button asChild size="lg">
              <a href={getLoginUrl()}>Sign In</a>
            </Button>
          </div>
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
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-8">My Orders</h1>

          {orders?.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                <Package className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-3">No orders yet</h2>
              <p className="text-muted-foreground mb-8">
                Start shopping to see your orders here.
              </p>
              <Button asChild>
                <Link href="/shop">Start Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders?.map((order) => {
                const status = statusConfig[order.status as OrderStatus];
                const StatusIcon = status.icon;
                
                return (
                  <div
                    key={order.id}
                    className="bg-card rounded-xl border border-border/50 p-4 md:p-6"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Order #{order.orderNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${status.bg} ${status.color}`}>
                          <StatusIcon className="h-4 w-4" />
                          <span className="text-sm font-medium">{status.label}</span>
                        </div>
                        <p className="text-lg font-semibold">${parseFloat(order.total).toFixed(2)}</p>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Shipping to: {order.shippingCity}, {order.shippingCountry}
                      </p>
                      <Link 
                        href={`/order-confirmation/${order.orderNumber}`}
                        className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                      >
                        View Details
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
