import type { FeaturedProductsResponse, Product, ProductListResponse } from "@workspace/api-client-react";

const SAMPLE_IMAGE = "/sample-product.png";
const nowIso = new Date().toISOString();

function makeProduct(
  id: number,
  title: string,
  price: number,
  flags: Pick<Product, "featured" | "isOffer" | "isBestSeller" | "isNewArrival">,
): Product {
  return {
    id,
    title,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    sku: `VELVET-${id}`,
    shortDescription: "Premium silicone design with whisper-quiet performance and easy-clean finish.",
    description:
      "Crafted for comfort and confidence with body-safe materials, elegant curves, and multiple intensity modes.",
    price,
    compareAtPrice: flags.isOffer ? price + 1200 : null,
    stockQuantity: 24,
    categoryId: null,
    category: null,
    tags: ["silicone", "premium", "discreet"],
    images: [
      {
        id: id * 100,
        productId: id,
        url: SAMPLE_IMAGE,
        altText: title,
        sortOrder: 0,
        isPrimary: true,
      },
    ],
    featured: flags.featured,
    isOffer: flags.isOffer,
    isBestSeller: flags.isBestSeller,
    isNewArrival: flags.isNewArrival,
    status: "published",
    seoTitle: title,
    seoDescription: "Discreet, premium adult wellness product.",
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}

export const SAMPLE_PRODUCTS: Product[] = [
  makeProduct(9001, "Velvet Luna Kegel Set", 4200, { featured: true, isOffer: true, isBestSeller: true, isNewArrival: true }),
  makeProduct(9002, "Velvet Pulse Duo", 6800, { featured: true, isOffer: false, isBestSeller: true, isNewArrival: false }),
  makeProduct(9003, "Velvet Nova Mini", 3500, { featured: true, isOffer: true, isBestSeller: false, isNewArrival: true }),
  makeProduct(9004, "Velvet Whisper Bullet", 2900, { featured: false, isOffer: true, isBestSeller: true, isNewArrival: false }),
  makeProduct(9005, "Velvet Aura Curve", 5600, { featured: true, isOffer: false, isBestSeller: true, isNewArrival: true }),
  makeProduct(9006, "Velvet Bloom Set", 6100, { featured: false, isOffer: true, isBestSeller: false, isNewArrival: true }),
  makeProduct(9007, "Velvet Ember Ring", 3200, { featured: true, isOffer: false, isBestSeller: false, isNewArrival: false }),
  makeProduct(9008, "Velvet Silk Wand", 7400, { featured: false, isOffer: true, isBestSeller: true, isNewArrival: false }),
  makeProduct(9009, "Velvet Serenade Pair", 5300, { featured: true, isOffer: false, isBestSeller: false, isNewArrival: true }),
  makeProduct(9010, "Velvet Midnight Touch", 4700, { featured: false, isOffer: true, isBestSeller: true, isNewArrival: true }),
];

export function getSampleProductById(id: number): Product | undefined {
  return SAMPLE_PRODUCTS.find((product) => product.id === id);
}

export function getSampleRelatedProducts(id: number): Product[] {
  return SAMPLE_PRODUCTS.filter((product) => product.id !== id).slice(0, 4);
}

export function getSampleProductList(): ProductListResponse {
  return {
    products: SAMPLE_PRODUCTS,
    total: SAMPLE_PRODUCTS.length,
    page: 1,
    totalPages: 1,
  };
}

export function getSampleFeaturedProducts(): FeaturedProductsResponse {
  return {
    featured: SAMPLE_PRODUCTS.filter((product) => product.featured).slice(0, 8),
    bestSellers: SAMPLE_PRODUCTS.filter((product) => product.isBestSeller).slice(0, 8),
    newArrivals: SAMPLE_PRODUCTS.filter((product) => product.isNewArrival).slice(0, 8),
    offers: SAMPLE_PRODUCTS.filter((product) => product.isOffer).slice(0, 8),
  };
}
