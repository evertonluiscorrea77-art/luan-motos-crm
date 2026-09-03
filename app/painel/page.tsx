import CrmDashboard from "@/components/crm-dashboard";
import { requireChatGPTUser } from "@/app/chatgpt-auth";
export const dynamic="force-dynamic";
export default async function Painel(){const user=await requireChatGPTUser("/painel");return <CrmDashboard displayName={user.displayName}/>}
