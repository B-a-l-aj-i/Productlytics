import fs from "node:fs/promises";
import path from "node:path";

// Swappable storage backend (brief requirement). The app only ever calls
// put/get/delete with a key — replacing local disk with S3 later means
// reimplementing these three functions, nothing else changes.
const UPLOAD_DIR = path.resolve("uploads");

export const storage = {
  async put(key: string, bytes: Buffer): Promise<void> {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.writeFile(path.join(UPLOAD_DIR, key), bytes);
  },

  async get(key: string): Promise<Buffer> {
    return fs.readFile(path.join(UPLOAD_DIR, key));
  },

  async delete(key: string): Promise<void> {
    await fs.rm(path.join(UPLOAD_DIR, key), { force: true });
  },
};
