import { useState } from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  TrendingUp,
  DollarSign,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  BarChart3,
  Activity,
  Bell,
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  LogOut,
  Menu,
  X,
  Link2,
  RefreshCw,
  Home,
  FileText,
  HelpCircle,
  Mail,
  Loader2
} from 'lucide-react';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

const statusConfig: Record<OrderStatus, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  pending: { label: 'Pending', icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-50' },
  processing: { label: 'Processing', icon: Package, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  shipped: { label: 'Shipped', icon: Truck, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  delivered: { label: 'Delivered', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50' },
};

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Dashboard() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You need admin privileges to access this dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild>
              <Link href="/">Return to Store</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate metrics
  const totalRevenue = stats?.totalRevenue || 0;
  const totalOrders = stats?.totalOrders || 0;
  const pendingOrders = stats?.pendingOrders || 0;
  const lowStockProducts = stats?.lowStockProducts || 0;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Recent orders (last 5)
  const recentOrders = orders?.slice(0, 5) || [];

  // Filter products by search
  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-card border-r border-border
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="AuraBloom" className="h-8" />
            </Link>
            <button 
              className="lg:hidden p-1 hover:bg-muted rounded"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                    transition-colors duration-150
                    ${isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                  {item.id === 'orders' && pendingOrders > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                      {pendingOrders}
                    </Badge>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Links */}
          <div className="p-4 border-t border-border space-y-1">
            <Link 
              href="/admin/cj-mapping"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Link2 className="h-5 w-5" />
              CJ Product Mapping
            </Link>
            <Link 
              href="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Home className="h-5 w-5" />
              View Store
            </Link>
          </div>

          {/* User */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  {user?.name?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name || 'Admin'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => logout()}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-card border-b border-border px-4 lg:px-6 py-4 flex items-center gap-4">
          <button 
            className="lg:hidden p-2 hover:bg-muted rounded-lg"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="flex-1">
            <h1 className="text-xl font-semibold capitalize">{activeSection}</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {pendingOrders > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {pendingOrders}
                </span>
              )}
            </Button>
            <Button variant="outline" size="icon" onClick={() => {
              refetchOrders();
              refetchProducts();
              toast.success('Data refreshed');
            }}>
              <RefreshCw className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {/* Overview Section */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-green-600" />
                      </div>
                      <Badge variant="secondary" className="text-green-600">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        12%
                      </Badge>
                    </div>
                    <p className="text-2xl lg:text-3xl font-bold">${totalRevenue.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <ShoppingCart className="h-5 w-5 text-blue-600" />
                      </div>
                      <Badge variant="secondary" className="text-blue-600">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        8%
                      </Badge>
                    </div>
                    <p className="text-2xl lg:text-3xl font-bold">{totalOrders}</p>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                      </div>
                    </div>
                    <p className="text-2xl lg:text-3xl font-bold">${avgOrderValue.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">Avg. Order Value</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                        <Package className="h-5 w-5 text-amber-600" />
                      </div>
                      {lowStockProducts > 0 && (
                        <Badge variant="destructive">{lowStockProducts} low</Badge>
                      )}
                    </div>
                    <p className="text-2xl lg:text-3xl font-bold">{products?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Products</p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions & Recent Orders */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setActiveSection('orders')}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      View All Orders
                      {pendingOrders > 0 && (
                        <Badge variant="secondary" className="ml-auto">{pendingOrders} pending</Badge>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setActiveSection('products')}
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Manage Products
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      asChild
                    >
                      <Link href="/admin/cj-mapping">
                        <Link2 className="h-4 w-4 mr-2" />
                        CJ Product Mapping
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setActiveSection('analytics')}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Analytics
                    </Button>
                  </CardContent>
                </Card>

                {/* Recent Orders */}
                <Card className="lg:col-span-2">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Recent Orders</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setActiveSection('orders')}>
                      View All <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {recentOrders.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No orders yet</p>
                    ) : (
                      <div className="space-y-3">
                        {recentOrders.map((order) => {
                          const status = statusConfig[order.status as OrderStatus];
                          const StatusIcon = status.icon;
                          return (
                            <div key={order.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                              <div className={`w-10 h-10 rounded-lg ${status.bgColor} flex items-center justify-center`}>
                                <StatusIcon className={`h-5 w-5 ${status.color}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{order.orderNumber}</p>
                                <p className="text-sm text-muted-foreground truncate">{order.customerName}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">${parseFloat(order.total).toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Inventory Alerts */}
              {lowStockProducts > 0 && (
                <Card className="border-amber-200 bg-amber-50/50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-amber-700">
                      <Activity className="h-5 w-5" />
                      Inventory Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {products?.filter(p => p.inventory < 10).map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-3 rounded-lg bg-white">
                          <div className="flex items-center gap-3">
                            <img 
                              src={product.images?.[0] || '/placeholder.jpg'} 
                              alt={product.name}
                              className="w-10 h-10 rounded object-cover"
                            />
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-amber-600">{product.inventory} units left</p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            Restock
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Orders Section */}
          {activeSection === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search orders..." 
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50 border-b">
                        <tr>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Order</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Customer</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Date</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Total</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
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
                                  <p className="font-medium">{order.orderNumber}</p>
                                  {order.cjOrderId && (
                                    <p className="text-xs text-muted-foreground">CJ: {order.cjOrderId}</p>
                                  )}
                                </td>
                                <td className="p-4">
                                  <p className="font-medium">{order.customerName}</p>
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
                                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${status.bgColor}`}>
                                    <StatusIcon className={`h-3.5 w-3.5 ${status.color}`} />
                                    <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
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
                                    <SelectTrigger className="w-[130px]">
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
                </CardContent>
              </Card>
            </div>
          )}

          {/* Products Section */}
          {activeSection === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search products..." 
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button onClick={() => toast.info('Product creation coming soon')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>

              <div className="grid gap-4">
                {filteredProducts.map((product) => (
                  <Card key={product.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <img 
                          src={product.images?.[0] || '/placeholder.jpg'} 
                          alt={product.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">Product ID: {product.id}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm font-medium">${parseFloat(product.price).toFixed(2)}</span>
                            <Badge variant={product.inventory < 10 ? 'destructive' : 'secondary'}>
                              {product.inventory} in stock
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            className="w-20"
                            defaultValue={product.inventory}
                            min={0}
                            onBlur={(e) => {
                              const newValue = parseInt(e.target.value);
                              if (newValue !== product.inventory) {
                                updateInventoryMutation.mutate({
                                  productId: product.id,
                                  inventory: newValue,
                                });
                              }
                            }}
                          />
                          <Button variant="outline" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Customers Section */}
          {activeSection === 'customers' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Management</CardTitle>
                  <CardDescription>View and manage your customer base</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Customer Analytics Coming Soon</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Track customer behavior, view order history, and segment your audience for targeted marketing.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Analytics Section */}
          {activeSection === 'analytics' && (
            <div className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Sales Overview</CardTitle>
                    <CardDescription>Revenue and order trends</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Sales chart visualization</p>
                        <p className="text-sm text-muted-foreground">Coming soon</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Traffic Sources</CardTitle>
                    <CardDescription>Where your visitors come from</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
                      <div className="text-center">
                        <Eye className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Traffic analytics</p>
                        <p className="text-sm text-muted-foreground">Coming soon</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Key Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-2xl font-bold">{totalOrders}</p>
                      <p className="text-sm text-muted-foreground">Total Orders</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-2xl font-bold">${avgOrderValue.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">Avg. Order Value</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-2xl font-bold">{products?.length || 0}</p>
                      <p className="text-sm text-muted-foreground">Active Products</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Settings Section */}
          {activeSection === 'settings' && (
            <div className="space-y-6">
              <Tabs defaultValue="general">
                <TabsList>
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  <TabsTrigger value="integrations">Integrations</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Store Settings</CardTitle>
                      <CardDescription>Manage your store configuration</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Store Name</label>
                        <Input defaultValue="AuraBloom" className="mt-1" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Contact Email</label>
                        <Input defaultValue={user?.email || ''} className="mt-1" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Currency</label>
                        <Select defaultValue="usd">
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="usd">USD ($)</SelectItem>
                            <SelectItem value="eur">EUR (€)</SelectItem>
                            <SelectItem value="gbp">GBP (£)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={() => toast.success('Settings saved')}>Save Changes</Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="notifications" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notification Settings</CardTitle>
                      <CardDescription>Configure how you receive alerts</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                          <p className="font-medium">New Order Alerts</p>
                          <p className="text-sm text-muted-foreground">Get notified when a new order is placed</p>
                        </div>
                        <Badge variant="secondary">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                          <p className="font-medium">Low Stock Alerts</p>
                          <p className="text-sm text-muted-foreground">Get notified when inventory is low</p>
                        </div>
                        <Badge variant="secondary">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                          <p className="font-medium">Weekly Reports</p>
                          <p className="text-sm text-muted-foreground">Receive weekly sales summaries</p>
                        </div>
                        <Badge variant="outline">Disabled</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="integrations" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Integrations</CardTitle>
                      <CardDescription>Connect third-party services</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-[#635BFF] flex items-center justify-center">
                            <span className="text-white font-bold text-sm">S</span>
                          </div>
                          <div>
                            <p className="font-medium">Stripe</p>
                            <p className="text-sm text-muted-foreground">Payment processing</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-700">Connected</Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-orange-500 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">CJ</span>
                          </div>
                          <div>
                            <p className="font-medium">CJ Dropshipping</p>
                            <p className="text-sm text-muted-foreground">Order fulfillment</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-700">Connected</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
