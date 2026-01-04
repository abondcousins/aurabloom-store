import { z } from 'zod';
import { router, protectedProcedure } from '../_core/trpc';
import { TRPCError } from '@trpc/server';
import { getCJClient } from './client';
import { getProductMapping, updateProductMapping, syncTrackingNumbers } from './orderSync';

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const cjRouter = router({
  // Check if CJ is configured
  isConfigured: protectedProcedure.query(() => {
    return { configured: !!process.env.CJ_API_KEY };
  }),

  // Validate CJ API connection
  validateConnection: adminProcedure.mutation(async () => {
    try {
      const client = getCJClient();
      const isValid = await client.validateConnection();
      return { success: isValid };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }),

  // Search CJ products
  searchProducts: adminProcedure
    .input(z.object({
      query: z.string().min(1),
      pageNum: z.number().default(1),
      pageSize: z.number().default(20),
    }))
    .mutation(async ({ input }) => {
      const client = getCJClient();
      const response = await client.searchProducts({
        productNameEn: input.query,
        pageNum: input.pageNum,
        pageSize: input.pageSize,
      });
      return response;
    }),

  // Get product details from CJ
  getProduct: adminProcedure
    .input(z.object({ pid: z.string() }))
    .query(async ({ input }) => {
      const client = getCJClient();
      const response = await client.getProduct(input.pid);
      return response;
    }),

  // Get product variants from CJ
  getProductVariants: adminProcedure
    .input(z.object({ pid: z.string() }))
    .query(async ({ input }) => {
      const client = getCJClient();
      const response = await client.getProductVariants(input.pid);
      return response;
    }),

  // Get current product mapping
  getProductMapping: adminProcedure.query(() => {
    return getProductMapping();
  }),

  // Update product mapping
  updateProductMapping: adminProcedure
    .input(z.object({
      slug: z.string(),
      vid: z.string(),
      cjProductId: z.string(),
    }))
    .mutation(({ input }) => {
      updateProductMapping(input.slug, input.vid, input.cjProductId);
      return { success: true };
    }),

  // Sync tracking numbers from CJ
  syncTracking: adminProcedure.mutation(async () => {
    await syncTrackingNumbers();
    return { success: true };
  }),

  // List CJ orders
  listOrders: adminProcedure
    .input(z.object({
      pageNum: z.number().default(1),
      pageSize: z.number().default(20),
      orderStatus: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const client = getCJClient();
      const response = await client.listOrders(input);
      return response;
    }),

  // Get CJ order details
  getOrder: adminProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ input }) => {
      const client = getCJClient();
      const response = await client.getOrder(input.orderId);
      return response;
    }),
});
