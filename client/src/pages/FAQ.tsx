import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Link } from 'wouter';
import { ChevronRight, Package, Truck, RotateCcw, CreditCard, HelpCircle, Sparkles } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqCategories = [
  {
    title: "Shipping & Delivery",
    icon: Truck,
    questions: [
      {
        question: "How long does shipping take?",
        answer: "Our standard shipping takes 6-13 business days for most products. Some items may have slightly different delivery times, which will be noted on the product page. We ship worldwide from our fulfillment centers."
      },
      {
        question: "Do you offer free shipping?",
        answer: "Yes! We offer free shipping on all orders worldwide. No minimum purchase required. Your order will be shipped with tracking so you can follow its journey to your door."
      },
      {
        question: "How can I track my order?",
        answer: "Once your order ships, you'll receive an email with your tracking number and a link to track your package. You can also view your order status by logging into your account and visiting the 'My Orders' page."
      },
      {
        question: "Do you ship internationally?",
        answer: "Yes, we ship to most countries worldwide including the US, Canada, UK, Australia, Germany, France, and many more. Shipping is free regardless of your location."
      },
    ]
  },
  {
    title: "Orders & Payments",
    icon: CreditCard,
    questions: [
      {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards (Visa, Mastercard, American Express), as well as Apple Pay and Google Pay through our secure Stripe checkout. All transactions are encrypted and secure."
      },
      {
        question: "Can I modify or cancel my order?",
        answer: "If you need to modify or cancel your order, please contact us as soon as possible. Once an order has been shipped, we cannot make changes, but you can return it once received."
      },
      {
        question: "Is my payment information secure?",
        answer: "Absolutely. We use Stripe for payment processing, which provides bank-level 256-bit SSL encryption. We never store your full credit card details on our servers."
      },
      {
        question: "Will I receive an order confirmation?",
        answer: "Yes, you'll receive an email confirmation immediately after placing your order with all the details. A second email with tracking information will be sent once your order ships."
      },
    ]
  },
  {
    title: "Returns & Refunds",
    icon: RotateCcw,
    questions: [
      {
        question: "What is your return policy?",
        answer: "We offer a 30-day return policy for unused items in their original packaging. If you're not satisfied with your purchase, contact us to initiate a return."
      },
      {
        question: "How do I return an item?",
        answer: "To return an item, email our support team with your order number and reason for return. We'll provide you with return instructions and a shipping label if applicable."
      },
      {
        question: "When will I receive my refund?",
        answer: "Once we receive and inspect your return, refunds are processed within 5-7 business days. The refund will be credited to your original payment method."
      },
      {
        question: "What if my item arrives damaged?",
        answer: "If your item arrives damaged, please contact us within 48 hours with photos of the damage. We'll send a replacement or issue a full refund at no additional cost to you."
      },
    ]
  },
  {
    title: "Products",
    icon: Package,
    questions: [
      {
        question: "Are your products authentic?",
        answer: "Yes, all our products are 100% authentic and sourced directly from trusted manufacturers. We stand behind the quality of every item we sell."
      },
      {
        question: "How do I use the LED Face Mask?",
        answer: "Our LED Photon Therapy Mask is easy to use. Simply cleanse your face, put on the mask, select your desired light mode (red for anti-aging, blue for acne), and relax for 15-20 minutes. Use 3-4 times per week for best results."
      },
      {
        question: "Is the Flame Diffuser safe to use?",
        answer: "Yes, our Flame Effect Aromatherapy Diffuser is completely safe. It uses ultrasonic technology to create a cool mist with a realistic flame effect - there's no actual fire or heat involved. It automatically shuts off when water runs low."
      },
      {
        question: "How long does the Lip Stain last?",
        answer: "Our Peel-Off Lip Stain provides long-lasting color that can last 8-12 hours without fading or transferring. It's waterproof and kiss-proof!"
      },
    ]
  },
  {
    title: "Account & Support",
    icon: HelpCircle,
    questions: [
      {
        question: "Do I need an account to place an order?",
        answer: "No, you can checkout as a guest. However, creating an account allows you to track orders, save your shipping information, and access exclusive member benefits."
      },
      {
        question: "How do I contact customer support?",
        answer: "You can reach our customer support team by emailing support@aurabloom.com or using the contact form on our website. We typically respond within 24 hours."
      },
      {
        question: "Do you have a rewards program?",
        answer: "We're currently developing a rewards program for our loyal customers. Sign up for our newsletter to be the first to know when it launches!"
      },
    ]
  },
];

export default function FAQ() {
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
              <span className="text-foreground">FAQ</span>
            </nav>
            
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Sparkles className="h-4 w-4" />
                We're Here to Help
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Frequently Asked Questions
              </h1>
              <p className="text-lg text-muted-foreground">
                Find answers to common questions about orders, shipping, returns, and our products. 
                Can't find what you're looking for? Contact our support team.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-12 md:py-16">
          <div className="container">
            <div className="max-w-4xl mx-auto space-y-12">
              {faqCategories.map((category, categoryIndex) => (
                <div key={categoryIndex}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <category.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-semibold text-foreground">
                      {category.title}
                    </h2>
                  </div>
                  
                  <Accordion type="single" collapsible className="space-y-3">
                    {category.questions.map((faq, faqIndex) => (
                      <AccordionItem 
                        key={faqIndex} 
                        value={`${categoryIndex}-${faqIndex}`}
                        className="bg-card border border-border/50 rounded-xl px-6 data-[state=open]:bg-primary/5"
                      >
                        <AccordionTrigger className="text-left font-medium hover:no-underline py-4">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground pb-4">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Still Have Questions CTA */}
        <section className="py-12 md:py-16 bg-gradient-to-b from-background to-primary/5">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Still Have Questions?
              </h2>
              <p className="text-muted-foreground mb-6">
                Our customer support team is here to help. Reach out and we'll get back to you within 24 hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/contact"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                >
                  Contact Support
                </Link>
                <a 
                  href="mailto:support@aurabloom.com"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-border bg-background font-medium hover:bg-accent transition-colors"
                >
                  Email Us
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
