import { useState } from 'react';
import { Link } from 'wouter';
import { 
  Package, ShoppingCart, DollarSign, AlertTriangle, 
  ChevronRight, Clock, CheckCircle, Truck, XCircle,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { toast } from 'sonner';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

const statusConfig: Record<OrderStatus, { label: string; icon: React.ElementType; color: string }> = {
  pending: { label: 'Pending', icon: Clock, color: 'text-amber-500' },
  processing: { label: 'Processing', icon: Package, color: 'text-blue-500' },
  shipped: { label: 'Shipped', icon: Truck, color: 'text-purple-500' },
  delivered: { label: 'Delivered', icon: CheckCircle, color: 'text-green-500' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-red-500' },
};

export default function Admin() {
  const { user, isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory'>('orders');
  
  const { data: stats } = trpc.admin.stats.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'admin',
  });
  
  const { data: orders, refetch: refetchOrders } = trpc.admin.orders.list.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'admin',
  });
  
  const { data: products, refetch: refetchProducts } = trpc.products.list.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const updateStatusMutation = trpc.admin.orders.updateStatus.useMutation({
    onSuccess: () => {
      toast.success('Order status updated');
      refetchOrders();
    },
    onError: () => {
      toast.error('Failed to update status');
    },
  });

  const updateInventoryMutation = trpc.admin.products.updateInventory.useMutation({
    onSuccess: () => {
      toast.success('Inventory updated');
      refetchProducts();
    },
    onError: () => {
      toast.error('Failed to update inventory');
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-muted rounded" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-xl" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You need admin privileges to access this page.
          </p>
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-muted/30">
        <div className="container py-6 md:py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage your store</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-card rounded-xl border border-border/50 p-4 md:p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-foreground">{stats?.totalOrders || 0}</p>
              <p className="text-sm text-muted-foreground">Total Orders</p>
            </div>
            
            <div className="bg-card rounded-xl border border-border/50 p-4 md:p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-500" />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-foreground">
                ${(stats?.totalRevenue || 0).toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
            </div>
            
            <div className="bg-card rounded-xl border border-border/50 p-4 md:p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-foreground">{stats?.pendingOrders || 0}</p>
              <p className="text-sm text-muted-foreground">Pending Orders</p>
            </div>
            
            <div className="bg-card rounded-xl border border-border/50 p-4 md:p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-foreground">{stats?.lowStockProducts || 0}</p>
              <p className="text-sm text-muted-foreground">Low Stock Items</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={activeTab === 'orders' ? 'default' : 'outline'}
              onClick={() => setActiveTab('orders')}
            >
              Orders
            </Button>
            <Button
              variant={activeTab === 'inventory' ? 'default' : 'outline'}
              onClick={() => setActiveTab('inventory')}
            >
              Inventory
            </Button>
            <Button
              variant="outline"
              asChild
            >
              <Link href="/admin/cj-mapping">
                <Package className="h-4 w-4 mr-2" />
                CJ Product Mapping
              </Link>
            </Button>
          </div>

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Order</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Customer</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Date</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Total</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {orders?.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                          No orders yet
                        </td>
                      </tr>
                    ) : (
                      orders?.map((order) => {
                        const status = statusConfig[order.status as OrderStatus];
                        const StatusIcon = status.icon;
                        return (
                          <tr key={order.id} className="hover:bg-muted/30">
                            <td className="p-4">
                              <p className="font-medium text-foreground">{order.orderNumber}</p>
                            </td>
                            <td className="p-4">
                              <p className="font-medium text-foreground">{order.customerName}</p>
                              <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
                            </td>
                            <td className="p-4 hidden md:table-cell">
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </td>
                            <td className="p-4">
                              <p className="font-medium">${parseFloat(order.total).toFixed(2)}</p>
                            </td>
                            <td className="p-4">
                              <div className={`inline-flex items-center gap-1.5 ${status.color}`}>
                                <StatusIcon className="h-4 w-4" />
                                <span className="text-sm font-medium">{status.label}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <Select
                                value={order.status}
                                onValueChange={(value) => {
                                  updateStatusMutation.mutate({
                                    orderId: order.id,
                                    status: value as OrderStatus,
                                  });
                                }}
                              >
                                <SelectTrigger className="w-[140px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="processing">Processing</SelectItem>
                                  <SelectItem value="shipped">Shipped</SelectItem>
                                  <SelectItem value="delivered">Delivered</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Inventory Tab */}
          {activeTab === 'inventory' && (
            <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Product</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Price</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Stock</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {products?.map((product) => {
                      const isLowStock = product.inventory < 20;
                      return (
                        <tr key={product.id} className="hover:bg-muted/30">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                                <img
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <p className="font-medium text-foreground line-clamp-1">{product.name}</p>
                            </div>
                          </td>
                          <td className="p-4 hidden md:table-cell">
                            <p className="font-medium">${parseFloat(product.price).toFixed(2)}</p>
                          </td>
                          <td className="p-4">
                            <p className={`font-medium ${isLowStock ? 'text-red-500' : 'text-foreground'}`}>
                              {product.inventory}
                            </p>
                          </td>
                          <td className="p-4">
                            {isLowStock ? (
                              <span className="inline-flex items-center gap-1 text-sm text-red-500">
                                <AlertTriangle className="h-4 w-4" />
                                Low Stock
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-sm text-green-500">
                                <CheckCircle className="h-4 w-4" />
                                In Stock
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                defaultValue={product.inventory}
                                min="0"
                                className="w-20 px-2 py-1 text-sm border rounded-md"
                                onBlur={(e) => {
                                  const newValue = parseInt(e.target.value);
                                  if (!isNaN(newValue) && newValue !== product.inventory) {
                                    updateInventoryMutation.mutate({
                                      productId: product.id,
                                      inventory: newValue,
                                    });
                                  }
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
