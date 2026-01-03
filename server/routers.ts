import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { notifyOwner } from "./_core/notification";
import * as db from "./db";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Categories
  categories: router({
    list: publicProcedure.query(async () => {
      return db.getAllCategories();
    }),
    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return db.getCategoryBySlug(input.slug);
      }),
  }),

  // Products
  products: router({
    list: publicProcedure.query(async () => {
      return db.getAllProducts();
    }),
    featured: publicProcedure.query(async () => {
      return db.getFeaturedProducts();
    }),
    byCategory: publicProcedure
      .input(z.object({ categoryId: z.number() }))
      .query(async ({ input }) => {
        return db.getProductsByCategory(input.categoryId);
      }),
    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return db.getProductBySlug(input.slug);
      }),
    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getProductById(input.id);
      }),
  }),

  // Reviews
  reviews: router({
    byProduct: publicProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ input }) => {
        return db.getProductReviews(input.productId);
      }),
    create: publicProcedure
      .input(z.object({
        productId: z.number(),
        authorName: z.string().min(1),
        rating: z.number().min(1).max(5),
        title: z.string().optional(),
        content: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createReview({
          ...input,
          userId: ctx.user?.id,
          isVerified: !!ctx.user,
        });
        return { success: true };
      }),
  }),

  // Cart
  cart: router({
    get: publicProcedure
      .input(z.object({ sessionId: z.string().optional() }).optional())
      .query(async ({ input, ctx }) => {
        const userId = ctx.user?.id;
        const sessionId = input?.sessionId;
        return db.getCartWithProducts(userId, sessionId);
      }),
    add: publicProcedure
      .input(z.object({
        productId: z.number(),
        quantity: z.number().min(1).default(1),
        sessionId: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.addToCart({
          productId: input.productId,
          quantity: input.quantity,
          userId: ctx.user?.id,
          sessionId: ctx.user ? undefined : input.sessionId,
        });
        return { success: true };
      }),
    updateQuantity: publicProcedure
      .input(z.object({
        itemId: z.number(),
        quantity: z.number().min(0),
      }))
      .mutation(async ({ input }) => {
        await db.updateCartItemQuantity(input.itemId, input.quantity);
        return { success: true };
      }),
    remove: publicProcedure
      .input(z.object({ itemId: z.number() }))
      .mutation(async ({ input }) => {
        await db.removeFromCart(input.itemId);
        return { success: true };
      }),
    clear: publicProcedure
      .input(z.object({ sessionId: z.string().optional() }).optional())
      .mutation(async ({ input, ctx }) => {
        await db.clearCart(ctx.user?.id, input?.sessionId);
        return { success: true };
      }),
    merge: protectedProcedure
      .input(z.object({ sessionId: z.string() }))
      .mutation(async ({ input, ctx }) => {
        await db.mergeCartOnLogin(input.sessionId, ctx.user.id);
        return { success: true };
      }),
  }),

  // Orders
  orders: router({
    create: publicProcedure
      .input(z.object({
        customerEmail: z.string().email(),
        customerName: z.string().min(1),
        customerPhone: z.string().optional(),
        shippingAddress: z.string().min(1),
        shippingCity: z.string().min(1),
        shippingState: z.string().optional(),
        shippingZip: z.string().min(1),
        shippingCountry: z.string().min(1),
        notes: z.string().optional(),
        sessionId: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const userId = ctx.user?.id;
        const sessionId = input.sessionId;
        
        // Get cart items
        const cartItems = await db.getCartWithProducts(userId, sessionId);
        if (cartItems.length === 0) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cart is empty' });
        }

        // Calculate totals
        const subtotal = cartItems.reduce((sum, item) => {
          return sum + (parseFloat(item.product.price) * item.quantity);
        }, 0);
        const shippingTotal = 0; // Free shipping
        const total = subtotal + shippingTotal;

        // Create order
        const order = await db.createOrder({
          userId,
          sessionId: userId ? undefined : sessionId,
          customerEmail: input.customerEmail,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          shippingAddress: input.shippingAddress,
          shippingCity: input.shippingCity,
          shippingState: input.shippingState,
          shippingZip: input.shippingZip,
          shippingCountry: input.shippingCountry,
          notes: input.notes,
          subtotal: subtotal.toFixed(2),
          shippingTotal: shippingTotal.toFixed(2),
          total: total.toFixed(2),
        });

        // Create order items
        const orderItemsData = cartItems.map(item => ({
          orderId: order.id,
          productId: item.productId,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
        }));
        await db.createOrderItems(orderItemsData);

        // Clear cart
        await db.clearCart(userId, sessionId);

        // Notify owner
        const itemsList = cartItems.map(item => `${item.quantity}x ${item.product.name}`).join(', ');
        await notifyOwner({
          title: `🛒 New Order: ${order.orderNumber}`,
          content: `New order from ${input.customerName} (${input.customerEmail})\n\nItems: ${itemsList}\n\nTotal: $${total.toFixed(2)}\n\nShipping to: ${input.shippingAddress}, ${input.shippingCity}, ${input.shippingZip}, ${input.shippingCountry}`,
        });

        return { orderNumber: order.orderNumber, total };
      }),
    byNumber: publicProcedure
      .input(z.object({ orderNumber: z.string() }))
      .query(async ({ input }) => {
        const order = await db.getOrderByNumber(input.orderNumber);
        if (!order) return null;
        const items = await db.getOrderItems(order.id);
        return { ...order, items };
      }),
    myOrders: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserOrders(ctx.user.id);
    }),
  }),

  // Admin routes
  admin: router({
    orders: router({
      list: adminProcedure.query(async () => {
        return db.getAllOrders();
      }),
      updateStatus: adminProcedure
        .input(z.object({
          orderId: z.number(),
          status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
        }))
        .mutation(async ({ input }) => {
          await db.updateOrderStatus(input.orderId, input.status);
          return { success: true };
        }),
      getDetails: adminProcedure
        .input(z.object({ orderId: z.number() }))
        .query(async ({ input }) => {
          const order = await db.getOrderById(input.orderId);
          if (!order) return null;
          const items = await db.getOrderItems(order.id);
          return { ...order, items };
        }),
    }),
    products: router({
      updateInventory: adminProcedure
        .input(z.object({
          productId: z.number(),
          inventory: z.number().min(0),
        }))
        .mutation(async ({ input }) => {
          await db.updateProductInventory(input.productId, input.inventory);
          return { success: true };
        }),
    }),
    stats: adminProcedure.query(async () => {
      const orders = await db.getAllOrders();
      const products = await db.getAllProducts();
      
      const totalRevenue = orders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + parseFloat(o.total), 0);
      
      const pendingOrders = orders.filter(o => o.status === 'pending').length;
      const lowStockProducts = products.filter(p => p.inventory < 20).length;
      
      return {
        totalOrders: orders.length,
        totalRevenue,
        pendingOrders,
        lowStockProducts,
        totalProducts: products.length,
      };
    }),
  }),

  // Seed data (for initialization)
  seed: publicProcedure.mutation(async () => {
    await db.seedInitialData();
    return { success: true };
  }),
});

export type AppRouter = typeof appRouter;
