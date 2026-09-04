"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowRight, Camera, ListFilter, MapPin, MessageCircle, RotateCcw, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Motorcycle } from "@/lib/demo-data";
import { parseImages } from "@/lib/demo-data";
import { catalogMotorcycles } from "@/lib/catalog-data";
import CatalogImage from "@/components/catalog-image";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const money=(value:number|null)=>value?new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0}).format(value):"Consulte";
const whatsapp=(motorcycle?:Motorcycle)=>`https://wa.me/558399036083?text=${encodeURIComponent(motorcycle?`Olá, Luan! Vi a ${motorcycle.brand} ${motorcycle.model} ${motorcycle.year} no site e quero saber mais.`:"Olá, Luan! Vim pelo site e quero encontrar minha próxima moto.")}`;
const modelFamily=(moto:Motorcycle)=>{
  const value=`${moto.brand} ${moto.model}`.toUpperCase().replace(/[-/,]/g," ");
  const families=["XRE 300","XRE 190","TITAN 160","TITAN 150","TITAN 125","FAN 160","FAN 150","FAN 125","BROS 160","BROS 150","BIZ 125","BIZ 110","BIZ 100","POP 110","POP 100","CB 300","CB 250","CBX 250","TWISTER 250","XT 660","XTZ 250","LANDER 250","FALCON 400","START 160","CRF 250","CRF 230","HORNET 600","CB 500","PCX 150","FAZER 250","FAZER 150","FACTOR 150","FACTOR 125","TORNADO 250","SAHARA 300","NC 750","YBR 150","YBR 125"];
  return families.find(item=>value.includes(item))||moto.model.replace(/\b(?:19|20)\d{2}\b.*$/," ").trim();
};

