import { Router } from "express";
import { db } from "@workspace/db";
import {
  usersTable, ordersTable, orderItemsTable, productsTable, productImagesTable,
  auditLogsTable, customersTable
} from "@workspace/db";
import { eq, desc, sql, ilike, and } from "drizzle-orm";
import { requireAuth, generateToken, validateToken, invalidateToken, extractToken, hashPassword, comparePassword } from "../lib/auth";
import { logAudit } from "../lib/audit";

const router = Router();

// ── AUTH ────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);

    if (!user || !(await comparePassword(password, user.passwordHash))) {
      return void res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user.id);

    await logAudit({
      adminId: user.id,
      adminName: user.name,
      action: "admin_login",
      entityType: "auth",
    });

    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token,
    });
  } catch (err) {
    req.log.error({ err }, "adminLogin error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/logout", async (req, res) => {
  try {
    const token = extractToken(req);
    if (token) invalidateToken(token);

    await logAudit({ action: "admin_logout", entityType: "auth" });

    res.json({ success: true, message: "Logged out" });
  } catch (err) {
    res.json({ success: true, message: "Logged out" });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = (req as any).adminUser;
    res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── DASHBOARD STATS ─────────────────────────────────────────────
router.get("/dashboard", requireAuth, async (req, res) => {
  try {
    const [totalOrdersRow] = await db.select({ count: sql<number>`count(*)` }).from(ordersTable);
    const [totalProductsRow] = await db.select({ count: sql<number>`count(*)` }).from(productsTable);
    const [totalCustomersRow] = await db.select({ count: sql<number>`count(*)` }).from(customersTable);
    const [pendingOrdersRow] = await db.select({ count: sql<number>`count(*)` }).from(ordersTable).where(eq(ordersTable.status, "pending"));

    const revenueRow = await db.select({ total: sql<number>`coalesce(sum(total), 0)` })
      .from(ordersTable).where(sql`status NOT IN ('cancelled', 'pending')`);
    const totalRevenue = parseFloat(String(revenueRow[0]?.total ?? 0));

    const lowStockProductsRaw = await db.select().from(productsTable)
      .leftJoin({ categories: null as any }, () => sql`false`)
      .where(sql`stock_quantity < 5 and status = 'published'`).limit(5);

    const lowStockProductsSimple = await db.select().from(productsTable)
      .where(sql`stock_quantity < 5 and status = 'published'`).limit(5);

    const recentOrders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)).limit(5);

    const topProductsRaw = await db.select({
      productId: orderItemsTable.productId,
      totalSold: sql<number>`sum(${orderItemsTable.quantity})`,
    }).from(orderItemsTable).groupBy(orderItemsTable.productId).orderBy(sql`sum(${orderItemsTable.quantity}) desc`).limit(5);

    const topProductIds = topProductsRaw.map(p => p.productId).filter(Boolean) as number[];
    const topProductsDetail = topProductIds.length > 0
      ? await db.select().from(productsTable).where(sql`id = ANY(${sql.raw(`ARRAY[${topProductIds.join(",")}]::int[]`)})`).limit(5)
      : [];

    const ordersByStatus = await db.select({
      status: ordersTable.status,
      count: sql<number>`count(*)`,
    }).from(ordersTable).groupBy(ordersTable.status);

    const revenueByMonth = await db.select({
      month: sql<string>`to_char(created_at, 'Mon YYYY')`,
      revenue: sql<number>`coalesce(sum(total), 0)`,
      orders: sql<number>`count(*)`,
    }).from(ordersTable)
      .where(sql`status NOT IN ('cancelled', 'pending') and created_at > now() - interval '6 months'`)
      .groupBy(sql`to_char(created_at, 'Mon YYYY')`)
      .orderBy(sql`min(created_at)`);

    const lowStockProductIds = lowStockProductsSimple.map(p => p.id);
    const lowStockImages = lowStockProductIds.length > 0
      ? await db.select().from(productImagesTable).where(sql`product_id = ANY(${sql.raw(`ARRAY[${lowStockProductIds.join(",")}]::int[]`)})`)
      : [];
    const recentOrderItems = recentOrders.length > 0
      ? await db.select().from(orderItemsTable).where(sql`order_id = ANY(${sql.raw(`ARRAY[${recentOrders.map(o => o.id).join(",")}]::int[]`)})`)
      : [];

    const imagesByProduct: Record<number, any[]> = {};
    lowStockImages.forEach(img => {
      if (!imagesByProduct[img.productId]) imagesByProduct[img.productId] = [];
      imagesByProduct[img.productId].push(img);
    });
    const itemsByOrder: Record<number, any[]> = {};
    recentOrderItems.forEach(item => {
      if (!itemsByOrder[item.orderId]) itemsByOrder[item.orderId] = [];
      itemsByOrder[item.orderId].push(item);
    });

    const formatProduct = (p: any) => ({
      ...p, price: parseFloat(p.price), compareAtPrice: p.compareAtPrice ? parseFloat(p.compareAtPrice) : null,
      images: (imagesByProduct[p.id] || []), tags: p.tags || [], category: null,
      createdAt: p.createdAt.toISOString(), updatedAt: p.updatedAt.toISOString(),
    });

    const formatOrderFn = (o: any) => ({
      ...o, shippingFee: parseFloat(o.shippingFee), subtotal: parseFloat(o.subtotal),
      discountAmount: parseFloat(o.discountAmount), total: parseFloat(o.total),
      items: (itemsByOrder[o.id] || []).map((item: any) => ({
        ...item, unitPrice: parseFloat(item.unitPrice), totalPrice: parseFloat(item.totalPrice),
      })),
      createdAt: o.createdAt.toISOString(), updatedAt: o.updatedAt.toISOString(),
    });

    res.json({
      totalRevenue,
      totalOrders: Number(totalOrdersRow.count),
      totalProducts: Number(totalProductsRow.count),
      totalCustomers: Number(totalCustomersRow.count),
      pendingOrders: Number(pendingOrdersRow.count),
      lowStockProducts: lowStockProductsSimple.map(formatProduct),
      recentOrders: recentOrders.map(formatOrderFn),
      topProducts: topProductsDetail.map(formatProduct),
      revenueByMonth: revenueByMonth.map(r => ({
        month: r.month,
        revenue: parseFloat(String(r.revenue)),
        orders: Number(r.orders),
      })),
      ordersByStatus: ordersByStatus.map(o => ({ status: o.status, count: Number(o.count) })),
    });
  } catch (err) {
    req.log.error({ err }, "getDashboardStats error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── CUSTOMERS ───────────────────────────────────────────────────
router.get("/customers", requireAuth, async (req, res) => {
  try {
    const { page = "1", limit = "20", search } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const conditions: any[] = [];
    if (search) {
      conditions.push(ilike(customersTable.phone, `%${search}%`));
    }
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [customers, countResult] = await Promise.all([
      db.select({
        id: customersTable.id,
        phone: customersTable.phone,
        name: customersTable.name,
        email: customersTable.email,
        isAnonymous: customersTable.isAnonymous,
        createdAt: customersTable.createdAt,
        totalOrders: sql<number>`(select count(*) from orders where customer_phone = ${customersTable.phone})`,
        totalSpent: sql<number>`coalesce((select sum(total) from orders where customer_phone = ${customersTable.phone} and status not in ('cancelled','pending')), 0)`,
      }).from(customersTable).where(whereClause).limit(limitNum).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(customersTable).where(whereClause),
    ]);

    const total = Number(countResult[0]?.count ?? 0);

    res.json({
      customers: customers.map(c => ({
        ...c,
        totalOrders: Number(c.totalOrders),
        totalSpent: parseFloat(String(c.totalSpent)),
        createdAt: c.createdAt.toISOString(),
      })),
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    req.log.error({ err }, "listCustomers error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── AUDIT LOGS ──────────────────────────────────────────────────
router.get("/audit-logs", requireAuth, async (req, res) => {
  try {
    const { page = "1", limit = "50" } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const [logs, countResult] = await Promise.all([
      db.select().from(auditLogsTable).orderBy(desc(auditLogsTable.createdAt)).limit(limitNum).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(auditLogsTable),
    ]);

    const total = Number(countResult[0]?.count ?? 0);

    res.json({
      logs: logs.map(l => ({ ...l, createdAt: l.createdAt.toISOString() })),
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    req.log.error({ err }, "listAuditLogs error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
