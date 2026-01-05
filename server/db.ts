import { eq, and, desc, asc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  products, InsertProduct, Product,
  categories, InsertCategory, Category,
  cartItems, InsertCartItem, CartItem,
  orders, InsertOrder, Order,
  orderItems, InsertOrderItem, OrderItem,
  reviews, InsertReview, Review
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER HELPERS ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ CATEGORY HELPERS ============

export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).orderBy(asc(categories.name));
}

export async function getCategoryBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return result[0] || null;
}

export async function createCategory(data: InsertCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(categories).values(data);
}

// ============ PRODUCT HELPERS ============

export async function getAllProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).orderBy(desc(products.isFeatured), asc(products.name));
}

export async function getFeaturedProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(eq(products.isFeatured, true)).orderBy(asc(products.name));
}

export async function getProductsByCategory(categoryId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(eq(products.categoryId, categoryId)).orderBy(asc(products.name));
}

export async function getProductBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return result[0] || null;
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0] || null;
}

export async function createProduct(data: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(products).values(data);
  return result;
}

export async function updateProductInventory(productId: number, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set({ inventory: quantity }).where(eq(products.id, productId));
}

// ============ CART HELPERS ============

export async function getCartItems(userId?: number, sessionId?: string) {
  const db = await getDb();
  if (!db) return [];
  
  if (userId) {
    return db.select().from(cartItems).where(eq(cartItems.userId, userId));
  } else if (sessionId) {
    return db.select().from(cartItems).where(eq(cartItems.sessionId, sessionId));
  }
  return [];
}

export async function getCartWithProducts(userId?: number, sessionId?: string) {
  const db = await getDb();
  if (!db) return [];
  
  const condition = userId 
    ? eq(cartItems.userId, userId)
    : sessionId 
      ? eq(cartItems.sessionId, sessionId)
      : sql`1=0`;
  
  const items = await db.select().from(cartItems).where(condition);
  
  const result = [];
  for (const item of items) {
    const product = await getProductById(item.productId);
    if (product) {
      result.push({ ...item, product });
    }
  }
  return result;
}

export async function addToCart(data: InsertCartItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const condition = data.userId 
    ? and(eq(cartItems.userId, data.userId), eq(cartItems.productId, data.productId))
    : data.sessionId
      ? and(eq(cartItems.sessionId, data.sessionId), eq(cartItems.productId, data.productId))
      : sql`1=0`;
  
  const existing = await db.select().from(cartItems).where(condition).limit(1);
  
  if (existing.length > 0) {
    await db.update(cartItems)
      .set({ quantity: existing[0].quantity + (data.quantity || 1) })
      .where(eq(cartItems.id, existing[0].id));
  } else {
    await db.insert(cartItems).values(data);
  }
}

export async function updateCartItemQuantity(itemId: number, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (quantity <= 0) {
    await db.delete(cartItems).where(eq(cartItems.id, itemId));
  } else {
    await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, itemId));
  }
}

export async function removeFromCart(itemId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(cartItems).where(eq(cartItems.id, itemId));
}

export async function clearCart(userId?: number, sessionId?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (userId) {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  } else if (sessionId) {
    await db.delete(cartItems).where(eq(cartItems.sessionId, sessionId));
  }
}

export async function mergeCartOnLogin(sessionId: string, userId: number) {
  const db = await getDb();
  if (!db) return;
  
  const sessionItems = await db.select().from(cartItems).where(eq(cartItems.sessionId, sessionId));
  
  for (const item of sessionItems) {
    const existing = await db.select().from(cartItems)
      .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, item.productId)))
      .limit(1);
    
    if (existing.length > 0) {
      await db.update(cartItems)
        .set({ quantity: existing[0].quantity + item.quantity })
        .where(eq(cartItems.id, existing[0].id));
      await db.delete(cartItems).where(eq(cartItems.id, item.id));
    } else {
      await db.update(cartItems)
        .set({ userId, sessionId: null })
        .where(eq(cartItems.id, item.id));
    }
  }
}

// ============ ORDER HELPERS ============

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `AB-${timestamp}-${random}`;
}

