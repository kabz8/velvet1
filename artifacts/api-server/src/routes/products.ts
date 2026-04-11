import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable, productImagesTable, categoriesTable } from "@workspace/db";
import { eq, ilike, and, gte, lte, or, inArray, sql, desc, asc } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { logAudit } from "../lib/audit";
import { saveBase64File } from "../lib/upload";

const router = Router();

function formatProduct(product: any, images: any[], category: any) {
  return {
    ...product,
    price: parseFloat(product.price),
    compareAtPrice: product.compareAtPrice ? parseFloat(product.compareAtPrice) : null,
    stockQuantity: product.stockQuantity,
    images: images.map((img: any) => ({
      ...img,
      sortOrder: img.sortOrder,
    })),
    category: category || null,
  };
}

router.get("/", async (req, res) => {
  try {
    const {
      page = "1",
      limit = "20",
      categoryId,
      search,
      minPrice,
      maxPrice,
      inStock,
      featured,
      isOffer,
      isBestSeller,
      isNewArrival,
      sortBy,
      status,
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const conditions: any[] = [];

    if (status) {
      conditions.push(eq(productsTable.status, status as any));
    } else {
      conditions.push(eq(productsTable.status, "published"));
    }
    if (categoryId) conditions.push(eq(productsTable.categoryId, parseInt(categoryId)));
    if (search) conditions.push(ilike(productsTable.title, `%${search}%`));
    if (minPrice) conditions.push(gte(productsTable.price, minPrice));
    if (maxPrice) conditions.push(lte(productsTable.price, maxPrice));
    if (inStock === "true") conditions.push(gte(productsTable.stockQuantity, 1));
    if (featured === "true") conditions.push(eq(productsTable.featured, true));
    if (isOffer === "true") conditions.push(eq(productsTable.isOffer, true));
    if (isBestSeller === "true") conditions.push(eq(productsTable.isBestSeller, true));
    if (isNewArrival === "true") conditions.push(eq(productsTable.isNewArrival, true));

    let orderBy;
    switch (sortBy) {
      case "price_asc": orderBy = asc(productsTable.price); break;
      case "price_desc": orderBy = desc(productsTable.price); break;
      case "popular": orderBy = desc(productsTable.isBestSeller); break;
      default: orderBy = desc(productsTable.createdAt);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [products, countResult] = await Promise.all([
      db.select().from(productsTable)
        .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
        .where(whereClause)
        .orderBy(orderBy)
        .limit(limitNum)
        .offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(productsTable).where(whereClause),
    ]);

    const total = Number(countResult[0]?.count ?? 0);
    const productIds = products.map(p => p.products.id);

    const images = productIds.length > 0
      ? await db.select().from(productImagesTable).where(inArray(productImagesTable.productId, productIds))
      : [];

    const imagesByProduct: Record<number, any[]> = {};
    images.forEach(img => {
      if (!imagesByProduct[img.productId]) imagesByProduct[img.productId] = [];
      imagesByProduct[img.productId].push(img);
    });

    const formatted = products.map(p =>
      formatProduct(p.products, imagesByProduct[p.products.id] || [], p.categories)
    );

    res.json({
      products: formatted,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    req.log.error({ err }, "listProducts error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/featured", async (req, res) => {
  try {
    const [featuredRaw, bestSellersRaw, newArrivalsRaw, offersRaw] = await Promise.all([
      db.select().from(productsTable).leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
        .where(and(eq(productsTable.featured, true), eq(productsTable.status, "published"))).limit(8),
      db.select().from(productsTable).leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
        .where(and(eq(productsTable.isBestSeller, true), eq(productsTable.status, "published"))).limit(8),
      db.select().from(productsTable).leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
        .where(and(eq(productsTable.isNewArrival, true), eq(productsTable.status, "published"))).limit(8),
      db.select().from(productsTable).leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
        .where(and(eq(productsTable.isOffer, true), eq(productsTable.status, "published"))).limit(8),
    ]);

    const allProductIds = [
      ...featuredRaw.map(p => p.products.id),
      ...bestSellersRaw.map(p => p.products.id),
      ...newArrivalsRaw.map(p => p.products.id),
      ...offersRaw.map(p => p.products.id),
    ];
    const uniqueIds = [...new Set(allProductIds)];

    const images = uniqueIds.length > 0
      ? await db.select().from(productImagesTable).where(inArray(productImagesTable.productId, uniqueIds))
      : [];
    const imagesByProduct: Record<number, any[]> = {};
    images.forEach(img => {
      if (!imagesByProduct[img.productId]) imagesByProduct[img.productId] = [];
      imagesByProduct[img.productId].push(img);
    });

    const fmt = (rows: any[]) => rows.map(p => formatProduct(p.products, imagesByProduct[p.products.id] || [], p.categories));

    res.json({
      featured: fmt(featuredRaw),
      bestSellers: fmt(bestSellersRaw),
      newArrivals: fmt(newArrivalsRaw),
      offers: fmt(offersRaw),
    });
  } catch (err) {
    req.log.error({ err }, "getFeaturedProducts error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [row] = await db.select().from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(eq(productsTable.id, id)).limit(1);

    if (!row) return void res.status(404).json({ error: "Not found" });

    const images = await db.select().from(productImagesTable).where(eq(productImagesTable.productId, id));
    res.json(formatProduct(row.products, images, row.categories));
  } catch (err) {
    req.log.error({ err }, "getProduct error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id/related", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, id)).limit(1);
    if (!product) return void res.json([]);

    const conditions = [
      eq(productsTable.status, "published"),
      sql`${productsTable.id} != ${id}`,
    ];
    if (product.categoryId) {
      conditions.push(eq(productsTable.categoryId, product.categoryId));
    }

    const related = await db.select().from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(and(...conditions)).limit(4);

    const productIds = related.map(p => p.products.id);
    const images = productIds.length > 0
      ? await db.select().from(productImagesTable).where(inArray(productImagesTable.productId, productIds))
      : [];
    const imagesByProduct: Record<number, any[]> = {};
    images.forEach(img => {
      if (!imagesByProduct[img.productId]) imagesByProduct[img.productId] = [];
      imagesByProduct[img.productId].push(img);
    });

    res.json(related.map(p => formatProduct(p.products, imagesByProduct[p.products.id] || [], p.categories)));
  } catch (err) {
    req.log.error({ err }, "getRelatedProducts error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const body = req.body;
    const [product] = await db.insert(productsTable).values({
      title: body.title,
      slug: body.slug,
      sku: body.sku,
      shortDescription: body.shortDescription,
      description: body.description,
      price: String(body.price),
      compareAtPrice: body.compareAtPrice != null ? String(body.compareAtPrice) : null,
      stockQuantity: body.stockQuantity ?? 0,
      categoryId: body.categoryId ?? null,
      tags: body.tags ?? [],
      featured: body.featured ?? false,
      isOffer: body.isOffer ?? false,
      isBestSeller: body.isBestSeller ?? false,
      isNewArrival: body.isNewArrival ?? false,
      status: body.status ?? "draft",
      seoTitle: body.seoTitle ?? null,
      seoDescription: body.seoDescription ?? null,
    }).returning();

    await logAudit({
      adminId: (req as any).adminUser?.id,
      adminName: (req as any).adminUser?.name,
      action: "product_created",
      entityType: "product",
      entityId: String(product.id),
      newValue: product,
    });

    res.status(201).json(formatProduct(product, [], null));
  } catch (err) {
    req.log.error({ err }, "createProduct error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const body = req.body;

    const [existing] = await db.select().from(productsTable).where(eq(productsTable.id, id)).limit(1);
    if (!existing) return void res.status(404).json({ error: "Not found" });

    const updates: any = { updatedAt: new Date() };
    if (body.title !== undefined) updates.title = body.title;
    if (body.slug !== undefined) updates.slug = body.slug;
    if (body.sku !== undefined) updates.sku = body.sku;
    if (body.shortDescription !== undefined) updates.shortDescription = body.shortDescription;
    if (body.description !== undefined) updates.description = body.description;
    if (body.price !== undefined) updates.price = String(body.price);
    if (body.compareAtPrice !== undefined) updates.compareAtPrice = body.compareAtPrice != null ? String(body.compareAtPrice) : null;
    if (body.stockQuantity !== undefined) updates.stockQuantity = body.stockQuantity;
    if (body.categoryId !== undefined) updates.categoryId = body.categoryId ?? null;
    if (body.tags !== undefined) updates.tags = body.tags;
    if (body.featured !== undefined) updates.featured = body.featured;
    if (body.isOffer !== undefined) updates.isOffer = body.isOffer;
    if (body.isBestSeller !== undefined) updates.isBestSeller = body.isBestSeller;
    if (body.isNewArrival !== undefined) updates.isNewArrival = body.isNewArrival;
    if (body.status !== undefined) updates.status = body.status;
    if (body.seoTitle !== undefined) updates.seoTitle = body.seoTitle;
    if (body.seoDescription !== undefined) updates.seoDescription = body.seoDescription;

    const [updated] = await db.update(productsTable).set(updates).where(eq(productsTable.id, id)).returning();

    await logAudit({
      adminId: (req as any).adminUser?.id,
      adminName: (req as any).adminUser?.name,
      action: "product_updated",
      entityType: "product",
      entityId: String(id),
      previousValue: existing,
      newValue: updated,
    });

    const images = await db.select().from(productImagesTable).where(eq(productImagesTable.productId, id));
    const [cat] = updated.categoryId
      ? await db.select().from(categoriesTable).where(eq(categoriesTable.id, updated.categoryId)).limit(1)
      : [null];

    res.json(formatProduct(updated, images, cat));
  } catch (err) {
    req.log.error({ err }, "updateProduct error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [existing] = await db.select().from(productsTable).where(eq(productsTable.id, id)).limit(1);
    if (!existing) return void res.status(404).json({ error: "Not found" });

    await db.delete(productsTable).where(eq(productsTable.id, id));

    await logAudit({
      adminId: (req as any).adminUser?.id,
      adminName: (req as any).adminUser?.name,
      action: "product_deleted",
      entityType: "product",
      entityId: String(id),
      previousValue: existing,
    });

    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    req.log.error({ err }, "deleteProduct error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/images", requireAuth, async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const { data, mimeType, altText, isPrimary } = req.body;

    const url = await saveBase64File(data, mimeType, "products");

    if (isPrimary) {
      await db.update(productImagesTable).set({ isPrimary: false }).where(eq(productImagesTable.productId, productId));
    }

    const existingImages = await db.select().from(productImagesTable).where(eq(productImagesTable.productId, productId));
    const sortOrder = existingImages.length;

    const [image] = await db.insert(productImagesTable).values({
      productId,
      url,
      altText: altText ?? null,
      sortOrder,
      isPrimary: isPrimary ?? (existingImages.length === 0),
    }).returning();

    res.status(201).json(image);
  } catch (err) {
    req.log.error({ err }, "uploadProductImage error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id/images", requireAuth, async (req, res) => {
  try {
    const imageId = parseInt(req.query.imageId as string);
    await db.delete(productImagesTable).where(eq(productImagesTable.id, imageId));
    res.json({ success: true, message: "Image deleted" });
  } catch (err) {
    req.log.error({ err }, "deleteProductImage error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
