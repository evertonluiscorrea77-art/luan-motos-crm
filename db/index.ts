import type { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "./schema";

export function getDb(): DrizzleD1Database<typeof schema> {
  throw new Error("Banco administrativo ainda não configurado na Vercel.");
}
