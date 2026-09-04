"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageCircle, ShieldCheck } from "lucide-react";
import { parseImages } from "@/lib/demo-data";
import { catalogMotorcycles } from "@/lib/catalog-data";
import MotorcycleGallery from "@/components/motorcycle-gallery";

const money = (n: number | null) => n ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n) : "Consulte";

export default function MotorcyclePage({ slug }: { slug: string }) {
  const [all, setAll] = useState(catalogMotorcycles);
  useEffect(() => {
    fetch("/api/inventory").then(r => r.json()).then(d => { if(Array.isArray(d.motorcycles)) setAll(d.motorcycles); }).catch(() => {});
  }, []);
  const moto = all.find(m => m.slug === slug);
  if (!moto) return <main className="not-found-moto"><Link href="/#estoque"><ArrowLeft /> Voltar ao estoque</Link><h1>Esta moto não está nesta seleção.</h1></main>;
  const whatsapp = "https://wa.me/558399036083?text=" + encodeURIComponent("Olá, Luan! Vi a " + (moto.version || moto.model) + " no site e quero saber mais.");
  return <main className="moto-page">
    <header><Link className="wordmark" href="/"><span>LM</span> LUAN MOTOS</Link><Link href="/#estoque"><ArrowLeft /> Voltar ao estoque</Link></header>
    <section className="moto-page-hero">
      <MotorcycleGallery key={moto.slug} images={parseImages(moto.images)} name={moto.model} />
      <div className="moto-page-info"><p className="eyebrow dark">{moto.brand}</p><h1>{moto.model}</h1>
        {moto.description && <p>{moto.description}</p>}
        <div className="moto-page-price">{money(moto.askingPrice)}</div>
        <div className="moto-page-specs"><span><b>{moto.year || "Não informado"}</b>Ano</span>
          <span><b>{parseImages(moto.images).length} fotos</b>Galeria da moto</span>
          {moto.mileage > 0 && <span><b>{moto.mileage.toLocaleString("pt-BR")} km</b>Rodagem</span>}
          {moto.engine && <span><b>{moto.engine}</b>Motor</span>}
        </div>
        <a className="moto-whatsapp" href={whatsapp} target="_blank" rel="noreferrer"><MessageCircle /> Falar com o vendedor</a>
        <small><ShieldCheck /> Confirme disponibilidade e condições com a loja.</small>
      </div>
    </section>
    <section className="related"><p className="eyebrow dark">Outras escolhas</p><h2>Conheça também.</h2><div>{all.filter(m => m.id !== moto.id).slice(0, 3).map(m => <Link href={`/motos/${m.slug}`} key={m.id}><span>{m.brand}</span><strong>{m.model}</strong><small>{m.year} · {money(m.askingPrice)}</small></Link>)}</div></section>
  </main>;
}
