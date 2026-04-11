import { Router } from "express";
import { db } from "@workspace/db";
import { testimonialsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router = Router();

function formatTestimonial(t: any) {
  return { ...t, createdAt: t.createdAt.toISOString() };
}

router.get("/", async (req, res) => {
  try {
    const testimonials = await db.select().from(testimonialsTable).where(eq(testimonialsTable.isActive, true));
    res.json(testimonials.map(formatTestimonial));
  } catch (err) {
    req.log.error({ err }, "listTestimonials error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const body = req.body;
    const [t] = await db.insert(testimonialsTable).values({
      customerAlias: body.customerAlias,
      rating: body.rating ?? 5,
      content: body.content,
      isActive: body.isActive ?? true,
    }).returning();
    res.status(201).json(formatTestimonial(t));
  } catch (err) {
    req.log.error({ err }, "createTestimonial error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const body = req.body;
    const [updated] = await db.update(testimonialsTable).set({
      customerAlias: body.customerAlias,
      rating: body.rating,
      content: body.content,
      isActive: body.isActive,
      updatedAt: new Date(),
    }).where(eq(testimonialsTable.id, id)).returning();
    res.json(formatTestimonial(updated));
  } catch (err) {
    req.log.error({ err }, "updateTestimonial error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(testimonialsTable).where(eq(testimonialsTable.id, id));
    res.json({ success: true, message: "Testimonial deleted" });
  } catch (err) {
    req.log.error({ err }, "deleteTestimonial error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
