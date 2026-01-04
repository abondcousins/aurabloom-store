import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Link } from 'wouter';
import { 
  ChevronRight, 
  Truck, 
  Globe, 
  Clock, 
  Package, 
  MapPin, 
  Search, 
  CheckCircle,
  Sparkles,
  Mail
} from 'lucide-react';

const shippingRegions = [
  {
    region: "United States",
    countries: "All 50 states",
    standardDelivery: "6-10 business days",
    expeditedDelivery: "3-5 business days*",
    cost: "Free",
  },
  {
    region: "Canada",
    countries: "All provinces",
    standardDelivery: "8-12 business days",
    expeditedDelivery: "5-7 business days*",
    cost: "Free",
  },
  {
    region: "United Kingdom",
    countries: "England, Scotland, Wales, N. Ireland",
    standardDelivery: "7-12 business days",
    expeditedDelivery: "4-6 business days*",
    cost: "Free",
  },
  {
    region: "Europe",
    countries: "Germany, France, Spain, Italy, Netherlands, etc.",
    standardDelivery: "8-14 business days",
    expeditedDelivery: "5-8 business days*",
    cost: "Free",
  },
  {
    region: "Australia & New Zealand",
    countries: "All states and territories",
    standardDelivery: "10-15 business days",
    expeditedDelivery: "6-9 business days*",
    cost: "Free",
  },
  {
    region: "Rest of World",
    countries: "Asia, South America, Africa, Middle East",
    standardDelivery: "12-20 business days",
    expeditedDelivery: "8-12 business days*",
    cost: "Free",
  },
];

const trackingSteps = [
  {
    step: 1,
    title: "Order Confirmed",
    description: "Your order has been received and payment confirmed. You'll receive an email confirmation with your order details.",
    icon: CheckCircle,
  },
  {
    step: 2,
    title: "Processing",
    description: "Your order is being prepared at our fulfillment center. Items are carefully picked, packed, and quality checked.",
    icon: Package,
  },
  {
    step: 3,
    title: "Shipped",
    description: "Your package is on its way! You'll receive an email with your tracking number and carrier information.",
    icon: Truck,
  },
  {
    step: 4,
    title: "In Transit",
    description: "Your package is traveling to your destination. Use your tracking number to follow its journey in real-time.",
    icon: Globe,
  },
  {
    step: 5,
    title: "Delivered",
    description: "Your package has arrived! Enjoy your new self-care products and don't forget to leave a review.",
    icon: MapPin,
  },
];

