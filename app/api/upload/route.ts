import { getChatGPTUser } from "@/app/chatgpt-auth";
export async function POST(request:Request){
  if(!(await getChatGPTUser()))return Response.json({error:"Não autorizado"},{status:401});void request;return Response.json({error:"Upload será liberado após a contratação do armazenamento definitivo."},{status:503});
}
