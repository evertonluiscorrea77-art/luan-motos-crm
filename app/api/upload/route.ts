import { env } from "cloudflare:workers";
import { getChatGPTUser } from "@/app/chatgpt-auth";
export async function POST(request:Request){
  if(!(await getChatGPTUser()))return Response.json({error:"Não autorizado"},{status:401});const form=await request.formData();const file=form.get("file");if(!(file instanceof File))return Response.json({error:"Arquivo ausente"},{status:400});if(!file.type.startsWith("image/"))return Response.json({error:"Envie uma imagem"},{status:400});if(file.size>8*1024*1024)return Response.json({error:"Imagem maior que 8 MB"},{status:400});const ext=file.name.split(".").pop()?.replace(/[^a-z0-9]/gi,"").toLowerCase()||"jpg";const key=`motorcycles/${crypto.randomUUID()}.${ext}`;await env.BUCKET.put(key,await file.arrayBuffer(),{httpMetadata:{contentType:file.type}});return Response.json({url:`/api/media/${key}`});
}
