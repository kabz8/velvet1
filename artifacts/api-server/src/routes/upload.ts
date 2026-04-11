import { Router } from "express";
import { saveBase64File } from "../lib/upload";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { data, mimeType, folder, filename } = req.body;

    if (!data || !mimeType) {
      return void res.status(400).json({ error: "data and mimeType are required" });
    }

    const url = await saveBase64File(data, mimeType, folder, filename);
    const parts = url.split("/");
    const fname = parts[parts.length - 1];

    res.status(201).json({ url, filename: fname });
  } catch (err) {
    req.log.error({ err }, "uploadFile error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
