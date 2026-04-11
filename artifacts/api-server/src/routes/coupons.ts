import { Router } from "express";
import { db } from "@workspace/db";
import { couponsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router = Router();

function formatCoupon(c: any) {
  return {
    ...c,
    discountValue: parseFloat(c.discountValue),
    minOrderAmount: c.minOrderAmount ? parseFloat(c.minOrderAmount) : null,
    expiresAt: c.expiresAt?.toISOString() ?? null,
    createdAt: c.createdAt.toISOString(),
  };
}

router.get("/", requireAuth, async (req, res) => {
  try {
    const coupons = await db.select().from(couponsTable);
    res.json(coupons.map(formatCoupon));
  } catch (err) {
    req.log.error({ err }, "listCoupons error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/validate", async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    const [coupon] = await db.select().from(couponsTable).where(eq(couponsTable.code, code.toUpperCase())).limit(1);

    if (!coupon || !coupon.isActive) {
      return void res.json({ valid: false, discountAmount: 0, message: "Invalid coupon code" });
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return void res.json({ valid: false, discountAmount: 0, message: "Coupon has expired" });
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return void res.json({ valid: false, discountAmount: 0, message: "Coupon usage limit reached" });
    }

    const minAmount = coupon.minOrderAmount ? parseFloat(coupon.minOrderAmount) : 0;
    if (orderAmount < minAmount) {
      return void res.json({
        valid: false,
        discountAmount: 0,
        message: `Minimum order amount is KES ${minAmount.toLocaleString()}`,
      });
    }

    const discountVal = parseFloat(coupon.discountValue);
    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = Math.round((orderAmount * discountVal) / 100);
    } else {
      discountAmount = Math.min(discountVal, orderAmount);
    }

    res.json({ valid: true, coupon: formatCoupon(coupon), discountAmount, message: null });
  } catch (err) {
    req.log.error({ err }, "validateCoupon error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const body = req.body;
    const [coupon] = await db.insert(couponsTable).values({
      code: body.code.toUpperCase(),
      discountType: body.discountType,
      discountValue: String(body.discountValue),
      minOrderAmount: body.minOrderAmount != null ? String(body.minOrderAmount) : null,
      maxUses: body.maxUses ?? null,
      isActive: body.isActive ?? true,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
    }).returning();

    res.status(201).json(formatCoupon(coupon));
  } catch (err) {
    req.log.error({ err }, "createCoupon error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const body = req.body;
    const [existing] = await db.select().from(couponsTable).where(eq(couponsTable.id, id)).limit(1);
    if (!existing) return void res.status(404).json({ error: "Not found" });

    const [updated] = await db.update(couponsTable).set({
      code: body.code?.toUpperCase(),
      discountType: body.discountType,
      discountValue: String(body.discountValue),
      minOrderAmount: body.minOrderAmount != null ? String(body.minOrderAmount) : null,
      maxUses: body.maxUses ?? null,
      isActive: body.isActive ?? true,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      updatedAt: new Date(),
    }).where(eq(couponsTable.id, id)).returning();

    res.json(formatCoupon(updated));
  } catch (err) {
    req.log.error({ err }, "updateCoupon error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(couponsTable).where(eq(couponsTable.id, id));
    res.json({ success: true, message: "Coupon deleted" });
  } catch (err) {
    req.log.error({ err }, "deleteCoupon error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
