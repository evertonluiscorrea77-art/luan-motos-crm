"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowRight, Camera, MapPin, MessageCircle, ShieldCheck } from "lucide-react";
import Image from "next/image";
import type { Motorcycle } from "@/lib/demo-data";
import { demoMotorcycles, parseImages } from "@/lib/demo-data";

const money=(value:number|null)=>value?new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0}).format(value):"Consulte";
const whatsapp=(motorcycle?:Motorcycle)=>`https://wa.me/558399036083?text=${encodeURIComponent(motorcycle?`Olá, Luan! Vi a ${motorcycle.brand} ${motorcycle.model} ${motorcycle.year} no site e quero saber mais.`:"Olá, Luan! Vim pelo site e quero encontrar minha próxima moto.")}`;

export default function PublicShowroom(){
  const [motos,setMotos]=useState(demoMotorcycles.filter(m=>m.published&&m.status==="disponivel"));
  const [selected,setSelected]=useState<Motorcycle|null>(null);
  const [interest,setInterest]=useState({name:"",phone:""}),[sending,setSending]=useState(false);
  useEffect(()=>{fetch("/api/inventory").then(r=>r.json()).then(d=>d.motorcycles&&setMotos(d.motorcycles)).catch(()=>{})},[]);
  return <main className="showroom-shell">
    <section className="showroom-hero" id="inicio">
      <Image fill priority sizes="100vw" className="showroom-hero-bg" src="/images/luan-motos-cover.png" alt="Identidade visual Luan Motos" />
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
      <div className="motorcycle-grid">
        {motos.map((moto,index)=>{const image=parseImages(moto.images)[0]||"/images/showroom.jpg";return <article className={`moto-card ${index===0?"moto-card-wide":""}`} key={moto.id} onClick={()=>setSelected(moto)} tabIndex={0} onKeyDown={e=>e.key==="Enter"&&setSelected(moto)}>
          <Image fill sizes={index===0?"100vw":"(max-width: 820px) 100vw, 50vw"} src={image} alt={`${moto.brand} ${moto.model}`} />
          <div className="moto-card-shade"/><div className="moto-status">Disponível</div>
          <div className="moto-card-copy"><p>{moto.brand}</p><h3>{moto.model}</h3><div className="moto-meta"><span>{moto.year}</span><span>{moto.mileage.toLocaleString("pt-BR")} km</span><span>{moto.engine}</span></div><div className="moto-price"><strong>{money(moto.askingPrice)}</strong><span>Conhecer <ArrowRight size={16}/></span></div></div>
        </article>})}
      </div>
    </section>

    <section className="trust-section" id="sobre">
      <div className="trust-visual"><Image fill sizes="(max-width: 820px) 100vw, 55vw" src="/images/showroom.jpg" alt="Showroom de motocicletas"/><div className="trust-stamp"><ShieldCheck/><span>Escolha<br/>com confiança</span></div></div>
      <div className="trust-copy"><p className="eyebrow dark">Luan Motos</p><h2>Negócio bom começa com verdade.</h2><p>Atendimento próximo, avaliação justa e suporte em cada etapa da negociação. Você entende a moto, as condições e o próximo passo antes de decidir.</p><ul><li><span>01</span> Compra, venda e troca</li><li><span>02</span> Financiamento</li><li><span>03</span> Avaliação da sua moto</li></ul><a href={whatsapp()} target="_blank" rel="noreferrer">Conversar agora <ArrowRight size={18}/></a></div>
    </section>

    <section className="location-section" id="localizacao"><div><p className="eyebrow">Onde encontrar</p><h2>Venha sentir<br/>a moto de perto.</h2></div><div className="location-card"><MapPin/><div><strong>Rua Quintino Bocaiúva, 50</strong><span>Palmeira · Campina Grande/PB</span><span>Segunda a sábado · 09h às 18h</span></div><a href="https://maps.google.com/?q=Rua+Quintino+Bocaiuva+50+Campina+Grande+PB" target="_blank" rel="noreferrer">Abrir no mapa <ArrowRight size={16}/></a></div></section>

    <footer className="public-footer"><div className="wordmark"><span>LM</span> LUAN MOTOS</div><p>Você escolhe a próxima. A gente resolve o caminho.</p><div><a href="https://instagram.com/luanmotos.br" target="_blank" rel="noreferrer"><Camera/> @luanmotos.br</a><a href={whatsapp()} target="_blank" rel="noreferrer"><MessageCircle/> (83) 9903-6083</a></div><a className="admin-link" href="/painel">Área da loja</a></footer>

    {selected&&<div className="detail-overlay" role="dialog" aria-modal="true" aria-label={`Detalhes da ${selected.model}`} onClick={()=>setSelected(null)}><article className="detail-panel" onClick={e=>e.stopPropagation()}><button className="detail-close" onClick={()=>setSelected(null)}>Fechar</button><div className="detail-image"><Image fill sizes="(max-width: 720px) 100vw, 720px" src={parseImages(selected.images)[0]||"/images/showroom.jpg"} alt={`${selected.brand} ${selected.model}`}/></div><div className="detail-body"><p className="eyebrow dark">{selected.brand}</p><h2>{selected.model}</h2><p>{selected.description}</p><div className="detail-specs"><span><b>{selected.year}</b>Ano</span><span><b>{selected.mileage.toLocaleString("pt-BR")} km</b>Rodagem</span><span><b>{selected.engine}</b>Motor</span><span><b>{selected.color}</b>Cor</span></div><div className="detail-bottom"><strong>{money(selected.askingPrice)}</strong><a href={`/motos/${selected.slug}`}>Ver página completa <ArrowRight/></a></div><form className="interest-form" onSubmit={async e=>{e.preventDefault();setSending(true);await fetch("/api/interests",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...interest,motorcycleId:selected.id})}).catch(()=>{});window.open(whatsapp(selected),"_blank","noopener,noreferrer");setSending(false)}}><p>Receba as condições no WhatsApp</p><input required placeholder="Seu nome" value={interest.name} onChange={e=>setInterest({...interest,name:e.target.value})}/><input required inputMode="tel" placeholder="Seu WhatsApp" value={interest.phone} onChange={e=>setInterest({...interest,phone:e.target.value})}/><button disabled={sending}><MessageCircle/>{sending?"Abrindo...":"Tenho interesse"}</button></form></div></article></div>}
  </main>
}
