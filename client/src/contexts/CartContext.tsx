import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { nanoid } from 'nanoid';

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    slug: string;
    price: string;
    imageUrl: string;
    shippingDaysMin: number | null;
    shippingDaysMax: number | null;
    isHero: boolean | null;
  };
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isLoading: boolean;
  sessionId: string;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refetch: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const SESSION_KEY = 'aurabloom_session_id';

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = nanoid();
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [sessionId] = useState(() => getOrCreateSessionId());
  
  const { data: cartData, isLoading, refetch } = trpc.cart.get.useQuery(
    { sessionId: user ? undefined : sessionId },
    { enabled: !!sessionId }
  );
  
  const addMutation = trpc.cart.add.useMutation({
    onSuccess: () => refetch(),
  });
  
  const updateMutation = trpc.cart.updateQuantity.useMutation({
    onSuccess: () => refetch(),
  });
  
  const removeMutation = trpc.cart.remove.useMutation({
    onSuccess: () => refetch(),
  });
  
  const clearMutation = trpc.cart.clear.useMutation({
    onSuccess: () => refetch(),
  });
  
  const mergeMutation = trpc.cart.merge.useMutation({
    onSuccess: () => refetch(),
  });
  
  // Merge cart when user logs in
  useEffect(() => {
    if (user && sessionId) {
      mergeMutation.mutate({ sessionId });
    }
  }, [user?.id]);
  
  const items: CartItem[] = (cartData || []).map((item: any) => ({
    id: item.id,
    productId: item.productId,
    quantity: item.quantity,
    product: {
      id: item.product.id,
      name: item.product.name,
      slug: item.product.slug,
      price: item.product.price,
      imageUrl: item.product.imageUrl,
      shippingDaysMin: item.product.shippingDaysMin,
      shippingDaysMax: item.product.shippingDaysMax,
      isHero: item.product.isHero,
    },
  }));
  
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + parseFloat(item.product.price) * item.quantity, 0);
  
  const addToCart = useCallback(async (productId: number, quantity = 1) => {
    await addMutation.mutateAsync({ productId, quantity, sessionId: user ? undefined : sessionId });
  }, [addMutation, sessionId, user]);
  
  const updateQuantity = useCallback(async (itemId: number, quantity: number) => {
    await updateMutation.mutateAsync({ itemId, quantity });
  }, [updateMutation]);
  
  const removeItem = useCallback(async (itemId: number) => {
    await removeMutation.mutateAsync({ itemId });
  }, [removeMutation]);
  
  const clearCart = useCallback(async () => {
    await clearMutation.mutateAsync({ sessionId: user ? undefined : sessionId });
  }, [clearMutation, sessionId, user]);
  
  return (
    <CartContext.Provider value={{
      items,
      itemCount,
      subtotal,
      isLoading,
      sessionId,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      refetch,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
