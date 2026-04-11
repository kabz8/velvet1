import { Router } from "express";
import { db } from "@workspace/db";
import { bannersTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { logAudit } from "../lib/audit";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const all = req.query.all === "true";
    const banners = await db.select().from(bannersTable)
      .where(all ? undefined : eq(bannersTable.isActive, true))
      .orderBy(asc(bannersTable.sortOrder));
    res.json(banners);
  } catch (err) {
    req.log.error({ err }, "listBanners error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const body = req.body;
    const [banner] = await db.insert(bannersTable).values({
      title: body.title,
      subtitle: body.subtitle ?? null,
      imageUrl: body.imageUrl ?? null,
      ctaLabel: body.ctaLabel ?? null,
      ctaLink: body.ctaLink ?? null,
      sortOrder: body.sortOrder ?? 0,
      isActive: body.isActive ?? true,
    }).returning();

    await logAudit({
      adminId: (req as any).adminUser?.id,
      adminName: (req as any).adminUser?.name,
      action: "banner_created",
      entityType: "banner",
      entityId: String(banner.id),
      newValue: banner,
    });

    res.status(201).json(banner);
  } catch (err) {
    req.log.error({ err }, "createBanner error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const body = req.body;
    const [existing] = await db.select().from(bannersTable).where(eq(bannersTable.id, id)).limit(1);
    if (!existing) return void res.status(404).json({ error: "Not found" });

    const [updated] = await db.update(bannersTable).set({
      title: body.title,
      subtitle: body.subtitle ?? null,
      imageUrl: body.imageUrl ?? null,
      ctaLabel: body.ctaLabel ?? null,
      ctaLink: body.ctaLink ?? null,
      sortOrder: body.sortOrder ?? 0,
      isActive: body.isActive ?? true,
      updatedAt: new Date(),
    }).where(eq(bannersTable.id, id)).returning();

    await logAudit({
      adminId: (req as any).adminUser?.id,
      adminName: (req as any).adminUser?.name,
      action: "banner_updated",
      entityType: "banner",
      entityId: String(id),
      previousValue: existing,
      newValue: updated,
    });

    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "updateBanner error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(bannersTable).where(eq(bannersTable.id, id));

    await logAudit({
      adminId: (req as any).adminUser?.id,
      adminName: (req as any).adminUser?.name,
      action: "banner_deleted",
      entityType: "banner",
      entityId: String(id),
    });

    res.json({ success: true, message: "Banner deleted" });
  } catch (err) {
    req.log.error({ err }, "deleteBanner error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
