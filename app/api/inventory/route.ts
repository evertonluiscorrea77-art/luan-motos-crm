import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { motorcycles } from "@/db/schema";
import { catalogMotorcycles } from "@/lib/catalog-data";

export async function GET() {
  try {
    const rows = await getDb().select().from(motorcycles).where(and(eq(motorcycles.published,true),eq(motorcycles.status,"disponivel"))).orderBy(desc(motorcycles.featured),desc(motorcycles.createdAt));
    const fallback=catalogMotorcycles.filter(m=>m.published&&m.status==="disponivel");
    return Response.json({motorcycles:rows.length?rows:fallback,demo:rows.length===0});
  } catch { return Response.json({motorcycles:catalogMotorcycles.filter(m=>m.published&&m.status==="disponivel"),demo:true}); }
}
