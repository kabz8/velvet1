import { Router } from "express";
import { db } from "@workspace/db";
import { offersTable } from "@workspace/db";
import { eq, and, lte, gte, or, isNull } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { logAudit } from "../lib/audit";

const router = Router();

function formatOffer(o: any) {
  return {
    ...o,
    discountValue: parseFloat(o.discountValue),
    startDate: o.startDate?.toISOString() ?? null,
    endDate: o.endDate?.toISOString() ?? null,
    productIds: o.productIds ?? [],
    categoryIds: o.categoryIds ?? [],
    createdAt: o.createdAt.toISOString(),
  };
}

router.get("/", async (req, res) => {
  try {
    const active = req.query.active === "true";
    const now = new Date();
    const conditions: any[] = [];
    if (active) {
      conditions.push(eq(offersTable.isActive, true));
      conditions.push(or(isNull(offersTable.startDate), lte(offersTable.startDate, now))!);
      conditions.push(or(isNull(offersTable.endDate), gte(offersTable.endDate, now))!);
    }
    const offers = await db.select().from(offersTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
    res.json(offers.map(formatOffer));
  } catch (err) {
    req.log.error({ err }, "listOffers error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const body = req.body;
    const [offer] = await db.insert(offersTable).values({
      name: body.name,
      discountType: body.discountType,
      discountValue: String(body.discountValue),
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      isActive: body.isActive ?? true,
      productIds: body.productIds ?? [],
      categoryIds: body.categoryIds ?? [],
    }).returning();

    await logAudit({
      adminId: (req as any).adminUser?.id,
      adminName: (req as any).adminUser?.name,
      action: "offer_created",
      entityType: "offer",
      entityId: String(offer.id),
      newValue: offer,
    });

    res.status(201).json(formatOffer(offer));
  } catch (err) {
    req.log.error({ err }, "createOffer error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const body = req.body;
    const [existing] = await db.select().from(offersTable).where(eq(offersTable.id, id)).limit(1);
    if (!existing) return void res.status(404).json({ error: "Not found" });

    const [updated] = await db.update(offersTable).set({
      name: body.name,
      discountType: body.discountType,
      discountValue: String(body.discountValue),
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      isActive: body.isActive ?? true,
      productIds: body.productIds ?? [],
      categoryIds: body.categoryIds ?? [],
      updatedAt: new Date(),
    }).where(eq(offersTable.id, id)).returning();

    await logAudit({
      adminId: (req as any).adminUser?.id,
      adminName: (req as any).adminUser?.name,
      action: "offer_updated",
      entityType: "offer",
      entityId: String(id),
      previousValue: existing,
      newValue: updated,
    });

    res.json(formatOffer(updated));
  } catch (err) {
    req.log.error({ err }, "updateOffer error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(offersTable).where(eq(offersTable.id, id));

    await logAudit({
      adminId: (req as any).adminUser?.id,
      adminName: (req as any).adminUser?.name,
      action: "offer_deleted",
      entityType: "offer",
      entityId: String(id),
    });

    res.json({ success: true, message: "Offer deleted" });
  } catch (err) {
    req.log.error({ err }, "deleteOffer error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
