import {useState, useCallback, useEffect} from 'react';

const WISHLIST_KEY = 'lzx-wishlist';

export interface WishlistItem {
  handle: string;
  title: string;
  variantId: string;
  image?: string;
  price?: string;
  addedAt: string;
}

function getStoredWishlist(): WishlistItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(WISHLIST_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function setStoredWishlist(items: WishlistItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
}

export function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    setItems(getStoredWishlist());
  }, []);

  const addItem = useCallback((item: WishlistItem) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.handle === item.handle);
      if (exists) return prev;
      const next = [...prev, item];
      setStoredWishlist(next);
      return next;
    });
  }, []);

  const removeItem = useCallback((handle: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.handle !== handle);
      setStoredWishlist(next);
      return next;
    });
  }, []);

  const isInWishlist = useCallback(
    (handle: string) => items.some((i) => i.handle === handle),
    [items],
  );

  const toggleItem = useCallback(
    (item: WishlistItem) => {
      if (isInWishlist(item.handle)) {
        removeItem(item.handle);
      } else {
        addItem(item);
      }
    },
    [addItem, removeItem, isInWishlist],
  );

  return {items, addItem, removeItem, isInWishlist, toggleItem};
}
