"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageCircle, ShieldCheck } from "lucide-react";
import type { Motorcycle } from "@/lib/demo-data";
import { parseImages } from "@/lib/demo-data";
import { catalogMotorcycles } from "@/lib/catalog-data";
import CatalogImage from "@/components/catalog-image";
const money=(n:number|null)=>n?new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0}).format(n):"Consulte";
export default function MotorcyclePage({slug}:{slug:string}){
 const [moto,setMoto]=useState<Motorcycle|undefined>(catalogMotorcycles.find(m=>m.slug===slug));const [all,setAll]=useState(catalogMotorcycles);
 useEffect(()=>{fetch("/api/inventory").then(r=>r.json()).then(d=>{setAll(d.motorcycles);setMoto(d.motorcycles.find((m:Motorcycle)=>m.slug===slug)||catalogMotorcycles.find(m=>m.slug===slug))}).catch(()=>{})},[slug]);
 if(!moto)return <main className="not-found-moto"><Link href="/"><ArrowLeft/> Voltar ao estoque</Link><h1>Esta moto não está mais disponível.</h1></main>;
 const whatsapp=`https://wa.me/558399036083?text=${encodeURIComponent(`Olá, Luan! Vi a ${moto.brand} ${moto.model} ${moto.year} no site e quero saber mais.`)}`;
 return <main className="moto-page"><header><Link className="wordmark" href="/"><span>LM</span> LUAN MOTOS</Link><Link href="/"><ArrowLeft/> Voltar ao estoque</Link></header><section className="moto-page-hero"><div className="moto-page-image"><CatalogImage fill priority sizes="(max-width: 900px) 100vw, 62vw" src={parseImages(moto.images)[0]||"/images/showroom.jpg"} alt={`${moto.brand} ${moto.model}`}/></div><div className="moto-page-info"><p className="eyebrow dark">{moto.brand} · Disponível</p><h1>{moto.model}</h1><p>{moto.description}</p><div className="moto-page-price">{money(moto.askingPrice)}</div><div className="moto-page-specs"><span><b>{moto.year||"Não informado"}</b>Ano</span>{moto.mileage>0&&<span><b>{moto.mileage.toLocaleString("pt-BR")} km</b>Rodagem</span>}{moto.engine&&<span><b>{moto.engine}</b>Motor</span>}{moto.color&&<span><b>{moto.color}</b>Cor</span>}</div><a className="moto-whatsapp" href={whatsapp} target="_blank"><MessageCircle/> Falar com o vendedor</a><small><ShieldCheck/> Atendimento direto pela Luan Motos.</small></div></section><section className="related"><p className="eyebrow dark">Outras escolhas</p><h2>Talvez a próxima esteja aqui.</h2><div>{all.filter(m=>m.id!==moto.id).slice(0,3).map(m=><Link href={`/motos/${m.slug}`} key={m.id}><span>{m.brand}</span><strong>{m.model}</strong><small>{m.year?`${m.year} · `:""}{money(m.askingPrice)}</small></Link>)}</div></section></main>
}