export async function createOrder(data: Omit<InsertOrder, 'orderNumber'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const orderNumber = generateOrderNumber();
  const result = await db.insert(orders).values({ ...data, orderNumber });
  
  const insertId = result[0].insertId;
  const order = await db.select().from(orders).where(eq(orders.id, insertId)).limit(1);
  return order[0];
}

export async function createOrderItems(items: InsertOrderItem[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(orderItems).values(items);
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result[0] || null;
}

export async function getOrderByNumber(orderNumber: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  return result[0] || null;
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

export async function getAllOrders() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function getUserOrders(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
}

export async function updateOrderStatus(orderId: number, status: Order['status']) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(orders).set({ status }).where(eq(orders.id, orderId));
}

// ============ REVIEW HELPERS ============

export async function getProductReviews(productId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reviews).where(eq(reviews.productId, productId)).orderBy(desc(reviews.createdAt));
}

export async function createReview(data: InsertReview) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(reviews).values(data);
  
  const allReviews = await getProductReviews(data.productId);
  const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
  await db.update(products)
    .set({ rating: avgRating.toFixed(1), reviewCount: allReviews.length })
    .where(eq(products.id, data.productId));
}

// ============ SEED DATA ============

export async function seedInitialData() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot seed: database not available");
    return;
  }

  const existingCategories = await getAllCategories();
  if (existingCategories.length > 0) {
    console.log("[Database] Data already seeded, skipping...");
    return;
  }

  console.log("[Database] Seeding initial data...");

  const categoryData: InsertCategory[] = [
    { name: "Skin Care", slug: "skin-care", description: "Rejuvenate and nourish your skin with our curated collection" },
    { name: "Home Wellness", slug: "home-wellness", description: "Transform your space into a sanctuary of calm" },
    { name: "Beauty", slug: "beauty", description: "Enhance your natural beauty with viral favorites" },
  ];

  for (const cat of categoryData) {
    await db.insert(categories).values(cat);
  }

  const cats = await getAllCategories();
  const skinCareId = cats.find(c => c.slug === "skin-care")?.id || 1;
  const homeWellnessId = cats.find(c => c.slug === "home-wellness")?.id || 2;
  const beautyId = cats.find(c => c.slug === "beauty")?.id || 3;

  const productData: InsertProduct[] = [
    {
      name: "LED Photon Therapy Mask",
      slug: "led-photon-therapy-mask",
      description: "Experience professional-grade skin rejuvenation at home with our 7-color LED therapy mask. This viral sensation uses red light therapy to boost collagen production, reduce fine lines, and give you that coveted glass skin glow. Touch-screen controls make it effortless to customize your treatment.",
      benefits: [
        "Stimulates collagen production for firmer skin",
        "Reduces appearance of fine lines and wrinkles",
        "Improves skin texture and tone",
        "Helps reduce acne and inflammation",
        "Professional spa results at home"
      ],
      specifications: {
        "Colors": "7 LED light modes",
        "Material": "Medical-grade silicone",
        "Power": "USB rechargeable",
        "Treatment Time": "15-20 minutes",
        "Warranty": "1 year"
      },
      price: "99.00",
      compareAtPrice: "149.00",
      costPrice: "27.56",
      shippingCost: "0.00",
      imageUrl: "/products/led-mask-1.jpg",
      images: [
        "/products/led-mask-1.jpg",
        "/products/led-mask-2.jpg",
        "/products/led-mask-3.jpg"
      ],
      categoryId: skinCareId,
      inventory: 150,
      shippingDaysMin: 8,
      shippingDaysMax: 20,
      isFeatured: true,
      isHero: false,
      rating: "4.8",
      reviewCount: 127
    },
    {
      name: "Collagen Overnight Wrapping Mask",
      slug: "collagen-overnight-mask",
      description: "Wake up to transformed skin with our viral K-beauty collagen mask. This overnight treatment deeply hydrates while you sleep, creating that coveted 'morning shed' effect that took TikTok by storm. Infused with natural collagen and hydrating ingredients for plump, dewy skin.",
      benefits: [
        "Deep overnight hydration",
        "Firms and plumps skin",
        "Creates the viral 'morning shed' effect",
        "Reduces appearance of pores",
        "Suitable for all skin types"
      ],
      specifications: {
        "Size": "75ml",
        "Key Ingredients": "Collagen, Hyaluronic Acid",
        "Skin Type": "All skin types",
        "Usage": "2-3 times per week",
        "Cruelty Free": "Yes"
      },
      price: "34.00",
      compareAtPrice: "45.00",
      costPrice: "10.84",
      shippingCost: "0.00",
      imageUrl: "/products/collagen-mask-1.png",
      images: [
        "/products/collagen-mask-1.png",
        "/products/collagen-mask-2.jpg",
        "/products/collagen-mask-3.jpg"
      ],
      categoryId: skinCareId,
      inventory: 200,
      shippingDaysMin: 8,
      shippingDaysMax: 20,
      isFeatured: true,
      isHero: false,
      rating: "4.7",
      reviewCount: 89
    },
    {
      name: "Peel-Off Lip Stain Trio",
      slug: "peel-off-lip-stain",
      description: "Get the perfect pout that lasts all day with our viral peel-off lip stain set. This innovative formula creates a transfer-proof, kiss-proof tint that survives coffee, meals, and everything in between. Includes three stunning shades for every mood.",
      benefits: [
        "Transfer-proof color that lasts 12+ hours",
        "Hydrating formula won't dry lips",
        "Satisfying peel-off application",
        "Three versatile shades included",
        "No need for touch-ups"
      ],
      specifications: {
        "Set Includes": "3 lip stains (3ml each)",
        "Shades": "Red Brown, Nude Brown, Cocoa",
        "Finish": "Natural matte",
        "Longevity": "12+ hours",
        "Vegan": "Yes"
      },
      price: "29.00",
      compareAtPrice: "39.00",
      costPrice: "12.18",
      shippingCost: "0.00",
      imageUrl: "/products/lip-stain-1.jpg",
      images: [
        "/products/lip-stain-1.jpg",
        "/products/lip-stain-2.jpg",
        "/products/lip-stain-3.jpg"
      ],
      categoryId: beautyId,
      inventory: 300,
      shippingDaysMin: 10,
      shippingDaysMax: 25,
      isFeatured: true,
      isHero: false,
      rating: "4.6",
      reviewCount: 156
    },
    {
      name: "Glow-Up Bundle",
      slug: "glow-up-bundle",
      description: "Get the ultimate skin transformation with our best-selling duo! This exclusive bundle combines our viral LED Photon Therapy Mask with the TikTok-famous Collagen Overnight Wrapping Mask for a complete at-home spa experience. Save $40 when you bundle these two powerhouse products together.",
      benefits: [
        "Complete skincare routine in one bundle",
        "LED therapy + overnight collagen treatment",
        "Save $40 compared to buying separately",
        "Professional spa results at home",
        "Perfect gift for skincare lovers"
      ],
      specifications: {
        "Includes": "LED Mask + Collagen Mask",
        "LED Colors": "7 light modes",
        "Mask Size": "75ml",
        "Value": "$133 worth of products",
        "Savings": "$40 off"
      },
      price: "93.00",
      compareAtPrice: "133.00",
      costPrice: "38.40",
      shippingCost: "0.00",
      imageUrl: "/products/glow-bundle-1.png",
      images: [
        "/products/glow-bundle-1.png",
        "/products/glow-bundle-2.jpg",
        "/products/glow-bundle-3.jpg"
      ],
      categoryId: skinCareId,
      inventory: 100,
      shippingDaysMin: 8,
      shippingDaysMax: 20,
      isFeatured: true,
      isHero: false,
      rating: "4.9",
      reviewCount: 45
    },
    {
      name: "Flame Effect Aromatherapy Diffuser",
      slug: "flame-aromatherapy-diffuser",
      description: "Transform your space into a sanctuary with our mesmerizing flame-effect diffuser. This 2-in-1 humidifier and aromatherapy machine creates a stunning visual display while filling your room with calming essential oil mist. Bluetooth remote control for ultimate convenience.",
      benefits: [
        "Realistic flame effect creates ambient lighting",
        "Humidifies and purifies air",
        "Bluetooth remote control included",
        "Whisper-quiet operation",
        "Auto shut-off safety feature"
      ],
      specifications: {
        "Capacity": "150ml",
        "Material": "Premium wood grain finish",
        "Control": "Bluetooth + Touch",
        "Coverage": "Up to 300 sq ft",
        "Run Time": "4-6 hours"
      },
      price: "69.00",
      compareAtPrice: "89.00",
      costPrice: "24.28",
      shippingCost: "0.00",
      imageUrl: "/products/flame-diffuser-1.jpg",
      images: [
        "/products/flame-diffuser-1.jpg",
        "/products/flame-diffuser-2.jpg",
        "/products/flame-diffuser-3.jpg"
      ],
      categoryId: homeWellnessId,
      inventory: 175,
      shippingDaysMin: 6,
      shippingDaysMax: 13,
      isFeatured: true,
      isHero: true,
      rating: "4.9",
      reviewCount: 203
    }
  ];

  for (const product of productData) {
    await db.insert(products).values(product);
  }

  // Get products by slug to ensure correct review mapping
  const ledMask = await getProductBySlug('led-photon-therapy-mask');
  const collagenMask = await getProductBySlug('collagen-overnight-mask');
  const lipStain = await getProductBySlug('peel-off-lip-stain');
  const diffuser = await getProductBySlug('flame-aromatherapy-diffuser');
  const glowBundle = await getProductBySlug('glow-up-bundle');
  
  const reviewData: InsertReview[] = [
    // LED Photon Therapy Mask reviews
    { productId: ledMask?.id || 1, authorName: "Sarah M.", rating: 5, title: "Game changer!", content: "I've been using this for 3 weeks and my skin has never looked better. The red light really works!", isVerified: true },
    { productId: ledMask?.id || 1, authorName: "Jessica L.", rating: 5, title: "Worth every penny", content: "Skeptical at first but the results speak for themselves. My fine lines are visibly reduced.", isVerified: true },
    // Collagen Overnight Wrapping Mask reviews
    { productId: collagenMask?.id || 2, authorName: "Emily R.", rating: 5, title: "TikTok made me buy it", content: "The morning peel is SO satisfying and my skin is glowing!", isVerified: true },
    { productId: collagenMask?.id || 2, authorName: "Megan H.", rating: 5, title: "Best overnight mask ever", content: "Wake up with the softest skin. The collagen really makes a difference!", isVerified: true },
    // Peel-Off Lip Stain Trio reviews
    { productId: lipStain?.id || 3, authorName: "Amanda K.", rating: 4, title: "Finally, a lip stain that lasts", content: "Survived my entire wedding day. The nude brown is my new go-to.", isVerified: true },
    { productId: lipStain?.id || 3, authorName: "Taylor S.", rating: 5, title: "Love all three colors", content: "The peel-off is so satisfying and the colors are gorgeous. Perfect for everyday!", isVerified: true },
    // Flame Effect Aromatherapy Diffuser reviews
    { productId: diffuser?.id || 4, authorName: "Michelle T.", rating: 5, title: "Obsessed with the flame effect", content: "This is the aesthetic piece my bedroom was missing. So calming!", isVerified: true },
    { productId: diffuser?.id || 4, authorName: "Rachel B.", rating: 5, title: "Fast shipping!", content: "Arrived in just 8 days and works perfectly. The flame looks so real.", isVerified: true },
    // Glow-Up Bundle reviews
    { productId: glowBundle?.id || 5, authorName: "Olivia P.", rating: 5, title: "Best skincare investment!", content: "The bundle is such a great deal. Both products work amazingly together - my skin has never looked better!", isVerified: true },
    { productId: glowBundle?.id || 5, authorName: "Nicole W.", rating: 5, title: "Perfect gift", content: "Bought this for my mom and she's obsessed! The savings make it totally worth it.", isVerified: true },
  ];

  for (const review of reviewData) {
    await db.insert(reviews).values(review);
  }

  console.log("[Database] Seed complete!");
}
