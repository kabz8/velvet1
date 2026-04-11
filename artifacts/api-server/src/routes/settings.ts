import { Router } from "express";
import { db } from "@workspace/db";
import { siteSettingsTable, ageGateSettingsTable, shippingSettingsTable } from "@workspace/db";
import { requireAuth } from "../lib/auth";
import { logAudit } from "../lib/audit";
import { sql } from "drizzle-orm";

const router = Router();

async function getOrCreateSettings() {
  let [settings] = await db.select().from(siteSettingsTable).limit(1);
  if (!settings) {
    [settings] = await db.insert(siteSettingsTable).values({}).returning();
  }
  return settings;
}

async function getOrCreateAgeGate() {
  let [settings] = await db.select().from(ageGateSettingsTable).limit(1);
  if (!settings) {
    [settings] = await db.insert(ageGateSettingsTable).values({}).returning();
  }
  return settings;
}

async function getOrCreateShipping() {
  let [settings] = await db.select().from(shippingSettingsTable).limit(1);
  if (!settings) {
    [settings] = await db.insert(shippingSettingsTable).values({}).returning();
  }
  return settings;
}

router.get("/", async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.json(settings);
  } catch (err) {
    req.log.error({ err }, "getSettings error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/", requireAuth, async (req, res) => {
  try {
    const body = req.body;
    const current = await getOrCreateSettings();

    const [updated] = await db.update(siteSettingsTable).set({
      storeName: body.storeName ?? current.storeName,
      storeEmail: body.storeEmail ?? null,
      storePhone: body.storePhone ?? null,
      storeAddress: body.storeAddress ?? null,
      announcementBar: body.announcementBar ?? null,
      announcementBarEnabled: body.announcementBarEnabled ?? current.announcementBarEnabled,
      socialFacebook: body.socialFacebook ?? null,
      socialInstagram: body.socialInstagram ?? null,
      socialTwitter: body.socialTwitter ?? null,
      socialWhatsapp: body.socialWhatsapp ?? null,
      footerText: body.footerText ?? null,
      cashOnDeliveryEnabled: body.cashOnDeliveryEnabled ?? current.cashOnDeliveryEnabled,
      metaTitle: body.metaTitle ?? null,
      metaDescription: body.metaDescription ?? null,
      socialImageUrl: body.socialImageUrl ?? null,
      updatedAt: new Date(),
    }).where(sql`id = ${current.id}`).returning();

    await logAudit({
      adminId: (req as any).adminUser?.id,
      adminName: (req as any).adminUser?.name,
      action: "settings_updated",
      entityType: "site_settings",
      previousValue: current,
      newValue: updated,
    });

    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "updateSettings error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/age-gate", async (req, res) => {
  try {
    const settings = await getOrCreateAgeGate();
    res.json(settings);
  } catch (err) {
    req.log.error({ err }, "getAgeGateSettings error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/age-gate", requireAuth, async (req, res) => {
  try {
    const body = req.body;
    const current = await getOrCreateAgeGate();

    const [updated] = await db.update(ageGateSettingsTable).set({
      enabled: body.enabled ?? current.enabled,
      title: body.title ?? current.title,
      message: body.message ?? current.message,
      confirmLabel: body.confirmLabel ?? current.confirmLabel,
      exitLabel: body.exitLabel ?? current.exitLabel,
      backgroundImageUrl: body.backgroundImageUrl ?? null,
      updatedAt: new Date(),
    }).where(sql`id = ${current.id}`).returning();

    await logAudit({
      adminId: (req as any).adminUser?.id,
      adminName: (req as any).adminUser?.name,
      action: "age_gate_settings_updated",
      entityType: "age_gate_settings",
      previousValue: current,
      newValue: updated,
    });

    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "updateAgeGateSettings error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/shipping", async (req, res) => {
  try {
    const settings = await getOrCreateShipping();
    res.json({
      ...settings,
      nairobiCountyFee: parseFloat(settings.nairobiCountyFee),
      outsideNairobiFee: parseFloat(settings.outsideNairobiFee),
    });
  } catch (err) {
    req.log.error({ err }, "getShippingSettings error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/shipping", requireAuth, async (req, res) => {
  try {
    const { nairobiCountyFee, outsideNairobiFee } = req.body;
    const current = await getOrCreateShipping();

    const [updated] = await db.update(shippingSettingsTable).set({
      nairobiCountyFee: String(nairobiCountyFee ?? current.nairobiCountyFee),
      outsideNairobiFee: String(outsideNairobiFee ?? current.outsideNairobiFee),
      updatedAt: new Date(),
    }).where(sql`id = ${current.id}`).returning();

    await logAudit({
      adminId: (req as any).adminUser?.id,
      adminName: (req as any).adminUser?.name,
      action: "shipping_settings_updated",
      entityType: "shipping_settings",
      previousValue: current,
      newValue: updated,
    });

    res.json({
      ...updated,
      nairobiCountyFee: parseFloat(updated.nairobiCountyFee),
      outsideNairobiFee: parseFloat(updated.outsideNairobiFee),
    });
  } catch (err) {
    req.log.error({ err }, "updateShippingSettings error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
