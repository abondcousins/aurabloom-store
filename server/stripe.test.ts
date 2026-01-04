import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the Stripe client
vi.mock('./stripe/client', () => ({
  stripe: null,
  isStripeConfigured: () => false,
}));

function createContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {
        origin: "https://test.example.com",
      },
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("stripe.isConfigured", () => {
  it("returns configured status", async () => {
    const ctx = createContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.stripe.isConfigured();

    expect(result).toHaveProperty("configured");
    expect(typeof result.configured).toBe("boolean");
  });
});

describe("stripe.createCheckoutSession", () => {
  it("throws error when Stripe is not configured", async () => {
    const ctx = createContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.stripe.createCheckoutSession({
        sessionId: "test-session",
      })
    ).rejects.toThrow("Stripe is not configured");
  });
});

describe("stripe.getSession", () => {
  it("throws error when Stripe is not configured", async () => {
    const ctx = createContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.stripe.getSession({
        sessionId: "cs_test_123",
      })
    ).rejects.toThrow("Stripe is not configured");
  });
});
