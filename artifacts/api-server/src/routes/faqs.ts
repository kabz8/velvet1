import { Router } from "express";
import { db } from "@workspace/db";
import { faqsTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router = Router();

function formatFaq(f: any) {
  return { ...f, createdAt: f.createdAt.toISOString() };
}

router.get("/", async (req, res) => {
  try {
    const faqs = await db.select().from(faqsTable).where(eq(faqsTable.isActive, true)).orderBy(asc(faqsTable.sortOrder));
    res.json(faqs.map(formatFaq));
  } catch (err) {
    req.log.error({ err }, "listFaqs error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const body = req.body;
    const [faq] = await db.insert(faqsTable).values({
      question: body.question,
      answer: body.answer,
      sortOrder: body.sortOrder ?? 0,
      isActive: body.isActive ?? true,
    }).returning();
    res.status(201).json(formatFaq(faq));
  } catch (err) {
    req.log.error({ err }, "createFaq error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const body = req.body;
    const [updated] = await db.update(faqsTable).set({
      question: body.question,
      answer: body.answer,
      sortOrder: body.sortOrder,
      isActive: body.isActive,
      updatedAt: new Date(),
    }).where(eq(faqsTable.id, id)).returning();
    res.json(formatFaq(updated));
  } catch (err) {
    req.log.error({ err }, "updateFaq error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(faqsTable).where(eq(faqsTable.id, id));
    res.json({ success: true, message: "FAQ deleted" });
  } catch (err) {
    req.log.error({ err }, "deleteFaq error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
