import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { adMetrics, goals, leads, motorcycles } from "@/db/schema";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { demoAds, demoGoal, demoLeads, demoMotorcycles } from "@/lib/demo-data";

async function authorized(){return Boolean(await getChatGPTUser())}
const slugify=(v:string)=>v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
export async function GET(){
  if(!(await authorized()))return Response.json({error:"Não autorizado"},{status:401});
  try{const db=getDb();const [motos,contacts,target,ads]=await Promise.all([db.select().from(motorcycles).orderBy(desc(motorcycles.createdAt)),db.select().from(leads).orderBy(desc(leads.updatedAt)),db.select().from(goals).orderBy(desc(goals.month)).limit(1),db.select().from(adMetrics).orderBy(desc(adMetrics.month))]);const empty=!motos.length&&!contacts.length;return Response.json({motorcycles:motos.length?motos:demoMotorcycles,leads:contacts.length?contacts:demoLeads,goal:target[0]??demoGoal,ads:ads.length?ads:demoAds,demo:empty})}catch{return Response.json({motorcycles:demoMotorcycles,leads:demoLeads,goal:demoGoal,ads:demoAds,demo:true})}
}
export async function POST(request:Request){
  if(!(await authorized()))return Response.json({error:"Não autorizado"},{status:401});
  const p=await request.json() as Record<string,unknown>;const action=String(p.action||"");const db=getDb();
  if(action==="add_motorcycle"){
    const brand=String(p.brand||"").trim(),model=String(p.model||"").trim();if(!brand||!model)return Response.json({error:"Marca e modelo são obrigatórios"},{status:400});
    const [row]=await db.insert(motorcycles).values({slug:`${slugify(`${brand}-${model}-${p.year||new Date().getFullYear()}`)}-${Date.now().toString(36)}`,brand,model,version:String(p.version||""),year:Number(p.year||new Date().getFullYear()),mileage:Number(p.mileage||0),engine:String(p.engine||""),color:String(p.color||""),askingPrice:p.askingPrice?Number(p.askingPrice):null,purchasePrice:p.purchasePrice?Number(p.purchasePrice):null,minimumPrice:p.minimumPrice?Number(p.minimumPrice):null,ownership:String(p.ownership||"propria"),description:String(p.description||""),images:JSON.stringify(p.images||[]),published:true}).returning();return Response.json({motorcycle:row},{status:201});
  }
  if(action==="update_motorcycle"){
    const updates:Record<string,unknown>={updatedAt:new Date().toISOString()};for(const k of ["brand","model","version","engine","color","ownership","status","description"] as const)if(p[k]!==undefined)updates[k]=String(p[k]);for(const k of ["year","mileage","askingPrice","purchasePrice","minimumPrice","salePrice"] as const)if(p[k]!==undefined)updates[k]=p[k]===null||p[k]===""?null:Number(p[k]);for(const k of ["featured","published"] as const)if(p[k]!==undefined)updates[k]=Boolean(p[k]);if(p.images!==undefined)updates.images=JSON.stringify(p.images);if(p.status==="vendida")updates.soldAt=new Date().toISOString();const [row]=await db.update(motorcycles).set(updates).where(eq(motorcycles.id,Number(p.id))).returning();return Response.json({motorcycle:row});
  }
  if(action==="delete_motorcycle"){await db.delete(motorcycles).where(eq(motorcycles.id,Number(p.id)));return Response.json({ok:true})}
  if(action==="add_lead"){
    const name=String(p.name||"").trim(),phone=String(p.phone||"").replace(/\D/g,"");if(!name||!phone)return Response.json({error:"Nome e telefone são obrigatórios"},{status:400});const [row]=await db.insert(leads).values({name,phone,email:String(p.email||""),source:String(p.source||"manual"),motorcycleId:p.motorcycleId?Number(p.motorcycleId):null,stage:String(p.stage||"novo"),notes:String(p.notes||""),followUpAt:p.followUpAt?String(p.followUpAt):null}).returning();return Response.json({lead:row},{status:201});
  }
  if(action==="move_lead"){const [row]=await db.update(leads).set({stage:String(p.stage||"novo"),updatedAt:new Date().toISOString()}).where(eq(leads.id,Number(p.id))).returning();return Response.json({lead:row})}
  if(action==="delete_lead"){await db.delete(leads).where(eq(leads.id,Number(p.id)));return Response.json({ok:true})}
  if(action==="save_goal"){const month=String(p.month||new Date().toISOString().slice(0,7));const found=await db.select().from(goals).where(eq(goals.month,month)).limit(1);const values={salesTarget:Number(p.salesTarget||0),revenueTarget:Number(p.revenueTarget||0),profitTarget:Number(p.profitTarget||0),updatedAt:new Date().toISOString()};const [row]=found.length?await db.update(goals).set(values).where(eq(goals.month,month)).returning():await db.insert(goals).values({month,...values}).returning();return Response.json({goal:row})}
  if(action==="save_ad_metric"){const [row]=await db.insert(adMetrics).values({month:String(p.month||new Date().toISOString().slice(0,7)),channel:String(p.channel||"Google Ads"),investment:Number(p.investment||0),leads:Number(p.leads||0),sales:Number(p.sales||0),revenue:Number(p.revenue||0),profit:Number(p.profit||0)}).returning();return Response.json({metric:row},{status:201})}
  return Response.json({error:"Ação inválida"},{status:400});
}