export default function PublicShowroom(){
  const [motos,setMotos]=useState(catalogMotorcycles.filter(m=>m.published&&m.status==="disponivel"));
  const [model,setModel]=useState(""),[year,setYear]=useState(""),[maxPrice,setMaxPrice]=useState(""),[visible,setVisible]=useState(12);
  useEffect(()=>{fetch("/api/inventory").then(r=>r.json()).then(d=>d.motorcycles&&setMotos(d.motorcycles)).catch(()=>{})},[]);
  const models=useMemo(()=>Array.from(new Set(motos.map(modelFamily))).sort((a,b)=>a.localeCompare(b,"pt-BR")),[motos]);
  const years=useMemo(()=>Array.from(new Set(motos.map(m=>m.year).filter(Boolean))).sort((a,b)=>b-a),[motos]);
  const priceLimits=useMemo(()=>{const highest=Math.max(3000,...motos.map(m=>m.askingPrice||0));return Array.from({length:Math.max(1,Math.ceil(highest/1000)-2)},(_,i)=>(i+3)*1000)},[motos]);
  const filtered=useMemo(()=>motos.filter(m=>{
    return (!model||modelFamily(m)===model)&&(!year||m.year===Number(year))&&(!maxPrice||(m.askingPrice!==null&&m.askingPrice<=Number(maxPrice)));
  }),[motos,model,year,maxPrice]);
  const activeFilters=[model,year,maxPrice].filter(Boolean).length;
  const clearFilters=()=>{setModel("");setYear("");setMaxPrice("");setVisible(12)};
  return <main className="showroom-shell">
    <section className="showroom-hero" id="inicio">
      <Image fill priority sizes="100vw" className="showroom-hero-bg" src="/images/luan-motos-cover.webp" alt="Identidade visual Luan Motos" />
      <div className="showroom-shade" />
      <header className="public-header">
        <a className="wordmark" href="#inicio"><span>LM</span> LUAN MOTOS</a>
        <nav><a href="#estoque">Motos</a><a href="#sobre">A loja</a><a href="#localizacao">Localização</a></nav>
        <a className="header-cta" href={whatsapp()} target="_blank" rel="noreferrer">WhatsApp <ArrowRight size={16}/></a>
      </header>
      <div className="hero-copy">
        <p className="eyebrow">Campina Grande · PB</p>
        <h1>A moto certa<br/><em>muda o caminho.</em></h1>
        <p className="hero-lead">Compra, venda, troca e financiamento com atendimento direto e motos escolhidas uma a uma.</p>
        <div className="hero-actions"><a className="primary-action" href="#estoque">Explorar estoque <ArrowDown size={18}/></a><a className="ghost-action" href={whatsapp()} target="_blank" rel="noreferrer"><MessageCircle size={18}/> Falar com Luan</a></div>
      </div>
      <div className="hero-proof"><div><strong>09h — 18h</strong><span>Atendimento</span></div><div><strong>Procedência</strong><span>Escolha segura</span></div><div><strong>Direto</strong><span>Sem atravessador</span></div></div>
    </section>

    <section className="manifesto"><p>Não é só cilindrada.</p><h2>É confiança para escolher.<br/>Liberdade para partir.</h2><div className="manifesto-line"/></section>

    <section className="inventory-section" id="estoque">
      <div className="section-heading"><div><p className="eyebrow dark">Estoque selecionado</p><h2>Escolha sua próxima máquina.</h2></div><p>Veja os detalhes. Compare com calma. Quando uma fizer sentido, fale direto com a loja.</p></div>
      <div className="catalog-toolbar">
        <p><strong>{filtered.length}</strong> {filtered.length===1?"moto encontrada":"motos encontradas"}</p>
        <div>
          {activeFilters>0&&<button className="filter-clear" type="button" onClick={clearFilters}><RotateCcw/> Limpar filtros</button>}
          <Sheet>
            <SheetTrigger className="filter-trigger"><ListFilter/> Filtrar {activeFilters>0&&<span>{activeFilters}</span>}</SheetTrigger>
            <SheetContent className="filter-sheet">
              <SheetHeader className="filter-sheet-head"><p>Encontre sua moto</p><SheetTitle>Filtrar estoque</SheetTitle><SheetDescription>Escolha somente o que importa para você.</SheetDescription></SheetHeader>
              <div className="filter-fields">
                <label><span>Modelo</span><select value={model} onChange={e=>{setModel(e.target.value);setVisible(12)}}><option value="">Todos os modelos</option>{models.map(value=><option value={value} key={value}>{value}</option>)}</select></label>
                <label><span>Ano</span><select value={year} onChange={e=>{setYear(e.target.value);setVisible(12)}}><option value="">Todos os anos</option>{years.map(value=><option value={value} key={value}>{value}</option>)}</select></label>
                <label><span>Valor</span><select value={maxPrice} onChange={e=>{setMaxPrice(e.target.value);setVisible(12)}}><option value="">Qualquer valor</option>{priceLimits.map(value=><option value={value} key={value}>Até {money(value)}</option>)}</select></label>
              </div>
              <SheetFooter className="filter-sheet-footer"><button type="button" onClick={clearFilters}>Limpar escolhas</button><SheetClose>Ver {filtered.length} {filtered.length===1?"moto":"motos"}</SheetClose></SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <div className="motorcycle-grid">
        {filtered.slice(0,visible).map(moto => {
          const images = parseImages(moto.images);
          return <Link className="moto-card presentation-card" href={`/motos/${moto.slug}`} key={moto.id}>
            <div className="presentation-card-photo"><CatalogImage fill sizes="(max-width: 820px) 100vw, 50vw" src={images[0]} alt={moto.model} /><span className="photo-count"><Camera size={15}/>{images.length} fotos</span></div>
            <div className="presentation-card-copy"><p>{moto.brand} · {moto.year}</p><h3>{moto.model}</h3><div><strong>{money(moto.askingPrice)}</strong><span>Ver detalhes <ArrowRight size={17}/></span></div></div>
          </Link>;
        })}
      </div>
      {filtered.length===0&&<div className="catalog-empty"><p>Nenhuma moto com esses filtros.</p><button type="button" onClick={clearFilters}>Ver todo o estoque</button></div>}
      {visible<filtered.length&&<button className="catalog-more" type="button" onClick={()=>setVisible(v=>v+12)}>Mostrar mais motos <span>{Math.min(12,filtered.length-visible)}</span></button>}
    </section>

    <section className="trust-section" id="sobre">
      <div className="trust-visual"><Image fill sizes="(max-width: 820px) 100vw, 55vw" src={parseImages(catalogMotorcycles[0].images)[2]} alt="Detalhes da Lander 250 do catálogo Luan Motos"/><div className="trust-stamp"><ShieldCheck/><span>Escolha<br/>com confiança</span></div></div>
      <div className="trust-copy"><p className="eyebrow dark">Luan Motos</p><h2>Negócio bom começa com verdade.</h2><p>Atendimento próximo, avaliação justa e suporte em cada etapa da negociação. Você entende a moto, as condições e o próximo passo antes de decidir.</p><ul><li><span>01</span> Compra, venda e troca</li><li><span>02</span> Financiamento</li><li><span>03</span> Avaliação da sua moto</li></ul><a href={whatsapp()} target="_blank" rel="noreferrer">Conversar agora <ArrowRight size={18}/></a></div>
    </section>

    <section className="location-section" id="localizacao"><div><p className="eyebrow">Onde encontrar</p><h2>Venha sentir<br/>a moto de perto.</h2></div><div className="location-card"><MapPin/><div><strong>Rua Quintino Bocaiúva, 50</strong><span>Palmeira · Campina Grande/PB</span><span>Segunda a sábado · 09h às 18h</span></div><a href="https://maps.google.com/?q=Rua+Quintino+Bocaiuva+50+Campina+Grande+PB" target="_blank" rel="noreferrer">Abrir no mapa <ArrowRight size={16}/></a></div></section>

    <footer className="public-footer"><div className="wordmark"><span>LM</span> LUAN MOTOS</div><p>Você escolhe a próxima. A gente resolve o caminho.</p><div><a href="https://instagram.com/luanmotos.br" target="_blank" rel="noreferrer"><Camera/> @luanmotos.br</a><a href={whatsapp()} target="_blank" rel="noreferrer"><MessageCircle/> (83) 9903-6083</a></div><a className="admin-link" href="/painel">Área da loja</a></footer>

  </main>
}
