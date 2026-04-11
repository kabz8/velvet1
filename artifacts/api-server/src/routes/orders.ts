import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, orderItemsTable, productsTable, productImagesTable, shippingSettingsTable, couponsTable, customersTable } from "@workspace/db";
import { eq, ilike, and, sql, desc } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { logAudit } from "../lib/audit";

const router = Router();

function formatOrder(order: any, items: any[]) {
  return {
    ...order,
    shippingFee: parseFloat(order.shippingFee),
    subtotal: parseFloat(order.subtotal),
    discountAmount: parseFloat(order.discountAmount),
    total: parseFloat(order.total),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    items: items.map((item: any) => ({
      ...item,
      unitPrice: parseFloat(item.unitPrice),
      totalPrice: parseFloat(item.totalPrice),
    })),
  };
}

router.get("/", requireAuth, async (req, res) => {
  try {
    const { page = "1", limit = "20", status, search } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const conditions: any[] = [];
    if (status) conditions.push(eq(ordersTable.status, status as any));
    if (search) conditions.push(ilike(ordersTable.orderNumber, `%${search}%`));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [orders, countResult] = await Promise.all([
      db.select().from(ordersTable).where(whereClause).orderBy(desc(ordersTable.createdAt)).limit(limitNum).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(ordersTable).where(whereClause),
    ]);

    const total = Number(countResult[0]?.count ?? 0);
    const orderIds = orders.map(o => o.id);

    const allItems = orderIds.length > 0
      ? await db.select().from(orderItemsTable).where(sql`order_id = ANY(${sql.raw(`ARRAY[${orderIds.join(",")}]::int[]`)})`)
      : [];

    const itemsByOrder: Record<number, any[]> = {};
    allItems.forEach(item => {
      if (!itemsByOrder[item.orderId]) itemsByOrder[item.orderId] = [];
      itemsByOrder[item.orderId].push(item);
    });

    res.json({
      orders: orders.map(o => formatOrder(o, itemsByOrder[o.id] || [])),
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    req.log.error({ err }, "listOrders error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const body = req.body;

    // Get shipping settings
    const [shippingRow] = await db.select().from(shippingSettingsTable).limit(1);
    const nairobiFee = shippingRow ? parseFloat(shippingRow.nairobiCountyFee) : 300;
    const outsideNairobiFee = shippingRow ? parseFloat(shippingRow.outsideNairobiFee) : 450;

    const shippingFee = body.deliveryRegion === "nairobi" ? nairobiFee : outsideNairobiFee;

    // Calculate subtotal
    let subtotal = 0;
    const enrichedItems: any[] = [];

    for (const item of body.items) {
      const [product] = await db.select().from(productsTable).where(eq(productsTable.id, item.productId)).limit(1);
      if (!product) return void res.status(400).json({ error: `Product ${item.productId} not found` });

      const unitPrice = parseFloat(product.price);
      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      const [primaryImage] = await db.select().from(productImagesTable)
        .where(and(eq(productImagesTable.productId, product.id), eq(productImagesTable.isPrimary, true))).limit(1);

      enrichedItems.push({
        productId: product.id,
        productTitle: product.title,
        productImageUrl: primaryImage?.url ?? null,
        quantity: item.quantity,
        unitPrice: String(unitPrice),
        totalPrice: String(totalPrice),
      });
    }

    // Apply coupon
    let discountAmount = 0;
    if (body.couponCode) {
      const [coupon] = await db.select().from(couponsTable).where(eq(couponsTable.code, body.couponCode.toUpperCase())).limit(1);
      if (coupon && coupon.isActive) {
        const discountVal = parseFloat(coupon.discountValue);
        if (coupon.discountType === "percentage") {
          discountAmount = Math.round((subtotal * discountVal) / 100);
        } else {
          discountAmount = Math.min(discountVal, subtotal);
        }
        await db.update(couponsTable).set({ usedCount: coupon.usedCount + 1 }).where(eq(couponsTable.id, coupon.id));
      }
    }

    const total = subtotal + shippingFee - discountAmount;
    const orderNumber = `VLV-${Date.now().toString().slice(-8)}`;

    const [order] = await db.insert(ordersTable).values({
      orderNumber,
      status: "pending",
      customerName: body.customerName ?? null,
      customerPhone: body.customerPhone,
      customerEmail: body.customerEmail ?? null,
      isAnonymous: body.isAnonymous ?? false,
      deliveryAddress: body.deliveryAddress,
      deliveryRegion: body.deliveryRegion,
      shippingFee: String(shippingFee),
      subtotal: String(subtotal),
      discountAmount: String(discountAmount),
      total: String(total),
      couponCode: body.couponCode ?? null,
      notes: body.notes ?? null,
      paymentMethod: body.paymentMethod ?? "pending",
    }).returning();

    await db.insert(orderItemsTable).values(enrichedItems.map(item => ({ ...item, orderId: order.id })));

    // Upsert customer record
    try {
      await db.insert(customersTable).values({
        phone: body.customerPhone,
        name: body.customerName ?? null,
        email: body.customerEmail ?? null,
        isAnonymous: body.isAnonymous ?? false,
      }).onConflictDoNothing();
    } catch (_) {}

    const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, order.id));

    res.status(201).json(formatOrder(order, items));
  } catch (err) {
    req.log.error({ err }, "createOrder error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id)).limit(1);
    if (!order) return void res.status(404).json({ error: "Not found" });

    const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, id));
    res.json(formatOrder(order, items));
  } catch (err) {
    req.log.error({ err }, "getOrder error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status, internalNotes } = req.body;

    const [existing] = await db.select().from(ordersTable).where(eq(ordersTable.id, id)).limit(1);
    if (!existing) return void res.status(404).json({ error: "Not found" });

    const updates: any = { updatedAt: new Date() };
    if (status !== undefined) updates.status = status;
    if (internalNotes !== undefined) updates.internalNotes = internalNotes;

    const [updated] = await db.update(ordersTable).set(updates).where(eq(ordersTable.id, id)).returning();

    await logAudit({
      adminId: (req as any).adminUser?.id,
      adminName: (req as any).adminUser?.name,
      action: "order_updated",
      entityType: "order",
      entityId: String(id),
      previousValue: { status: existing.status, internalNotes: existing.internalNotes },
      newValue: { status: updated.status, internalNotes: updated.internalNotes },
    });

    const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, id));
    res.json(formatOrder(updated, items));
  } catch (err) {
    req.log.error({ err }, "updateOrder error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
