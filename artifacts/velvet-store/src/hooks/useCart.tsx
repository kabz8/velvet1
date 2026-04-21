import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Product } from "@workspace/api-client-react";

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}

const CartContext = createContext<CartContextType | null>(null);

function toFiniteNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function normalizeProduct(product: unknown): Product | null {
  const record = toRecord(product);
  const nested = toRecord(record.product);
  const nestedProducts = toRecord(record.products);
  const id = toFiniteNumber(record.id ?? nested.id ?? nestedProducts.id, -1);
  if (id <= 0) return null;

  const title =
    (typeof record.title === "string" && record.title) ||
    (typeof nested.title === "string" && nested.title) ||
    (typeof nestedProducts.title === "string" && nestedProducts.title) ||
    `Product ${id}`;

  const price = toFiniteNumber(record.price ?? nested.price ?? nestedProducts.price, 0);
  const compareAtPriceRaw = record.compareAtPrice ?? nested.compareAtPrice ?? nestedProducts.compareAtPrice;
  const compareAtPrice = compareAtPriceRaw == null ? null : toFiniteNumber(compareAtPriceRaw, 0);

  const rawImages = Array.isArray(record.images)
    ? record.images
    : Array.isArray(nested.images)
      ? nested.images
      : Array.isArray(nestedProducts.images)
        ? nestedProducts.images
      : [];
  const images = rawImages
    .map((image, index) => {
      const imageRecord = toRecord(image);
      const url = imageRecord.url;
      if (typeof url !== "string" || !url) return null;
      return {
        id: toFiniteNumber(imageRecord.id, index + 1),
        productId: id,
        url,
        altText: typeof imageRecord.altText === "string" ? imageRecord.altText : null,
        sortOrder: toFiniteNumber(imageRecord.sortOrder, index),
        isPrimary: Boolean(imageRecord.isPrimary ?? index === 0),
      };
    })
    .filter((image): image is NonNullable<typeof image> => Boolean(image));

  const tagsRaw = Array.isArray(record.tags) ? record.tags : Array.isArray(nested.tags) ? nested.tags : [];
  const tags = tagsRaw.filter((tag): tag is string => typeof tag === "string");
  const tagsWithNestedProducts = tags.length > 0
    ? tags
    : Array.isArray(nestedProducts.tags)
      ? nestedProducts.tags.filter((tag): tag is string => typeof tag === "string")
      : [];

  return {
    id,
    title,
    slug:
      (typeof record.slug === "string" && record.slug) ||
      (typeof nested.slug === "string" && nested.slug) ||
      `product-${id}`,
    sku:
      (typeof record.sku === "string" && record.sku) ||
      (typeof nested.sku === "string" && nested.sku) ||
      "",
    shortDescription:
      (typeof record.shortDescription === "string" && record.shortDescription) ||
      (typeof nested.shortDescription === "string" && nested.shortDescription) ||
      (typeof nestedProducts.shortDescription === "string" && nestedProducts.shortDescription) ||
      "",
    description:
      (typeof record.description === "string" && record.description) ||
      (typeof nested.description === "string" && nested.description) ||
      (typeof nestedProducts.description === "string" && nestedProducts.description) ||
      "",
    price,
    compareAtPrice,
    stockQuantity: toFiniteNumber(record.stockQuantity ?? nested.stockQuantity ?? nestedProducts.stockQuantity, 0),
    categoryId: null,
    category: null,
    tags: tagsWithNestedProducts,
    images: images.length > 0 ? images : [{ id: 1, productId: id, url: "/sample-product.png", altText: null, sortOrder: 0, isPrimary: true }],
    featured: Boolean(record.featured ?? nested.featured ?? nestedProducts.featured ?? false),
    isOffer: Boolean(record.isOffer ?? nested.isOffer ?? nestedProducts.isOffer ?? false),
    isBestSeller: Boolean(record.isBestSeller ?? nested.isBestSeller ?? nestedProducts.isBestSeller ?? false),
    isNewArrival: Boolean(record.isNewArrival ?? nested.isNewArrival ?? nestedProducts.isNewArrival ?? false),
    status: "published",
    seoTitle: null,
    seoDescription: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function normalizeCartItems(rawItems: unknown): CartItem[] {
  if (!Array.isArray(rawItems)) return [];
  return rawItems
    .map((item) => {
      const itemRecord = toRecord(item);
      const product = normalizeProduct(itemRecord.product);
      if (!product) return null;
      const quantity = Math.max(1, toFiniteNumber(itemRecord.quantity, 1));
      return { product, quantity };
    })
    .filter((item): item is CartItem => Boolean(item));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("velvet_cart");
      return saved ? normalizeCartItems(JSON.parse(saved)) : [];
    } catch {
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("velvet_cart", JSON.stringify(items));
  }, [items]);

  const addItem = (product: Product, quantity = 1) => {
    const normalizedProduct = normalizeProduct(product);
    if (!normalizedProduct) return;
    setItems(prev => {
      const existing = prev.find(i => i.product.id === normalizedProduct.id);
      if (existing) {
        return prev.map(i => i.product.id === normalizedProduct.id ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { product: normalizedProduct, quantity }];
    });
    setIsOpen(true);
  };

  const removeItem = (productId: number) => {
    setItems(prev => prev.filter(i => i.product.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems(prev => prev.map(i => i.product.id === productId ? { ...i, quantity } : i));
  };

  const clearCart = () => setItems([]);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, itemCount, subtotal, isOpen, setIsOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
