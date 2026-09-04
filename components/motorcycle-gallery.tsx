"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

export default function MotorcycleGallery({ images, name }: { images: string[]; name: string }) {
  const [viewport, carousel] = useEmblaCarousel({ loop: images.length > 1 });
  const [active, setActive] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const select = useCallback(() => setActive(carousel?.selectedScrollSnap() ?? 0), [carousel]);
  useEffect(() => {
    if (!carousel) return;
    carousel.on("select", select).on("reInit", select);
    return () => { carousel.off("select", select).off("reInit", select); };
  }, [carousel, select]);
  const change = (direction: number) => {
    if (direction < 0) carousel?.scrollPrev(); else carousel?.scrollNext();
  };
  return <section className="bike-gallery" aria-label={`Fotos de ${name}`}>
    <div className="bike-gallery-viewport" ref={viewport}>
      <div className="bike-gallery-track">{images.map((src, index) => <div className="bike-gallery-slide" key={src}>
        <Image src={src} alt={`${name} — foto ${index + 1} de ${images.length}`} fill priority={index === 0} sizes="(max-width: 900px) 100vw, 65vw" />
      </div>)}</div>
    </div>
    <div className="bike-gallery-controls">
      <div><button type="button" onClick={() => change(-1)} aria-label="Foto anterior" disabled={images.length < 2}><ChevronLeft /></button>
      <span aria-live="polite">{active + 1} / {images.length}</span>
      <button type="button" onClick={() => change(1)} aria-label="Próxima foto" disabled={images.length < 2}><ChevronRight /></button></div>
      <button type="button" onClick={() => setExpanded(true)}><Maximize2 /> Ampliar</button>
    </div>
    <div className="bike-gallery-thumbs" aria-label="Escolher foto">{images.map((src, index) => <button type="button" key={src} onClick={() => carousel?.scrollTo(index)} aria-label={`Ver foto ${index + 1}`} aria-pressed={index === active}>
      <Image src={src} alt="" fill sizes="90px" />
    </button>)}</div>
    <Dialog open={expanded} onOpenChange={setExpanded}>
      <DialogContent className="bike-lightbox" onKeyDown={event => { if(event.key === 'ArrowLeft') change(-1); if(event.key === 'ArrowRight') change(1); }}>
        <DialogTitle>{name}</DialogTitle><DialogDescription>Foto {active + 1} de {images.length}</DialogDescription>
        <div className="bike-lightbox-image"><Image src={images[active]} alt={`${name} — foto ${active + 1}`} fill sizes="95vw" /></div>
        <div className="bike-lightbox-controls"><button type="button" onClick={() => change(-1)} aria-label="Foto anterior"><ChevronLeft /></button><span>{active + 1} / {images.length}</span><button type="button" onClick={() => change(1)} aria-label="Próxima foto"><ChevronRight /></button></div>
      </DialogContent>
    </Dialog>
  </section>;
}
