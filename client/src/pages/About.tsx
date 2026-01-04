import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Sparkles, Heart, Truck, Shield, Star, Users } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 bg-gradient-to-b from-primary/5 to-background">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" />
                Our Story
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-semibold text-foreground mb-6">
                Beauty That <span className="text-primary">Actually Works</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                We believe everyone deserves access to the viral self-care products that actually deliver results. 
                No gimmicks, no empty promises—just curated favorites that work.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 md:py-20">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-6">
                  Why We Started AuraBloom
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    It started with a simple frustration: endless scrolling through TikTok, seeing amazing 
                    self-care products go viral, but never knowing which ones actually worked and where to 
                    find them at fair prices.
                  </p>
                  <p>
                    We spent months researching, testing, and validating products. We talked to dermatologists, 
                    read thousands of reviews, and tried everything ourselves. The result? A carefully curated 
                    collection of products that deliver real, visible results.
                  </p>
                  <p>
                    <strong className="text-foreground">AuraBloom was born from a belief:</strong> that self-care 
                    shouldn't be complicated or expensive. It should be accessible, effective, and maybe even a 
                    little bit fun.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <img 
                    src="/products/flame-diffuser-1.jpg" 
                    alt="AuraBloom products" 
                    className="w-3/4 h-3/4 object-cover rounded-xl shadow-lg"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-card p-4 rounded-xl shadow-lg border">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Heart className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">10,000+</p>
                      <p className="text-sm text-muted-foreground">Happy Customers</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 md:py-20 bg-card">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-4">
                What We Stand For
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Every product in our collection meets our strict standards for quality, effectiveness, and value.
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-background p-6 rounded-xl border">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Proven Results</h3>
                <p className="text-sm text-muted-foreground">
                  Every product is tested and validated with real reviews before we add it to our collection.
                </p>
              </div>
              
              <div className="bg-background p-6 rounded-xl border">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Quality First</h3>
                <p className="text-sm text-muted-foreground">
                  We partner only with trusted suppliers who meet our quality and safety standards.
                </p>
              </div>
              
              <div className="bg-background p-6 rounded-xl border">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Fast Shipping</h3>
                <p className="text-sm text-muted-foreground">
                  Get your self-care essentials delivered to your door in as little as 6-13 days.
                </p>
              </div>
              
              <div className="bg-background p-6 rounded-xl border">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Community Driven</h3>
                <p className="text-sm text-muted-foreground">
                  Our product selection is inspired by what's actually working for real people on social media.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Promise Section */}
        <section className="py-16 md:py-20">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-6">
                Our Promise to You
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                When you shop with AuraBloom, you're not just buying products—you're joining a community 
                of people who believe that self-care is self-love. We promise to always be transparent, 
                to only sell products we believe in, and to make your glow-up journey as smooth as possible.
              </p>
              <div className="inline-flex items-center gap-2 text-primary font-medium">
                <Heart className="h-5 w-5 fill-primary" />
                <span>Real Results, Real Fast.</span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-20 bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="container">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-serif font-semibold text-foreground mb-4">
                Ready to Start Your Glow-Up?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Discover the viral self-care products everyone's talking about.
              </p>
              <a 
                href="/shop" 
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                Shop Now
                <Sparkles className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
