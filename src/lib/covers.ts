import "server-only";
import crypto from "node:crypto";
import { query } from "./db";
import type { NewCover } from "./books";

// Covers are resized in the browser (see lib/resize-image.ts) before upload,
// so anything bigger than this means something went wrong.
const MAX_COVER_BYTES = 1024 * 1024;
const ALLOWED_TYPES = ["image/webp", "image/jpeg", "image/png"];

/** Cover ids are UUIDs; anything else is rejected before touching the database. */
export const COVER_ID_RE = /^[a-f0-9-]{36}$/;

export async function readCoverFile(file: File): Promise<NewCover> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Unsupported image type.");
  }
  if (file.size > MAX_COVER_BYTES) {
    throw new Error("The cover image is too large.");
  }
  return {
    id: crypto.randomUUID(),
    mime: file.type,
    data: new Uint8Array(await file.arrayBuffer()),
  };
}

export async function getCover(id: string) {
  const rows = await query<{ mime: string; data: ArrayBuffer }>(
    "SELECT mime, data FROM covers WHERE id = ?",
    [id],
  );
  return rows[0];
}