export default function Shipping() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/5 to-background py-12 md:py-16">
          <div className="container">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground">Shipping Information</span>
            </nav>
            
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Truck className="h-4 w-4" />
                Free Worldwide Shipping
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Shipping Information
              </h1>
              <p className="text-lg text-muted-foreground">
                We offer free shipping on all orders worldwide. Learn about delivery times, 
                tracking your order, and our shipping policies.
              </p>
            </div>
          </div>
        </section>

        {/* Key Benefits */}
        <section className="py-12 border-b">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-4 p-6 rounded-xl bg-card border border-border/50">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Free Shipping</h3>
                  <p className="text-sm text-muted-foreground">
                    No minimum order required. Free shipping on every order, everywhere.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-6 rounded-xl bg-card border border-border/50">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Fast Processing</h3>
                  <p className="text-sm text-muted-foreground">
                    Orders are processed within 1-2 business days of purchase.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-6 rounded-xl bg-card border border-border/50">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Full Tracking</h3>
                  <p className="text-sm text-muted-foreground">
                    Every order includes tracking so you can follow your package.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Delivery Estimates Table */}
        <section className="py-12 md:py-16">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                  Delivery Estimates by Region
                </h2>
                <p className="text-muted-foreground">
                  Estimated delivery times from the date your order ships. Processing takes 1-2 business days.
                </p>
              </div>
              
              {/* Desktop Table */}
              <div className="hidden md:block overflow-hidden rounded-xl border border-border/50">
                <table className="w-full">
                  <thead className="bg-primary/5">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Region</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Standard Delivery</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Expedited*</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {shippingRegions.map((region, index) => (
                      <tr key={index} className="bg-card hover:bg-primary/5 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-foreground">{region.region}</p>
                            <p className="text-xs text-muted-foreground">{region.countries}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{region.standardDelivery}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{region.expeditedDelivery}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            {region.cost}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {shippingRegions.map((region, index) => (
                  <div key={index} className="bg-card rounded-xl border border-border/50 p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-foreground">{region.region}</p>
                        <p className="text-xs text-muted-foreground">{region.countries}</p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {region.cost}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Standard</p>
                        <p className="font-medium">{region.standardDelivery}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Expedited*</p>
                        <p className="font-medium">{region.expeditedDelivery}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <p className="mt-4 text-xs text-muted-foreground text-center">
                *Expedited shipping may be available for select products. Check product page for availability.
              </p>
            </div>
          </div>
        </section>

        {/* Order Tracking Section */}
        <section className="py-12 md:py-16 bg-gradient-to-b from-background to-primary/5">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  <Sparkles className="h-4 w-4" />
                  Track Your Order
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                  How to Track Your Order
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  Follow your package every step of the way. Here's what to expect after you place your order.
                </p>
              </div>
              
              {/* Tracking Steps */}
              <div className="relative">
                {/* Connecting Line */}
                <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2" />
                
                <div className="space-y-8 md:space-y-0">
                  {trackingSteps.map((step, index) => (
                    <div 
                      key={index} 
                      className={`relative md:grid md:grid-cols-2 md:gap-8 ${
                        index % 2 === 0 ? '' : 'md:direction-rtl'
                      }`}
                    >
                      {/* Content */}
                      <div className={`${index % 2 === 0 ? 'md:text-right md:pr-12' : 'md:col-start-2 md:pl-12'}`}>
                        <div className={`bg-card rounded-xl border border-border/50 p-6 ${index % 2 === 0 ? '' : 'md:text-left'}`}>
                          <div className={`flex items-center gap-3 mb-3 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                            <div className="p-2 rounded-lg bg-primary/10">
                              <step.icon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <span className="text-xs text-muted-foreground">Step {step.step}</span>
                              <h3 className="font-semibold text-foreground">{step.title}</h3>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                      
                      {/* Timeline Dot */}
                      <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Tracking Instructions */}
              <div className="mt-12 bg-card rounded-xl border border-border/50 p-6 md:p-8">
                <h3 className="font-semibold text-foreground mb-4">How to Use Your Tracking Number</h3>
                <ol className="space-y-4">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center">1</span>
                    <div>
                      <p className="font-medium text-foreground">Check Your Email</p>
                      <p className="text-sm text-muted-foreground">Once your order ships, you'll receive an email with your tracking number and a direct link to track your package.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center">2</span>
                    <div>
                      <p className="font-medium text-foreground">Click the Tracking Link</p>
                      <p className="text-sm text-muted-foreground">Click the link in your email to see real-time updates on your package location and estimated delivery date.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center">3</span>
                    <div>
                      <p className="font-medium text-foreground">Or Visit the Carrier Website</p>
                      <p className="text-sm text-muted-foreground">Copy your tracking number and paste it on the carrier's website (e.g., USPS, DHL, FedEx) for detailed tracking information.</p>
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* Important Notes */}
        <section className="py-12 md:py-16">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
                Important Shipping Information
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card rounded-xl border border-border/50 p-6">
                  <h3 className="font-semibold text-foreground mb-3">Processing Time</h3>
                  <p className="text-sm text-muted-foreground">
                    Orders are processed within 1-2 business days (Monday-Friday, excluding holidays). 
                    During peak seasons, processing may take an additional 1-2 days.
                  </p>
                </div>
                
                <div className="bg-card rounded-xl border border-border/50 p-6">
                  <h3 className="font-semibold text-foreground mb-3">Customs & Duties</h3>
                  <p className="text-sm text-muted-foreground">
                    International orders may be subject to customs fees, import duties, or taxes. 
                    These charges are the responsibility of the recipient and vary by country.
                  </p>
                </div>
                
                <div className="bg-card rounded-xl border border-border/50 p-6">
                  <h3 className="font-semibold text-foreground mb-3">Delivery Attempts</h3>
                  <p className="text-sm text-muted-foreground">
                    Carriers typically make 2-3 delivery attempts. If you miss a delivery, 
                    check for a notice with pickup instructions or rescheduling options.
                  </p>
                </div>
                
                <div className="bg-card rounded-xl border border-border/50 p-6">
                  <h3 className="font-semibold text-foreground mb-3">Address Accuracy</h3>
                  <p className="text-sm text-muted-foreground">
                    Please ensure your shipping address is complete and accurate. We cannot be held 
                    responsible for packages delivered to incorrect addresses provided by the customer.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-12 md:py-16 bg-gradient-to-b from-background to-primary/5">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center">
              <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Questions About Your Shipment?
              </h2>
              <p className="text-muted-foreground mb-6">
                Our customer support team is here to help with any shipping questions or concerns.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/contact"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                >
                  Contact Support
                </Link>
                <Link 
                  href="/faq"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-border bg-background font-medium hover:bg-accent transition-colors"
                >
                  View FAQ
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
