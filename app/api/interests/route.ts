import { getDb } from "@/db";
import { leads } from "@/db/schema";
export async function POST(request:Request){
  try{const p=await request.json() as Record<string,unknown>;const name=String(p.name||"").trim().slice(0,120);const phone=String(p.phone||"").replace(/\D/g,"").slice(0,15);if(name.length<2||phone.length<10)return Response.json({error:"Informe nome e WhatsApp"},{status:400});const [lead]=await getDb().insert(leads).values({name,phone,source:"Site",motorcycleId:p.motorcycleId?Number(p.motorcycleId):null,stage:"novo",notes:"Interesse registrado no showroom digital."}).returning();return Response.json({lead},{status:201})}catch{return Response.json({error:"Não foi possível registrar agora"},{status:500})}
}
