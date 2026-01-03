import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@example.com",
      name: "Admin User",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("products router", () => {
  it("should list all products", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const products = await caller.products.list();
    
    expect(Array.isArray(products)).toBe(true);
  });

  it("should list featured products", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const products = await caller.products.featured();
    
    expect(Array.isArray(products)).toBe(true);
  });
});

describe("categories router", () => {
  it("should list all categories", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const categories = await caller.categories.list();
    
    expect(Array.isArray(categories)).toBe(true);
  });
});

describe("cart router", () => {
  it("should return empty cart for new session", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const cart = await caller.cart.get({ sessionId: "test-session-123" });
    
    expect(Array.isArray(cart)).toBe(true);
  });
});

describe("admin router", () => {
  it("should deny access to non-admin users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(caller.admin.stats()).rejects.toThrow();
  });

  it("should allow admin to access stats", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    
    const stats = await caller.admin.stats();
    
    expect(stats).toHaveProperty("totalOrders");
    expect(stats).toHaveProperty("totalRevenue");
    expect(stats).toHaveProperty("pendingOrders");
    expect(stats).toHaveProperty("lowStockProducts");
    expect(stats).toHaveProperty("totalProducts");
  });

  it("should allow admin to list orders", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    
    const orders = await caller.admin.orders.list();
    
    expect(Array.isArray(orders)).toBe(true);
  });
});
