import fs from "fs";
import path from "path";
import { logger } from "./logger";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export async function saveBase64File(
  base64Data: string,
  mimeType: string,
  folder?: string,
  filename?: string,
): Promise<string> {
  const ext = mimeType.split("/")[1] || "bin";
  const fname = filename || `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const dir = folder ? path.join(UPLOADS_DIR, folder) : UPLOADS_DIR;

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filePath = path.join(dir, fname);
  const buffer = Buffer.from(base64Data.replace(/^data:[^;]+;base64,/, ""), "base64");
  fs.writeFileSync(filePath, buffer);

  const relative = folder ? `${folder}/${fname}` : fname;
  logger.info({ relative }, "File saved");
  return `/api/uploads/${relative}`;
}
