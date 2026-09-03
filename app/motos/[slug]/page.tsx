import MotorcyclePage from "@/components/motorcycle-page";
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return <MotorcyclePage slug={slug}/>}
