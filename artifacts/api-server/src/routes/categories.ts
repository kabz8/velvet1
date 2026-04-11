import { Router } from "express";
import { db } from "@workspace/db";
import { categoriesTable, productsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { logAudit } from "../lib/audit";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const categories = await db.select({
      id: categoriesTable.id,
      name: categoriesTable.name,
      slug: categoriesTable.slug,
      description: categoriesTable.description,
      imageUrl: categoriesTable.imageUrl,
      createdAt: categoriesTable.createdAt,
      productCount: sql<number>`(select count(*) from products where category_id = ${categoriesTable.id} and status = 'published')`,
    }).from(categoriesTable).orderBy(categoriesTable.name);

    res.json(categories.map(c => ({ ...c, productCount: Number(c.productCount) })));
  } catch (err) {
    req.log.error({ err }, "listCategories error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const { name, slug, description, imageUrl } = req.body;
    const [category] = await db.insert(categoriesTable).values({ name, slug, description, imageUrl }).returning();

    await logAudit({
      adminId: (req as any).adminUser?.id,
      adminName: (req as any).adminUser?.name,
      action: "category_created",
      entityType: "category",
      entityId: String(category.id),
      newValue: category,
    });

    res.status(201).json({ ...category, productCount: 0 });
  } catch (err) {
    req.log.error({ err }, "createCategory error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, slug, description, imageUrl } = req.body;
    const [existing] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, id)).limit(1);
    if (!existing) return void res.status(404).json({ error: "Not found" });

    const [updated] = await db.update(categoriesTable)
      .set({ name, slug, description, imageUrl, updatedAt: new Date() })
      .where(eq(categoriesTable.id, id)).returning();

    await logAudit({
      adminId: (req as any).adminUser?.id,
      adminName: (req as any).adminUser?.name,
      action: "category_updated",
      entityType: "category",
      entityId: String(id),
      previousValue: existing,
      newValue: updated,
    });

    const [countResult] = await db.select({ count: sql<number>`count(*)` })
      .from(productsTable).where(eq(productsTable.categoryId, id));

    res.json({ ...updated, productCount: Number(countResult?.count ?? 0) });
  } catch (err) {
    req.log.error({ err }, "updateCategory error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(categoriesTable).where(eq(categoriesTable.id, id));

    await logAudit({
      adminId: (req as any).adminUser?.id,
      adminName: (req as any).adminUser?.name,
      action: "category_deleted",
      entityType: "category",
      entityId: String(id),
    });

    res.json({ success: true, message: "Category deleted" });
  } catch (err) {
    req.log.error({ err }, "deleteCategory error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
